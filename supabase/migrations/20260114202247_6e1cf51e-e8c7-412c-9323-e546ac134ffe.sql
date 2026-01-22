-- Remove the status check constraint since status field is no longer used in the UI
ALTER TABLE public.student_courses DROP CONSTRAINT student_courses_status_check;

-- Update the status column to have a simpler default and allow any value
ALTER TABLE public.student_courses ALTER COLUMN status SET DEFAULT 'ativo';