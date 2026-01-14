-- Add type column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'expense'; -- Default to expense (thầu phụ) as safe bet, but we will update.

-- Update existing Tiên Sơn contracts
UPDATE public.contracts 
SET type = 'revenue' 
WHERE contract_code = 'HĐ-TS-001'; -- CapitalLand (Chủ đầu tư)

UPDATE public.contracts 
SET type = 'expense' 
WHERE contract_code IN ('HĐ-NTP-01', 'HĐ-NTP-02'); -- Thầu phụ

-- Optional: Add check constraint if we want to be strict, but flexible is better for now.
-- ALTER TABLE public.contracts ADD CONSTRAINT contracts_type_check CHECK (type IN ('revenue', 'expense'));
