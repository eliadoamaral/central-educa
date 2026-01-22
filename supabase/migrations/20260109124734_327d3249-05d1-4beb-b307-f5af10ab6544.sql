-- Allow authenticated users to view students (read-only)
CREATE POLICY "Authenticated users can view students" 
ON public.students 
FOR SELECT 
USING (auth.uid() IS NOT NULL);