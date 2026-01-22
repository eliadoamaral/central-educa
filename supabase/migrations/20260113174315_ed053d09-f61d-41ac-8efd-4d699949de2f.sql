-- Add dedicated funnel_stage column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS funnel_stage TEXT DEFAULT 'novo_lead';

-- Create an index for better query performance on funnel_stage
CREATE INDEX IF NOT EXISTS idx_students_funnel_stage ON public.students(funnel_stage);

-- Migrate existing funnel stage data from notes to the new column
UPDATE public.students
SET funnel_stage = SUBSTRING(notes FROM '\[FUNNEL:(\w+)\]')
WHERE notes LIKE '%[FUNNEL:%';

-- Clean up the FUNNEL prefix from notes field
UPDATE public.students
SET notes = TRIM(REGEXP_REPLACE(notes, '\[FUNNEL:\w+\]\s*', '', 'g'))
WHERE notes LIKE '%[FUNNEL:%';