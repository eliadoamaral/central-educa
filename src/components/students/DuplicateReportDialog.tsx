import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Merge, 
  Mail,
  Phone,
  FileText,
  User,
  Search,
  Filter,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Shield,
  Zap,
  Target,
  LayoutGrid,
  List
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/hooks/useStudents";
import { 
  DuplicateGroup, 
  DuplicateMatchType,
  findDuplicates, 
  getDuplicateStats 
} from "@/utils/duplicateDetection";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DuplicateReportDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  onViewStudent: (studentId: string) => void;
  onMergeStudents: (student1: Student, student2: Student) => void;
  onRefreshStudents?: () => void;
}

// Premium color scheme using design system tokens
const matchTypeConfig: Record<DuplicateMatchType, { 
  label: string; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  icon: typeof CheckCircle2;
  gradient: string;
}> = {
  exact: { 
    label: "Exato", 
    color: "text-destructive", 
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    icon: XCircle,
    gradient: "from-destructive/20 to-destructive/5"
  },
  high: { 
    label: "Alta", 
    color: "text-orange-500 dark:text-orange-400", 
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    icon: AlertTriangle,
    gradient: "from-orange-500/20 to-orange-500/5"
  },
  medium: { 
    label: "Média", 
    color: "text-secondary dark:text-secondary", 
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/20",
    icon: AlertTriangle,
    gradient: "from-secondary/20 to-secondary/5"
  },
  low: { 
    label: "Baixa", 
    color: "text-primary", 
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: Search,
    gradient: "from-primary/20 to-primary/5"
  }
};

const fieldIcons: Record<string, typeof User> = {
  name: User,
  email: Mail,
  phone: Phone,
  cpf: FileText,
  Nome: User,
  'E-mail': Mail,
  Telefone: Phone,
  CPF: FileText
};

// Type for bulk action selection
interface BulkSelection {
  groupId: string;
  keepStudentId: string;
  deleteStudentIds: string[];
}


export function DuplicateReportDialog({
  open,
  onClose,
  students,
  onViewStudent,
  onMergeStudents,
  onRefreshStudents
}: DuplicateReportDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterField, setFilterField] = useState<string>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [resolvedGroups, setResolvedGroups] = useState<Set<string>>(new Set());
  
  // Bulk action states
  const [selectedGroups, setSelectedGroups] = useState<Map<string, BulkSelection>>(new Map());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    setSelectedGroups(new Map());
    setIsBulkMode(false);
    
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const groups = findDuplicates(students, { minSimilarity: 70 });
    setDuplicateGroups(groups);
    setHasScanned(true);
    setIsScanning(false);
    
    // Auto-expand first few groups
    const initialExpanded = new Set(groups.slice(0, 3).map(g => g.id));
    setExpandedGroups(initialExpanded);
  };

  const handleRescan = () => {
    setResolvedGroups(new Set());
    setSelectedGroups(new Map());
    setIsBulkMode(false);
    handleScan();
  };

  const stats = useMemo(() => {
    const unresolvedGroups = duplicateGroups.filter(g => !resolvedGroups.has(g.id));
    return getDuplicateStats(unresolvedGroups);
  }, [duplicateGroups, resolvedGroups]);

  const filteredGroups = useMemo(() => {
    return duplicateGroups.filter(group => {
      if (resolvedGroups.has(group.id)) return false;
      if (filterType !== "all" && group.matchType !== filterType) return false;
      if (filterField !== "all" && group.primaryField !== filterField) return false;
      return true;
    });
  }, [duplicateGroups, filterType, filterField, resolvedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const markAsResolved = (groupId: string) => {
    setResolvedGroups(prev => new Set([...prev, groupId]));
    // Remove from selection
    setSelectedGroups(prev => {
      const next = new Map(prev);
      next.delete(groupId);
      return next;
    });
  };

  const handleMerge = (student1: Student, student2: Student, groupId: string) => {
    onMergeStudents(student1, student2);
    markAsResolved(groupId);
  };

  // Bulk selection handlers
  const toggleGroupSelection = useCallback((group: DuplicateGroup, keepStudentId?: string) => {
    setSelectedGroups(prev => {
      const next = new Map(prev);
      if (next.has(group.id)) {
        next.delete(group.id);
      } else {
        const keep = keepStudentId || group.students[0].id;
        const deleteIds = group.students.filter(s => s.id !== keep).map(s => s.id);
        next.set(group.id, {
          groupId: group.id,
          keepStudentId: keep,
          deleteStudentIds: deleteIds
        });
      }
      return next;
    });
  }, []);

  const updateGroupSelection = useCallback((groupId: string, keepStudentId: string, group: DuplicateGroup) => {
    setSelectedGroups(prev => {
      const next = new Map(prev);
      const deleteIds = group.students.filter(s => s.id !== keepStudentId).map(s => s.id);
      next.set(groupId, {
        groupId,
        keepStudentId,
        deleteStudentIds: deleteIds
      });
      return next;
    });
  }, []);

  const selectAllGroups = useCallback(() => {
    const newSelection = new Map<string, BulkSelection>();
    filteredGroups.forEach(group => {
      const keep = group.students[0].id;
      const deleteIds = group.students.filter(s => s.id !== keep).map(s => s.id);
      newSelection.set(group.id, {
        groupId: group.id,
        keepStudentId: keep,
        deleteStudentIds: deleteIds
      });
    });
    setSelectedGroups(newSelection);
  }, [filteredGroups]);

  const clearSelection = useCallback(() => {
    setSelectedGroups(new Map());
  }, []);

  const totalSelectedForDeletion = useMemo(() => {
    let count = 0;
    selectedGroups.forEach(sel => {
      count += sel.deleteStudentIds.length;
    });
    return count;
  }, [selectedGroups]);

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedGroups.size === 0) return;
    
    setIsProcessingBulk(true);
    setBulkProgress(0);
    
    const allDeleteIds: string[] = [];
    selectedGroups.forEach(sel => {
      allDeleteIds.push(...sel.deleteStudentIds);
    });
    
    let processed = 0;
    let errors = 0;
    
    for (const id of allDeleteIds) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting student:', error);
        errors++;
      }
      
      processed++;
      setBulkProgress(Math.round((processed / allDeleteIds.length) * 100));
    }
    
    // Mark all processed groups as resolved
    const newResolved = new Set(resolvedGroups);
    selectedGroups.forEach((_, groupId) => {
      newResolved.add(groupId);
    });
    setResolvedGroups(newResolved);
    setSelectedGroups(new Map());
    setIsProcessingBulk(false);
    setShowDeleteConfirm(false);
    setIsBulkMode(false);
    
    toast({
      title: "Exclusão em massa concluída",
      description: `${processed - errors} cadastros excluídos${errors > 0 ? `, ${errors} erros` : ''}.`
    });
    
    onRefreshStudents?.();
  };

  // Bulk merge handler - keeps the first student and merges data from others
  const handleBulkMerge = async () => {
    if (selectedGroups.size === 0) return;
    
    setIsProcessingBulk(true);
    setBulkProgress(0);
    
    const selections = Array.from(selectedGroups.values());
    let processed = 0;
    let errors = 0;
    
    for (const sel of selections) {
      try {
        // Find the student data
        const group = duplicateGroups.find(g => g.id === sel.groupId);
        if (!group) continue;
        
        const keepStudent = group.students.find(s => s.id === sel.keepStudentId);
        const deleteStudents = group.students.filter(s => sel.deleteStudentIds.includes(s.id));
        
        if (!keepStudent || deleteStudents.length === 0) continue;
        
        // Merge data from other students into the keep student
        const mergedData: Record<string, string | boolean | null> = {};
        
        // For each field, use the keep student's value if it exists, otherwise use first non-null from others
        const fieldsToMerge = ['phone', 'cpf', 'birth_date', 'city', 'state', 'notes', 'course', 'lead_source'] as const;
        
        for (const field of fieldsToMerge) {
          if (!keepStudent[field]) {
            for (const delStudent of deleteStudents) {
              if (delStudent[field]) {
                mergedData[field] = delStudent[field];
                break;
              }
            }
          }
        }
        
        // Update the keep student with merged data if any
        if (Object.keys(mergedData).length > 0) {
          const { error: updateError } = await supabase
            .from('students')
            .update(mergedData)
            .eq('id', sel.keepStudentId);
          
          if (updateError) throw updateError;
        }
        
        // Delete the duplicate students
        for (const deleteId of sel.deleteStudentIds) {
          const { error: deleteError } = await supabase
            .from('students')
            .delete()
            .eq('id', deleteId);
          
          if (deleteError) throw deleteError;
        }
      } catch (error) {
        console.error('Error in bulk merge:', error);
        errors++;
      }
      
      processed++;
      setBulkProgress(Math.round((processed / selections.length) * 100));
    }
    
    // Mark all processed groups as resolved
    const newResolved = new Set(resolvedGroups);
    selectedGroups.forEach((_, groupId) => {
      newResolved.add(groupId);
    });
    setResolvedGroups(newResolved);
    setSelectedGroups(new Map());
    setIsProcessingBulk(false);
    setShowMergeConfirm(false);
    setIsBulkMode(false);
    
    toast({
      title: "Mesclagem em massa concluída",
      description: `${processed - errors} grupos mesclados${errors > 0 ? `, ${errors} erros` : ''}.`
    });
    
    onRefreshStudents?.();
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-large bg-gradient-to-b from-background to-muted/30">
          {/* Premium Header */}
          <div className="relative px-6 pt-6 pb-4 border-b bg-card">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-outfit font-semibold tracking-tight">
                    Análise de Duplicidades
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Verificação inteligente de cadastros duplicados
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {students.length} cadastros
              </Badge>
            </div>
          </div>

          {!hasScanned ? (
            /* Premium Scan Interface */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-glow-pulse" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <Sparkles className="h-16 w-16 text-primary" />
                </div>
              </div>
              
              <div className="mt-8 text-center space-y-4 max-w-lg">
                <h3 className="text-2xl font-outfit font-semibold tracking-tight">
                  Pronto para analisar
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nossa análise inteligente irá identificar registros duplicados utilizando algoritmos avançados de similaridade.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Target, label: "Correspondência exata", desc: "100% iguais" },
                  { icon: Zap, label: "Alta similaridade", desc: ">90% similar" },
                  { icon: Search, label: "Variações", desc: "Erros de digitação" },
                  { icon: User, label: "Nomes similares", desc: "Algoritmo fuzzy" }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mb-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-center">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleScan} 
                disabled={isScanning} 
                size="lg"
                className="mt-10 px-8 h-12 text-base font-medium shadow-glow btn-premium"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analisando cadastros...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Iniciar Análise
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
              {/* Premium Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'exact' as const, value: stats.exactMatches, label: 'Exatos' },
                  { key: 'high' as const, value: stats.highSimilarity, label: 'Alta' },
                  { key: 'medium' as const, value: stats.mediumSimilarity, label: 'Média' },
                  { key: 'low' as const, value: stats.lowSimilarity, label: 'Baixa' }
                ].map((stat) => {
                  const config = matchTypeConfig[stat.key];
                  const Icon = config.icon;
                  return (
                    <button
                      key={stat.key}
                      onClick={() => setFilterType(filterType === stat.key ? 'all' : stat.key)}
                      className={cn(
                        "relative overflow-hidden p-4 rounded-xl border text-left transition-all",
                        "hover:shadow-soft hover:scale-[1.02]",
                        filterType === stat.key 
                          ? `${config.borderColor} ${config.bgColor} ring-2 ring-offset-2 ring-offset-background ${config.borderColor.replace('border-', 'ring-')}`
                          : "border-border/50 bg-card hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-50",
                        config.gradient
                      )} />
                      <div className="relative flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold font-outfit">{stat.value}</p>
                          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <Select value={filterField} onValueChange={setFilterField}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-card">
                      <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="all">Todos os campos</SelectItem>
                      <SelectItem value="Nome">Nome</SelectItem>
                      <SelectItem value="E-mail">E-mail</SelectItem>
                      <SelectItem value="Telefone">Telefone</SelectItem>
                      <SelectItem value="CPF">CPF</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleRescan}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reescanear</TooltipContent>
                  </Tooltip>
                  
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  
                  {/* Bulk Mode Toggle */}
                  <Button 
                    variant={isBulkMode ? "secondary" : "ghost"} 
                    size="sm"
                    className={cn(
                      "h-8 text-xs",
                      isBulkMode && "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    onClick={() => {
                      setIsBulkMode(!isBulkMode);
                      if (isBulkMode) clearSelection();
                    }}
                  >
                    {isBulkMode ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                        Seleção em Massa
                      </>
                    )}
                  </Button>
                </div>
                
                <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                  {filteredGroups.length} grupos
                </Badge>
              </div>

              {/* Bulk Selection Controls */}
              {isBulkMode && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={selectAllGroups}
                      disabled={selectedGroups.size === filteredGroups.length}
                    >
                      <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                      Selecionar Todos
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={clearSelection}
                      disabled={selectedGroups.size === 0}
                    >
                      <Square className="h-3.5 w-3.5 mr-1.5" />
                      Limpar
                    </Button>
                  </div>
                  
                  <Separator orientation="vertical" className="h-5" />
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-0 font-semibold">
                      {selectedGroups.size} selecionados
                    </Badge>
                    {totalSelectedForDeletion > 0 && (
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        {totalSelectedForDeletion} para excluir
                      </Badge>
                    )}
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="h-8 shadow-soft"
                      onClick={() => setShowMergeConfirm(true)}
                      disabled={selectedGroups.size === 0 || isProcessingBulk}
                    >
                      <Merge className="h-3.5 w-3.5 mr-1.5" />
                      Mesclar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={selectedGroups.size === 0 || isProcessingBulk}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress Bar for Bulk Operations */}
              {isProcessingBulk && (
                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium">Processando operação em massa...</span>
                    </div>
                    <span className="text-muted-foreground">{bulkProgress}%</span>
                  </div>
                  <Progress value={bulkProgress} className="h-2" />
                </div>
              )}

              {/* Duplicate Groups List */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-3 pb-4">
                  {filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 rounded-2xl bg-primary/10 mb-6">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold font-outfit">
                        {stats.totalGroups > 0 ? "Tudo limpo!" : "Nenhuma duplicidade"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                        {stats.totalGroups > 0 
                          ? "Todos os grupos foram filtrados ou resolvidos" 
                          : "Não foram encontrados cadastros duplicados na base"}
                      </p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <DuplicateGroupCard
                      key={group.id}
                      group={group}
                      isExpanded={expandedGroups.has(group.id)}
                      onToggle={() => toggleGroup(group.id)}
                      onViewStudent={onViewStudent}
                      onMerge={(s1, s2) => handleMerge(s1, s2, group.id)}
                      onMarkResolved={() => markAsResolved(group.id)}
                      isBulkMode={isBulkMode}
                      isSelected={selectedGroups.has(group.id)}
                      selectedKeepId={selectedGroups.get(group.id)?.keepStudentId}
                      onToggleSelection={() => toggleGroupSelection(group)}
                      onChangeKeepStudent={(keepId) => updateGroupSelection(group.id, keepId, group)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
      
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirmar Exclusão em Massa
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você está prestes a excluir <strong>{totalSelectedForDeletion} cadastros</strong> de {selectedGroups.size} grupos duplicados.</p>
              <p className="text-destructive font-medium">Esta ação não pode ser desfeita!</p>
              <p>Os cadastros marcados como "manter" serão preservados.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingBulk}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir {totalSelectedForDeletion} Cadastros
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bulk Merge Confirmation Dialog */}
      <AlertDialog open={showMergeConfirm} onOpenChange={setShowMergeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5 text-primary" />
              Confirmar Mesclagem em Massa
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você está prestes a mesclar <strong>{selectedGroups.size} grupos</strong> de cadastros duplicados.</p>
              <p>Para cada grupo:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>O cadastro selecionado como "manter" será atualizado com dados faltantes dos outros</li>
                <li>Os demais cadastros ({totalSelectedForDeletion}) serão excluídos</li>
              </ul>
              <p className="text-muted-foreground text-sm">Esta ação não pode ser desfeita!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingBulk}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkMerge}
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mesclando...
                </>
              ) : (
                <>
                  <Merge className="h-4 w-4 mr-2" />
                  Mesclar {selectedGroups.size} Grupos
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </Dialog>
    </TooltipProvider>
  );
}

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onViewStudent: (studentId: string) => void;
  onMerge: (student1: Student, student2: Student) => void;
  onMarkResolved: () => void;
  isBulkMode?: boolean;
  isSelected?: boolean;
  selectedKeepId?: string;
  onToggleSelection?: () => void;
  onChangeKeepStudent?: (keepId: string) => void;
}

function DuplicateGroupCard({
  group,
  isExpanded,
  onToggle,
  onViewStudent,
  onMerge,
  onMarkResolved,
  isBulkMode = false,
  isSelected = false,
  selectedKeepId,
  onToggleSelection,
  onChangeKeepStudent
}: DuplicateGroupCardProps) {
  const config = matchTypeConfig[group.matchType];
  const Icon = config.icon;
  const FieldIcon = fieldIcons[group.primaryField] || FileText;

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-soft",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isExpanded && "shadow-soft"
      )}
    >
      {/* Gradient accent on left edge */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all",
        `bg-gradient-to-b ${config.gradient}`
      )} />
      
      <div 
        className={cn(
          "relative p-4 pl-5 cursor-pointer transition-colors",
          "hover:bg-muted/30"
        )}
        onClick={isBulkMode ? (e) => { e.stopPropagation(); onToggleSelection?.(); } : onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {isBulkMode && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleSelection?.()}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 shrink-0"
              />
            )}
            <div className={cn(
              "shrink-0 p-2.5 rounded-xl border transition-colors",
              config.bgColor,
              config.borderColor
            )}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {group.students.length} cadastros similares
                </span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5",
                    config.bgColor, config.color
                  )}
                >
                  {group.overallSimilarity}% {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <FieldIcon className="h-3 w-3" />
                <span>Correspondência por {group.primaryField}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isBulkMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); onMarkResolved(); }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ignorar grupo</TooltipContent>
              </Tooltip>
            )}
            <div className={cn(
              "p-1 rounded-md transition-colors",
              "group-hover:bg-muted"
            )}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {(isExpanded || (isBulkMode && isSelected)) && (
        <div className="border-t bg-muted/20 p-4 space-y-4">
          {/* Bulk Mode: Select which student to keep */}
          {isBulkMode && isSelected && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Selecione qual cadastro manter:</p>
              </div>
              <div className="space-y-2">
                {group.students.map((student) => (
                  <label 
                    key={student.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      selectedKeepId === student.id 
                        ? "bg-primary/10 border-2 border-primary shadow-soft" 
                        : "bg-card border border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox 
                      checked={selectedKeepId === student.id}
                      onCheckedChange={() => onChangeKeepStudent?.(student.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                    {selectedKeepId === student.id ? (
                      <Badge className="text-[10px] bg-primary/20 text-primary border-0 font-semibold">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Manter
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 font-medium">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Match Details */}
          {isExpanded && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Campos correspondentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.matches.map((match, idx) => {
                    const matchConfig = matchTypeConfig[match.matchType];
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                          "bg-card hover:bg-muted/50"
                        )}
                      >
                        {fieldIcons[match.fieldLabel] && (
                          <span className="text-muted-foreground">
                            {(() => {
                              const MatchIcon = fieldIcons[match.fieldLabel];
                              return <MatchIcon className="h-3.5 w-3.5" />;
                            })()}
                          </span>
                        )}
                        <span className="text-sm font-medium">{match.fieldLabel}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-[10px] font-semibold", matchConfig.bgColor, matchConfig.color)}
                        >
                          {match.similarity}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Students Comparison */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cadastros encontrados
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.students.map((student, idx) => (
                    <div 
                      key={student.id} 
                      className={cn(
                        "relative p-4 rounded-xl border bg-card transition-all",
                        isBulkMode && isSelected && selectedKeepId === student.id && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          Cadastro {idx + 1}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => onViewStudent(student.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{student.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {student.cpf && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>CPF: {student.cpf}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-[10px] text-muted-foreground">
                          Cadastrado em {format(new Date(student.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {!isBulkMode && group.students.length === 2 && (
                <div className="flex justify-end pt-2">
                  <Button 
                    className="shadow-soft btn-premium"
                    onClick={() => onMerge(group.students[0], group.students[1])}
                  >
                    <Merge className="h-4 w-4 mr-2" />
                    Mesclar Cadastros
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
