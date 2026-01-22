-- Fix: Remove auth.users exposure from user_activity_detailed view
-- This view was joining with auth.users which exposes internal authentication metadata
-- The join is unnecessary as all required data comes from profiles table

CREATE OR REPLACE VIEW public.user_activity_detailed AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.created_at,
  COALESCE(ur.role, 'user'::app_role) AS role,
  COALESCE(lc.total_logins, (0)::bigint) AS total_logins,
  lc.last_login,
  COALESCE(pv.total_page_views, (0)::bigint) AS total_page_views
FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  LEFT JOIN (
    SELECT 
      user_access_logs.user_id,
      count(*) AS total_logins,
      max(user_access_logs.accessed_at) AS last_login
    FROM user_access_logs
    WHERE user_access_logs.access_type = 'login'::access_type
    GROUP BY user_access_logs.user_id
  ) lc ON p.id = lc.user_id
  LEFT JOIN (
    SELECT 
      user_access_logs.user_id,
      count(*) AS total_page_views
    FROM user_access_logs
    WHERE user_access_logs.access_type = 'page_view'::access_type
    GROUP BY user_access_logs.user_id
  ) pv ON p.id = pv.user_id;