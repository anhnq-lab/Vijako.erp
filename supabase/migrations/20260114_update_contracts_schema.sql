-- Add missing columns to contracts table for alert scanning
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing records with fallback data if possible
UPDATE public.contracts 
SET name = partner_name || ' - ' || contract_code
WHERE name IS NULL;
