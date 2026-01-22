-- Drop the existing check constraint
ALTER TABLE public.student_courses DROP CONSTRAINT IF EXISTS student_courses_status_check;

-- Add new check constraint with correct Portuguese values
ALTER TABLE public.student_courses ADD CONSTRAINT student_courses_status_check CHECK (status = ANY (ARRAY['matriculado'::text, 'concluido'::text]));