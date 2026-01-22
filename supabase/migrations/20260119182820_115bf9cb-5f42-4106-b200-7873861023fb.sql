-- Add CEP and address columns to students table
ALTER TABLE public.students
ADD COLUMN cep text,
ADD COLUMN address text;