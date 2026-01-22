import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AccessLog {
  id: string;
  user_id: string;
  access_type: string;
  page_route: string | null;
  accessed_at: string;
  user_name?: string;
  user_email?: string;
}

export const ActivityTimeline = () => {
  const [activities, setActivities] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch access logs
      const { data: logs, error: logsError } = await supabase
        .from('user_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Fetch user profiles for the logs
      const userIds = [...new Set(logs?.map(log => log.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const enrichedLogs = logs?.map(log => ({
        ...log,
        user_name: profilesMap.get(log.user_id)?.name,
        user_email: profilesMap.get(log.user_id)?.email
      })) || [];

      setActivities(enrichedLogs);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg font-outfit">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Carregando atividades...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhuma atividade registrada
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(activity.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.access_type === 'login' ? (
                        <LogIn className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                      <p className="text-sm text-foreground font-medium truncate">
                        {activity.user_name || 'Usuário desconhecido'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.access_type === 'login' ? 'Fez login' : 'Acessou'}{' '}
                      {activity.page_route && activity.access_type === 'page_view' && (
                        <span className="font-mono bg-muted px-1 rounded">
                          {activity.page_route}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.accessed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
