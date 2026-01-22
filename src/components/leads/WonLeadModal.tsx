import { useState } from "react";
import { Trophy, UserCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
interface WonLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onCompleteRegistration: () => void;
  onClose: () => void;
}
export function WonLeadModal({
  open,
  onOpenChange,
  studentName,
  onCompleteRegistration,
  onClose
}: WonLeadModalProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const handleCloseClick = () => {
    setShowCloseConfirm(true);
  };
  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };
  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };
  return <>
      <Dialog open={open} onOpenChange={isOpen => {
      if (!isOpen) {
        handleCloseClick();
      } else {
        onOpenChange(isOpen);
      }
    }}>
        <DialogContent className="max-w-md p-8" onPointerDownOutside={e => e.preventDefault()}>
          <DialogHeader className="text-center sm:text-center space-y-4">
            
            <DialogTitle className="text-2xl font-bold text-center text-action">
              Parabéns pela conquista!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed text-base">
              <span className="font-semibold text-primary">{studentName}</span> foi 
              matriculado(a) com sucesso e inserido(a) no banco de dados de alunos.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 rounded-xl bg-action/5 border border-action/20">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-action mt-0.5 flex-shrink-0" />
              <p className="text-sm text-action text-center">Complete o cadastro do aluno agora para garantir que todas as informações estejam atualizadas.</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" onClick={handleCloseClick} className="sm:flex-1">
              Fechar
            </Button>
            <Button onClick={onCompleteRegistration} className="sm:flex-1 bg-action hover:bg-action-hover text-white">
              Completar Cadastro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent className="max-w-md p-8">
          <AlertDialogHeader className="text-center sm:text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center">
              Cadastro Incompleto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
              O aluno <span className="font-semibold text-foreground">{studentName}</span> pode 
              estar com dados incompletos. Deseja realmente fechar sem completar o cadastro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel onClick={handleCancelClose} className="sm:flex-1 order-2 sm:order-1">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="sm:flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground order-1 sm:order-2">
              Fechar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}