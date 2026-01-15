-- Create contract_attachments table for file management
CREATE TABLE IF NOT EXISTS public.contract_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contract_attachments_contract_id 
ON public.contract_attachments(contract_id);

-- Enable RLS
ALTER TABLE public.contract_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read, authenticated write
DROP POLICY IF EXISTS "Allow public read attachments" ON public.contract_attachments;
CREATE POLICY "Allow public read attachments" 
ON public.contract_attachments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert attachments" ON public.contract_attachments;
CREATE POLICY "Allow authenticated insert attachments" 
ON public.contract_attachments FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete attachments" ON public.contract_attachments;
CREATE POLICY "Allow authenticated delete attachments" 
ON public.contract_attachments FOR DELETE 
USING (true);

-- Create storage bucket for contract files (run this via Supabase Dashboard or SQL)
-- This creates a bucket named 'contract-files'
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read contract files" ON storage.objects;
CREATE POLICY "Public read contract files"
ON storage.objects FOR SELECT
USING (bucket_id = 'contract-files');

DROP POLICY IF EXISTS "Authenticated upload contract files" ON storage.objects;
CREATE POLICY "Authenticated upload contract files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contract-files');

DROP POLICY IF EXISTS "Authenticated delete contract files" ON storage.objects;
CREATE POLICY "Authenticated delete contract files"
ON storage.objects FOR DELETE
USING (bucket_id = 'contract-files');

COMMENT ON TABLE public.contract_attachments IS 'Stores metadata for contract file attachments';
COMMENT ON COLUMN public.contract_attachments.file_url IS 'Supabase storage URL to the file';
