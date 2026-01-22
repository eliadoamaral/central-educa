-- Add attachment columns to student_notes table
ALTER TABLE public.student_notes
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Create storage bucket for student note attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-attachments',
  'student-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student attachments
CREATE POLICY "Authenticated users can upload student attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-attachments');

CREATE POLICY "Anyone can view student attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'student-attachments');

CREATE POLICY "Users can delete their own student attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'student-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);