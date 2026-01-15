-- =====================================================
-- VIJAKO ERP - FINANCE COMPLETE SEED DATA
-- Created: 2026-01-15 10:35
-- This script uses correct column names and existing projects
-- =====================================================

DO $$ 
DECLARE
    -- Get existing project IDs
    p001_id UUID;
    p002_id UUID;
    p003_id UUID;
    p004_id UUID;
    
    -- Contract IDs
    cont_rev_1 UUID;
    cont_rev_2 UUID;
    cont_exp_1 UUID;
    cont_exp_2 UUID;
    
    -- Invoice IDs
    inv_1 UUID;
    inv_2 UUID;
    inv_3 UUID;
    inv_4 UUID;
BEGIN
    -- =====================================================
    -- 1. GET EXISTING PROJECTS
    -- =====================================================
    SELECT id INTO p001_id FROM projects WHERE code = 'P-001' LIMIT 1;
    SELECT id INTO p002_id FROM projects WHERE code = 'P-002' LIMIT 1;
    SELECT id INTO p003_id FROM projects WHERE code = 'P-003' LIMIT 1;
    SELECT id INTO p004_id FROM projects WHERE code = 'P-004' LIMIT 1;
    
    IF p001_id IS NULL THEN
        RAISE NOTICE 'Project P-001 not found. Please run init_projects migration first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found projects: P001=%, P002=%, P003=%, P004=%', p001_id, p002_id, p003_id, p004_id;

    -- =====================================================
    -- 2. CREATE CONTRACTS (Use contract_value, not value)
    -- =====================================================
    
    -- Revenue Contract 1: Vijako Tower with Investor
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('HĐ-DT-VT-2024', 'revenue', 'Tập đoàn Vingroup', p001_id, 45000000000, 18000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO cont_rev_1;
    
    -- Revenue Contract 2: Industrial Park with Government
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('HĐ-DT-KCN-2024', 'revenue', 'UBND Tỉnh Yên Bái', p002_id, 85000000000, 25000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO cont_rev_2;
    
    -- Expense Contract 1: Steel Supplier
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('HĐ-TP-HP-2024', 'expense', 'Thép Hòa Phát', p001_id, 12000000000, 8000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO cont_exp_1;
    
    -- Expense Contract 2: Concrete Supplier
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status)
    VALUES ('HĐ-BT-AV-2024', 'expense', 'Bê tông An Việt', p002_id, 8500000000, 5000000000, 'active')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO cont_exp_2;
    
    RAISE NOTICE 'Created contracts: REV1=%, REV2=%, EXP1=%, EXP2=%', cont_rev_1, cont_rev_2, cont_exp_1, cont_exp_2;

    -- =====================================================
    -- 3. CREATE INVOICES
    -- =====================================================
    
    -- Sales Invoice 1: Payment milestone from Vingroup
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES ('HĐ-VT-001', 'sales', p001_id, cont_rev_1, 'Vijako Construction', '2024-10-15', '2024-11-15', 5000000000, 5000000000, 5000000000, 0, 'paid')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount
    RETURNING id INTO inv_1;
    
    -- Sales Invoice 2: Pending payment from Vingroup
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES ('HĐ-VT-002', 'sales', p001_id, cont_rev_1, 'Vijako Construction', '2024-11-20', '2024-12-20', 8000000000, 8000000000, 0, 8000000000, 'pending')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount
    RETURNING id INTO inv_2;
    
    -- Purchase Invoice 1: Steel from Hoa Phat
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES ('HĐ-MH-HP-001', 'purchase', p001_id, cont_exp_1, 'Thép Hòa Phát', '2024-10-01', '2024-10-31', 3000000000, 3000000000, 3000000000, 0, 'paid')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount
    RETURNING id INTO inv_3;
    
    -- Purchase Invoice 2: Concrete from An Viet
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES ('HĐ-MH-AV-001', 'purchase', p002_id, cont_exp_2, 'Bê tông An Việt', '2024-11-05', '2024-12-05', 2500000000, 2500000000, 0, 2500000000, 'pending')
    ON CONFLICT (invoice_code) DO UPDATE SET total_amount = EXCLUDED.total_amount
    RETURNING id INTO inv_4;
    
    RAISE NOTICE 'Created invoices: INV1=%, INV2=%, INV3=%, INV4=%', inv_1, inv_2, inv_3, inv_4;

    -- =====================================================
    -- 4. CREATE PAYMENTS
    -- =====================================================
    
    -- Receipt 1: Payment from Vingroup
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status, description)
    VALUES ('TT-THU-001', 'receipt', p001_id, cont_rev_1, inv_1, '2024-10-25', 5000000000, 'Tập đoàn Vingroup', 'completed', 'Thu tiền đợt 1 dự án Vijako Tower')
    ON CONFLICT (payment_code) DO NOTHING;
    
    -- Receipt 2: Payment from Yen Bai
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status, description)
    VALUES ('TT-THU-002', 'receipt', p002_id, cont_rev_2, NULL, '2024-11-10', 10000000000, 'UBND Tỉnh Yên Bái', 'completed', 'Tạm ứng KCN Trấn Yên')
    ON CONFLICT (payment_code) DO NOTHING;
    
    -- Disbursement 1: Pay Hoa Phat
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status, description)
    VALUES ('TT-CHI-001', 'disbursement', p001_id, cont_exp_1, inv_3, '2024-10-20', 3000000000, 'Thép Hòa Phát', 'completed', 'Thanh toán thép đợt 1')
    ON CONFLICT (payment_code) DO NOTHING;
    
    -- Disbursement 2: Pay An Viet
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, invoice_id, payment_date, amount, partner_name, status, description)
    VALUES ('TT-CHI-002', 'disbursement', p002_id, cont_exp_2, NULL, '2024-11-15', 2000000000, 'Bê tông An Việt', 'completed', 'Thanh toán bê tông đợt 1')
    ON CONFLICT (payment_code) DO NOTHING;
    
    RAISE NOTICE 'Created 4 payment records';

    -- =====================================================
    -- 5. UPDATE CASH FLOW MONTHLY - Use correct scale
    -- The existing data uses small numbers (45, 52, etc.)
    -- which represent billions in the UI. Keep consistent.
    -- =====================================================
    
    -- Clear and re-insert 2024 data with realistic values
    DELETE FROM cash_flow_monthly WHERE year = 2024;
    
    INSERT INTO cash_flow_monthly (month_label, month_index, year, inflow, outflow) VALUES
    ('T1', 1, 2024, 15, 12),
    ('T2', 2, 2024, 18, 15),
    ('T3', 3, 2024, 12, 14),
    ('T4', 4, 2024, 25, 20),
    ('T5', 5, 2024, 30, 22),
    ('T6', 6, 2024, 28, 25),
    ('T7', 7, 2024, 35, 30),
    ('T8', 8, 2024, 32, 28),
    ('T9', 9, 2024, 12, 11),
    ('T10', 10, 2024, 45, 35),
    ('T11', 11, 2024, 55, 42),
    ('T12', 12, 2024, 48, 40);
    
    RAISE NOTICE 'Updated cash_flow_monthly for 2024 (12 months)';

    -- =====================================================
    -- 6. SUMMARY
    -- =====================================================
    RAISE NOTICE '✅ Finance demo data seeded successfully!';
    RAISE NOTICE '📊 Created: 4 contracts, 4 invoices, 4 payments, 12 months cash flow';
    
END $$;
