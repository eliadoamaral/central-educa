import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, User, Mail, Phone, MapPin, FileText, Calendar, Building2, Megaphone } from "lucide-react";
import { format } from "date-fns";

export interface MergeChange {
  field: string;
  label: string;
  icon: typeof User;
  oldValue: string | null;
  newValue: string | null;
}

export interface MergeSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  changes: MergeChange[];
  onViewStudent?: () => void;
}

const fieldIcons: Record<string, typeof User> = {
  name: User,
  email: Mail,
  phone: Phone,
  cpf: FileText,
  city: MapPin,
  state: MapPin,
  notes: FileText,
  birth_date: Calendar,
  lead_source: Megaphone,
  is_sc_client: Building2
};

const fieldLabels: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  cpf: "CPF",
  city: "Cidade",
  state: "Estado",
  notes: "Observações",
  birth_date: "Data de Nascimento",
  lead_source: "Origem",
  is_sc_client: "Cliente S&C",
  course: "Curso"
};

export function MergeSuccessDialog({ 
  open, 
  onClose, 
  studentName, 
  changes,
  onViewStudent 
}: MergeSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Mesclagem Concluída</DialogTitle>
          </div>
          <DialogDescription>
            Os cadastros foram unificados com sucesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Name */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Cadastro atualizado</p>
            <p className="font-semibold text-lg">{studentName}</p>
          </div>

          {/* Changes Summary */}
          {changes.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Campos atualizados ({changes.length})
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {changes.map((change, index) => {
                  const Icon = change.icon || fieldIcons[change.field] || FileText;
                  const label = change.label || fieldLabels[change.field] || change.field;
                  
                  return (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground line-through truncate max-w-[120px]">
                          {change.oldValue || "—"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium truncate max-w-[120px]">
                          {change.newValue || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                Os valores selecionados já correspondiam aos dados existentes
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            {onViewStudent && (
              <Button onClick={onViewStudent} className="flex-1">
                Ver Cadastro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate changes between old and new data
export function calculateMergeChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  fieldsToCompare: string[]
): MergeChange[] {
  const changes: MergeChange[] = [];
  
  for (const field of fieldsToCompare) {
    const oldValue = oldData[field];
    const newValue = newData[field];
    
    // Normalize values for comparison
    const normalizedOld = oldValue === null || oldValue === undefined || oldValue === '' ? null : String(oldValue);
    const normalizedNew = newValue === null || newValue === undefined || newValue === '' ? null : String(newValue);
    
    if (normalizedOld !== normalizedNew) {
      changes.push({
        field,
        label: fieldLabels[field] || field,
        icon: fieldIcons[field] || FileText,
        oldValue: normalizedOld,
        newValue: normalizedNew
      });
    }
  }
  
  return changes;
}
