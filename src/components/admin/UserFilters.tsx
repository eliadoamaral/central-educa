import { useState } from 'react';
import { Search, Filter, X, Save, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { UserFilters as UserFiltersType } from '@/types/admin';

interface UserFiltersProps {
  totalUsers: number;
  filters: UserFiltersType;
  updateFilter: (key: keyof UserFiltersType, value: any) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  presets: any[];
  savePreset: (name: string) => Promise<void>;
  loadPreset: (preset: any) => void;
  deletePreset: (id: string) => Promise<void>;
}

export const UserFilters = ({
  totalUsers,
  filters,
  updateFilter,
  clearFilters,
  activeFiltersCount,
  presets,
  savePreset,
  loadPreset,
  deletePreset,
}: UserFiltersProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSavePreset = async () => {
    if (presetName.trim()) {
      try {
        await savePreset(presetName);
        toast.success('Filtro salvo com sucesso!');
        setShowSaveDialog(false);
        setPresetName('');
      } catch (error) {
        toast.error('Erro ao salvar filtro');
      }
    }
  };

  const handleLoadPreset = (preset: any) => {
    loadPreset(preset);
    toast.success(`Filtro "${preset.preset_name}" aplicado`);
  };

  const handleDeletePreset = async (presetId: string, presetName: string) => {
    try {
      await deletePreset(presetId);
      toast.success(`Filtro "${presetName}" excluído`);
    } catch (error) {
      toast.error('Erro ao excluir filtro');
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Advanced Filters Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 h-5 min-w-5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-background" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros Avançados</h4>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={(value) => updateFilter('role', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Todos os roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Creation Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Criação</label>
                <div className="grid grid-cols-2 gap-2">
                  <DateInput
                    value={filters.dateFrom || ''}
                    onChange={(value) => updateFilter('dateFrom', value)}
                    showValidation={false}
                  />
                  <DateInput
                    value={filters.dateTo || ''}
                    onChange={(value) => updateFilter('dateTo', value)}
                    showValidation={false}
                  />
                </div>
              </div>

              {/* Last Activity Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Última Atividade</label>
                <div className="grid grid-cols-2 gap-2">
                  <DateInput
                    value={filters.lastActivityFrom || ''}
                    onChange={(value) => updateFilter('lastActivityFrom', value)}
                    showValidation={false}
                  />
                  <DateInput
                    value={filters.lastActivityTo || ''}
                    onChange={(value) => updateFilter('lastActivityTo', value)}
                    showValidation={false}
                  />
                </div>
              </div>

              {/* Login Count Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Logins</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={filters.minLogins || ''}
                    onChange={(e) => updateFilter('minLogins', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Mínimo"
                    min="0"
                  />
                  <Input
                    type="number"
                    value={filters.maxLogins || ''}
                    onChange={(e) => updateFilter('maxLogins', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Máximo"
                    min="0"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Atividade</label>
                <Select
                  value={filters.activityLevel || 'all'}
                  onValueChange={(value) => updateFilter('activityLevel', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os níveis" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Presets Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Presets
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-background">
            <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Filtro Atual
            </DropdownMenuItem>
            {presets.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm font-semibold">Filtros Salvos</div>
                {presets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex items-center justify-between"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2 opacity-0" />
                      {preset.preset_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id, preset.preset_name);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Count */}
      <div className="mt-3 text-sm text-muted-foreground">
        {totalUsers} {totalUsers === 1 ? 'usuário encontrado' : 'usuários encontrados'}
      </div>

      {/* Save Preset Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar Filtro</AlertDialogTitle>
            <AlertDialogDescription>
              Dê um nome para este conjunto de filtros para reutilizá-lo depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Nome do filtro..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSavePreset();
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPresetName('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePreset}>Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
