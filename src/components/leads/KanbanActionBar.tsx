import { useEffect, useState } from "react";
import { Trash2, X, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DropZone {
  id: "delete" | "lost" | "won";
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  bgColorHover: string;
  borderColor: string;
  iconColor: string;
}

interface KanbanActionBarProps {
  isDragging: boolean;
  onDrop: (action: "delete" | "lost" | "won", studentId: string) => void;
}

const dropZones: DropZone[] = [
  {
    id: "delete",
    label: "Excluir",
    icon: <Trash2 className="h-6 w-6" />,
    bgColor: "bg-muted/50 dark:bg-muted/30",
    bgColorHover: "bg-destructive/20 dark:bg-destructive/30",
    borderColor: "border-destructive/40",
    iconColor: "text-destructive",
  },
  {
    id: "lost",
    label: "Marcar como Perdido",
    icon: <X className="h-6 w-6" />,
    bgColor: "bg-red-50 dark:bg-red-500/10",
    bgColorHover: "bg-red-100 dark:bg-red-500/20",
    borderColor: "border-red-300 dark:border-red-500/40",
    iconColor: "text-red-500",
  },
  {
    id: "won",
    label: "Marcar como Ganho",
    icon: <Trophy className="h-6 w-6" />,
    bgColor: "bg-green-50 dark:bg-green-500/10",
    bgColorHover: "bg-green-100 dark:bg-green-500/20",
    borderColor: "border-green-300 dark:border-green-500/40",
    iconColor: "text-green-500",
  },
];

// Sound effects using Web Audio API
const playSound = (type: "delete" | "lost" | "won") => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on action type
    if (type === "delete") {
      // Low, short "thud" sound
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === "lost") {
      // Descending tone - "failure" sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === "won") {
      // Ascending celebratory chime
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + startTime);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
        osc.start(audioContext.currentTime + startTime);
        osc.stop(audioContext.currentTime + startTime + duration);
      };
      
      // Play a celebratory arpeggio (C-E-G-C)
      playNote(523.25, 0, 0.15);      // C5
      playNote(659.25, 0.1, 0.15);    // E5
      playNote(783.99, 0.2, 0.15);    // G5
      playNote(1046.50, 0.3, 0.25);   // C6
      return; // Early return since we handle oscillator lifecycle in playNote
    }
  } catch (error) {
    console.log("Audio playback not supported:", error);
  }
};

export function KanbanActionBar({ isDragging, onDrop }: KanbanActionBarProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Animate in/out based on dragging state
  useEffect(() => {
    if (isDragging) {
      setIsVisible(true);
    } else {
      // Small delay before hiding to allow drop animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setHoveredZone(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoveredZone(zoneId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setHoveredZone(null);
    }
  };

  const handleDrop = (e: React.DragEvent, zoneId: "delete" | "lost" | "won") => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("text/plain");
    
    if (!studentId) return;

    // For delete action, show confirmation dialog
    if (zoneId === "delete") {
      setPendingDeleteId(studentId);
      setDeleteConfirmOpen(true);
      setHoveredZone(null);
      return;
    }

    // Play sound feedback
    playSound(zoneId);

    // Fire confetti for "won" action
    if (zoneId === "won") {
      triggerConfetti();
    }

    onDrop(zoneId, studentId);
    setHoveredZone(null);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      playSound("delete");
      onDrop("delete", pendingDeleteId);
    }
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const triggerConfetti = () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#22c55e", "#16a34a", "#15803d", "#166534", "#fbbf24", "#f59e0b"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 25,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    // Multiple bursts
    shoot();
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 w-full h-28 z-50 transition-all duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t border-border/50" />

        {/* Drop zones container */}
        <div className="relative h-full max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          {dropZones.map((zone) => (
            <div
              key={zone.id}
              className={cn(
                "flex-1 h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer",
                zone.borderColor,
                hoveredZone === zone.id
                  ? cn(zone.bgColorHover, "scale-105 border-solid shadow-lg")
                  : zone.bgColor
              )}
              onDragOver={(e) => handleDragOver(e, zone.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone.id)}
            >
              <div
                className={cn(
                  "transition-transform duration-200",
                  zone.iconColor,
                  hoveredZone === zone.id && "scale-110"
                )}
              >
                {zone.icon}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  hoveredZone === zone.id ? zone.iconColor : "text-muted-foreground"
                )}
              >
                {zone.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-md p-8">
          <AlertDialogHeader className="text-center sm:text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center">
              Excluir Lead
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
              Tem certeza que deseja excluir este lead? Ele será movido para a lixeira e poderá ser restaurado posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className="sm:flex-1 order-2 sm:order-1"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="sm:flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground order-1 sm:order-2"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
