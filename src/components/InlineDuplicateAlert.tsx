import { AlertCircle } from 'lucide-react';
import { Student } from '@/hooks/useStudents';
import { FieldDuplicateResult } from '@/hooks/useDuplicateCheck';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, CreditCard, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
interface InlineDuplicateAlertProps {
  fieldResult: FieldDuplicateResult;
  fieldLabel: string; // e.g., "email", "telefone", "CPF"
  onViewStudent?: (studentId: string) => void;
}
const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  graduated: 'Formado',
  dropped: 'Desistente',
  pending: 'Pendente',
  lead: 'Lead'
};
const statusConfig: Record<string, {
  bg: string;
  text: string;
}> = {
  active: {
    bg: 'bg-primary/10',
    text: 'text-primary'
  },
  inactive: {
    bg: 'bg-muted',
    text: 'text-muted-foreground'
  },
  graduated: {
    bg: 'bg-primary/20',
    text: 'text-primary'
  },
  dropped: {
    bg: 'bg-destructive/10',
    text: 'text-destructive'
  },
  pending: {
    bg: 'bg-muted',
    text: 'text-muted-foreground'
  },
  lead: {
    bg: 'bg-primary/10',
    text: 'text-primary'
  }
};
export function InlineDuplicateAlert({
  fieldResult,
  fieldLabel,
  onViewStudent
}: InlineDuplicateAlertProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Don't show anything while checking - loading spinner is shown in input
  if (fieldResult.isChecking) {
    return null;
  }
  if (!fieldResult.isDuplicate || !fieldResult.duplicateStudent) {
    return null;
  }
  const student = fieldResult.duplicateStudent;
  const statusStyle = statusConfig[student.status] || {
    bg: 'bg-muted',
    text: 'text-muted-foreground'
  };
  return <>
      <div className="flex items-center gap-1.5 py-1">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-xs text-muted-foreground">
          {fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} similar encontrado.
        </span>
        <button type="button" onClick={() => setShowDetails(true)} className="text-xs text-primary font-medium hover:underline">
          Revisar
        </button>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border/50">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              
              Possível duplicidade de {fieldLabel}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-5 space-y-4">
            {/* Existing Student Info */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{student.name}</span>
                </div>
                <Badge className={cn(statusStyle.bg, statusStyle.text, "text-xs font-medium")}>
                  {statusLabels[student.status] || student.status}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className={cn("flex items-center gap-2", fieldLabel.toLowerCase() === 'email' && "text-primary font-medium")}>
                  <Mail className="h-3 w-3" />
                  <span>{student.email}</span>
                </div>
                {student.phone && <div className={cn("flex items-center gap-2", fieldLabel.toLowerCase() === 'telefone' && "text-primary font-medium")}>
                    <Phone className="h-3 w-3" />
                    <span>{student.phone}</span>
                  </div>}
                {student.cpf && <div className={cn("flex items-center gap-2", fieldLabel.toLowerCase() === 'cpf' && "text-primary font-medium")}>
                    <CreditCard className="h-3 w-3" />
                    <span>{student.cpf}</span>
                  </div>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onViewStudent && <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => {
              onViewStudent(student.id);
              setShowDetails(false);
            }}>
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Ver cadastro
                </Button>}
            </div>

            
          </div>
        </DialogContent>
      </Dialog>
    </>;
}