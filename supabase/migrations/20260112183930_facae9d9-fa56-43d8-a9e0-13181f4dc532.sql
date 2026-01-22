-- Add new columns for lead management
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS deal_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS deal_currency TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS phones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_close_date DATE;

-- Create index for tags for faster searches
CREATE INDEX IF NOT EXISTS idx_students_tags ON public.students USING GIN(tags);

-- Create index for deal_value for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_students_deal_value ON public.students(deal_value);

-- Add comment for documentation
COMMENT ON COLUMN public.students.deal_value IS 'Monetary value of the lead/deal';
COMMENT ON COLUMN public.students.deal_currency IS 'Currency code (BRL, USD, EUR)';
COMMENT ON COLUMN public.students.phones IS 'JSON array of phone objects with value and type';
COMMENT ON COLUMN public.students.emails IS 'JSON array of email objects with value and type';
COMMENT ON COLUMN public.students.tags IS 'Array of tag labels for categorization';
COMMENT ON COLUMN public.students.expected_close_date IS 'Expected date to close the deal';