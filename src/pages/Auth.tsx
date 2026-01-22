import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserAccessLog } from "@/types/supabase-extensions";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";
import authBg from "@/assets/auth-bg.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Check for domain validation error from OAuth redirect
  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'invalid_domain') {
      toast({
        title: "Acesso negado",
        description: "Apenas emails @safrasecifras.com.br são permitidos",
        variant: "destructive"
      });
      // Clean URL
      window.history.replaceState({}, '', '/auth');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao conectar com Google",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      const inputs = form.querySelectorAll('input');
      inputs.forEach((input: HTMLInputElement) => {
        if (!input.validity.valid) {
          input.setCustomValidity('Por favor, preencha este campo');
        }
      });
      form.reportValidity();
      return;
    }
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      if (error) throw error;

      if (data.user) {
        const logData: UserAccessLog = {
          user_id: data.user.id,
          access_type: 'login'
        };
        await supabase.from('user_access_logs').insert(logData);
      }
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo!"
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (!signupEmail.toLowerCase().endsWith('@safrasecifras.com.br')) {
      toast({
        title: "Email não permitido",
        description: "Apenas emails @safrasecifras.com.br são permitidos",
        variant: "destructive"
      });
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique as senhas digitadas",
        variant: "destructive"
      });
      return;
    }
    if (signupPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    const hasUpperCase = /[A-Z]/.test(signupPassword);
    const hasLowerCase = /[a-z]/.test(signupPassword);
    const hasNumber = /[0-9]/.test(signupPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: "Senha fraca",
        description: "A senha deve conter letras maiúsculas, minúsculas e números",
        variant: "destructive"
      });
      return;
    }

    const trimmedName = signupName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter entre 2 e 100 caracteres",
        variant: "destructive"
      });
      return;
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      toast({
        title: "Nome inválido",
        description: "O nome deve conter apenas letras, espaços e hífens",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);

    try {
      // Verificação prévia: checar se email já existe na tabela profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', signupEmail.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já possui uma conta. Faça login ou recupere sua senha.",
          variant: "destructive",
          duration: 8000
        });
        setLoading(false);
        return;
      }
    } catch (checkError) {
      // Se falhar a verificação, continua com o signup normal
      console.log('Verificação prévia falhou, continuando com signup');
    }

    try {
      const { data: validationData } = await supabase.functions.invoke('validate-email-domain', {
        body: { email: signupEmail }
      });
      if (!validationData?.valid) {
        toast({
          title: "Email não permitido",
          description: validationData?.message || "Apenas emails @safrasecifras.com.br são permitidos",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
    } catch (validationError) {
      toast({
        title: "Erro na validação",
        description: "Apenas emails @safrasecifras.com.br são permitidos",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name: trimmedName }
        }
      });

      // Tratar erros específicos
      if (error) {
        if (error.message?.includes('already registered') ||
          error.message?.includes('User already registered') ||
          (error as any).status === 422 ||
          (error as any).code === 'user_already_exists') {
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login ou recuperar sua senha.",
            variant: "destructive",
            duration: 8000
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      // IMPORTANTE: Verificar se identities está vazio (indica usuário duplicado no Supabase)
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já possui uma conta. Tente fazer login ou recuperar sua senha.",
          variant: "destructive",
          duration: 8000
        });
        setLoading(false);
        return;
      }

      // Verificar se o usuário foi realmente criado
      if (!data?.user) {
        toast({
          title: "Erro ao criar conta",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Sucesso!
      if (data.session) {
        // Log de acesso para o primeiro login automático
        const logData: UserAccessLog = {
          user_id: data.user.id,
          access_type: 'login'
        };
        await supabase.from('user_access_logs').insert(logData);

        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo à plataforma."
        });
        navigate("/");
        return;
      }

      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora você pode fazer login com suas credenciais"
      });

      setIsSignUp(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Erro ao criar conta",
        description: error?.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu email",
        variant: "destructive"
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha"
      });

      setForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-full flex-shrink-0">
        {/* Background Image */}
        <img
          src={authBg}
          alt="Agronegócio moderno"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Emerald Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/85 to-emerald-950/95" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 lg:px-16 py-8 lg:py-0">
          {/* Logo */}
          <img
            src={educasafrasLogo}
            alt="EducaSafras"
            className="h-16 lg:h-24 w-auto mb-6 lg:mb-10"
          />

          {/* Headline */}
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-outfit font-bold text-white text-center leading-tight mb-3 lg:mb-4">
            Inteligência estratégica<br />para o agronegócio.
          </h1>

          {/* Subtitle */}
          <p className="text-sm lg:text-lg text-white/80 text-center max-w-md">
            Acesse a plataforma interna de gestão educacional.
          </p>
        </div>
      </div>

      {/* Right Panel - Authentication Form */}
      <div className="w-full lg:w-1/2 flex-1 bg-background flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {!isSignUp ? (
            /* Login Form */
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl lg:text-3xl font-outfit font-bold text-foreground">
                  Bem-vindo
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Insira suas credenciais para acessar o painel.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email institucional
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@safrasecifras.com.br"
                    value={loginEmail}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setLoginEmail(e.target.value);
                    }}
                    onInvalid={e => {
                      const target = e.target as HTMLInputElement;
                      if (target.validity.valueMissing) {
                        target.setCustomValidity('Por favor, preencha este campo');
                      } else if (target.validity.typeMismatch) {
                        target.setCustomValidity('Por favor, insira um email válido');
                      }
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Senha
                    </Label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setLoginPassword(e.target.value);
                    }}
                    onInvalid={e => {
                      (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha este campo');
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Lembrar-me
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar na plataforma"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-medium"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar com Google
              </Button>

              {/* Signup Link */}
              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Criar conta
                </button>
              </p>
            </div>
          ) : (
            /* Signup Form */
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl lg:text-3xl font-outfit font-bold text-foreground">
                  Criar conta
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Preencha os dados abaixo para criar sua conta.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setSignupName(e.target.value);
                    }}
                    onInvalid={e => {
                      (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha este campo');
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email institucional
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@safrasecifras.com.br"
                    value={signupEmail}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setSignupEmail(e.target.value);
                    }}
                    onInvalid={e => {
                      const target = e.target as HTMLInputElement;
                      if (target.validity.valueMissing) {
                        target.setCustomValidity('Por favor, preencha este campo');
                      } else if (target.validity.typeMismatch) {
                        target.setCustomValidity('Por favor, insira um email válido');
                      }
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Apenas emails @safrasecifras.com.br são permitidos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setSignupPassword(e.target.value);
                    }}
                    onInvalid={e => {
                      (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha este campo');
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-sm font-medium">
                    Confirmar senha
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={e => {
                      e.target.setCustomValidity('');
                      setSignupConfirmPassword(e.target.value);
                    }}
                    onInvalid={e => {
                      (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha este campo');
                    }}
                    disabled={loading}
                    required
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-base"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Fazer login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber o link de recuperação
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="seu@safrasecifras.com.br"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={forgotPasswordLoading}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)} disabled={forgotPasswordLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? "Enviando..." : "Enviar link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
