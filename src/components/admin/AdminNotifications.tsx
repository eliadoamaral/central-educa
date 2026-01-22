import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Send, Users, User, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const AdminNotifications = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning">("info");
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRecentNotifications();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setRecentNotifications((data || []) as NotificationRecord[]);
    }
    setLoading(false);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a mensagem",
        variant: "destructive"
      });
      return;
    }

    if (targetType === "single" && !selectedUserId) {
      toast({
        title: "Selecione um usuário",
        description: "Escolha um usuário para enviar a notificação",
        variant: "destructive"
      });
      return;
    }

    setSending(true);

    try {
      if (targetType === "all") {
        // Send to all users
        const notifications = users.map(user => ({
          user_id: user.id,
          title: title.trim(),
          message: message.trim(),
          type,
          read: false
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;

        toast({
          title: "Notificações enviadas",
          description: `Notificação enviada para ${users.length} usuários`
        });
      } else {
        // Send to single user
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: selectedUserId,
            title: title.trim(),
            message: message.trim(),
            type,
            read: false
          });

        if (error) throw error;

        const selectedUser = users.find(u => u.id === selectedUserId);
        toast({
          title: "Notificação enviada",
          description: `Notificação enviada para ${selectedUser?.name || selectedUser?.email}`
        });
      }

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setSelectedUserId("");
      
      // Refresh notifications list
      fetchRecentNotifications();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setRecentNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: "Notificação excluída" });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || user?.email || userId.slice(0, 8) + '...';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 text-green-600';
      case 'warning': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-blue-500/10 text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enviar Notificação
          </CardTitle>
          <CardDescription>
            Envie notificações em tempo real para os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Destinatário</Label>
                <Select value={targetType} onValueChange={(v: "all" | "single") => setTargetType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Todos os usuários ({users.length})
                      </div>
                    </SelectItem>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Usuário específico
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {targetType === "single" && (
                <div className="space-y-2">
                  <Label htmlFor="user">Selecionar Usuário</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(v: "info" | "success" | "warning") => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da notificação"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conteúdo da notificação"
                rows={3}
                maxLength={500}
              />
            </div>

            <Button type="submit" disabled={sending} className="w-full md:w-auto">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
          <CardDescription>
            Últimas 50 notificações enviadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação enviada ainda</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        {getUserName(notification.user_id)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(notification.type)}>
                          {notification.type === 'info' && 'Info'}
                          {notification.type === 'success' && 'Sucesso'}
                          {notification.type === 'warning' && 'Aviso'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.read ? "secondary" : "default"}>
                          {notification.read ? 'Lida' : 'Não lida'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
