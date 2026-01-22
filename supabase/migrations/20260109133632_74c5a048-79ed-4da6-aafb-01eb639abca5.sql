-- Create student_activity_logs table for tracking changes
CREATE TABLE public.student_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'course_added', 'course_updated', 'course_removed', 'status_changed'
  description TEXT NOT NULL, -- Human readable description
  details JSONB, -- Additional details like old/new values
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view student activity logs" 
ON public.student_activity_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert student activity logs" 
ON public.student_activity_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_student_activity_logs_student_id ON public.student_activity_logs(student_id);
CREATE INDEX idx_student_activity_logs_created_at ON public.student_activity_logs(created_at DESC);