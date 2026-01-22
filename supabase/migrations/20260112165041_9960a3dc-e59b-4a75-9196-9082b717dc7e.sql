-- Add deleted_at column for soft delete functionality
ALTER TABLE public.students 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_by column to track who deleted
ALTER TABLE public.students 
ADD COLUMN deleted_by UUID DEFAULT NULL;

-- Create index for faster queries on non-deleted students
CREATE INDEX idx_students_deleted_at ON public.students(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS policies to handle soft delete visibility
-- Users can see non-deleted students (existing behavior maintained)
-- Admins can see all students including deleted ones for trash management