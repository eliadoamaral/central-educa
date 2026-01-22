-- Add is_sc_client column to students table
ALTER TABLE public.students 
ADD COLUMN is_sc_client BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.students.is_sc_client IS 'Indica se o aluno é cliente da Safras & Cifras';