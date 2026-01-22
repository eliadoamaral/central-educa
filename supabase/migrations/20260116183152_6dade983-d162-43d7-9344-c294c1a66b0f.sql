-- Create table for funnel stage colors customization
CREATE TABLE public.funnel_stage_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id TEXT NOT NULL UNIQUE,
  header_color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.funnel_stage_colors ENABLE ROW LEVEL SECURITY;

-- Create policies - all authenticated users can view and modify (shared settings)
CREATE POLICY "Authenticated users can view funnel stage colors" 
ON public.funnel_stage_colors 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert funnel stage colors" 
ON public.funnel_stage_colors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update funnel stage colors" 
ON public.funnel_stage_colors 
FOR UPDATE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_funnel_stage_colors_updated_at
BEFORE UPDATE ON public.funnel_stage_colors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();