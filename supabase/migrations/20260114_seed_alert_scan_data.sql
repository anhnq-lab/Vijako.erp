-- Seeding data specifically for testing Alert Center Scan capability
-- Current Date: 2026-01-14

DO $$
DECLARE
    v_project_sunurban UUID;
    v_project_kingpalace UUID;
BEGIN
    SELECT id INTO v_project_sunurban FROM public.projects WHERE code = 'P-SUNURBAN' LIMIT 1;
    SELECT id INTO v_project_kingpalace FROM public.projects WHERE code = 'P-KINGPALACE' LIMIT 1;

    -- 1. Expiring Bank Guarantee (< 30 days: before 2026-02-13)
    INSERT INTO public.bank_guarantees (code, type, project_id, bank_name, value, expiry_date, status)
    VALUES ('BL-SCAN-TEST-001', 'Bảo lãnh thực hiện HĐ', v_project_sunurban, 'Vietcombank Ba Đình', 5000000000, '2026-01-25', 'active')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Critical Risk (Score >= 17)
    INSERT INTO public.project_risks (project_id, title, description, category, probability, impact, status)
    VALUES (v_project_sunurban, 'Rủi ro sụt lún móng tháp A', 'Phát hiện địa chất không ổn định tại khu vực tháp A, có nguy cơ sụt lún cao.', 'safety', 5, 4, 'open');

    -- 3. Stale WIP Document (> 7 days: before 2026-01-07)
    INSERT INTO public.project_documents (name, type, size, url, uploaded_by, project_id, status, created_at)
    VALUES ('BVE_KienTruc_Tang1_Fix.dwg', 'dwg', 15600000, 'https://supabase.com/storage/v1/object/public/documents/test.dwg', 'Nguyễn Văn An', v_project_sunurban, 'WIP', '2025-12-25 10:00:00+07');

    -- 4. Expiring Contract (< 30 days: before 2026-02-13)
    INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, status, end_date, name)
    VALUES ('CONT-SCAN-099', 'Công ty Thép Hòa Phát', v_project_sunurban, 5000000000, 4500000000, 'active', '2026-02-05', 'Cung cấp thép xây dựng giai đoạn 2')
    ON CONFLICT (contract_code) DO NOTHING;

END $$;
