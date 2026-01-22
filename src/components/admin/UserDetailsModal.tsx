import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, LogIn, Eye, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserActivity {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: string;
  total_logins: number;
  last_login: string | null;
  total_page_views: number;
}

interface UserDetailsModalProps {
  user: UserActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AccessLog {
  id: string;
  access_type: string;
  page_route: string | null;
  accessed_at: string;
}

export const UserDetailsModal = ({ user, open, onOpenChange }: UserDetailsModalProps) => {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchAccessLogs();
    }
  }, [user, open]);

  const fetchAccessLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_access_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAccessLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs de acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-outfit">Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-2">
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <LogIn className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-xs text-muted-foreground">Último login</p>
                <p className="text-sm font-medium text-foreground">
                  {user.last_login 
                    ? format(new Date(user.last_login), "dd/MM/yyyy HH:mm", { locale: ptBR })
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <LogIn className="h-8 w-8 text-chart-2" />
              <div>
                <p className="text-xs text-muted-foreground">Total de logins</p>
                <p className="text-2xl font-semibold text-foreground">{user.total_logins}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Total de visualizações</p>
                <p className="text-2xl font-semibold text-foreground">{user.total_page_views}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Access History */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Histórico de Acessos (últimos 20)
            </h4>
            <ScrollArea className="h-64 rounded-lg border border-border">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : accessLogs.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum acesso registrado
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 w-16 text-muted-foreground">
                        {format(new Date(log.accessed_at), "HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {log.access_type === 'login' ? (
                            <LogIn className="h-4 w-4 text-chart-1" />
                          ) : (
                            <Eye className="h-4 w-4 text-primary" />
                          )}
                          <span className="font-medium text-foreground">
                            {log.access_type === 'login' ? 'Login' : 'Visualização'}
                          </span>
                        </div>
                        {log.page_route && (
                          <p className="text-muted-foreground ml-6">{log.page_route}</p>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {format(new Date(log.accessed_at), "dd/MM", { locale: ptBR })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
