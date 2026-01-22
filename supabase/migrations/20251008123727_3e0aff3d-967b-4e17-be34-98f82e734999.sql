-- ============================================================================
-- FASE 1: SISTEMA DE FILTROS AVANÇADOS + PAGINAÇÃO + AUDITORIA
-- ============================================================================

-- 1. Criar ENUM para tipos de ações administrativas
CREATE TYPE public.admin_action_type AS ENUM (
  'role_change',
  'user_delete',
  'user_suspend',
  'user_reactivate',
  'config_change',
  'export_data'
);

-- 2. Tabela para presets de filtros salvos pelos admins
CREATE TABLE public.admin_filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de auditoria de ações administrativas
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type admin_action_type NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS Policies para admin_filter_presets
ALTER TABLE public.admin_filter_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their own filter presets"
ON public.admin_filter_presets
FOR ALL
USING (admin_user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

-- 5. RLS Policies para admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (admin_user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

-- 6. Índices para performance
CREATE INDEX idx_admin_filter_presets_admin ON public.admin_filter_presets(admin_user_id);
CREATE INDEX idx_admin_actions_admin ON public.admin_actions(admin_user_id, created_at DESC);
CREATE INDEX idx_admin_actions_target ON public.admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_type ON public.admin_actions(action_type);
CREATE INDEX idx_admin_actions_created ON public.admin_actions(created_at DESC);

-- 7. RPC Function: Paginação de usuários com filtros avançados
CREATE OR REPLACE FUNCTION public.get_paginated_users(
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20,
  filters JSONB DEFAULT '{}'::jsonb,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  total_count BIGINT;
  offset_value INT;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can access this function';
  END IF;

  offset_value := (page_number - 1) * page_size;

  -- Query principal com filtros dinâmicos
  WITH filtered_users AS (
    SELECT 
      uad.id,
      uad.name,
      uad.email,
      uad.created_at,
      uad.role,
      uad.total_logins,
      uad.last_login,
      uad.total_page_views
    FROM public.user_activity_detailed uad
    WHERE 
      -- Filtro de busca por texto
      (filters->>'searchTerm' IS NULL OR 
       uad.name ILIKE '%' || (filters->>'searchTerm') || '%' OR
       uad.email ILIKE '%' || (filters->>'searchTerm') || '%')
      -- Filtro de role
      AND (filters->>'role' IS NULL OR uad.role::text = filters->>'role')
      -- Filtro de período de cadastro
      AND (filters->>'dateFrom' IS NULL OR uad.created_at >= (filters->>'dateFrom')::timestamp)
      AND (filters->>'dateTo' IS NULL OR uad.created_at <= (filters->>'dateTo')::timestamp)
      -- Filtro de última atividade
      AND (filters->>'lastActivityFrom' IS NULL OR uad.last_login >= (filters->>'lastActivityFrom')::timestamp)
      AND (filters->>'lastActivityTo' IS NULL OR uad.last_login <= (filters->>'lastActivityTo')::timestamp)
      -- Filtro de número de logins
      AND (filters->>'minLogins' IS NULL OR uad.total_logins >= (filters->>'minLogins')::bigint)
      AND (filters->>'maxLogins' IS NULL OR uad.total_logins <= (filters->>'maxLogins')::bigint)
  ),
  total AS (
    SELECT COUNT(*) as count FROM filtered_users
  )
  SELECT jsonb_build_object(
    'users', (
      SELECT jsonb_agg(row_to_json(fu.*))
      FROM (
        SELECT * FROM filtered_users
        ORDER BY 
          CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN name END ASC,
          CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN name END DESC,
          CASE WHEN sort_by = 'email' AND sort_order = 'asc' THEN email END ASC,
          CASE WHEN sort_by = 'email' AND sort_order = 'desc' THEN email END DESC,
          CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN created_at END ASC,
          CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN created_at END DESC,
          CASE WHEN sort_by = 'total_logins' AND sort_order = 'asc' THEN total_logins END ASC,
          CASE WHEN sort_by = 'total_logins' AND sort_order = 'desc' THEN total_logins END DESC,
          CASE WHEN sort_by = 'last_login' AND sort_order = 'asc' THEN last_login END ASC,
          CASE WHEN sort_by = 'last_login' AND sort_order = 'desc' THEN last_login END DESC
        LIMIT page_size
        OFFSET offset_value
      ) fu
    ),
    'total_count', (SELECT count FROM total),
    'total_pages', CEIL((SELECT count FROM total)::numeric / page_size),
    'current_page', page_number,
    'page_size', page_size
  ) INTO result;

  RETURN result;
END;
$$;

-- 8. RPC Function: Registrar ação administrativa
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type admin_action_type,
  p_target_user_id UUID DEFAULT NULL,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_id UUID;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can log actions';
  END IF;

  INSERT INTO public.admin_actions (
    admin_user_id,
    action_type,
    target_user_id,
    action_details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_user_id,
    p_action_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO action_id;

  RETURN action_id;
END;
$$;

-- 9. Trigger para auditoria automática de mudanças de role
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_admin_action(
      'role_change',
      NEW.user_id,
      jsonb_build_object(
        'old_role', NULL,
        'new_role', NEW.role,
        'operation', 'INSERT'
      )
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_admin_action(
      'role_change',
      NEW.user_id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'operation', 'UPDATE'
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_admin_action(
      'role_change',
      OLD.user_id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NULL,
        'operation', 'DELETE'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER after_user_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_role_changes();