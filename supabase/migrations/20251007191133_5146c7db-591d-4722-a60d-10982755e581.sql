-- Add RLS policies to analytical views to restrict access to admins only
-- This prevents unauthorized users from viewing sensitive business analytics

-- Note: Views don't support RLS directly in PostgreSQL, so we'll use SECURITY DEFINER functions
-- to wrap the views with proper access control

-- Create admin-only access functions for each view
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS TABLE (
  total_users bigint,
  active_today bigint,
  total_logins bigint,
  last_activity timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT total_users, active_today, total_logins, last_activity
  FROM public.admin_dashboard_metrics
  WHERE has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_activity_detailed()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  created_at timestamp with time zone,
  role app_role,
  total_logins bigint,
  last_login timestamp with time zone,
  total_page_views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, email, created_at, role, total_logins, last_login, total_page_views
  FROM public.user_activity_detailed
  WHERE has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_daily_access_stats()
RETURNS TABLE (
  access_date date,
  logins bigint,
  unique_users bigint,
  page_views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_date, logins, unique_users, page_views
  FROM public.daily_access_stats
  WHERE has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_activity_summary()
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  user_created_at timestamp with time zone,
  total_logins bigint,
  last_login timestamp with time zone,
  total_page_views bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, name, email, user_created_at, total_logins, last_login, total_page_views
  FROM public.user_activity_summary
  WHERE has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_login_count()
RETURNS TABLE (
  user_id uuid,
  total_logins bigint,
  last_login timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, total_logins, last_login
  FROM public.user_login_count
  WHERE has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_page_views()
RETURNS TABLE (
  user_id uuid,
  page_route text,
  view_count bigint,
  last_viewed timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, page_route, view_count, last_viewed
  FROM public.user_page_views
  WHERE has_role(auth.uid(), 'admin');
$$;

-- Revoke direct access to views from public/authenticated users
REVOKE ALL ON public.admin_dashboard_metrics FROM PUBLIC, authenticated;
REVOKE ALL ON public.user_activity_detailed FROM PUBLIC, authenticated;
REVOKE ALL ON public.daily_access_stats FROM PUBLIC, authenticated;
REVOKE ALL ON public.user_activity_summary FROM PUBLIC, authenticated;
REVOKE ALL ON public.user_login_count FROM PUBLIC, authenticated;
REVOKE ALL ON public.user_page_views FROM PUBLIC, authenticated;

-- Grant execute permissions on the security definer functions to authenticated users
-- The functions themselves will check for admin role before returning data
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_detailed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_access_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_login_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_page_views() TO authenticated;