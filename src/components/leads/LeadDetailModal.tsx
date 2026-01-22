import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Globe,
  Building2,
  DollarSign,
  MessageSquare,
  History,
  Plus,
  Paperclip,
  X,
  FileIcon,
  Download,
  ExternalLink,
  Trash2,
  Loader2,
  Edit,
  Clock,
  Tag,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import { useStudentNotes, StudentNote } from '@/hooks/useStudentNotes';
import { useStudentActivityLogs, StudentActivityLog } from '@/hooks/useStudentActivityLogs';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Student, StudentInput } from '@/hooks/useStudents';
import { InlineEditField } from './InlineEditField';
import { InlineLocationField } from './InlineLocationField';
import { supabase } from '@/integrations/supabase/client';

// Lead source labels
const leadSourceLabels: Record<string, string> = {
  indicacao: 'Indicação',
  evento: 'Evento',
  redes_sociais: 'Redes Sociais',
  google: 'Google/Busca',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  email_marketing: 'Email Marketing',
  parceiro: 'Parceiro/Afiliado',
  outro: 'Outro',
};

// Funnel stage labels
const funnelStageLabels: Record<string, string> = {
  novo_lead: 'Novo Lead',
  primeiro_contato: '1º Contato',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

// Activity type icons and labels
const activityTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { icon: <Plus className="h-3 w-3" />, label: 'Criado', color: 'bg-green-500' },
  updated: { icon: <Edit className="h-3 w-3" />, label: 'Atualizado', color: 'bg-blue-500' },
  stage_changed: { icon: <History className="h-3 w-3" />, label: 'Etapa alterada', color: 'bg-purple-500' },
  note_added: { icon: <MessageSquare className="h-3 w-3" />, label: 'Observação', color: 'bg-amber-500' },
  note_deleted: { icon: <Trash2 className="h-3 w-3" />, label: 'Observação removida', color: 'bg-red-400' },
  contact_made: { icon: <Phone className="h-3 w-3" />, label: 'Contato realizado', color: 'bg-cyan-500' },
  email_sent: { icon: <Mail className="h-3 w-3" />, label: 'Email enviado', color: 'bg-indigo-500' },
  won: { icon: <DollarSign className="h-3 w-3" />, label: 'Lead ganho', color: 'bg-emerald-500' },
  lost: { icon: <X className="h-3 w-3" />, label: 'Lead perdido', color: 'bg-red-500' },
  deleted: { icon: <Trash2 className="h-3 w-3" />, label: 'Excluído', color: 'bg-gray-500' },
  restored: { icon: <History className="h-3 w-3" />, label: 'Restaurado', color: 'bg-teal-500' },
  default: { icon: <Clock className="h-3 w-3" />, label: 'Atividade', color: 'bg-muted-foreground' },
};

// Courses and lead sources options
const courseOptions = [
  { value: 'Sucessores do Agro', label: 'Sucessores do Agro' },
  { value: 'Gestoras do Agro', label: 'Gestoras do Agro' },
  { value: 'Reforma Tributária', label: 'Reforma Tributária' },
  { value: 'Gestão Estratégica de Pessoas', label: 'Gestão Estratégica de Pessoas' },
];

const leadSourceOptions = [
  { value: 'indicacao', label: 'Indicação' },
  { value: 'evento', label: 'Evento' },
  { value: 'redes_sociais', label: 'Redes Sociais' },
  { value: 'google', label: 'Google/Busca' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'parceiro', label: 'Parceiro/Afiliado' },
  { value: 'outro', label: 'Outro' },
];

const funnelStageOptions = [
  { value: 'novo_lead', label: 'Novo Lead' },
  { value: 'primeiro_contato', label: '1º Contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'matriculado', label: 'Matriculado' },
  { value: 'perdido', label: 'Perdido' },
];

interface LeadDetailModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageColor?: string;
  onEdit?: () => void;
  onUpdateStudent?: (id: string, data: Partial<StudentInput>) => Promise<Student | boolean | null>;
  onStudentUpdated?: (student: Student) => void;
  onRefreshStudents?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

export function LeadDetailModal({
  student,
  open,
  onOpenChange,
  stageColor = '#6b7280',
  onEdit,
  onUpdateStudent,
  onStudentUpdated,
  onRefreshStudents,
}: LeadDetailModalProps) {
  const { notes, loading: notesLoading, addNote, deleteNote } = useStudentNotes(student?.id);
  const { logs, loading: logsLoading, addLog } = useStudentActivityLogs(student?.id);
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('updates');
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<StudentNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localStudent, setLocalStudent] = useState<Student | null>(student);

  // Update local student when prop changes
  if (student?.id !== localStudent?.id || student?.updated_at !== localStudent?.updated_at) {
    setLocalStudent(student);
  }

  if (!localStudent) return null;

  // Check for duplicates
  const checkDuplicates = async (field: 'email' | 'phone' | 'cpf', value: string): Promise<{ hasDuplicate: boolean; duplicateName?: string }> => {
    if (!value || !localStudent) return { hasDuplicate: false };
    
    const cleanValue = field === 'email' ? value.toLowerCase().trim() : value.replace(/\D/g, '');
    if (!cleanValue) return { hasDuplicate: false };

    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name')
        .ilike(field, field === 'email' ? cleanValue : `%${cleanValue}%`)
        .is('deleted_at', null)
        .neq('id', localStudent.id)
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return { hasDuplicate: true, duplicateName: data[0].name };
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
    
    return { hasDuplicate: false };
  };

  // Inline update handler with validation
  const handleInlineUpdate = async (field: keyof StudentInput, value: any): Promise<void> => {
    if (!onUpdateStudent || !localStudent) {
      throw new Error('Update not available');
    }

    // Validate and check duplicates for specific fields
    if (field === 'email' || field === 'phone') {
      const duplicate = await checkDuplicates(field as 'email' | 'phone', value);
      if (duplicate.hasDuplicate) {
        toast.error(`Este ${field === 'email' ? 'email' : 'telefone'} já está cadastrado para ${duplicate.duplicateName}`);
        throw new Error('Duplicate found');
      }
    }

    // Email validation
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        toast.error('Email inválido');
        throw new Error('Invalid email');
      }
    }
    
    const result = await onUpdateStudent(localStudent.id, { [field]: value });
    if (result) {
      // Update local state immediately for better UX
      const updatedStudent = { ...localStudent, [field]: value, updated_at: new Date().toISOString() };
      setLocalStudent(updatedStudent);
      onStudentUpdated?.(updatedStudent);
      
      // Refresh the students list to sync with edit modal
      onRefreshStudents?.();
      
      // Log the update
      const fieldLabels: Record<string, string> = {
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        city: 'Cidade',
        state: 'Estado',
        course: 'Curso',
        lead_source: 'Origem',
        deal_value: 'Valor do negócio',
        expected_close_date: 'Previsão de fechamento',
        notes: 'Notas',
        funnel_stage: 'Etapa do funil',
      };
      
      addLog('updated', `${fieldLabels[field] || field} atualizado`, {
        field,
        new_value: value,
      });
      
      toast.success('Atualizado com sucesso');
    } else {
      throw new Error('Failed to update');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use imagens (JPEG, PNG, GIF, WebP) ou PDF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande. O limite é 10MB.');
      return;
    }

    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() && !selectedFile) return;
    
    setIsAdding(true);
    try {
      const result = await addNote({ content: newNote, attachment: selectedFile });
      if (result) {
        const preview = newNote.length > 50 ? newNote.substring(0, 50) + '...' : (newNote || '(sem texto)');
        const attachmentText = selectedFile ? ' com anexo' : '';
        addLog('note_added', `Observação adicionada${attachmentText}: "${preview}"`, {
          content_preview: preview,
          has_attachment: !!selectedFile,
        });
      }
      setNewNote('');
      clearFile();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteNote(noteToDelete.id);
      if (success) {
        const preview = noteToDelete.content.length > 50 
          ? noteToDelete.content.substring(0, 50) + '...' 
          : (noteToDelete.content || '(sem texto)');
        const attachmentText = noteToDelete.attachment_url ? ' com anexo' : '';
        addLog('note_deleted', `Observação removida${attachmentText}: "${preview}"`, {
          content_preview: preview,
          had_attachment: !!noteToDelete.attachment_url,
        });
      }
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (note: StudentNote) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, "'Hoje às' HH:mm", { locale: ptBR });
    } else if (diffInHours < 48) {
      return format(date, "'Ontem às' HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatCurrency = (value: number, currency: string = 'BRL'): string => {
    const currencyConfig: Record<string, { locale: string; currency: string }> = {
      'BRL': { locale: 'pt-BR', currency: 'BRL' },
      'USD': { locale: 'en-US', currency: 'USD' },
      'EUR': { locale: 'de-DE', currency: 'EUR' },
    };
    const config = currencyConfig[currency] || currencyConfig['BRL'];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isImage = (type: string | null | undefined) => {
    return type?.startsWith('image/');
  };

  const renderAttachment = (note: StudentNote) => {
    if (!note.attachment_url) return null;

    if (isImage(note.attachment_type)) {
      return (
        <div className="mt-2 relative group/img">
          <img
            src={note.attachment_url}
            alt={note.attachment_name || 'Anexo'}
            className="max-w-full max-h-32 rounded-lg border object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(note.attachment_url!, '_blank')}
          />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(note.attachment_url!, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <a
        href={note.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors group/file w-fit"
      >
        <div className="p-1.5 bg-red-500/10 rounded">
          <FileIcon className="h-3.5 w-3.5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate max-w-[150px]">{note.attachment_name}</p>
          {note.attachment_size && (
            <p className="text-[10px] text-muted-foreground">{formatFileSize(note.attachment_size)}</p>
          )}
        </div>
        <Download className="h-3.5 w-3.5 text-muted-foreground group-hover/file:text-foreground transition-colors" />
      </a>
    );
  };

  const getActivityConfig = (actionType: string) => {
    return activityTypeConfig[actionType] || activityTypeConfig.default;
  };

  const hasLocation = localStudent.city || localStudent.state;
  const locationText = [localStudent.city, localStudent.state].filter(Boolean).join(', ');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left Panel - Lead Details */}
            <div className="w-[45%] border-r flex flex-col">
              {/* Header */}
              <div 
                className="p-4 border-b"
                style={{ 
                  background: `linear-gradient(135deg, ${stageColor}15 0%, transparent 100%)`,
                  borderTop: `3px solid ${stageColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold truncate">{localStudent.name}</h2>
                      {localStudent.is_sc_client && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>Cliente S&C</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <Badge 
                      className="mt-2 text-white"
                      style={{ backgroundColor: stageColor }}
                    >
                      {funnelStageLabels[localStudent.funnel_stage || 'novo_lead'] || localStudent.funnel_stage}
                    </Badge>
                  </div>
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              {/* Details List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Contato
                    </h3>
                    
                    <InlineEditField
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={localStudent.email || ''}
                      type="email"
                      placeholder="email@exemplo.com"
                      onSave={(value) => handleInlineUpdate('email', value)}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => val ? (
                        <a href={`mailto:${val}`} className="text-primary hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                          {val}
                        </a>
                      ) : undefined}
                    />

                    <InlineEditField
                      icon={<Phone className="h-4 w-4" />}
                      label="Telefone"
                      value={localStudent.phone || ''}
                      type="tel"
                      placeholder="(00) 00000-0000"
                      onSave={(value) => handleInlineUpdate('phone', value || null)}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => val ? (
                        <a href={`tel:${val}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {val}
                        </a>
                      ) : undefined}
                    />

                    <InlineLocationField
                      icon={<MapPin className="h-4 w-4" />}
                      stateValue={localStudent.state || ''}
                      cityValue={localStudent.city || ''}
                      onSaveState={async (value) => {
                        await handleInlineUpdate('state', value || null);
                      }}
                      onSaveCity={async (value) => {
                        await handleInlineUpdate('city', value || null);
                      }}
                      disabled={!onUpdateStudent}
                    />
                  </div>

                  <Separator />

                  {/* Lead Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Informações do Lead
                    </h3>

                    <InlineEditField
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Curso de Interesse"
                      value={localStudent.course || ''}
                      type="select"
                      options={courseOptions}
                      placeholder="Selecione um curso"
                      onSave={(value) => handleInlineUpdate('course', value || null)}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => val ? <Badge variant="outline">{val}</Badge> : undefined}
                    />

                    <InlineEditField
                      icon={<Globe className="h-4 w-4" />}
                      label="Origem"
                      value={localStudent.lead_source || ''}
                      type="select"
                      options={leadSourceOptions}
                      placeholder="Selecione a origem"
                      onSave={(value) => handleInlineUpdate('lead_source', value || null)}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => val ? (
                        <Badge variant="secondary">
                          {leadSourceLabels[val] || val}
                        </Badge>
                      ) : undefined}
                    />

                    <InlineEditField
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Valor do Negócio"
                      value={localStudent.deal_value ? String(localStudent.deal_value) : ''}
                      type="text"
                      placeholder="0,00"
                      onSave={async (value) => {
                        const numValue = value ? parseFloat(value.replace(',', '.')) : null;
                        await handleInlineUpdate('deal_value', numValue);
                      }}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => {
                        const numVal = parseFloat(val);
                        if (numVal && numVal > 0) {
                          return (
                            <span className="font-semibold text-green-600 dark:text-green-500">
                              {formatCurrency(numVal, localStudent.deal_currency || 'BRL')}
                            </span>
                          );
                        }
                        return undefined;
                      }}
                    />

                    <InlineEditField
                      icon={<Calendar className="h-4 w-4" />}
                      label="Previsão de Fechamento"
                      value={localStudent.expected_close_date || ''}
                      type="text"
                      placeholder="YYYY-MM-DD"
                      onSave={(value) => handleInlineUpdate('expected_close_date', value || null)}
                      disabled={!onUpdateStudent}
                      formatDisplay={(val) => {
                        if (val) {
                          try {
                            return format(new Date(val), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                          } catch {
                            return val;
                          }
                        }
                        return undefined;
                      }}
                    />
                  </div>

                  {/* Tags */}
                  {localStudent.tags && localStudent.tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {localStudent.tags.map((tag, index) => {
                            const [tagName, tagColor] = typeof tag === 'string' && tag.includes('|') 
                              ? tag.split('|') 
                              : [String(tag), '#3B82F6'];
                            return (
                              <span 
                                key={index} 
                                className="text-xs px-2 py-1 rounded text-white" 
                                style={{ backgroundColor: tagColor }}
                              >
                                {tagName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Dates */}
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Datas
                    </h3>
                    
                    <DetailRow icon={<Calendar className="h-4 w-4" />} label="Criado em">
                      {format(new Date(localStudent.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </DetailRow>

                    <DetailRow icon={<Clock className="h-4 w-4" />} label="Última atualização">
                      {format(new Date(localStudent.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </DetailRow>
                  </div>

                  {/* Notes Preview */}
                  {localStudent.notes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Notas Rápidas
                        </h3>
                        <p className="text-sm text-muted-foreground italic">
                          {localStudent.notes.replace(/\[FUNNEL:\w+\]\s*/g, '').trim()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel - Updates & Activity Log */}
            <div className="w-[55%] flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b px-4">
                  <TabsList className="h-12 bg-transparent p-0 gap-4">
                    <TabsTrigger 
                      value="updates" 
                      className="relative h-12 px-0 pb-3 pt-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Atualizações
                      {notes.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 text-xs px-1.5">
                          {notes.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="relative h-12 px-0 pb-3 pt-3 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Log de Atividade
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="updates" className="flex-1 flex flex-col m-0 p-0 data-[state=inactive]:hidden">
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Add Update Form */}
                    <div className="p-4 border-b space-y-3">
                      <Textarea
                        placeholder="Escreva uma atualização e mencione outros com @"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[70px] resize-none"
                      />
                      
                      {/* File Preview */}
                      {selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-8 w-8 object-cover rounded" />
                          ) : (
                            <div className="h-8 w-8 bg-red-500/10 rounded flex items-center justify-center">
                              <FileIcon className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={clearFile}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept={ALLOWED_TYPES.join(',')}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAdding}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </div>
                        <ActionButton
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote.trim() && !selectedFile}
                          loading={isAdding}
                          loadingText="Enviando..."
                        >
                          Publicar
                        </ActionButton>
                      </div>
                    </div>

                    {/* Updates List */}
                    {notesLoading ? (
                      <div className="flex items-center justify-center flex-1">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : notes.length > 0 ? (
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                          {notes.map((note) => (
                            <div key={note.id} className="group">
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {getInitials(note.author_name || 'U')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 bg-muted/50 rounded-lg p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm">
                                        {note.author_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatNoteDate(note.created_at)}
                                      </span>
                                    </div>
                                    {note.created_by === user?.id && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                                        onClick={() => openDeleteDialog(note)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  {note.content && (
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-1.5 leading-relaxed">
                                      {note.content}
                                    </p>
                                  )}
                                  {renderAttachment(note)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Nenhuma atualização ainda
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Adicione uma atualização para acompanhar o histórico deste lead
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="flex-1 m-0 p-0 data-[state=inactive]:hidden overflow-hidden">
                  {logsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : logs.length > 0 ? (
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
                          
                          <div className="space-y-4">
                            {logs.map((log) => {
                              const config = getActivityConfig(log.action_type);
                              return (
                                <div key={log.id} className="flex gap-3 relative">
                                  <div 
                                    className={cn(
                                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-white",
                                      config.color
                                    )}
                                  >
                                    {config.icon}
                                  </div>
                                  <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-sm">
                                          <span className="font-medium">{log.performer_name || 'Sistema'}</span>
                                          <span className="text-muted-foreground"> · {config.label}</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                          {log.description}
                                        </p>
                                      </div>
                                      <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {formatNoteDate(log.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As alterações feitas neste lead aparecerão aqui
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir observação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A observação{noteToDelete?.attachment_url ? ' e seu anexo serão removidos' : ' será removida'} permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper component for detail rows
function DetailRow({ 
  icon, 
  label, 
  children 
}: { 
  icon: React.ReactNode; 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
}
