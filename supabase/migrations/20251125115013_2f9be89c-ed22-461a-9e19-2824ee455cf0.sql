-- Fix cascade delete issue with admin_actions foreign key

-- 1. Remove foreign key that prevents keeping audit history after user deletion
ALTER TABLE public.admin_actions 
DROP CONSTRAINT IF EXISTS admin_actions_target_user_id_fkey;

-- 2. Modify the trigger to not log DELETE operations during cascade
CREATE OR REPLACE FUNCTION public.audit_user_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Don't log DELETE operations during cascade (when profile has been deleted)
  IF (TG_OP = 'DELETE') THEN
    -- Check if the profile still exists before logging
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = OLD.user_id) THEN
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
    RETURN OLD;
  END IF;
  
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;