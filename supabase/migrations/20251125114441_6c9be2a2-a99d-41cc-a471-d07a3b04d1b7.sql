-- Fix user deletion cascading issues

-- First, drop existing foreign key constraints if they exist
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_access_logs 
DROP CONSTRAINT IF EXISTS user_access_logs_user_id_fkey;

-- Recreate foreign keys with CASCADE DELETE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.user_access_logs
ADD CONSTRAINT user_access_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Recreate the user_activity_detailed view to ensure it only shows existing users
DROP VIEW IF EXISTS public.user_activity_detailed CASCADE;

CREATE VIEW public.user_activity_detailed AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.created_at,
  COALESCE(ur.role, 'user'::app_role) as role,
  COALESCE(lc.total_logins, 0) as total_logins,
  lc.last_login,
  COALESCE(pv.total_page_views, 0) as total_page_views
FROM public.profiles p
INNER JOIN auth.users au ON p.id = au.id  -- Only include users that still exist in auth.users
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_logins,
    MAX(accessed_at) as last_login
  FROM public.user_access_logs
  WHERE access_type = 'login'
  GROUP BY user_id
) lc ON p.id = lc.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_page_views
  FROM public.user_access_logs
  WHERE access_type = 'page_view'
  GROUP BY user_id
) pv ON p.id = pv.user_id;