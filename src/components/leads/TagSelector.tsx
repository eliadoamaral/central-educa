import { useState, useMemo } from "react";
import { Plus, Check, X, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLeadTags } from "@/hooks/useLeadTags";

export interface TagWithColor {
  name: string;
  color: string;
}

interface TagSelectorProps {
  tags: TagWithColor[];
  onChange: (tags: TagWithColor[]) => void;
}

const TAG_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#EAB308", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
  "#92400E", // brown
  "#F97316", // orange
  "#14B8A6", // teal
  "#F43F5E", // rose
  "#84CC16", // lime
];

// Helper function to determine text color based on background
const getTextColor = (bgColor: string): string => {
  // Yellow needs white text for better contrast
  if (bgColor === '#EAB308') return '#FFFFFF';
  return '#FFFFFF';
};

export function TagSelector({ 
  tags, 
  onChange
}: TagSelectorProps) {
  const { tags: availableTags, createTag, deleteTag, updateTag, isLoading } = useLeadTags();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null);
  const [deletingTag, setDeletingTag] = useState<{ id: string; name: string } | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleTag = (tag: TagWithColor) => {
    const exists = tags.some(t => t.name === tag.name);
    if (exists) {
      onChange(tags.filter(t => t.name !== tag.name));
    } else {
      onChange([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onChange(tags.filter(t => t.name !== tagName));
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag: TagWithColor = {
      name: newTagName.trim(),
      color: newTagColor,
    };
    
    // Add to selected tags
    onChange([...tags, newTag]);
    
    // Save to database for reuse
    createTag({ name: newTag.name, color: newTag.color });
    
    // Reset form and close dialog
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0]);
    setIsCreateDialogOpen(false);
  };

  // Convert LeadTag[] to TagWithColor[] for display, keeping id for edit/delete
  const allAvailableTagsWithId = useMemo(() => {
    return availableTags.map(t => ({ id: t.id, name: t.name, color: t.color }));
  }, [availableTags]);

  // Filter tags based on search query
  const filteredTagsWithId = useMemo(() => {
    if (!searchQuery.trim()) return allAvailableTagsWithId;
    const query = searchQuery.toLowerCase().trim();
    return allAvailableTagsWithId.filter(t => t.name.toLowerCase().includes(query));
  }, [allAvailableTagsWithId, searchQuery]);

  const allAvailableTags: TagWithColor[] = useMemo(() => {
    const dbTags: TagWithColor[] = allAvailableTagsWithId.map(t => ({ name: t.name, color: t.color }));
    // Add any selected custom tags that aren't in the database yet
    tags.forEach(tag => {
      if (!dbTags.some(t => t.name === tag.name)) {
        dbTags.push(tag);
      }
    });
    return dbTags;
  }, [allAvailableTagsWithId, tags]);

  const handleEditTag = (e: React.MouseEvent, tag: { id: string; name: string; color: string }) => {
    e.stopPropagation();
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setIsOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTag || !newTagName.trim()) return;
    
    const oldName = editingTag.name;
    const newName = newTagName.trim();
    
    updateTag({ id: editingTag.id, name: newName, color: newTagColor });
    
    // Update selected tags if the edited tag was selected
    if (tags.some(t => t.name === oldName)) {
      onChange(tags.map(t => t.name === oldName ? { name: newName, color: newTagColor } : t));
    }
    
    setIsEditDialogOpen(false);
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0]);
  };

  const handleDeleteClick = (e: React.MouseEvent, tag: { id: string; name: string }) => {
    e.stopPropagation();
    setDeletingTag(tag);
    setIsOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingTag) return;
    
    // Remove from selected tags if it was selected
    onChange(tags.filter(t => t.name !== deletingTag.name));
    
    deleteTag(deletingTag.id);
    setIsDeleteDialogOpen(false);
    setDeletingTag(null);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            className="flex w-full min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:border-ring transition-colors"
          >
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: tag.color,
                      color: getTextColor(tag.color)
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.name);
                    }}
                  >
                    <X className="h-3 w-3" />
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">Selecionar etiquetas</span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          {/* Search input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar etiquetas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Available tags list */}
          <div className="max-h-48 overflow-y-auto py-1">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">Carregando...</div>
            ) : filteredTagsWithId.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {searchQuery ? "Nenhuma etiqueta encontrada" : "Nenhuma etiqueta disponível"}
              </div>
            ) : filteredTagsWithId.map((tag) => {
              const isSelected = tags.some(t => t.name === tag.name);
              return (
                <div
                  key={tag.id}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors group hover:bg-muted"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTag({ name: tag.name, color: tag.color })}
                    className="flex items-center gap-2 flex-1 min-w-0"
                  >
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color)
                      }}
                    >
                      {tag.name}
                    </span>
                    <span className="flex-1" />
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleEditTag(e, tag)}
                      className="p-1 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar etiqueta"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, tag)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Excluir etiqueta"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new tag button */}
          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCreateDialogOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2 py-2 text-primary text-sm hover:bg-primary/10 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar etiqueta
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create new tag dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Nova etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Nome da etiqueta</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da etiqueta"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor da etiqueta</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {newTagColor === color && (
                      <Check className="h-4 w-4 text-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewTagName("");
                setNewTagColor(TAG_COLORS[0]);
              }}
            >
              Cancelar
            </Button>
            <ActionButton onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Salvar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit tag dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Editar etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTagName">Nome da etiqueta</Label>
              <Input
                id="editTagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da etiqueta"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor da etiqueta</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {newTagColor === color && (
                      <Check className="h-4 w-4 text-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingTag(null);
                setNewTagName("");
                setNewTagColor(TAG_COLORS[0]);
              }}
            >
              Cancelar
            </Button>
            <ActionButton onClick={handleSaveEdit} disabled={!newTagName.trim()}>
              Salvar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Excluir etiqueta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir a etiqueta <strong>"{deletingTag?.name}"</strong>? 
              Esta ação não pode ser desfeita e a etiqueta será removida de todos os contatos.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingTag(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
