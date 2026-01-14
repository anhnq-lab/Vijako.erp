-- Migration: Create project_risks table for Risk Matrix feature
-- Date: 2026-01-14

-- Drop table if exists (for clean re-run)
DROP TABLE IF EXISTS public.project_risks CASCADE;

-- Create the project_risks table
CREATE TABLE public.project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Core Risk Fields
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'schedule', 'cost', 'safety', 'quality', 'legal', 'resource'
    
    -- Risk Assessment (1-5 scale where 1=very low, 5=very high)
    -- For display purposes: value * 20 = percentage (1=20%, 5=100%)
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
    
    -- Risk Score (computed: probability * impact, range 1-25)
    risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
    
    -- Status & Response
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'mitigating', 'closed', 'accepted'
    mitigation_plan TEXT,
    owner_id UUID,
    
    -- Timestamps
    identified_date TIMESTAMPTZ DEFAULT NOW(),
    review_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_project_risks_project_id ON public.project_risks(project_id);
CREATE INDEX idx_project_risks_status ON public.project_risks(status);
CREATE INDEX idx_project_risks_risk_score ON public.project_risks(risk_score DESC);

-- Enable RLS
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access on project_risks"
ON public.project_risks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for anon users (read only)
CREATE POLICY "Allow anon read access on project_risks"
ON public.project_risks
FOR SELECT
TO anon
USING (true);

-- Add helpful comments
COMMENT ON TABLE public.project_risks IS 'Stores project risk assessments for the Risk Matrix feature';
COMMENT ON COLUMN public.project_risks.probability IS 'Likelihood of risk occurring (1-5 scale)';
COMMENT ON COLUMN public.project_risks.impact IS 'Severity if risk occurs (1-5 scale)';
COMMENT ON COLUMN public.project_risks.risk_score IS 'Computed risk score (probability * impact)';
COMMENT ON COLUMN public.project_risks.category IS 'Risk category: schedule, cost, safety, quality, legal, resource';

-- Seed initial risk data (matching mock data from Dashboard)
DO $$
DECLARE
    v_project_id UUID;
BEGIN
    -- The Nine (Low Risk: prob=1, impact=1, score=1)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-001' OR name ILIKE '%The Nine%' LIMIT 1;
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
        VALUES (v_project_id, 'Rủi ro pháp lý đã giảm', 'Các vấn đề pháp lý đã được xử lý, rủi ro ở mức thấp', 'legal', 1, 1, 'closed');
    END IF;

    -- Foxconn BG (Medium Risk: prob=3, impact=3, score=9)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-002' OR name ILIKE '%Foxconn%' LIMIT 1;
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
        VALUES (v_project_id, 'Chậm tiến độ nhập vật tư', 'Nguy cơ chậm tiến độ do nhà cung cấp giao hàng trễ', 'schedule', 3, 3, 'mitigating');
    END IF;

    -- Sun Urban (Critical Risk: prob=5, impact=5, score=25)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-003' OR name ILIKE '%Sun Urban%' LIMIT 1;
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
        VALUES (v_project_id, 'Sự cố an toàn lao động', 'Đã xảy ra sự cố ATLĐ cấp 1, cần hành động khẩn cấp', 'safety', 5, 5, 'open');
    END IF;

    -- Aeon Mall (High Risk: prob=4, impact=3, score=12)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-004' OR name ILIKE '%Aeon%' LIMIT 1;
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
        VALUES (v_project_id, 'Vượt ngân sách dự kiến', 'Chi phí vật tư tăng 15% so với dự toán ban đầu', 'cost', 4, 3, 'mitigating');
    END IF;

    -- Mỹ Thuận 2 (Watch Risk: prob=2, impact=4, score=8)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-005' OR name ILIKE '%Thuận%' OR name ILIKE '%Tiên Sơn%' LIMIT 1;
    IF v_project_id IS NOT NULL THEN
        INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
        VALUES (v_project_id, 'Thay đổi thiết kế', 'Chủ đầu tư yêu cầu thay đổi thiết kế giai đoạn 2', 'quality', 2, 4, 'open');
    END IF;
    RAISE NOTICE 'Migration 20260114_init_risks.sql completed successfully';
END $$;
