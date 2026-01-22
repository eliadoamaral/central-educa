import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, RotateCcw, AlertTriangle, Loader2, Search, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { Student } from "@/hooks/useStudents";
interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedStudents: Student[];
  loading: boolean;
  onRestore: (id: string) => Promise<Student | void>;
  onRestoreMultiple: (ids: string[]) => Promise<Student[] | void>;
  onPermanentlyDelete: (id: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
  onRefresh: () => Promise<void>;
}
export function TrashDialog({
  open,
  onOpenChange,
  deletedStudents,
  loading,
  onRestore,
  onRestoreMultiple,
  onPermanentlyDelete,
  onEmptyTrash,
  onRefresh
}: TrashDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [restoringMultiple, setRestoringMultiple] = useState(false);

  // Confirmation dialogs
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [confirmRestoreMultipleOpen, setConfirmRestoreMultipleOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const filteredStudents = deletedStudents.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.id));
  const someFilteredSelected = filteredStudents.some(s => selectedIds.includes(s.id));
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds = filteredStudents.map(s => s.id);
      setSelectedIds(prev => [...new Set([...prev, ...newIds])]);
    } else {
      const filteredIds = filteredStudents.map(s => s.id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };
  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await onRestore(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    } finally {
      setRestoringId(null);
    }
  };
  const handleRestoreMultiple = async () => {
    setRestoringMultiple(true);
    try {
      await onRestoreMultiple(selectedIds);
      setSelectedIds([]);
    } finally {
      setRestoringMultiple(false);
      setConfirmRestoreMultipleOpen(false);
    }
  };
  const handlePermanentlyDelete = async () => {
    if (!studentToDelete) return;
    setDeletingId(studentToDelete.id);
    try {
      await onPermanentlyDelete(studentToDelete.id);
      setSelectedIds(prev => prev.filter(i => i !== studentToDelete.id));
    } finally {
      setDeletingId(null);
      setConfirmDeleteOpen(false);
      setStudentToDelete(null);
    }
  };
  const handleEmptyTrash = async () => {
    setEmptyingTrash(true);
    try {
      await onEmptyTrash();
      setSelectedIds([]);
    } finally {
      setEmptyingTrash(false);
      setConfirmEmptyOpen(false);
    }
  };
  const openDeleteConfirm = (student: Student) => {
    setStudentToDelete(student);
    setConfirmDeleteOpen(true);
  };

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedIds([]);
      setSearchTerm("");
    }
    onOpenChange(newOpen);
  };
  return <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              
              Lixeira de Alunos
            </DialogTitle>
            <DialogDescription>
              Alunos excluídos podem ser restaurados ou removidos permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar na lixeira..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              {selectedIds.length > 0 && <Button variant="outline" size="sm" onClick={() => setConfirmRestoreMultipleOpen(true)} disabled={restoringMultiple} className="gap-1.5">
                  {restoringMultiple ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                      <RotateCcw className="h-4 w-4" />
                      Restaurar ({selectedIds.length})
                    </>}
                </Button>}
              {deletedStudents.length > 0 && <Button variant="destructive" size="sm" onClick={() => setConfirmEmptyOpen(true)} disabled={emptyingTrash}>
                  {emptyingTrash ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                      <Trash className="h-4 w-4 mr-2" />
                      Esvaziar
                    </>}
                </Button>}
            </div>

            {/* Select All */}
            {!loading && filteredStudents.length > 0 && <div className="flex items-center gap-2 px-1">
                <Checkbox id="select-all" checked={allFilteredSelected} onCheckedChange={handleSelectAll} className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" {...someFilteredSelected && !allFilteredSelected ? {
              "data-state": "indeterminate"
            } : {}} />
                <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Selecionar todos ({filteredStudents.length})
                </label>
              </div>}

            {/* Student List */}
            <ScrollArea className="h-[350px] pr-4">
              {loading ? <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>)}
                </div> : filteredStudents.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trash2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {searchTerm ? "Nenhum aluno encontrado" : "A lixeira está vazia"}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {searchTerm ? "Tente buscar com outros termos" : "Alunos excluídos aparecerão aqui"}
                  </p>
                </div> : <div className="space-y-2">
                  {filteredStudents.map(student => <div key={student.id} className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${selectedIds.includes(student.id) ? 'bg-muted/30 border-primary/30' : ''}`}>
                      <Checkbox checked={selectedIds.includes(student.id)} onCheckedChange={checked => handleSelectOne(student.id, !!checked)} className="flex-shrink-0" />
                      
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-destructive">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.email}
                        </p>
                        {student.deleted_at && <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                            <span>
                              Excluído em {format(new Date(student.deleted_at), "dd/MM/yyyy", {
                        locale: ptBR
                      })}
                            </span>
                            <span className="text-destructive/70 font-medium">
                              • {Math.max(0, 30 - differenceInDays(new Date(), new Date(student.deleted_at)))} dias restantes
                            </span>
                          </div>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => handleRestore(student.id)} disabled={restoringId === student.id || deletingId === student.id} className="gap-1.5">
                          {restoringId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">Restaurar</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(student)} disabled={restoringId === student.id || deletingId === student.id} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          {deletingId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>)}
                </div>}
            </ScrollArea>

            {/* Footer info */}
            {!loading && deletedStudents.length > 0 && <div className="flex flex-col gap-2 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span>
                    {selectedIds.length > 0 ? `${selectedIds.length} de ${deletedStudents.length} selecionados` : `${deletedStudents.length} ${deletedStudents.length === 1 ? 'aluno' : 'alunos'} na lixeira`}
                  </span>
                  
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/70">
                  
                  
                </div>
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Restore Multiple */}
      <AlertDialog open={confirmRestoreMultipleOpen} onOpenChange={setConfirmRestoreMultipleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar alunos selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar <strong>{selectedIds.length} {selectedIds.length === 1 ? 'aluno' : 'alunos'}</strong>? 
              Eles serão movidos de volta para a lista de alunos ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoringMultiple}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreMultiple} disabled={restoringMultiple}>
              {restoringMultiple ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restaurando...
                </> : "Restaurar alunos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Permanent Delete */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente <strong>{studentToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita e todos os dados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentlyDelete} disabled={!!deletingId} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletingId ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </> : "Excluir permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Empty Trash */}
      <AlertDialog open={confirmEmptyOpen} onOpenChange={setConfirmEmptyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Esvaziar lixeira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente <strong>{deletedStudents.length} {deletedStudents.length === 1 ? 'aluno' : 'alunos'}</strong>? 
              Esta ação não pode ser desfeita e todos os dados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={emptyingTrash}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmptyTrash} disabled={emptyingTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {emptyingTrash ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Esvaziando...
                </> : "Esvaziar lixeira"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}