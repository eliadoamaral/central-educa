-- Add lead_source field to students table for marketing analysis
ALTER TABLE public.students 
ADD COLUMN lead_source TEXT DEFAULT NULL;

COMMENT ON COLUMN public.students.lead_source IS 'Origem/fonte do aluno para análise de marketing (indicação, evento, redes sociais, etc.)';