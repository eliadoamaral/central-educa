import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Plus, Search, Users, TrendingUp, CheckCircle2, Phone, MoreVertical, Building2, Eye, Edit, ArrowRight, ArrowLeftIcon, Filter, Mail, MapPin, GraduationCap, Globe } from "lucide-react";
import confetti from "canvas-confetti";
import { KanbanActionBar } from "@/components/leads/KanbanActionBar";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadFilters, LeadFiltersState } from "@/components/leads/LeadFilters";
import { LeadCardDisplaySettings, useCardDisplaySettings, CardDisplaySettings } from "@/components/leads/LeadCardDisplaySettings";
import { StageColorPicker } from "@/components/leads/StageColorPicker";
import { LeadDetailModal } from "@/components/leads/LeadDetailModal";
import { WonLeadModal } from "@/components/leads/WonLeadModal";
import { usePageView } from "@/hooks/usePageView";
import { useStudents, StudentInput, Student } from "@/hooks/useStudents";
import { useLeadActivityLogger } from "@/hooks/useLeadActivityLogger";
import { useFunnelStageColors } from "@/hooks/useFunnelStageColors";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { LeadForm, LeadFormData } from "@/components/leads/LeadForm";
import { TagWithColor } from "@/components/leads/TagSelector";
import { MergeSuccessDialog, calculateMergeChanges, MergeChange } from "@/components/MergeSuccessDialog";
import { validateCPF, validatePhone, isCPFComplete, isPhoneComplete } from "@/components/ui/masked-input";
import { validateEmail, isEmailComplete } from "@/components/ui/email-input";

// Funnel stages configuration
const funnelStages = [{
  id: "novo_lead",
  label: "Novo Lead",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: ["inactive"]
}, {
  id: "primeiro_contato",
  label: "1º Contato",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: []
}, {
  id: "qualificado",
  label: "Qualificado",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: []
}, {
  id: "proposta",
  label: "Proposta",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: []
}, {
  id: "matriculado",
  label: "Matriculado",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: ["active"]
}, {
  id: "perdido",
  label: "Perdido",
  color: "bg-muted-foreground/60",
  textColor: "text-foreground",
  bgLight: "bg-muted/30 dark:bg-muted/10",
  borderColor: "border-border",
  statuses: ["dropped"]
}];
const leadSources = [{
  value: "indicacao",
  label: "Indicação"
}, {
  value: "evento",
  label: "Evento"
}, {
  value: "redes_sociais",
  label: "Redes Sociais"
}, {
  value: "google",
  label: "Google/Busca"
}, {
  value: "linkedin",
  label: "LinkedIn"
}, {
  value: "instagram",
  label: "Instagram"
}, {
  value: "youtube",
  label: "YouTube"
}, {
  value: "email_marketing",
  label: "Email Marketing"
}, {
  value: "parceiro",
  label: "Parceiro/Afiliado"
}, {
  value: "outro",
  label: "Outro"
}];
const leadSourceLabels: Record<string, string> = leadSources.reduce((acc, source) => {
  acc[source.value] = source.label;
  return acc;
}, {} as Record<string, string>);
const courses = ["Sucessores do Agro", "Gestoras do Agro", "Reforma Tributária", "Gestão Estratégica de Pessoas"];

// Get funnel stage from the dedicated column
const getFunnelStage = (student: {
  funnel_stage?: string | null;
  notes?: string | null;
}): string => {
  // First check the dedicated column
  if (student.funnel_stage) return student.funnel_stage;

  // Fallback to notes for legacy data (will be migrated)
  if (student.notes) {
    const match = student.notes.match(/\[FUNNEL:(\w+)\]/);
    if (match) return match[1];
  }
  return "novo_lead";
};

// Clean notes by removing any legacy FUNNEL prefix
const getCleanNotes = (notes: string | null): string => {
  return notes?.replace(/\[FUNNEL:\w+\]\s*/g, "").trim() || "";
};
interface LeadCardProps {
  student: ReturnType<typeof useStudents>["students"][0];
  stage: typeof funnelStages[0];
  stageColor: string;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onView: () => void;
  onEdit: () => void;
  onClick: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onDragStart: (e: React.DragEvent, studentId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  displaySettings: CardDisplaySettings;
}

// Currency formatting helper
const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  const currencyConfig: Record<string, {
    locale: string;
    currency: string;
  }> = {
    'BRL': {
      locale: 'pt-BR',
      currency: 'BRL'
    },
    'USD': {
      locale: 'en-US',
      currency: 'USD'
    },
    'EUR': {
      locale: 'de-DE',
      currency: 'EUR'
    }
  };
  const config = currencyConfig[currency] || currencyConfig['BRL'];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
function LeadCard({
  student,
  stage,
  stageColor,
  onMoveLeft,
  onMoveRight,
  onView,
  onEdit,
  onClick,
  canMoveLeft,
  canMoveRight,
  onDragStart,
  onDragEnd,
  isDragging,
  displaySettings
}: LeadCardProps) {
  const navigate = useNavigate();
  const hasLocation = student.city || student.state;
  const locationText = [student.city, student.state].filter(Boolean).join(", ");

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons, dropdown, or dragging
    if ((e.target as HTMLElement).closest('button, [role="menu"], [role="menuitem"]')) {
      return;
    }
    onClick();
  };

  return (
    <Card 
      draggable 
      onDragStart={e => onDragStart(e, student.id)} 
      onDragEnd={onDragEnd} 
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4", 
        isDragging && "opacity-50 scale-95 shadow-lg cursor-grabbing"
      )}
      style={{ borderLeftColor: stageColor }}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header with name and menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {displaySettings.showName && (
              <div className="flex items-start gap-2">
                <h4 className="font-medium text-foreground text-sm leading-tight break-words line-clamp-2">
                  {student.name}
                </h4>
                {student.is_sc_client && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    </TooltipTrigger>
                    <TooltipContent>Cliente S&C</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/alunos/${student.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canMoveLeft && (
                <DropdownMenuItem onClick={onMoveLeft}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Mover para trás
                </DropdownMenuItem>
              )}
              {canMoveRight && (
                <DropdownMenuItem onClick={onMoveRight}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Avançar etapa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Email */}
        {displaySettings.showEmail && student.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
        )}

        {/* Phone */}
        {displaySettings.showPhone && student.phone && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{student.phone}</span>
          </div>
        )}

        {/* Location */}
        {displaySettings.showLocation && hasLocation && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {/* Course Badge - linha separada */}
        {displaySettings.showCourse && student.course && (
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {student.course}
            </Badge>
          </div>
        )}

        {/* Source Badge - linha separada */}
        {displaySettings.showSource && student.lead_source && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {leadSourceLabels[student.lead_source] || student.lead_source}
            </Badge>
          </div>
        )}

        {/* Tags Display - linha separada */}
        {displaySettings.showTags && student.tags && student.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {student.tags.slice(0, 2).map((tag, index) => {
              const [tagName, tagColor] = typeof tag === 'string' && tag.includes('|') 
                ? tag.split('|') 
                : [String(tag), '#3B82F6'];
              return (
                <span 
                  key={index} 
                  className="text-[10px] px-1.5 py-0.5 rounded text-white truncate max-w-[80px]" 
                  style={{ backgroundColor: tagColor }}
                >
                  {tagName}
                </span>
              );
            })}
            {student.tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                +{student.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Notes */}
        {displaySettings.showNotes && getCleanNotes(student.notes) && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            {getCleanNotes(student.notes)}
          </p>
        )}

        {/* Footer: Date and Value */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {displaySettings.showDate && (
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {format(new Date(student.created_at), "dd/MM/yy", { locale: ptBR })}
              </span>
            )}
            
            {/* Deal Value Display */}
            {displaySettings.showValue && student.deal_value && student.deal_value > 0 && (
              <span className="text-xs font-semibold text-muted-foreground">
                {formatCurrency(student.deal_value, student.deal_currency || 'BRL')}
              </span>
            )}
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            {canMoveLeft && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100" 
                onClick={e => {
                  e.stopPropagation();
                  onMoveLeft();
                }}
              >
                <ArrowLeftIcon className="h-3 w-3" />
              </Button>
            )}
            {canMoveRight && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100" 
                onClick={e => {
                  e.stopPropagation();
                  onMoveRight();
                }}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default function Prospeccao() {
  usePageView('/prospeccao');
  const navigate = useNavigate();
  const {
    students,
    loading,
    createStudent,
    updateStudent,
    deleteStudent,
    fetchStudents
  } = useStudents();
  const { settings: displaySettings, setSettings: setDisplaySettings } = useCardDisplaySettings();
  const { getStageColor, updateColor, isUpdating: isUpdatingColor } = useFunnelStageColors();
  const { logStageChange, logLeadCreated, logLeadUpdated, logLeadWon, logLeadLost, logLeadDeleted } = useLeadActivityLogger();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LeadFiltersState>({
    courses: [],
    sources: [],
    funnelStages: [],
    scClient: "all",
    states: [],
    cities: [],
    dateFrom: "",
    dateTo: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<typeof students[0] | null>(null);
  
  // Lead detail modal state
  const [detailModalStudent, setDetailModalStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [returnToDetailAfterEdit, setReturnToDetailAfterEdit] = useState(false);

  // Drag and drop state
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Merge success dialog state
  const [mergeSuccessOpen, setMergeSuccessOpen] = useState(false);
  const [mergeSuccessData, setMergeSuccessData] = useState<{
    studentName: string;
    studentId: string;
    changes: MergeChange[];
  } | null>(null);

  // Won lead modal state
  const [wonLeadModalOpen, setWonLeadModalOpen] = useState(false);
  const [wonLeadData, setWonLeadData] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
    course: "",
    lead_source: "",
    notes: "",
    city: "",
    state: "",
    cep: "",
    address: "",
    funnel_stage: "novo_lead",
    value: "",
    currency: "BRL",
    phones: [] as {
      value: string;
      type: string;
    }[],
    emails: [] as {
      value: string;
      type: string;
    }[],
    tags: [] as TagWithColor[],
    expected_close_date: ""
  });
  const resetForm = (preselectedStage?: string) => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birth_date: "",
      course: "",
      lead_source: "",
      notes: "",
      city: "",
      state: "",
      cep: "",
      address: "",
      funnel_stage: preselectedStage || "novo_lead",
      value: "",
      currency: "BRL",
      phones: [],
      emails: [],
      tags: [],
      expected_close_date: ""
    });
    setEditingStudent(null);
  };

  // Open add dialog with preselected stage
  const openAddDialogWithStage = useCallback((stageId: string) => {
    resetForm(stageId);
    setIsAddDialogOpen(true);
  }, []);

  // Duplicate check for lead form
  const duplicateExcludeId = useMemo(() => editingStudent?.id || null, [editingStudent?.id]);
  const duplicateCheck = useDuplicateCheck({
    cpf: formData.cpf,
    phone: formData.phone,
    email: formData.email,
    name: formData.name,
    excludeId: duplicateExcludeId,
    debounceMs: 500
  });
  const handleViewDuplicateStudent = (studentId: string) => {
    setIsAddDialogOpen(false);
    navigate(`/alunos/${studentId}`);
  };

  // Handler for merging duplicate leads
  const handleMergeLeads = useCallback(async (mergedData: any, existingStudentId: string) => {
    try {
      // Get existing student data for comparison
      const {
        data: existingStudent
      } = await supabase.from('students').select('*').eq('id', existingStudentId).single();

      // Determine status based on funnel stage
      let status = 'inactive';
      if (formData.funnel_stage === 'matriculado') {
        status = 'active';
      } else if (formData.funnel_stage === 'perdido') {
        status = 'dropped';
      }

      // Calculate changes for the summary
      const fieldsToCompare = ['name', 'email', 'phone', 'cpf', 'birth_date', 'city', 'state', 'notes', 'lead_source', 'course'];
      const changes = calculateMergeChanges(existingStudent || {}, mergedData, fieldsToCompare);

      // Update the existing student with the merged data
      await updateStudent(existingStudentId, {
        name: mergedData.name,
        email: mergedData.email,
        phone: mergedData.phone || null,
        cpf: mergedData.cpf || null,
        birth_date: mergedData.birth_date || null,
        city: mergedData.city || null,
        state: mergedData.state || null,
        notes: mergedData.notes || null,
        course: mergedData.course || null,
        lead_source: mergedData.lead_source || null,
        funnel_stage: formData.funnel_stage,
        status: status
      });

      // Close dialogs and reset form
      setIsAddDialogOpen(false);
      resetForm();

      // Refresh data
      fetchStudents();

      // Show success dialog with summary
      setMergeSuccessData({
        studentName: mergedData.name,
        studentId: existingStudentId,
        changes
      });
      setMergeSuccessOpen(true);
    } catch (error: any) {
      console.error('Error merging leads:', error);
      toast({
        title: "Erro ao mesclar leads",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [updateStudent, formData.funnel_stage, resetForm, fetchStudents]);

  // Filter only leads (not graduated students)
  const leads = useMemo(() => {
    return students.filter(s => s.status !== "graduated");
  }, [students]);

  // Get available states and cities for filter options
  const availableStates = useMemo(() => {
    return [...new Set(leads.map(s => s.state).filter(Boolean))].sort() as string[];
  }, [leads]);
  const availableCities = useMemo(() => {
    const filteredByState = filters.states.length > 0 ? leads.filter(s => filters.states.includes(s.state || '')) : leads;
    return [...new Set(filteredByState.map(s => s.city).filter(Boolean))].sort() as string[];
  }, [leads, filters.states]);

  // Apply search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter(student => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = student.name.toLowerCase().includes(search) || student.email.toLowerCase().includes(search) || student.phone?.toLowerCase().includes(search) || student.city?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Course filter
      if (filters.courses.length > 0 && !filters.courses.includes(student.course || '')) return false;

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(student.lead_source || '')) return false;

      // Funnel stage filter
      if (filters.funnelStages.length > 0) {
        const studentStage = getFunnelStage(student);
        if (!filters.funnelStages.includes(studentStage)) return false;
      }

      // S&C Client filter
      if (filters.scClient === "yes" && !student.is_sc_client) return false;
      if (filters.scClient === "no" && student.is_sc_client) return false;

      // State filter
      if (filters.states.length > 0 && !filters.states.includes(student.state || '')) return false;

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(student.city || '')) return false;

      // Date filters
      if (filters.dateFrom) {
        const createdAt = new Date(student.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (createdAt < fromDate) return false;
      }
      if (filters.dateTo) {
        const createdAt = new Date(student.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (createdAt > toDate) return false;
      }
      return true;
    });
  }, [leads, searchTerm, filters]);

  // Group leads by funnel stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, typeof students> = {};
    funnelStages.forEach(stage => {
      grouped[stage.id] = [];
    });
    filteredLeads.forEach(student => {
      const stage = getFunnelStage(student);
      // Also consider status for automatic categorization
      if (student.status === "active" && stage === "novo_lead") {
        grouped["matriculado"].push(student);
      } else if (student.status === "dropped") {
        grouped["perdido"].push(student);
      } else if (grouped[stage]) {
        grouped[stage].push(student);
      } else {
        grouped["novo_lead"].push(student);
      }
    });
    return grouped;
  }, [filteredLeads]);

  // Calculate metrics per stage (total value and count)
  const stageMetrics = useMemo(() => {
    const metrics: Record<string, {
      totalValue: number;
      count: number;
    }> = {};
    funnelStages.forEach(stage => {
      const stageLeads = leadsByStage[stage.id] || [];
      const totalValue = stageLeads.reduce((sum, student) => {
        return sum + (student.deal_value || 0);
      }, 0);
      metrics[stage.id] = {
        totalValue,
        count: stageLeads.length
      };
    });
    return metrics;
  }, [leadsByStage]);

  // Calculate funnel metrics
  const funnelMetrics = useMemo(() => {
    const total = filteredLeads.length;
    const newLeads = leadsByStage["novo_lead"]?.length || 0;
    const qualified = leadsByStage["qualificado"]?.length || 0;
    const proposals = leadsByStage["proposta"]?.length || 0;
    const enrolled = leadsByStage["matriculado"]?.length || 0;
    const lost = leadsByStage["perdido"]?.length || 0;
    const conversionRate = total > 0 ? Math.round(enrolled / total * 100) : 0;
    const lossRate = total > 0 ? Math.round(lost / total * 100) : 0;
    return {
      total,
      newLeads,
      qualified,
      proposals,
      enrolled,
      lost,
      conversionRate,
      lossRate
    };
  }, [filteredLeads, leadsByStage]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || filters.courses.length > 0 || filters.sources.length > 0 || filters.funnelStages.length > 0 || filters.scClient !== "all" || filters.states.length > 0 || filters.cities.length > 0 || filters.dateFrom !== "" || filters.dateTo !== "";
  }, [searchTerm, filters]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', studentId);
  }, []);
  const handleDragEnd = useCallback(() => {
    setDraggedStudentId(null);
    setDragOverStageId(null);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  }, [dragOverStageId]);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the stage column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverStageId(null);
    }
  }, []);

  // Trigger confetti animation for won leads
  const triggerWonConfetti = useCallback(() => {
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
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('text/plain');
    setDraggedStudentId(null);
    setDragOverStageId(null);
    if (!studentId) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const currentStage = getFunnelStage(student);
    if (currentStage === targetStageId) return; // No change needed

    const targetStage = funnelStages.find(s => s.id === targetStageId);
    if (!targetStage) return;

    // Determine new status based on stage
    let newStatus = student.status;
    if (targetStageId === "matriculado") {
      newStatus = "active";
    } else if (targetStageId === "perdido") {
      newStatus = "dropped";
    } else if (student.status === "active" || student.status === "dropped") {
      newStatus = "inactive";
    }
    const success = await updateStudent(student.id, {
      funnel_stage: targetStageId,
      status: newStatus
    });
    if (success) {
      // Log the stage change
      await logStageChange(student.id, student.name, currentStage, targetStageId);
      
      // If moved to matriculado, trigger celebration
      if (targetStageId === "matriculado") {
        await logLeadWon(student.id, student.name);
        triggerWonConfetti();
        setTimeout(() => {
          setWonLeadData({
            studentId: student.id,
            studentName: student.name
          });
          setWonLeadModalOpen(true);
        }, 500);
      } else {
        toast({
          title: "Lead movido",
          description: `${student.name} movido para ${targetStage.label}`
        });
      }
    }
  }, [students, updateStudent, logStageChange, logLeadWon]);
  const handleMoveStage = async (student: typeof students[0], direction: 'left' | 'right') => {
    const currentStage = getFunnelStage(student);
    const currentIndex = funnelStages.findIndex(s => s.id === currentStage);
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= funnelStages.length) return;
    const newStage = funnelStages[newIndex];

    // Determine new status based on stage
    let newStatus = student.status;
    if (newStage.id === "matriculado") {
      newStatus = "active";
    } else if (newStage.id === "perdido") {
      newStatus = "dropped";
    } else if (student.status === "active" || student.status === "dropped") {
      newStatus = "inactive"; // Reset to inactive if moving from enrolled/lost
    }
    const success = await updateStudent(student.id, {
      funnel_stage: newStage.id,
      status: newStatus
    });
    if (success) {
      // Log the stage change
      await logStageChange(student.id, student.name, currentStage, newStage.id);
      
      // If moved to matriculado, trigger celebration
      if (newStage.id === "matriculado") {
        await logLeadWon(student.id, student.name);
        triggerWonConfetti();
        setTimeout(() => {
          setWonLeadData({
            studentId: student.id,
            studentName: student.name
          });
          setWonLeadModalOpen(true);
        }, 500);
      } else {
        toast({
          title: "Lead movido",
          description: `${student.name} movido para ${newStage.label}`
        });
      }
    }
  };

  // Handle action bar drop (delete, lost, won)
  const handleActionBarDrop = useCallback(async (action: "delete" | "lost" | "won", studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const currentStage = getFunnelStage(student);
    
    if (action === "delete") {
      // Soft delete the lead using the deleteStudent method
      try {
        await deleteStudent(studentId);
        await logLeadDeleted(studentId, student.name);
        toast({
          title: "Lead excluído",
          description: `${student.name} foi movido para a lixeira`
        });
      } catch (error) {
        // Error handling is done in deleteStudent
      }
    } else if (action === "lost") {
      // Mark as lost
      const success = await updateStudent(studentId, {
        funnel_stage: "perdido",
        status: "dropped"
      });
      if (success) {
        await logLeadLost(studentId, student.name);
        await logStageChange(studentId, student.name, currentStage, "perdido");
        toast({
          title: "Lead marcado como perdido",
          description: `${student.name} foi movido para Perdido`
        });
      }
    } else if (action === "won") {
      // Mark as won (matriculado)
      const success = await updateStudent(studentId, {
        funnel_stage: "matriculado",
        status: "active"
      });
      if (success) {
        await logLeadWon(studentId, student.name);
        await logStageChange(studentId, student.name, currentStage, "matriculado");
        
        // Show won lead modal after a short delay for confetti to be visible
        setTimeout(() => {
          setWonLeadData({
            studentId: studentId,
            studentName: student.name
          });
          setWonLeadModalOpen(true);
        }, 500);
      }
    }
    setDraggedStudentId(null);
    setDragOverStageId(null);
  }, [students, updateStudent, deleteStudent, logLeadDeleted, logLeadLost, logLeadWon, logStageChange]);
  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Erro",
        description: emailValidation.error || "Email inválido",
        variant: "destructive"
      });
      return;
    }
    if (formData.email.includes("@") && !isEmailComplete(formData.email)) {
      toast({
        title: "Erro",
        description: "Email está incompleto",
        variant: "destructive"
      });
      return;
    }

    // Validate CPF and phone if provided
    const cpfHasContent = formData.cpf.replace(/\D/g, "").length > 0;
    const phoneHasContent = formData.phone.replace(/\D/g, "").length > 0;
    if (cpfHasContent) {
      if (!isCPFComplete(formData.cpf)) {
        toast({
          title: "Erro",
          description: "CPF está incompleto",
          variant: "destructive"
        });
        return;
      }
      if (!validateCPF(formData.cpf)) {
        toast({
          title: "Erro",
          description: "CPF inválido",
          variant: "destructive"
        });
        return;
      }
    }
    if (phoneHasContent) {
      if (!isPhoneComplete(formData.phone)) {
        toast({
          title: "Erro",
          description: "Telefone está incompleto",
          variant: "destructive"
        });
        return;
      }
      if (!validatePhone(formData.phone)) {
        toast({
          title: "Erro",
          description: "Telefone inválido",
          variant: "destructive"
        });
        return;
      }
    }
    const studentData: StudentInput = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      cpf: formData.cpf || null,
      birth_date: formData.birth_date || null,
      course: formData.course || null,
      lead_source: formData.lead_source || null,
      notes: formData.notes || null,
      city: formData.city || null,
      state: formData.state || null,
      cep: formData.cep || null,
      address: formData.address || null,
      status: formData.funnel_stage === "matriculado" ? "active" : formData.funnel_stage === "perdido" ? "dropped" : "inactive",
      is_sc_client: false,
      deal_value: formData.value ? parseFloat(formData.value) / 100 : null,
      deal_currency: formData.currency || "BRL",
      phones: formData.phones?.length ? formData.phones : null,
      emails: formData.emails?.length ? formData.emails : null,
      tags: formData.tags?.length ? formData.tags.map(t => typeof t === 'string' ? t : `${t.name}|${t.color}`) : null,
      expected_close_date: formData.expected_close_date || null,
      funnel_stage: formData.funnel_stage
    };
    try {
      if (editingStudent) {
        // Build changes object for logging
        const changes: Record<string, { from: any; to: any }> = {};
        
        // Compare relevant fields
        if (editingStudent.name !== studentData.name) {
          changes.name = { from: editingStudent.name, to: studentData.name };
        }
        if (editingStudent.email !== studentData.email) {
          changes.email = { from: editingStudent.email, to: studentData.email };
        }
        if (editingStudent.phone !== studentData.phone) {
          changes.phone = { from: editingStudent.phone, to: studentData.phone };
        }
        if (editingStudent.course !== studentData.course) {
          changes.course = { from: editingStudent.course, to: studentData.course };
        }
        if (editingStudent.lead_source !== studentData.lead_source) {
          changes.lead_source = { from: editingStudent.lead_source, to: studentData.lead_source };
        }
        if (editingStudent.city !== studentData.city) {
          changes.city = { from: editingStudent.city, to: studentData.city };
        }
        if (editingStudent.state !== studentData.state) {
          changes.state = { from: editingStudent.state, to: studentData.state };
        }
        if (editingStudent.deal_value !== studentData.deal_value) {
          changes.deal_value = { from: editingStudent.deal_value, to: studentData.deal_value };
        }
        if (editingStudent.expected_close_date !== studentData.expected_close_date) {
          changes.expected_close_date = { from: editingStudent.expected_close_date, to: studentData.expected_close_date };
        }
        
        const currentStage = getFunnelStage(editingStudent);
        const stageChanged = currentStage !== studentData.funnel_stage;
        
        await updateStudent(editingStudent.id, studentData);
        
        // Log the update if there are changes
        if (Object.keys(changes).length > 0) {
          await logLeadUpdated(editingStudent.id, editingStudent.name, changes);
        }
        
        // Log stage change separately if it changed
        if (stageChanged && studentData.funnel_stage) {
          await logStageChange(editingStudent.id, editingStudent.name, currentStage, studentData.funnel_stage);
        }
      } else {
        const newStudent = await createStudent(studentData);
        
        // Log creation
        if (newStudent) {
          await logLeadCreated(newStudent.id, newStudent.name, studentData.funnel_stage || 'novo_lead');
        }
      }
      toast({
        title: editingStudent ? "Lead atualizado" : "Lead criado",
        description: `${formData.name} foi ${editingStudent ? 'atualizado' : 'adicionado'} ao funil`
      });
      setIsAddDialogOpen(false);
      
      // If editing from detail modal, reopen it with updated data
      if (returnToDetailAfterEdit && editingStudent) {
        // Create updated student object with new data
        const updatedStudent: Student = {
          ...editingStudent,
          ...studentData,
          updated_at: new Date().toISOString()
        };
        setDetailModalStudent(updatedStudent);
        setIsDetailModalOpen(true);
        setReturnToDetailAfterEdit(false);
      }
      
      resetForm();
    } catch (error) {
      // Error already handled by useStudents hook
    }
  };
  const openEditDialog = (student: typeof students[0]) => {
    setEditingStudent(student);
    // Convert stored tags (string format "name|color") to TagWithColor[]
    const tagsWithColor: TagWithColor[] = (student.tags || []).map(tag => {
      if (typeof tag === 'string' && tag.includes('|')) {
        const [name, color] = tag.split('|');
        return {
          name,
          color: color || '#3B82F6'
        };
      }
      return {
        name: String(tag),
        color: '#3B82F6'
      };
    });
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || "",
      cpf: student.cpf || "",
      birth_date: student.birth_date || "",
      course: student.course || "",
      lead_source: student.lead_source || "",
      notes: getCleanNotes(student.notes),
      city: student.city || "",
      state: student.state || "",
      cep: student.cep || "",
      address: student.address || "",
      funnel_stage: getFunnelStage(student),
      value: student.deal_value ? Math.round(student.deal_value * 100).toString() : "",
      currency: student.deal_currency || "BRL",
      phones: student.phones || [],
      emails: student.emails || [],
      tags: tagsWithColor,
      expected_close_date: student.expected_close_date || ""
    });
    setIsAddDialogOpen(true);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Prospecção</h1>
                  <p className="text-sm text-muted-foreground">Funil de vendas e gestão de leads</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] lg:flex-none lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              
              <LeadFilters filters={filters} onFiltersChange={setFilters} courseOptions={courses.map(c => ({
                value: c,
                label: c
              }))} sourceOptions={leadSources} funnelStageOptions={funnelStages.map(s => ({
                value: s.id,
                label: s.label
              }))} stateOptions={availableStates} cityOptions={availableCities} />
              
              <LeadCardDisplaySettings settings={displaySettings} onSettingsChange={setDisplaySettings} />
              
              <ActionButton onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </ActionButton>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards with animation */}
        <div 
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            displaySettings.showKPICards 
              ? "grid-rows-[1fr] opacity-100" 
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-visible">
            <div className="space-y-3 py-2">
              {/* Filter Active Indicator */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                  <Filter className="h-3 w-3" />
                  <span>Exibindo resultados filtrados ({filteredLeads.length} de {leads.length} leads)</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Total Leads - uses neutral gray */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('novo_lead')}10`,
                    borderColor: `${getStageColor('novo_lead')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Total Leads</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.total}
                    </span>
                  </CardContent>
                </Card>
                
                {/* Novos - novo_lead stage */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('novo_lead')}10`,
                    borderColor: `${getStageColor('novo_lead')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Novos</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.newLeads}
                    </span>
                  </CardContent>
                </Card>
                
                {/* Qualificados - qualificado stage */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('qualificado')}10`,
                    borderColor: `${getStageColor('qualificado')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Qualificados</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.qualified}
                    </span>
                  </CardContent>
                </Card>
                
                {/* Propostas - proposta stage */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('proposta')}10`,
                    borderColor: `${getStageColor('proposta')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Propostas</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.proposals}
                    </span>
                  </CardContent>
                </Card>
                
                {/* Matriculados - matriculado stage */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('matriculado')}10`,
                    borderColor: `${getStageColor('matriculado')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Matriculados</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.enrolled}
                    </span>
                  </CardContent>
                </Card>
                
                {/* Conversão - uses green/success color */}
                <Card 
                  className={cn(
                    "border-2 shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out cursor-default group", 
                    hasActiveFilters && "ring-1 ring-primary/20"
                  )}
                  style={{
                    backgroundColor: `${getStageColor('matriculado')}10`,
                    borderColor: `${getStageColor('matriculado')}30`,
                  }}
                >
                  <CardContent className="p-4">
                    <p className="text-muted-foreground font-medium mb-2 text-sm">Conversão</p>
                    <span className="text-2xl font-bold font-outfit text-foreground">
                      {funnelMetrics.conversionRate}%
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {funnelStages.map((stage, stageIndex) => {
              const stageColor = getStageColor(stage.id);
              // Generate a subtle background color from the stage color (10% opacity)
              const stageBgColor = `${stageColor}15`; // Hex with alpha
              const stageBorderColor = `${stageColor}40`; // Hex with alpha for border
              return (
                <div 
                  key={stage.id} 
                  className={cn(
                    "w-72 flex-shrink-0 rounded-xl border-2 transition-colors duration-200 group/stage",
                    dragOverStageId === stage.id && draggedStudentId && "!bg-foreground/10 dark:!bg-foreground/20 !border-primary"
                  )}
                  style={{
                    backgroundColor: dragOverStageId === stage.id && draggedStudentId ? undefined : stageBgColor,
                    borderColor: dragOverStageId === stage.id && draggedStudentId ? undefined : stageBorderColor,
                  }}
                  onDragOver={e => handleDragOver(e, stage.id)} 
                  onDragLeave={handleDragLeave} 
                  onDrop={e => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="relative">
                    <div className="p-3 border-b border-border/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: stageColor }}
                            />
                            <h3 className={cn("font-semibold text-sm", stage.textColor)}>
                              {stage.label}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground ml-4.5">
                            {formatCurrency(stageMetrics[stage.id]?.totalValue || 0, 'BRL')} · {stageMetrics[stage.id]?.count || 0} {stageMetrics[stage.id]?.count === 1 ? 'negócio' : 'negócios'}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <StageColorPicker
                            currentColor={stageColor}
                            onColorChange={(color) => updateColor({ stageId: stage.id, color })}
                            isUpdating={isUpdatingColor}
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/stage:opacity-100 transition-opacity" onClick={() => openAddDialogWithStage(stage.id)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Adicionar lead nesta etapa</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stage Content */}
                  <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
                    <div className="p-2 space-y-2">
                      {leadsByStage[stage.id]?.map(student => (
                        <LeadCard 
                          key={student.id} 
                          student={student} 
                          stage={stage}
                          stageColor={stageColor}
                          onMoveLeft={() => handleMoveStage(student, 'left')} 
                          onMoveRight={() => handleMoveStage(student, 'right')} 
                          onView={() => navigate(`/alunos/${student.id}`)} 
                          onEdit={() => openEditDialog(student)} 
                          // onClick desabilitado temporariamente - TODO: Reativar modal de detalhes futuramente
                          onClick={() => {}}
                          canMoveLeft={stageIndex > 0} 
                          canMoveRight={stageIndex < funnelStages.length - 1} 
                          onDragStart={handleDragStart} 
                          onDragEnd={handleDragEnd} 
                          isDragging={draggedStudentId === student.id} 
                          displaySettings={displaySettings} 
                        />
                      ))}
                      
                      {(!leadsByStage[stage.id] || leadsByStage[stage.id].length === 0) && (
                        <div className="py-8 text-center text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhum lead</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          // Dialog is closing
          if (returnToDetailAfterEdit && editingStudent) {
            // Return to detail modal
            const currentStudent = students.find(s => s.id === editingStudent.id);
            if (currentStudent) {
              setDetailModalStudent(currentStudent);
              setIsDetailModalOpen(true);
            }
            setReturnToDetailAfterEdit(false);
          }
          setIsAddDialogOpen(false);
          resetForm();
        } else {
          setIsAddDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-5xl p-0 border-0 overflow-hidden">
          <LeadForm formData={formData} onFormDataChange={data => setFormData({
          ...formData,
          ...data
        } as typeof formData)} funnelStages={funnelStages} courses={courses} leadSources={leadSources} duplicateCheck={duplicateCheck} onViewDuplicateStudent={handleViewDuplicateStudent} onMerge={handleMergeLeads} onSubmit={handleSubmit} onCancel={() => {
          if (returnToDetailAfterEdit && editingStudent) {
            // Return to detail modal
            const currentStudent = students.find(s => s.id === editingStudent.id);
            if (currentStudent) {
              setDetailModalStudent(currentStudent);
              setIsDetailModalOpen(true);
            }
            setReturnToDetailAfterEdit(false);
          }
          setIsAddDialogOpen(false);
          resetForm();
        }} isEditing={!!editingStudent} />
        </DialogContent>
      </Dialog>

      {/* Merge Success Dialog */}
      <MergeSuccessDialog open={mergeSuccessOpen} onClose={() => {
      setMergeSuccessOpen(false);
      setMergeSuccessData(null);
    }} studentName={mergeSuccessData?.studentName || ""} changes={mergeSuccessData?.changes || []} onViewStudent={mergeSuccessData?.studentId ? () => {
      setMergeSuccessOpen(false);
      navigate(`/alunos/${mergeSuccessData.studentId}`);
    } : undefined} />

      {/* Kanban Action Bar - appears when dragging */}
      <KanbanActionBar isDragging={!!draggedStudentId} onDrop={handleActionBarDrop} />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        student={detailModalStudent}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        stageColor={detailModalStudent ? getStageColor(detailModalStudent.funnel_stage || 'novo_lead') : undefined}
        onUpdateStudent={updateStudent}
        onStudentUpdated={(updated) => setDetailModalStudent(updated)}
        onRefreshStudents={fetchStudents}
        onEdit={() => {
          if (detailModalStudent) {
            setReturnToDetailAfterEdit(true);
            setIsDetailModalOpen(false);
            openEditDialog(detailModalStudent);
          }
        }}
      />

      {/* Won Lead Success Modal */}
      <WonLeadModal
        open={wonLeadModalOpen}
        onOpenChange={setWonLeadModalOpen}
        studentName={wonLeadData?.studentName || ""}
        onCompleteRegistration={() => {
          setWonLeadModalOpen(false);
          if (wonLeadData?.studentId) {
            navigate(`/alunos/${wonLeadData.studentId}`);
          }
        }}
        onClose={() => {
          setWonLeadModalOpen(false);
          setWonLeadData(null);
        }}
      />
    </div>;
}