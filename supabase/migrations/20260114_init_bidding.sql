-- Bidding System Tables
CREATE TABLE IF NOT EXISTS public.bidding_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget NUMERIC(20, 2),
    deadline DATE,
    status TEXT CHECK (status IN ('draft', 'published', 'closed', 'awarded')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bidding_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.bidding_packages(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.supply_chain_vendors(id) ON DELETE SET NULL,
    price NUMERIC(20, 2),
    proposal_url TEXT,
    score NUMERIC(3, 1),
    status TEXT CHECK (status IN ('submitted', 'under_review', 'awarded', 'rejected')) DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bidding_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidding_quotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read published packages" ON public.bidding_packages FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users full access to bidding" ON public.bidding_packages FOR ALL USING (true);
CREATE POLICY "Authenticated users full access to quotes" ON public.bidding_quotes FOR ALL USING (true);

-- Seed Bidding Data
INSERT INTO public.bidding_packages (title, project_id, budget, deadline, status)
SELECT 
    'Gói thầu cơ điện MEP - Tòa nhà Vijako Tower',
    id,
    15000000000,
    '2024-06-30',
    'published'
FROM public.projects WHERE code = 'P-001' LIMIT 1;

INSERT INTO public.bidding_packages (title, project_id, budget, deadline, status)
SELECT 
    'Cung cấp và lắp đặt cửa nhôm kính - The Nine',
    id,
    8000000000,
    '2024-07-15',
    'published'
FROM public.projects WHERE code = 'P-002' LIMIT 1;
