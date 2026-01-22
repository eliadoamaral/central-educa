import { User, Mail, Phone, CreditCard, Calendar, ExternalLink, Loader2, AlertCircle, GraduationCap, Merge, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/hooks/useStudents';
import { MatchedFieldType } from '@/hooks/useDuplicateCheck';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DuplicateAlertProps {
  duplicateStudent: Student;
  matchedField: MatchedFieldType;
  matchedFields?: string[];
  isChecking: boolean;
  onViewStudent?: (studentId: string) => void;
  onMerge?: (mergedData: Partial<Student>, existingStudentId: string) => void;
  currentFormData?: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    city?: string;
    state?: string;
    notes?: string;
    course?: string;
    is_sc_client?: boolean;
    lead_source?: string;
    birth_date?: string;
  };
}

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  graduated: 'Formado',
  dropped: 'Desistente',
  pending: 'Pendente',
  lead: 'Lead'
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-primary/10', text: 'text-primary' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground' },
  graduated: { bg: 'bg-primary/20', text: 'text-primary' },
  dropped: { bg: 'bg-destructive/10', text: 'text-destructive' },
  pending: { bg: 'bg-muted', text: 'text-muted-foreground' },
  lead: { bg: 'bg-primary/10', text: 'text-primary' }
};

interface MergeField {
  key: keyof Student;
  label: string;
  icon: React.ElementType;
  existingValue: string | boolean | null;
  newValue: string | boolean | null;
  format?: (value: any) => string;
}

const MergeFieldSelector = ({ 
  field, 
  selectedSource, 
  onSelect 
}: { 
  field: MergeField; 
  selectedSource: 'existing' | 'new';
  onSelect: (source: 'existing' | 'new') => void;
}) => {
  const Icon = field.icon;
  const existingDisplay = field.format ? field.format(field.existingValue) : String(field.existingValue || '-');
  const newDisplay = field.format ? field.format(field.newValue) : String(field.newValue || '-');
  
  const hasExisting = field.existingValue !== null && field.existingValue !== '' && field.existingValue !== undefined;
  const hasNew = field.newValue !== null && field.newValue !== '' && field.newValue !== undefined;
  
  // Se ambos são iguais ou só um tem valor, não mostrar
  if (existingDisplay === newDisplay) return null;
  if (!hasExisting && !hasNew) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {field.label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect('existing')}
          disabled={!hasExisting}
          className={cn(
            "relative p-3 rounded-lg border-2 text-left transition-all text-sm",
            selectedSource === 'existing'
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/30",
            !hasExisting && "opacity-50 cursor-not-allowed"
          )}
        >
          {selectedSource === 'existing' && (
            <div className="absolute top-2 right-2">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className="text-xs text-muted-foreground block mb-1">Existente</span>
          <span className="font-medium truncate block">{existingDisplay}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('new')}
          disabled={!hasNew}
          className={cn(
            "relative p-3 rounded-lg border-2 text-left transition-all text-sm",
            selectedSource === 'new'
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/30",
            !hasNew && "opacity-50 cursor-not-allowed"
          )}
        >
          {selectedSource === 'new' && (
            <div className="absolute top-2 right-2">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className="text-xs text-muted-foreground block mb-1">Novo</span>
          <span className="font-medium truncate block">{newDisplay}</span>
        </button>
      </div>
    </div>
  );
};

export function DuplicateAlert({ 
  duplicateStudent, 
  matchedField, 
  matchedFields = [],
  isChecking,
  onViewStudent,
  onMerge,
  currentFormData
}: DuplicateAlertProps) {
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeSelections, setMergeSelections] = useState<Record<string, 'existing' | 'new'>>({});
  const [showDetails, setShowDetails] = useState(false);

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Verificando...</span>
      </div>
    );
  }

  const getMatchMessage = () => {
    if (matchedFields.length > 1) {
      return matchedFields.join(', ').toLowerCase();
    }
    switch (matchedField) {
      case 'cpf':
        return 'CPF';
      case 'phone':
        return 'telefone';
      case 'email':
        return 'email';
      case 'name':
        return 'nome';
      case 'multiple':
        return 'dados';
      default:
        return 'dados';
    }
  };

  const isFieldMatched = (field: string) => {
    return matchedFields.includes(field) || 
           matchedField === field.toLowerCase() ||
           matchedField === 'multiple';
  };

  const statusStyle = statusConfig[duplicateStudent.status] || { bg: 'bg-muted', text: 'text-muted-foreground' };

  const mergeFields: MergeField[] = [
    { 
      key: 'name', 
      label: 'Nome', 
      icon: User, 
      existingValue: duplicateStudent.name, 
      newValue: currentFormData?.name || null 
    },
    { 
      key: 'email', 
      label: 'Email', 
      icon: Mail, 
      existingValue: duplicateStudent.email, 
      newValue: currentFormData?.email || null 
    },
    { 
      key: 'phone', 
      label: 'Telefone', 
      icon: Phone, 
      existingValue: duplicateStudent.phone, 
      newValue: currentFormData?.phone || null 
    },
    { 
      key: 'cpf', 
      label: 'CPF', 
      icon: CreditCard, 
      existingValue: duplicateStudent.cpf, 
      newValue: currentFormData?.cpf || null 
    },
    { 
      key: 'birth_date', 
      label: 'Data de Nascimento', 
      icon: Calendar, 
      existingValue: duplicateStudent.birth_date, 
      newValue: currentFormData?.birth_date || null,
      format: (val) => val ? format(new Date(val), 'dd/MM/yyyy', { locale: ptBR }) : '-'
    },
    { 
      key: 'city', 
      label: 'Cidade', 
      icon: User, 
      existingValue: duplicateStudent.city, 
      newValue: currentFormData?.city || null 
    },
    { 
      key: 'state', 
      label: 'Estado', 
      icon: User, 
      existingValue: duplicateStudent.state, 
      newValue: currentFormData?.state || null 
    },
    { 
      key: 'course', 
      label: 'Curso', 
      icon: GraduationCap, 
      existingValue: duplicateStudent.course, 
      newValue: currentFormData?.course || null 
    },
    { 
      key: 'notes', 
      label: 'Observações', 
      icon: User, 
      existingValue: duplicateStudent.notes, 
      newValue: currentFormData?.notes || null 
    },
    { 
      key: 'lead_source', 
      label: 'Origem', 
      icon: User, 
      existingValue: duplicateStudent.lead_source, 
      newValue: currentFormData?.lead_source || null 
    },
    { 
      key: 'is_sc_client', 
      label: 'Cliente S&C', 
      icon: User, 
      existingValue: duplicateStudent.is_sc_client, 
      newValue: currentFormData?.is_sc_client ?? null,
      format: (val) => val === true ? 'Sim' : val === false ? 'Não' : '-'
    },
  ];

  // Filtra campos que têm diferenças
  const fieldsWithDifferences = mergeFields.filter(field => {
    const existingDisplay = field.format ? field.format(field.existingValue) : String(field.existingValue || '');
    const newDisplay = field.format ? field.format(field.newValue) : String(field.newValue || '');
    return existingDisplay !== newDisplay && (field.existingValue || field.newValue);
  });

  const handleOpenMerge = () => {
    // Inicializa seleções - prioriza dados existentes se existirem
    const initialSelections: Record<string, 'existing' | 'new'> = {};
    fieldsWithDifferences.forEach(field => {
      const hasExisting = field.existingValue !== null && field.existingValue !== '' && field.existingValue !== undefined;
      initialSelections[field.key] = hasExisting ? 'existing' : 'new';
    });
    setMergeSelections(initialSelections);
    setShowMergeDialog(true);
  };

  const handleConfirmMerge = () => {
    const mergedData: Partial<Student> = {};
    
    fieldsWithDifferences.forEach(field => {
      const source = mergeSelections[field.key] || 'existing';
      const value = source === 'existing' ? field.existingValue : field.newValue;
      (mergedData as any)[field.key] = value;
    });

    // Adiciona campos que não têm diferença (mantém existente)
    mergeFields.forEach(field => {
      if (!fieldsWithDifferences.find(f => f.key === field.key)) {
        if (field.existingValue !== null && field.existingValue !== undefined && field.existingValue !== '') {
          (mergedData as any)[field.key] = field.existingValue;
        } else if (field.newValue !== null && field.newValue !== undefined && field.newValue !== '') {
          (mergedData as any)[field.key] = field.newValue;
        }
      }
    });

    onMerge?.(mergedData, duplicateStudent.id);
    setShowMergeDialog(false);
  };

  return (
    <>
      {/* Minimal Inline Alert */}
      <div className="flex items-center gap-1.5 py-1">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-xs text-muted-foreground">
          Pessoa com {getMatchMessage()} similar já existe.
        </span>
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-xs text-primary font-medium hover:underline"
        >
          Revisar
        </button>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b border-border/50">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Possível duplicidade encontrada
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-5 space-y-4">
            {/* Existing Student Info */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{duplicateStudent.name}</span>
                </div>
                <Badge className={cn(statusStyle.bg, statusStyle.text, "text-xs font-medium")}>
                  {statusLabels[duplicateStudent.status] || duplicateStudent.status}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className={cn(
                  "flex items-center gap-2",
                  isFieldMatched('Email') && "text-primary font-medium"
                )}>
                  <Mail className="h-3 w-3" />
                  <span>{duplicateStudent.email}</span>
                </div>
                {duplicateStudent.phone && (
                  <div className={cn(
                    "flex items-center gap-2",
                    isFieldMatched('Telefone') && "text-primary font-medium"
                  )}>
                    <Phone className="h-3 w-3" />
                    <span>{duplicateStudent.phone}</span>
                  </div>
                )}
                {duplicateStudent.cpf && (
                  <div className={cn(
                    "flex items-center gap-2",
                    isFieldMatched('CPF') && "text-primary font-medium"
                  )}>
                    <CreditCard className="h-3 w-3" />
                    <span>{duplicateStudent.cpf}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onViewStudent && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    onViewStudent(duplicateStudent.id);
                    setShowDetails(false);
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Ver cadastro
                </Button>
              )}
              {onMerge && currentFormData && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    setShowDetails(false);
                    handleOpenMerge();
                  }}
                  data-merge-trigger
                >
                  <Merge className="h-3 w-3 mr-1.5" />
                  Mesclar
                </Button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Continue salvando se tiver certeza de que são pessoas diferentes.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/25">
                <Merge className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Mesclar Cadastros</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Escolha qual valor manter para cada campo
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh] p-6">
            <div className="space-y-6">
              {/* Visual indicator */}
              <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="text-center">
                  <div className="p-2 rounded-lg bg-muted inline-block mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Existente</p>
                  <p className="text-sm font-medium truncate max-w-[100px]">{duplicateStudent.name.split(' ')[0]}</p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <ArrowRight className="h-4 w-4" />
                  <Merge className="h-4 w-4" />
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </div>
                <div className="text-center">
                  <div className="p-2 rounded-lg bg-primary/10 inline-block mb-1">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Novo</p>
                  <p className="text-sm font-medium truncate max-w-[100px]">{currentFormData?.name?.split(' ')[0] || '-'}</p>
                </div>
              </div>

              {fieldsWithDifferences.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Não há campos diferentes para mesclar.</p>
                  <p className="text-xs mt-1">Os cadastros são idênticos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fieldsWithDifferences.map(field => (
                    <MergeFieldSelector
                      key={field.key}
                      field={field}
                      selectedSource={mergeSelections[field.key] || 'existing'}
                      onSelect={(source) => setMergeSelections(prev => ({ ...prev, [field.key]: source }))}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 pt-4 border-t border-border/50 bg-muted/20">
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={() => setShowMergeDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                onClick={handleConfirmMerge}
                disabled={fieldsWithDifferences.length === 0}
              >
                <Check className="h-4 w-4" />
                Confirmar Mesclagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
