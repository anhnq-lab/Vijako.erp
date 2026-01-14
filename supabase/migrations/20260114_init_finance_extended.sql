-- Extended Finance Tables
CREATE TABLE IF NOT EXISTS public.bank_guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- e.g., 'Performance', 'Advance Payment', 'Warranty'
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    value NUMERIC(20, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'warning', 'expired', 'released')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    amount NUMERIC(20, 2) NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('pending', 'under_review', 'approved', 'paid', 'rejected')) DEFAULT 'pending',
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cash_flow_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_label TEXT NOT NULL, -- e.g., 'T1', 'T2'
    month_index INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    inflow NUMERIC(20, 2) DEFAULT 0,
    outflow NUMERIC(20, 2) DEFAULT 0,
    net_flow NUMERIC(20, 2) GENERATED ALWAYS AS (inflow - outflow) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bank_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_monthly ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all access to bank_guarantees" ON public.bank_guarantees FOR ALL USING (true);
CREATE POLICY "Allow all access to payment_requests" ON public.payment_requests FOR ALL USING (true);
CREATE POLICY "Allow all access to cash_flow_monthly" ON public.cash_flow_monthly FOR ALL USING (true);

-- Seed Data
DO $$
DECLARE
    v_project_p001 UUID;
    v_project_p002 UUID;
    v_project_p003 UUID;
    v_contract_1 UUID;
    v_contract_2 UUID;
BEGIN
    SELECT id INTO v_project_p001 FROM public.projects WHERE code = 'P-001' LIMIT 1;
    SELECT id INTO v_project_p002 FROM public.projects WHERE code = 'P-002' LIMIT 1;
    SELECT id INTO v_project_p003 FROM public.projects WHERE code = 'P-003' LIMIT 1;

    -- Add some contracts if missing for seeding
    INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, status)
    VALUES ('CONT-2024-001', 'Công ty CP Đầu tư CapitalLand', v_project_p001, 15000000000, 12000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET id = contracts.id RETURNING id INTO v_contract_1;

    INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, status, is_risk)
    VALUES ('CONT-2024-002', 'Công ty Bê tông Xuyên Á', v_project_p002, 2500000000, 2000000000, 'active', true)
    ON CONFLICT (contract_code) DO UPDATE SET id = contracts.id RETURNING id INTO v_contract_2;

    -- Bank Guarantees
    INSERT INTO public.bank_guarantees (code, type, project_id, bank_name, value, expiry_date, status) VALUES
    ('BL-PER-001', 'Bảo lãnh thực hiện HĐ', v_project_p003, 'BIDV Cầu Giấy', 12500000000, '2024-12-30', 'active'),
    ('BL-ADV-005', 'Bảo lãnh tạm ứng', v_project_p001, 'Vietinbank', 45000000000, '2023-11-15', 'warning'),
    ('BL-WAR-002', 'Bảo lãnh bảo hành', v_project_p002, 'Techcombank', 5200000000, '2025-06-01', 'active');

    -- Payment Requests
    INSERT INTO public.payment_requests (code, contract_id, project_id, amount, submission_date, status) VALUES
    ('PAY-882', v_contract_1, v_project_p001, 120000000, '2023-10-14', 'pending'),
    ('PAY-880', v_contract_2, v_project_p002, 850000000, '2023-10-10', 'approved');

    INSERT INTO public.payment_requests (code, contract_id, project_id, amount, submission_date, status, is_blocked, block_reason) VALUES
    ('PAY-881', v_contract_1, v_project_p001, 45000000, '2023-10-13', 'pending', true, 'Hồ sơ chất lượng thiếu');

    -- Cash Flow Data
    INSERT INTO public.cash_flow_monthly (month_label, month_index, year, inflow, outflow) VALUES
    ('T1', 1, 2024, 45, 30),
    ('T2', 2, 2024, 52, 48),
    ('T3', 3, 2024, 38, 45),
    ('T4', 4, 2024, 65, 50),
    ('T5', 5, 2024, 80, 60),
    ('T6', 6, 2024, 95, 85),
    ('T7', 7, 2024, 110, 90),
    ('T8', 8, 2024, 105, 88),
    ('T9', 9, 2024, 125, 95),
    ('T10', 10, 2024, 90, 80),
    ('T11', 11, 2024, 140, 110),
    ('T12', 12, 2024, 160, 120);

END $$;
