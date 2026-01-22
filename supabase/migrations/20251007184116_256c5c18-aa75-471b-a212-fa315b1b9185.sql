-- Fase 1: Sistema de Controle de Acesso (RBAC)
-- Migration segura que ignora objetos que já existem

-- Criar enum para roles (se não existir)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar tabela user_roles (se não existir)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop policies antigas se existirem e recriar
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can view user_activity_detailed" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all access logs" ON public.user_access_logs;

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Atribuir role admin ao email especificado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'elia.amaral@safrasecifras.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Atribuir role 'user' a todos os outros usuários
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM auth.users
WHERE email != 'elia.amaral@safrasecifras.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- View para métricas do dashboard admin
CREATE OR REPLACE VIEW public.admin_dashboard_metrics AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(DISTINCT user_id) 
   FROM user_access_logs 
   WHERE DATE(accessed_at) = CURRENT_DATE) as active_today,
  (SELECT COUNT(*) 
   FROM user_access_logs 
   WHERE access_type = 'login') as total_logins,
  (SELECT MAX(accessed_at) 
   FROM user_access_logs) as last_activity;

-- View para atividade detalhada por usuário
CREATE OR REPLACE VIEW public.user_activity_detailed AS
SELECT
  p.id,
  p.name,
  p.email,
  p.created_at,
  (SELECT role FROM user_roles WHERE user_id = p.id LIMIT 1) as role,
  COALESCE(lc.total_logins, 0) as total_logins,
  COALESCE(lc.last_login, NULL) as last_login,
  COALESCE(
    (SELECT COUNT(*) 
     FROM user_access_logs 
     WHERE user_id = p.id AND access_type = 'page_view'), 
    0
  ) as total_page_views
FROM profiles p
LEFT JOIN user_login_count lc ON lc.user_id = p.id
ORDER BY p.created_at DESC;

-- View para estatísticas diárias
CREATE OR REPLACE VIEW public.daily_access_stats AS
SELECT
  DATE(accessed_at) as access_date,
  COUNT(*) FILTER (WHERE access_type = 'login') as logins,
  COUNT(*) FILTER (WHERE access_type = 'page_view') as page_views,
  COUNT(DISTINCT user_id) as unique_users
FROM user_access_logs
WHERE accessed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(accessed_at)
ORDER BY access_date DESC;

-- RLS Policies para views administrativas
CREATE POLICY "Only admins can view user_activity_detailed"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin')
);

-- Permitir que admins vejam todos os logs
CREATE POLICY "Admins can view all access logs"
ON public.user_access_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));