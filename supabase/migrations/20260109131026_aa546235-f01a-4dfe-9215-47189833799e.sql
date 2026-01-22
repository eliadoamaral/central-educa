-- Create student_courses table for multiple courses per student
CREATE TABLE public.student_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(student_id, course_name)
);

-- Enable RLS
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view student courses"
ON public.student_courses
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert student courses"
ON public.student_courses
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update student courses"
ON public.student_courses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete student courses"
ON public.student_courses
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_student_courses_updated_at
BEFORE UPDATE ON public.student_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing course data from students table to student_courses
INSERT INTO public.student_courses (student_id, course_name, enrollment_date, status, created_at)
SELECT id, course, enrollment_date, status, created_at
FROM public.students
WHERE course IS NOT NULL AND course != '';