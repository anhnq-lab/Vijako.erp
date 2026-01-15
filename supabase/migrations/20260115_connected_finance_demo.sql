-- Seed Logically Linked Finance Data
-- Created: 2026-01-15 10:15
-- Updated: 2026-01-15 10:27 - Fixed to use existing or create demo projects
-- Logic: Revenue Chain (Contract -> Sales Invoices -> Receipt Payments)
--        Expense Chain (Contract -> Purchase Invoices -> Disbursement Payments)

DO $$ 
DECLARE
    -- Project IDs
    gs_id UUID;
    br_id UUID;
    ts_id UUID;
    
    -- Contract IDs
    rev_cont_1 UUID;
    rev_cont_2 UUID;
    exp_cont_1 UUID;
    exp_cont_2 UUID;
    
    -- Invoice IDs
    inv_rev_1 UUID;
    inv_rev_2 UUID;
    inv_exp_1 UUID;
    inv_exp_2 UUID;
BEGIN
    -- 1. GET OR CREATE DEMO PROJECTS
    -- Try to get existing projects first
    SELECT id INTO gs_id FROM projects WHERE code = 'P-GREENSHADE' LIMIT 1;
    SELECT id INTO br_id FROM projects WHERE code = 'P-BROTHER' LIMIT 1;
    SELECT id INTO ts_id FROM projects WHERE code = 'P-005' LIMIT 1;
    
    -- If projects don't exist, create them
    IF gs_id IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date)
        VALUES ('P-GREENSHADE', 'Dự án Green Shade Residence', 'Hà Nội', 'Nguyễn Quốc Anh', 'active', 65, '2024-01-15', '2025-12-31')
        RETURNING id INTO gs_id;
    END IF;
    
    IF br_id IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date)
        VALUES ('P-BROTHER', 'Dự án Brother Complex', 'TP.HCM', 'Nguyễn Quốc Anh', 'active', 45, '2024-03-01', '2025-09-30')
        RETURNING id INTO br_id;
    END IF;
    
    IF ts_id IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date)
        VALUES ('P-005', 'Dự án Tiên Sơn', 'Bắc Ninh', 'Nguyễn Quốc Anh', 'active', 78, '2023-06-01', '2025-06-30')
        RETURNING id INTO ts_id;
    END IF;
    
    -- 2. CREATE REVENUE CONTRACTS
    INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('CONT-REV-GS-01', 'revenue', 'Bất động sản LuxHome', gs_id, 45000000000, 15000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO rev_cont_1;

    INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('CONT-REV-TS-01', 'revenue', 'UBND Tỉnh Bắc Ninh', ts_id, 120000000000, 30000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO rev_cont_2;

    -- 3. CREATE EXPENSE CONTRACTS
    INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('CONT-EXP-GS-01', 'expense', 'Thép Hòa Phát Miền Bắc', gs_id, 12000000000, 5000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO exp_cont_1;

    INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('CONT-EXP-BR-01', 'expense', 'Bê tông An Việt', br_id, 8000000000, 2000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO exp_cont_2;

    -- 4. CREATE SALES INVOICES (Linked to Revenue Contracts)
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES
    ('INV-SLV-001', 'sales', gs_id, rev_cont_1, 'Vijako ERP', '2024-11-20', '2024-12-20', 5000000000, 5000000000, 5000000000, 0, 'paid'),
    ('INV-SLV-002', 'sales', gs_id, rev_cont_1, 'Vijako ERP', '2024-12-15', '2025-01-15', 10000000000, 10000000000, 0, 10000000000, 'pending'),
    ('INV-SLV-003', 'sales', ts_id, rev_cont_2, 'Vijako ERP', '2024-12-01', '2025-01-01', 30000000000, 30000000000, 30000000000, 0, 'paid')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount;

    SELECT id INTO inv_rev_1 FROM invoices WHERE invoice_code = 'INV-SLV-001';
    SELECT id INTO inv_rev_2 FROM invoices WHERE invoice_code = 'INV-SLV-002';

    -- 5. CREATE PURCHASE INVOICES (Linked to Expense Contracts)
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES
    ('INV-PUR-001', 'purchase', gs_id, exp_cont_1, 'Thép Hòa Phát Miền Bắc', '2024-11-25', '2024-12-25', 2000000000, 2000000000, 2000000000, 0, 'paid'),
    ('INV-PUR-002', 'purchase', gs_id, exp_cont_1, 'Thép Hòa Phát Miền Bắc', '2024-12-10', '2025-01-10', 3000000000, 3000000000, 0, 3000000000, 'pending'),
    ('INV-PUR-003', 'purchase', br_id, exp_cont_2, 'Bê tông An Việt', '2024-12-20', '2025-01-20', 2000000000, 2000000000, 2000000000, 0, 'paid')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount;

    SELECT id INTO inv_exp_1 FROM invoices WHERE invoice_code = 'INV-PUR-001';
    SELECT id INTO inv_exp_2 FROM invoices WHERE invoice_code = 'INV-PUR-002';

    -- 6. CREATE PAYMENTS (Properly Linked)
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status, description)
    VALUES
    -- Payment for Revenue
    ('PAY-REC-001', 'receipt', gs_id, rev_cont_1, inv_rev_1, '2024-12-05', 5000000000, 'Bất động sản LuxHome', 'completed', 'Thu tiền đợt 1 HĐ LuxHome'),
    ('PAY-REC-002', 'receipt', ts_id, rev_cont_2, NULL, '2024-12-10', 30000000000, 'UBND Tỉnh Bắc Ninh', 'completed', 'Tạm ứng thi công Tiên Sơn'),
    
    -- Payment for Expense
    ('PAY-DISP-001', 'disbursement', gs_id, exp_cont_1, inv_exp_1, '2024-12-01', 2000000000, 'Thép Hòa Phát Miền Bắc', 'completed', 'Chi trả tiền thép đợt 1'),
    ('PAY-DISP-002', 'disbursement', br_id, exp_cont_2, inv_exp_1, '2024-12-25', 2000000000, 'Bê tông An Việt', 'completed', 'Quyết toán đổ bê tông sàn T2')
    ON CONFLICT (payment_code) DO NOTHING;

    -- 7. REFRESH CASH FLOW MONTHLY (for Chart)
    DELETE FROM cash_flow_monthly WHERE year = 2024;
    
    INSERT INTO public.cash_flow_monthly (month_label, month_index, year, inflow, outflow) VALUES
    ('T1', 1, 2024, 15000000000, 12000000000),
    ('T2', 2, 2024, 18000000000, 15000000000),
    ('T3', 3, 2024, 12000000000, 14000000000),
    ('T4', 4, 2024, 25000000000, 20000000000),
    ('T5', 5, 2024, 30000000000, 22000000000),
    ('T6', 6, 2024, 28000000000, 25000000000),
    ('T7', 7, 2024, 35000000000, 30000000000),
    ('T8', 8, 2024, 32000000000, 28000000000),
    ('T9', 9, 2024, 12000000000, 11000000000),
    ('T10', 10, 2024, 45000000000, 35000000000),
    ('T11', 11, 2024, 55000000000, 42000000000),
    ('T12', 12, 2024, 48000000000, 40000000000);

    RAISE NOTICE 'Finance demo data seeded successfully!';
    RAISE NOTICE 'Created/Used Projects: GS=%, BR=%, TS=%', gs_id, br_id, ts_id;

END $$;
