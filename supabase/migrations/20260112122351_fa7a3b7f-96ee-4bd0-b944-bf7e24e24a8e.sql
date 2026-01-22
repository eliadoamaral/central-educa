-- Enable realtime for student_courses and student_activity_logs tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity_logs;