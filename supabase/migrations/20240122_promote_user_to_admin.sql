-- Promote elia.amaral@safrasecifras.com.br to admin
-- Using session_replication_role = replica to bypass auth.uid() checks in triggers

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'elia.amaral@safrasecifras.com.br';

  IF target_user_id IS NOT NULL THEN
    -- Disable triggers for this transaction
    SET session_replication_role = 'replica';

    -- Delete existing role
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Insert new admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');

    -- Re-enable triggers
    SET session_replication_role = 'origin';
  END IF;
END $$;
