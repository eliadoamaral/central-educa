-- Create function to delete users (admin only)
-- This function will cascade delete user data from profiles, user_roles, and user_access_logs
CREATE OR REPLACE FUNCTION public.delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Check if user is not trying to delete themselves
  IF auth.uid() = user_id THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  -- Delete user data (cascades automatically via foreign keys)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users (function itself checks for admin)
GRANT EXECUTE ON FUNCTION public.delete_user(uuid) TO authenticated;