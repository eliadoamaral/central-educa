import { useState } from "react";
import { Key, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExecutiveHeaderProps {
  sidebarCollapsed?: boolean;
  onMenuClick?: () => void;
}
export const ExecutiveHeader = ({
  sidebarCollapsed = false,
  onMenuClick
}: ExecutiveHeaderProps) => {
  const { user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
        variant: "destructive"
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso"
      });
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };


  return <>
      <header className="fixed top-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-6 transition-all duration-300 left-0 lg:left-64" style={{
        left: undefined
      }}>
        {/* Left: Mobile Menu Button + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg md:text-xl font-outfit font-semibold text-foreground">Painel Estratégico</h1>
        </div>

        {/* Empty - actions moved to sidebar */}
        <div />
      </header>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e escolha uma nova senha
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input id="current-password" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={passwordLoading} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={passwordLoading} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
              <Input id="confirm-new-password" type="password" placeholder="••••••••" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} disabled={passwordLoading} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)} disabled={passwordLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>;
};