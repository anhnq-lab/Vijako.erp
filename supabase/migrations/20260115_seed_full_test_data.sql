-- =====================================================
-- SEED DATA FOR ALERT CENTER & AI FEATURES
-- Created: 2026-01-15
-- Context: Creating a full dataset for "Khu Đô Thị Smart City" to test Alerts and AI
-- =====================================================

DO $$
DECLARE
    v_project_id UUID;
    v_owner_contract_id UUID;
    v_supply_contract_id UUID;
    v_sub_contract_id UUID;
    v_invoice1_id UUID;
    v_invoice2_id UUID;
BEGIN
    -- Ensure columns exist (idempotent)
    BEGIN
        ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
        ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- 1. Create a new complex project: "Khu Đô Thị Smart City"
    INSERT INTO public.projects (
        name, code, status, start_date, end_date, 
        description, location,
        budget, progress,
        manager, type
    ) 
    VALUES (
        'Khu Đô Thị Smart City', 'VJK-SC-2026', 'active', 
        CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '24 months',
        'Khu đô thị thông minh với 3 tòa tháp 45 tầng và khu thấp tầng.',
        'Đại Lộ Thăng Long, Nam Từ Liêm, Hà Nội',
        5000000000000, 15,
        'Nguyễn Quốc Anh', 'Building'
    )
    RETURNING id INTO v_project_id;

    -- Update project coordinates for Map
    UPDATE public.projects 
    SET latitude = 21.0068, longitude = 105.7592 
    WHERE id = v_project_id;

    -- 2. Seed Alerts for Alert Center (Trung tâm cảnh báo)
    
    -- 2.1 Safety Alerts
    INSERT INTO public.alerts (project_id, type, severity, title, description, is_read, due_date, source_type)
    VALUES 
    (v_project_id, 'safety', 'critical', 'Giàn giáo tầng 5 không đảm bảo an toàn', 'Thanh giằng ngang bị thiếu tại trục 5-A. Yêu cầu khắc phục ngay lập tức.', false, NOW() + INTERVAL '2 hours', 'project_issues'),
    (v_project_id, 'safety', 'high', 'Công nhân không thắt dây an toàn', 'Phát hiện 3 công nhân tổ cốp pha làm việc trên cao không đeo dây an toàn.', false, NOW() + INTERVAL '4 hours', 'project_issues');

    -- 2.2 Risk Alerts
    INSERT INTO public.alerts (project_id, type, severity, title, description, is_read, due_date, source_type)
    VALUES 
    (v_project_id, 'risk', 'high', 'Rủi ro trượt giá thép 5%', 'Giá thép thị trường đang tăng mạnh, dự kiến ảnh hưởng 2 tỷ VND ngân sách.', false, NOW() + INTERVAL '3 days', 'project_risks');

    -- 2.3 Deadline/Progress Alerts
    INSERT INTO public.alerts (project_id, type, severity, title, description, is_read, due_date, source_type)
    VALUES 
    (v_project_id, 'deadline', 'medium', 'Chậm tiến độ đổ bê tông sàn tầng 6', 'Tiến độ thực tế chậm 2 ngày so với kế hoạch.', false, NOW() + INTERVAL '1 day', 'milestones'),
    (v_project_id, 'deadline', 'low', 'Nộp báo cáo tuần', 'Báo cáo tuần 34 chưa được nộp.', false, NOW() + INTERVAL '5 hours', 'tasks');

    -- 2.4 Document/Approval Alerts
    INSERT INTO public.alerts (project_id, type, severity, title, description, is_read, due_date, source_type)
    VALUES 
    (v_project_id, 'document', 'medium', '5 Bản vẽ Shopdrawing chờ duyệt', 'Bản vẽ chi tiết thép dầm sàn tầng 6.', false, NOW() + INTERVAL '2 days', 'project_documents'),
    (v_project_id, 'contract', 'medium', 'Sắp hết hạn bảo lãnh thực hiện HĐ', 'Bảo lãnh hết hạn vào tuần tới (22/01/2026).', false, NOW() + INTERVAL '7 days', 'contracts');

    -- 3. Seed Finance Data with AI Features

    -- 3.1 Contracts
    -- Revenue Contract (Owner)
    INSERT INTO public.contracts (
        project_id, contract_code, contract_type, partner_name, 
        contract_value, paid_amount, retention_amount,
        status, signing_date, start_date, end_date
    ) VALUES (
        v_project_id, 'HĐ-SC-001/2026', 'revenue', 'Tập đoàn Vingroup',
        1200000000000, 150000000000, 5000000000,
        'active', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '24 months'
    ) RETURNING id INTO v_owner_contract_id;

    -- Expense Contract (Supplier)
    INSERT INTO public.contracts (
        project_id, contract_code, contract_type, partner_name, 
        contract_value, paid_amount, retention_amount,
        status, signing_date, start_date, end_date
    ) VALUES (
        v_project_id, 'HĐ-CC-THEP-01', 'expense', 'Công ty Thép Hòa Phát',
        50000000000, 12000000000, 0,
        'active', CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE - INTERVAL '5 months', CURRENT_DATE + INTERVAL '6 months'
    ) RETURNING id INTO v_supply_contract_id;

    -- Expense Contract (Subcontractor)
    INSERT INTO public.contracts (
        project_id, contract_code, contract_type, partner_name, 
        contract_value, paid_amount, retention_amount,
        status, signing_date, start_date, end_date
    ) VALUES (
        v_project_id, 'HĐ-TP-ME-01', 'expense', 'Nhà thầu MEP Sigma',
        80000000000, 0, 0,
        'draft', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months'
    ) RETURNING id INTO v_sub_contract_id;

    -- 3.2 Invoices with AI Data
    
    -- Invoice 1: Material (Steel) - Fully Scanned
    INSERT INTO public.invoices (
        project_id, contract_id, invoice_code, invoice_type, 
        vendor_name, vendor_tax_code, invoice_date, due_date,
        amount, tax_amount, total_amount, paid_amount, outstanding_amount,
        status, description,
        is_ai_scanned, ai_confidence, ai_extraction_data
    ) VALUES (
        v_project_id, v_supply_contract_id, 'HD-0098822', 'purchase',
        'Công ty Thép Hòa Phát', '0101234567', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
        5000000000, 500000000, 5500000000, 0, 5500000000,
        'pending', 'Thanh toán đợt 2 - Cung cấp thép D20, D25',
        true, 0.98, 
        '{
            "invoice_number": "0098822",
            "date": "2026-01-10",
            "vendor": {
                "name": "Công ty Cổ phần Thép Hòa Phát",
                "tax_id": "0101234567",
                "address": "KCN Phố Nối A, Hưng Yên"
            },
            "line_items": [
                {"item": "Thép gân D20 CB500-V", "quantity": 100, "unit": "Tấn", "unit_price": 15000000, "amount": 1500000000},
                {"item": "Thép gân D25 CB500-V", "quantity": 233.33, "unit": "Tấn", "unit_price": 15000000, "amount": 3500000000}
            ],
            "total_before_tax": 5000000000,
            "tax": 500000000,
            "total_amount": 5500000000
        }'::jsonb
    ) RETURNING id INTO v_invoice1_id;

    -- Invoice 2: Service (Security) - Scanned with lower confidence
    INSERT INTO public.invoices (
        project_id, invoice_code, invoice_type, 
        vendor_name, vendor_tax_code, invoice_date, due_date,
        amount, tax_amount, total_amount, paid_amount, outstanding_amount,
        status, description,
        is_ai_scanned, ai_confidence, ai_extraction_data
    ) VALUES (
        v_project_id, 'HD-SEC-01/26', 'purchase',
        'Công ty Bảo Vệ Thăng Long', '0108889999', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '10 days',
        25000000, 2500000, 27500000, 0, 27500000,
        'pending', 'Dịch vụ bảo vệ tháng 12/2025',
        true, 0.85,
        '{
            "invoice_number": "SEC-01/26",
            "date": "2026-01-12",
            "vendor": {
                "name": "Bảo Vệ Thăng Long",
                "tax_id": "0108889999"
            },
            "line_items": [
                {"item": "Phí dịch vụ bảo vệ 24/7", "amount": 25000000}
            ],
            "total_amount": 27500000
        }'::jsonb
    ) RETURNING id INTO v_invoice2_id;

    -- 3.3 Payments (Simulated history)
    -- Advance payment for Steel
    INSERT INTO public.payments (
        project_id, contract_id, payment_code, payment_type,
        payment_date, amount, partner_name, 
        status, payment_method, description
    ) VALUES (
        v_project_id, v_supply_contract_id, 'UNC-2601-001', 'disbursement',
        CURRENT_DATE - INTERVAL '1 month', 12000000000, 'Công ty Thép Hòa Phát',
        'completed', 'bank_transfer', 'Tạm ứng hợp đồng thép 20%'
    );

    -- Cash flow record for the above payment
    INSERT INTO public.cash_flow_records (
        project_id, record_date, flow_type, category, amount, description
    ) VALUES (
        v_project_id, CURRENT_DATE - INTERVAL '1 month', 'outflow', 'Materials', 12000000000, 'Tạm ứng thép'
    );

    -- 4. Document Activities (For recent activity log)
    -- Must have at least one document seeded in cde_alert_schema but let's assume we link to existing or just skip specific IDs for now
    -- Or better, create a dummy document for this project
    INSERT INTO public.project_documents (
        project_id, name, url, status, category, discipline, revision
    ) VALUES (
        v_project_id, 'Ban_ve_thi_cong_T05.dwg', 'https://example.com/dwg01', 'WIP', 'Design', 'ARCH', 'P01'
    );

END $$;
