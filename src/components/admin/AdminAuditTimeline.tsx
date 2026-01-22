import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Shield,
  Trash2,
  UserX,
  UserCheck,
  Settings,
  Download,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import type { AdminAction, AdminActionType } from '@/types/admin';

const getActionIcon = (actionType: AdminActionType) => {
  const icons = {
    role_change: Shield,
    user_delete: Trash2,
    user_suspend: UserX,
    user_reactivate: UserCheck,
    config_change: Settings,
    export_data: Download,
  };
  return icons[actionType] || Shield;
};

const getActionLabel = (actionType: AdminActionType) => {
  const labels: Record<AdminActionType, string> = {
    role_change: 'Mudança de Permissão',
    user_delete: 'Exclusão de Usuário',
    user_suspend: 'Suspensão de Usuário',
    user_reactivate: 'Reativação de Usuário',
    config_change: 'Alteração de Configuração',
    export_data: 'Exportação de Dados',
  };
  return labels[actionType];
};

const getActionDescription = (action: AdminAction) => {
  const { action_type, action_details, target_user_name, admin_name } = action;

  switch (action_type) {
    case 'role_change':
      const oldRole = action_details.old_role === 'admin' ? 'Administrador' : 'Usuário';
      const newRole = action_details.new_role === 'admin' ? 'Administrador' : 'Usuário';
      return `${admin_name} alterou ${target_user_name || 'um usuário'} de ${oldRole} para ${newRole}`;
    
    case 'user_delete':
      return `${admin_name} excluiu o usuário ${target_user_name || 'desconhecido'}`;
    
    case 'user_suspend':
      return `${admin_name} suspendeu o usuário ${target_user_name || 'desconhecido'}`;
    
    case 'user_reactivate':
      return `${admin_name} reativou o usuário ${target_user_name || 'desconhecido'}`;
    
    case 'export_data':
      return `${admin_name} exportou dados do sistema`;
    
    case 'config_change':
      return `${admin_name} alterou configurações do sistema`;
    
    default:
      return `${admin_name} realizou uma ação administrativa`;
  }
};

const getCriticalityBadge = (actionType: AdminActionType) => {
  const criticalActions = ['user_delete', 'config_change'];
  const warningActions = ['role_change', 'user_suspend'];

  if (criticalActions.includes(actionType)) {
    return <Badge variant="destructive">Alta</Badge>;
  }
  if (warningActions.includes(actionType)) {
    return <Badge variant="default">Média</Badge>;
  }
  return <Badge variant="secondary">Baixa</Badge>;
};

export function AdminAuditTimeline() {
  const { actions, loading, filterType, setFilterType, refresh } = useAdminAudit();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Registro de Auditoria</h3>
          <p className="text-sm text-muted-foreground">
            Últimas {actions.length} ações administrativas
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as AdminActionType | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="role_change">Mudanças de Permissão</SelectItem>
              <SelectItem value="user_delete">Exclusões</SelectItem>
              <SelectItem value="user_suspend">Suspensões</SelectItem>
              <SelectItem value="user_reactivate">Reativações</SelectItem>
              <SelectItem value="config_change">Configurações</SelectItem>
              <SelectItem value="export_data">Exportações</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma ação registrada</p>
          </Card>
        ) : (
          actions.map((action) => {
            const Icon = getActionIcon(action.action_type);
            const initials = action.admin_name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase() || 'AD';

            return (
              <Collapsible key={action.id}>
                <Card className="p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {getActionLabel(action.action_type)}
                            </span>
                            {getCriticalityBadge(action.action_type)}
                          </div>
                          <p className="text-sm mt-1">
                            {getActionDescription(action)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(action.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>

                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      {/* Expandable Details */}
                      <CollapsibleContent className="space-y-2">
                        <div className="pl-6 pt-2 space-y-1 text-xs text-muted-foreground border-l-2 border-muted">
                          <div>
                            <strong>Admin:</strong> {action.admin_email}
                          </div>
                          {action.target_user_email && (
                            <div>
                              <strong>Usuário Afetado:</strong> {action.target_user_email}
                            </div>
                          )}
                          {action.ip_address && (
                            <div>
                              <strong>IP:</strong> {action.ip_address}
                            </div>
                          )}
                          {action.user_agent && (
                            <div className="truncate">
                              <strong>Navegador:</strong> {action.user_agent}
                            </div>
                          )}
                          {Object.keys(action.action_details).length > 0 && (
                            <div>
                              <strong>Detalhes:</strong>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(action.action_details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </div>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
