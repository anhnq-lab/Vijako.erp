-- Seeding data for Vijako Tower (P-001)
-- This script ensures the project has realistic financial records

DO $$ 
DECLARE
    v_project_id UUID;
    v_rev_contract_id UUID;
    v_exp_contract_id UUID;
    v_invoice_id UUID;
BEGIN
    -- 1. Get Project ID
    SELECT id INTO v_project_id FROM projects WHERE code = 'P-001';

    IF v_project_id IS NULL THEN
        RAISE NOTICE 'Project P-001 not found. Skipping seeding.';
        RETURN;
    END IF;

    -- 2. Insert Contracts
    -- Revenue Contract (A-B)
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status, signing_date, start_date, end_date)
    VALUES ('HĐ-VT-2024-REV', 'revenue', 'Tập đoàn Đầu tư Bất động sản Việt Nam', v_project_id, 120000000000, 35000000000, 'active', '2024-01-05', '2024-02-01', '2026-06-30')
    RETURNING id INTO v_rev_contract_id;

    -- Expense Contract (B-C)
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status, signing_date, start_date, end_date)
    VALUES ('HĐ-VT-2024-EXP-SC', 'expense', 'CTCP Xây dựng Delta', v_project_id, 45000000000, 12500000000, 'active', '2024-01-15', '2024-02-15', '2026-06-01')
    RETURNING id INTO v_exp_contract_id;

    -- 3. Insert Bidding Packages
    INSERT INTO bidding_packages (package_code, title, project_id, budget, status, publish_date, submission_deadline)
    VALUES 
    ('PK-VT-001', 'Gói thầu MEP - Khối đế', v_project_id, 15000000000, 'published', '2026-01-10', '2026-02-10'),
    ('PK-VT-002', 'Gói thầu Hoàn thiện nội thất sảnh', v_project_id, 8500000000, 'draft', '2026-02-01', '2026-03-01');

    -- 4. Insert Bank Guarantees
    INSERT INTO bank_guarantees (guarantee_code, guarantee_type, project_id, contract_id, bank_name, guarantee_value, issue_date, expiry_date, status)
    VALUES 
    ('BG-VT-2024-001', 'Bảo lãnh thực hiện hợp đồng', v_project_id, v_rev_contract_id, 'VietinBank - CN Tây Hà Nội', 6000000000, '2024-02-01', '2026-07-31', 'active'),
    ('BG-VT-2024-002', 'Bảo lãnh tạm ứng', v_project_id, v_rev_contract_id, 'VietinBank - CN Tây Hà Nội', 12000000000, '2024-01-15', '2024-12-31', 'active');

    -- 5. Insert Invoices & Payments (to match contract paid amounts)
    -- Revenue Invoice
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, total_amount, paid_amount, status)
    VALUES ('INV-VT-REV-001', 'sales', v_project_id, v_rev_contract_id, 'VIJAKO Jsc', '2024-03-20', 35000000000, 35000000000, 'paid')
    RETURNING id INTO v_invoice_id;

    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status)
    VALUES ('PAY-VT-REV-001', 'receipt', v_project_id, v_rev_contract_id, v_invoice_id, '2024-03-25', 35000000000, 'Tập đoàn Đầu tư Bất động sản Việt Nam', 'completed');

    -- Expense Invoice
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, total_amount, paid_amount, status)
    VALUES ('INV-VT-EXP-001', 'purchase', v_project_id, v_exp_contract_id, 'CTCP Xây dựng Delta', '2024-04-10', 12500000000, 12500000000, 'paid')
    RETURNING id INTO v_invoice_id;

    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status)
    VALUES ('PAY-VT-EXP-001', 'disbursement', v_project_id, v_exp_contract_id, v_invoice_id, '2024-04-15', 12500000000, 'CTCP Xây dựng Delta', 'completed');

END $$;
