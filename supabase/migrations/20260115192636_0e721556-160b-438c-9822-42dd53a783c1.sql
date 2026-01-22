-- Create tags table for reusable tags across all leads
CREATE TABLE public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view tags
CREATE POLICY "Users can view all tags" 
ON public.lead_tags 
FOR SELECT 
TO authenticated
USING (true);

-- All authenticated users can create tags
CREATE POLICY "Users can create tags" 
ON public.lead_tags 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- All authenticated users can update tags
CREATE POLICY "Users can update tags" 
ON public.lead_tags 
FOR UPDATE 
TO authenticated
USING (true);

-- All authenticated users can delete tags
CREATE POLICY "Users can delete tags" 
ON public.lead_tags 
FOR DELETE 
TO authenticated
USING (true);

-- Insert default tags
INSERT INTO public.lead_tags (name, color) VALUES
  ('Prioritário', '#F43F5E'),
  ('Quente', '#F97316'),
  ('Morno', '#EAB308'),
  ('Frio', '#3B82F6'),
  ('VIP', '#8B5CF6'),
  ('Retornar Ligação', '#10B981'),
  ('Aguardando Resposta', '#6B7280'),
  ('Interessado', '#14B8A6'),
  ('Orçamento Enviado', '#84CC16'),
  ('Indicação', '#EC4899')
ON CONFLICT (name) DO NOTHING;