import { useState } from 'react';
import { ArrowUpDown, Eye, MoreVertical, UserCog, Trash2, ShieldCheck, ShieldMinus, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement, AppRole } from '@/hooks/useUserManagement';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserFilters } from './UserFilters';
import { PaginationControls } from './PaginationControls';
import type { UserActivity } from '@/types/admin';

interface UserManagementTableProps {
  onViewDetails: (user: UserActivity) => void;
  onUserChanged?: () => void;
}

type RoleAction = {
  user: UserActivity;
  action: 'promoteToUser' | 'promoteToAdmin' | 'demoteToUser' | 'demoteToViewer' | 'delete';
};

const ROLE_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  user: 'secondary',
  viewer: 'outline'
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  user: 'Usuário',
  viewer: 'Visualizador'
};

export function UserManagementTable({ onViewDetails, onUserChanged }: UserManagementTableProps) {
  const { user: currentUser } = useAuth();
  const { loading: actionLoading, promoteToUser, promoteToAdmin, demoteToUser, demoteToViewer, deleteUser } = useUserManagement();
  const {
    users,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    sortConfig,
    loading,
    filters,
    updateFilter,
    clearFilters,
    activeFiltersCount,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    goToPage,
    changePageSize,
    changeSorting,
    refresh,
  } = useAdminUsers();
  
  const [pendingAction, setPendingAction] = useState<RoleAction | null>(null);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    const { user, action } = pendingAction;
    let success = false;
    
    switch (action) {
      case 'promoteToUser':
        success = await promoteToUser(user.id);
        break;
      case 'promoteToAdmin':
        success = await promoteToAdmin(user.id, user.role as AppRole);
        break;
      case 'demoteToUser':
        success = await demoteToUser(user.id);
        break;
      case 'demoteToViewer':
        success = await demoteToViewer(user.id, user.role as AppRole);
        break;
      case 'delete':
        success = await deleteUser(user.id);
        break;
    }
    
    if (success) {
      refresh();
      onUserChanged?.();
    }
    setPendingAction(null);
  };

  const getActionDialogContent = () => {
    if (!pendingAction) return { title: '', description: '' };
    
    const { user, action } = pendingAction;
    
    switch (action) {
      case 'promoteToUser':
        return {
          title: 'Conceder Acesso Completo',
          description: `Deseja conceder acesso completo ao sistema para ${user.name}? O usuário poderá acessar todas as funcionalidades exceto administração.`
        };
      case 'promoteToAdmin':
        return {
          title: 'Promover para Administrador',
          description: `Deseja promover ${user.name} para Administrador? O usuário terá acesso completo ao sistema, incluindo gestão de usuários.`
        };
      case 'demoteToUser':
        return {
          title: 'Remover Privilégios de Admin',
          description: `Deseja remover os privilégios de administrador de ${user.name}? O usuário ainda terá acesso completo às funcionalidades, mas não poderá gerenciar usuários.`
        };
      case 'demoteToViewer':
        return {
          title: 'Restringir Acesso',
          description: `Deseja restringir o acesso de ${user.name}? O usuário só poderá visualizar as páginas de cursos.`
        };
      case 'delete':
        return {
          title: 'Excluir Usuário',
          description: `Confirmar exclusão de ${user.name}? Esta ação não pode ser desfeita.`
        };
      default:
        return { title: '', description: '' };
    }
  };

  const dialogContent = getActionDialogContent();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserFilters
            totalUsers={totalCount}
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            presets={presets}
            savePreset={savePreset}
            loadPreset={loadPreset}
            deletePreset={deletePreset}
          />

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => changeSorting('name')} className="gap-2">
                          Usuário <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => changeSorting('role')} className="gap-2">
                          Perfil <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => changeSorting('total_logins')} className="gap-2">
                          Logins <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => changeSorting('last_login')} className="gap-2">
                          Último Login <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center">Nenhum usuário encontrado</TableCell></TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar><AvatarFallback>{getInitials(user.name)}</AvatarFallback></Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'outline'}>
                              {ROLE_LABELS[user.role] || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.total_logins}</TableCell>
                          <TableCell className="text-sm">
                            {user.last_login ? format(new Date(user.last_login), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Nunca'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button onClick={() => onViewDetails(user)} variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                              {currentUser?.id !== user.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" disabled={actionLoading}><MoreVertical className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {/* Viewer actions */}
                                    {(user.role as string) === 'viewer' && (
                                      <>
                                        <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'promoteToUser' })}>
                                          <UserCheck className="h-4 w-4 mr-2" />
                                          Conceder Acesso Completo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'promoteToAdmin' })}>
                                          <ShieldCheck className="h-4 w-4 mr-2" />
                                          Tornar Admin
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {/* User actions */}
                                    {(user.role as string) === 'user' && (
                                      <>
                                        <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'promoteToAdmin' })}>
                                          <ShieldCheck className="h-4 w-4 mr-2" />
                                          Tornar Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'demoteToViewer' })}>
                                          <UserX className="h-4 w-4 mr-2" />
                                          Restringir Acesso
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {/* Admin actions */}
                                    {(user.role as string) === 'admin' && (
                                      <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'demoteToUser' })}>
                                        <ShieldMinus className="h-4 w-4 mr-2" />
                                        Remover Admin
                                      </DropdownMenuItem>
                                    )}
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setPendingAction({ user, action: 'delete' })} className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            
              {users.length > 0 && (
                <PaginationControls currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalCount={totalCount} onPageChange={goToPage} onPageSizeChange={changePageSize} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              className={pendingAction?.action === 'delete' ? 'bg-destructive' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
