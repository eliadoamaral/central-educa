-- Add edition column to student_courses table
ALTER TABLE public.student_courses 
ADD COLUMN edition text DEFAULT '1ª Edição';

-- Update status default to 'matriculado' instead of 'active'
ALTER TABLE public.student_courses 
ALTER COLUMN status SET DEFAULT 'matriculado';