-- Create student_notes table for observation history
CREATE TABLE public.student_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX idx_student_notes_student_id ON public.student_notes(student_id);
CREATE INDEX idx_student_notes_created_at ON public.student_notes(created_at DESC);

-- Enable RLS
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies - authenticated users can manage notes
CREATE POLICY "Authenticated users can view student notes"
ON public.student_notes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create student notes"
ON public.student_notes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own notes"
ON public.student_notes
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own notes"
ON public.student_notes
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Migrate existing notes from students table to student_notes
INSERT INTO public.student_notes (student_id, content, created_at, created_by)
SELECT id, notes, updated_at, created_by
FROM public.students
WHERE notes IS NOT NULL AND TRIM(notes) != '';