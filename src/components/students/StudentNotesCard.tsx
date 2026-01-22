import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/action-button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Plus, Loader2, Trash2, Paperclip, X, FileIcon, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStudentNotes, StudentNote } from '@/hooks/useStudentNotes';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface StudentNotesCardProps {
  studentId: string;
  className?: string;
  onNoteAdded?: (content: string, hasAttachment: boolean) => void;
  onNoteDeleted?: (content: string, hasAttachment: boolean) => void;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
export function StudentNotesCard({
  studentId,
  className,
  onNoteAdded,
  onNoteDeleted
}: StudentNotesCardProps) {
  const {
    notes,
    loading,
    addNote,
    deleteNote
  } = useStudentNotes(studentId);
  const {
    user
  } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<StudentNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Create preview for images
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
      const result = await addNote({
        content: newNote,
        attachment: selectedFile
      });
      if (result && onNoteAdded) {
        onNoteAdded(newNote.trim(), !!selectedFile);
      }
      setNewNote('');
      clearFile();
      setShowAddForm(false);
    } finally {
      setIsAdding(false);
    }
  };
  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteNote(noteToDelete.id);
      if (success && onNoteDeleted) {
        onNoteDeleted(noteToDelete.content, !!noteToDelete.attachment_url);
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
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return format(date, "'Hoje às' HH:mm", {
        locale: ptBR
      });
    } else if (diffInHours < 48) {
      return format(date, "'Ontem às' HH:mm", {
        locale: ptBR
      });
    } else {
      return format(date, "dd 'de' MMM 'às' HH:mm", {
        locale: ptBR
      });
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const isImage = (type: string | null | undefined) => {
    return type?.startsWith('image/');
  };
  const renderAttachment = (note: StudentNote) => {
    if (!note.attachment_url) return null;
    if (isImage(note.attachment_type)) {
      return <div className="mt-2 relative group/img">
          <img src={note.attachment_url} alt={note.attachment_name || 'Anexo'} className="max-w-full max-h-48 rounded-lg border object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(note.attachment_url!, '_blank')} />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={e => {
            e.stopPropagation();
            window.open(note.attachment_url!, '_blank');
          }}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>;
    }

    // PDF or other file
    return <a href={note.attachment_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors group/file w-fit">
        <div className="p-1.5 bg-red-500/10 rounded">
          <FileIcon className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate max-w-[200px]">{note.attachment_name}</p>
          {note.attachment_size && <p className="text-xs text-muted-foreground">{formatFileSize(note.attachment_size)}</p>}
        </div>
        <Download className="h-4 w-4 text-muted-foreground group-hover/file:text-foreground transition-colors" />
      </a>;
  };
  return <>
      <Card className={cn("flex flex-col h-[500px]", className)}>
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              
              Observações
              {notes.length > 0 && <span className="text-sm font-normal text-muted-foreground">
                  ({notes.length})
                </span>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1">
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
          {/* Add Note Form */}
          {showAddForm && <div className="space-y-3 p-3 bg-muted/50 rounded-lg border flex-shrink-0">
              <Textarea placeholder="Digite sua observação..." value={newNote} onChange={e => setNewNote(e.target.value)} className="min-h-[80px] resize-none" autoFocus />
              
              {/* File Preview */}
              {selectedFile && <div className="flex items-center gap-2 p-2 bg-background rounded border">
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 bg-red-500/10 rounded flex items-center justify-center">
                      <FileIcon className="h-5 w-5 text-red-500" />
                    </div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>}
              
              <div className="flex items-center justify-between gap-2">
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept={ALLOWED_TYPES.join(',')} className="hidden" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isAdding} className="gap-1">
                    <Paperclip className="h-4 w-4" />
                    Anexar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                setShowAddForm(false);
                setNewNote('');
                clearFile();
              }} disabled={isAdding}>
                    Cancelar
                  </Button>
                  <ActionButton size="sm" onClick={handleAddNote} disabled={!newNote.trim() && !selectedFile} loading={isAdding} loadingText="Salvando...">
                    Adicionar
                  </ActionButton>
                </div>
              </div>
            </div>}

          {/* Notes List */}
          {loading ? <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div> : notes.length > 0 ? <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="space-y-4 pb-2">
                {notes.map((note, index) => <div key={note.id}>
                    <div className="group flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(note.author_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium text-sm">
                              {note.author_name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatNoteDate(note.created_at)}
                            </span>
                          </div>
                          {note.created_by === user?.id && <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => openDeleteDialog(note)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>}
                        </div>
                        {note.content && <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-1 leading-relaxed">
                            {note.content}
                          </p>}
                        {renderAttachment(note)}
                      </div>
                    </div>
                    {index < notes.length - 1 && <Separator className="mt-4" />}
                  </div>)}
              </div>
            </ScrollArea> : <div className="flex flex-col items-center justify-center flex-1 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma observação registrada
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em "Nova" para adicionar
              </p>
            </div>}
        </CardContent>
      </Card>

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
            <AlertDialogAction onClick={handleDeleteNote} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}