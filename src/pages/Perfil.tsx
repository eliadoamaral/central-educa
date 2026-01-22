import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Save, User, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [name, setName] = useState("");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      setName(data?.name || "");
    } catch (error: any) {
      toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) {
      toast({ title: "Nome obrigatório", description: "Por favor, preencha o nome", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso" });
      fetchProfile();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem", variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "O tamanho máximo é 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Avatar atualizado", description: "Sua foto foi salva com sucesso" });
      fetchProfile();
    } catch (error: any) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setRemoving(true);
    try {
      // List files in user folder and delete them
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        const filesToRemove = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage.from('avatars').remove(filesToRemove);
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Avatar removido", description: "Sua foto foi removida com sucesso" });
      fetchProfile();
    } catch (error: any) {
      toast({ title: "Erro ao remover foto", description: error.message, variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Senhas não coincidem", description: "A nova senha e a confirmação devem ser iguais", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast({ title: "Erro ao alterar senha", description: error.message || "Tente novamente mais tarde", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const userEmail = profile?.email || user?.email;
    if (!userEmail) {
      toast({ title: "Erro", description: "E-mail não encontrado", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      toast({ 
        title: "E-mail enviado", 
        description: "Verifique sua caixa de entrada para redefinir sua senha" 
      });
    } catch (error: any) {
      toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-outfit font-semibold text-foreground">Editar Perfil</h1>
            <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
          </div>
        </div>

        {/* Avatar Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Foto de Perfil</CardTitle>
            <CardDescription>Clique na imagem para alterar sua foto</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-2xl font-medium">
                  {profile?.name ? getInitials(profile.name) : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
              {profile?.avatar_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={removing}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {removing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            <CardDescription>Atualize seu nome e outras informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={profile?.email || user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
            </div>

            <div className="space-y-2">
              <Label>Membro desde</Label>
              <Input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex justify-end pt-4">
              <ActionButton onClick={handleSaveProfile} loading={saving} loadingText="Salvando...">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </ActionButton>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              Trocar Senha
            </CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Esqueceu a senha?"
                    )}
                  </Button>
                </div>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={passwordLoading}
                />
                <p className="text-xs text-muted-foreground">A senha deve ter pelo menos 6 caracteres</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
