-- 1. Add 'viewer' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

-- 2. Create a function to assign viewer role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert viewer role for new user if they don't already have any role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Create trigger to auto-assign viewer role when profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- 4. Create a function to check if user has full access (admin or user role, not just viewer)
CREATE OR REPLACE FUNCTION public.has_full_access(_user_id uuid)
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
      AND role IN ('admin', 'user')
  )
$$;

-- 5. Grant execute permission on new function
GRANT EXECUTE ON FUNCTION public.has_full_access(uuid) TO authenticated;