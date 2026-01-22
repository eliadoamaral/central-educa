import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StageColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  isUpdating?: boolean;
}

const STAGE_COLORS = [
  "#6B7280", // gray
  "#3B82F6", // blue
  "#10B981", // green
  "#EAB308", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#92400E", // brown
  "#F97316", // orange
  "#14B8A6", // teal
  "#F43F5E", // rose
  "#84CC16", // lime
  "#EF4444", // red
];

export function StageColorPicker({
  currentColor,
  onColorChange,
  isUpdating,
}: StageColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover/stage:opacity-100 transition-opacity"
              disabled={isUpdating}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Personalizar cor da etapa</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Cor do cabeçalho
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {STAGE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all flex items-center justify-center",
                  "hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-offset-background",
                  currentColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
                style={{ backgroundColor: color }}
                disabled={isUpdating}
              >
                {currentColor === color && (
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
