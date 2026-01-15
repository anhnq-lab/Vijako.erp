-- =====================================================
-- VIJAKO ERP - COMPLETE FINANCE SAMPLE DATA (FIXED)
-- Migration: 20260115_complete_finance_seed.sql
-- Created: 2026-01-15
-- Fixed: Sử dụng đúng tên cột theo schema thực tế
-- =====================================================

-- Xóa dữ liệu cũ để tránh conflict
DELETE FROM payments WHERE payment_code LIKE 'PAY-%';
DELETE FROM invoices WHERE invoice_code LIKE 'INV-%';
DELETE FROM payment_requests WHERE request_code LIKE 'YTTP-%';
DELETE FROM bank_guarantees WHERE guarantee_code LIKE 'BL-%';
DELETE FROM contracts WHERE contract_code LIKE 'HD-%';
DELETE FROM cash_flow_monthly;

DO $$ 
DECLARE
    -- Project IDs
    p_kingpalace UUID;
    p_legend UUID;
    p_ia20 UUID;
    p_suncity UUID;
    p_sunurban UUID;
    p_greenshade UUID;
    p_brother UUID;
    p_tienson UUID;
    
    -- Contract IDs
    c_kingpalace_rev UUID;
    c_kingpalace_exp1 UUID;
    c_kingpalace_exp2 UUID;
    c_legend_rev UUID;
    c_legend_exp1 UUID;
    c_ia20_rev UUID;
    c_ia20_exp1 UUID;
    c_suncity_rev UUID;
    c_suncity_exp1 UUID;
    c_sunurban_rev UUID;
    c_sunurban_exp1 UUID;
    c_sunurban_exp2 UUID;
    c_greenshade_rev UUID;
    c_greenshade_exp1 UUID;
    c_brother_rev UUID;
    c_brother_exp1 UUID;
    c_tienson_rev UUID;
    c_tienson_exp1 UUID;
    
BEGIN
    -- =========================================================
    -- 1. GET PROJECT IDs
    -- =========================================================
    SELECT id INTO p_kingpalace FROM projects WHERE code = 'P-KINGPALACE' LIMIT 1;
    SELECT id INTO p_legend FROM projects WHERE code = 'P-LEGEND' LIMIT 1;
    SELECT id INTO p_ia20 FROM projects WHERE code = 'P-IA20' LIMIT 1;
    SELECT id INTO p_suncity FROM projects WHERE code = 'P-SUNCITY' LIMIT 1;
    SELECT id INTO p_sunurban FROM projects WHERE code = 'P-SUNURBAN' LIMIT 1;
    SELECT id INTO p_greenshade FROM projects WHERE code = 'P-GREENSHADE' LIMIT 1;
    SELECT id INTO p_brother FROM projects WHERE code = 'P-BROTHER' LIMIT 1;
    SELECT id INTO p_tienson FROM projects WHERE code = 'P-005' LIMIT 1;
    
    -- Fallback: tạo project nếu chưa có
    IF p_tienson IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date, schedule_performance)
        VALUES ('P-005', 'Dự án Tiên Sơn', 'Bắc Ninh', 'Nguyễn Quốc Anh', 'active', 78, '2023-06-01', '2025-06-30', 'on_track')
        RETURNING id INTO p_tienson;
    END IF;
    
    IF p_greenshade IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date, schedule_performance)
        VALUES ('P-GREENSHADE', 'Green Shade Residence', 'Hà Nội', 'Nguyễn Quốc Anh', 'active', 65, '2024-01-15', '2025-12-31', 'on_track')
        RETURNING id INTO p_greenshade;
    END IF;
    
    IF p_brother IS NULL THEN
        INSERT INTO projects (code, name, location, manager, status, progress, start_date, end_date, schedule_performance)
        VALUES ('P-BROTHER', 'Brother Complex', 'TP.HCM', 'Nguyễn Quốc Anh', 'active', 45, '2024-03-01', '2025-09-30', 'delayed')
        RETURNING id INTO p_brother;
    END IF;

    -- =========================================================
    -- 2. CREATE CONTRACTS - DỰ ÁN ĐÃ HOÀN THÀNH
    -- =========================================================
    
    -- === KING PALACE ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-KP-REV-001', 'revenue', 'Công ty CP BĐS Hoa Anh Đào', p_kingpalace, 250000000000, 250000000000, 0, 5, 'completed', '2019-06-15', '2019-07-01', '2020-12-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_kingpalace_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-KP-EXP-001', 'expense', 'Thép Hòa Phát Miền Bắc', p_kingpalace, 45000000000, 45000000000, 0, 5, 'completed', '2019-07-20', '2019-08-01', '2020-06-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_kingpalace_exp1;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-KP-EXP-002', 'expense', 'Coteccons Glass JSC', p_kingpalace, 32000000000, 32000000000, 0, 5, 'completed', '2019-10-15', '2019-11-01', '2020-09-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_kingpalace_exp2;

    -- === THE LEGEND ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-LG-REV-001', 'revenue', 'BDV JSC', p_legend, 180000000000, 180000000000, 0, 5, 'completed', '2017-08-01', '2017-09-01', '2019-04-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_legend_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-LG-EXP-001', 'expense', 'Bê tông Việt Đức', p_legend, 28000000000, 28000000000, 0, 5, 'completed', '2017-09-15', '2017-10-01', '2018-12-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_legend_exp1;

    -- === IA20 CIPUTRA ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-IA20-REV-001', 'revenue', 'Công ty CP Đầu tư BĐS Đông Đô - BQP', p_ia20, 320000000000, 320000000000, 0, 5, 'completed', '2018-11-01', '2018-12-01', '2020-02-29')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_ia20_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-IA20-EXP-001', 'expense', 'Cốt thép Việt Á Corp', p_ia20, 55000000000, 55000000000, 0, 5, 'completed', '2018-12-15', '2019-01-01', '2019-12-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_ia20_exp1;

    -- === SUNSHINE CITY ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-SC-REV-001', 'revenue', 'Tập đoàn Sunshine Group', p_suncity, 450000000000, 450000000000, 0, 5, 'completed', '2017-09-01', '2017-10-01', '2020-10-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_suncity_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-SC-EXP-001', 'expense', 'Tân Á Đại Thành', p_suncity, 85000000000, 85000000000, 0, 5, 'completed', '2017-10-15', '2017-11-01', '2020-06-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_suncity_exp1;

    -- =========================================================
    -- 3. CREATE CONTRACTS - DỰ ÁN ĐANG THI CÔNG
    -- =========================================================
    
    -- === SUN URBAN CITY HÀ NAM ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-SU-REV-001', 'revenue', 'Tập đoàn SUN Group', p_sunurban, 2500000000000, 750000000000, 125000000000, 5, 'active', '2022-12-15', '2023-01-01', '2026-12-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_sunurban_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date, is_risk, risk_note)
    VALUES ('HD-SU-EXP-001', 'expense', 'Tổng công ty Hòa Bình', p_sunurban, 380000000000, 150000000000, 19000000000, 5, 'active', '2023-02-01', '2023-03-01', '2026-06-30', false, NULL)
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_sunurban_exp1;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date, is_risk, risk_note)
    VALUES ('HD-SU-EXP-002', 'expense', 'Thép Pomina', p_sunurban, 120000000000, 48000000000, 6000000000, 5, 'active', '2023-03-15', '2023-04-01', '2025-12-31', true, 'Giá thép biến động mạnh, cần theo dõi')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_sunurban_exp2;

    -- === GREEN SHADE RESIDENCE ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-GS-REV-001', 'revenue', 'Bất động sản LuxHome', p_greenshade, 45000000000, 15000000000, 2250000000, 5, 'active', '2023-12-20', '2024-01-15', '2025-12-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_greenshade_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-GS-EXP-001', 'expense', 'Thép Hòa Phát HN', p_greenshade, 12000000000, 5000000000, 600000000, 5, 'active', '2024-02-01', '2024-02-15', '2025-10-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_greenshade_exp1;

    -- === BROTHER COMPLEX ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-BR-REV-001', 'revenue', 'Brother Development Inc.', p_brother, 85000000000, 34000000000, 4250000000, 5, 'active', '2024-02-15', '2024-03-01', '2025-09-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_brother_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date, is_risk, risk_note)
    VALUES ('HD-BR-EXP-001', 'expense', 'Bê tông An Việt', p_brother, 8000000000, 2000000000, 400000000, 5, 'active', '2024-04-01', '2024-04-15', '2025-06-30', true, 'Tiến độ cung cấp chậm')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_brother_exp1;

    -- === TIÊN SƠN BẮC NINH ===
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-TS-REV-001', 'revenue', 'UBND Tỉnh Bắc Ninh', p_tienson, 120000000000, 30000000000, 6000000000, 5, 'active', '2023-05-01', '2023-06-01', '2025-06-30')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_tienson_rev;
    
    INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, retention_percentage, status, signing_date, start_date, end_date)
    VALUES ('HD-TS-EXP-001', 'expense', 'Thép SMC', p_tienson, 25000000000, 10000000000, 1250000000, 5, 'active', '2023-07-01', '2023-07-15', '2025-03-31')
    ON CONFLICT (contract_code) DO UPDATE SET contract_value = EXCLUDED.contract_value
    RETURNING id INTO c_tienson_exp1;

    -- =========================================================
    -- 4. CREATE INVOICES - HÓA ĐƠN
    -- =========================================================
    
    -- === SALES INVOICES (Thu) - Dự án hoàn thành ===
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status) VALUES
    -- King Palace
    ('INV-KP-S-001', 'sales', p_kingpalace, c_kingpalace_rev, 'Vijako JSC', '2019-09-01', '2019-10-01', 50000000000, 5000000000, 55000000000, 55000000000, 0, 'paid'),
    ('INV-KP-S-002', 'sales', p_kingpalace, c_kingpalace_rev, 'Vijako JSC', '2020-03-15', '2020-04-15', 100000000000, 10000000000, 110000000000, 110000000000, 0, 'paid'),
    ('INV-KP-S-003', 'sales', p_kingpalace, c_kingpalace_rev, 'Vijako JSC', '2020-12-20', '2021-01-20', 85000000000, 8500000000, 93500000000, 93500000000, 0, 'paid'),
    -- The Legend
    ('INV-LG-S-001', 'sales', p_legend, c_legend_rev, 'Vijako JSC', '2018-03-01', '2018-04-01', 60000000000, 6000000000, 66000000000, 66000000000, 0, 'paid'),
    ('INV-LG-S-002', 'sales', p_legend, c_legend_rev, 'Vijako JSC', '2019-04-15', '2019-05-15', 120000000000, 12000000000, 132000000000, 132000000000, 0, 'paid'),
    -- IA20
    ('INV-IA20-S-001', 'sales', p_ia20, c_ia20_rev, 'Vijako JSC', '2019-06-01', '2019-07-01', 100000000000, 10000000000, 110000000000, 110000000000, 0, 'paid'),
    ('INV-IA20-S-002', 'sales', p_ia20, c_ia20_rev, 'Vijako JSC', '2020-02-15', '2020-03-15', 220000000000, 22000000000, 242000000000, 242000000000, 0, 'paid'),
    -- Sunshine City
    ('INV-SC-S-001', 'sales', p_suncity, c_suncity_rev, 'Vijako JSC', '2018-06-01', '2018-07-01', 150000000000, 15000000000, 165000000000, 165000000000, 0, 'paid'),
    ('INV-SC-S-002', 'sales', p_suncity, c_suncity_rev, 'Vijako JSC', '2020-10-20', '2020-11-20', 300000000000, 30000000000, 330000000000, 330000000000, 0, 'paid')
    ON CONFLICT (invoice_code) DO NOTHING;

    -- === SALES INVOICES (Thu) - Dự án đang thi công ===
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status) VALUES
    -- Sun Urban City
    ('INV-SU-S-001', 'sales', p_sunurban, c_sunurban_rev, 'Vijako JSC', '2023-06-01', '2023-07-01', 250000000000, 25000000000, 275000000000, 275000000000, 0, 'paid'),
    ('INV-SU-S-002', 'sales', p_sunurban, c_sunurban_rev, 'Vijako JSC', '2024-01-15', '2024-02-15', 250000000000, 25000000000, 275000000000, 275000000000, 0, 'paid'),
    ('INV-SU-S-003', 'sales', p_sunurban, c_sunurban_rev, 'Vijako JSC', '2024-09-01', '2024-10-01', 250000000000, 25000000000, 275000000000, 275000000000, 0, 'paid'),
    ('INV-SU-S-004', 'sales', p_sunurban, c_sunurban_rev, 'Vijako JSC', '2025-01-10', '2025-02-10', 300000000000, 30000000000, 330000000000, 0, 330000000000, 'pending'),
    -- Green Shade
    ('INV-GS-S-001', 'sales', p_greenshade, c_greenshade_rev, 'Vijako JSC', '2024-03-01', '2024-04-01', 15000000000, 1500000000, 16500000000, 16500000000, 0, 'paid'),
    ('INV-GS-S-002', 'sales', p_greenshade, c_greenshade_rev, 'Vijako JSC', '2025-01-05', '2025-02-05', 10000000000, 1000000000, 11000000000, 0, 11000000000, 'pending'),
    -- Brother Complex
    ('INV-BR-S-001', 'sales', p_brother, c_brother_rev, 'Vijako JSC', '2024-06-01', '2024-07-01', 20000000000, 2000000000, 22000000000, 22000000000, 0, 'paid'),
    ('INV-BR-S-002', 'sales', p_brother, c_brother_rev, 'Vijako JSC', '2024-12-15', '2025-01-15', 14000000000, 1400000000, 15400000000, 15400000000, 0, 'paid'),
    ('INV-BR-S-003', 'sales', p_brother, c_brother_rev, 'Vijako JSC', '2025-01-12', '2025-02-12', 12000000000, 1200000000, 13200000000, 0, 13200000000, 'pending'),
    -- Tiên Sơn
    ('INV-TS-S-001', 'sales', p_tienson, c_tienson_rev, 'Vijako JSC', '2023-09-01', '2023-10-01', 30000000000, 3000000000, 33000000000, 33000000000, 0, 'paid'),
    ('INV-TS-S-002', 'sales', p_tienson, c_tienson_rev, 'Vijako JSC', '2025-01-08', '2025-02-08', 25000000000, 2500000000, 27500000000, 0, 27500000000, 'pending')
    ON CONFLICT (invoice_code) DO NOTHING;

    -- === PURCHASE INVOICES (Chi) ===
    INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, budget_category) VALUES
    -- King Palace Expenses
    ('INV-KP-P-001', 'purchase', p_kingpalace, c_kingpalace_exp1, 'Thép Hòa Phát Miền Bắc', '2019-10-15', '2019-11-15', 25000000000, 2500000000, 27500000000, 27500000000, 0, 'paid', 'Vật liệu xây dựng'),
    ('INV-KP-P-002', 'purchase', p_kingpalace, c_kingpalace_exp1, 'Thép Hòa Phát Miền Bắc', '2020-04-20', '2020-05-20', 20000000000, 2000000000, 22000000000, 22000000000, 0, 'paid', 'Vật liệu xây dựng'),
    ('INV-KP-P-003', 'purchase', p_kingpalace, c_kingpalace_exp2, 'Coteccons Glass JSC', '2020-06-15', '2020-07-15', 32000000000, 3200000000, 35200000000, 35200000000, 0, 'paid', 'Hoàn thiện'),
    -- Sun Urban Expenses
    ('INV-SU-P-001', 'purchase', p_sunurban, c_sunurban_exp1, 'Tổng công ty Hòa Bình', '2023-08-01', '2023-09-01', 80000000000, 8000000000, 88000000000, 88000000000, 0, 'paid', 'Xây dựng'),
    ('INV-SU-P-002', 'purchase', p_sunurban, c_sunurban_exp1, 'Tổng công ty Hòa Bình', '2024-04-15', '2024-05-15', 70000000000, 7000000000, 77000000000, 77000000000, 0, 'paid', 'Xây dựng'),
    ('INV-SU-P-003', 'purchase', p_sunurban, c_sunurban_exp2, 'Thép Pomina', '2023-10-01', '2023-11-01', 48000000000, 4800000000, 52800000000, 52800000000, 0, 'paid', 'Vật liệu xây dựng'),
    ('INV-SU-P-004', 'purchase', p_sunurban, c_sunurban_exp2, 'Thép Pomina', '2025-01-10', '2025-02-10', 35000000000, 3500000000, 38500000000, 0, 38500000000, 'pending', 'Vật liệu xây dựng'),
    -- Green Shade Expenses
    ('INV-GS-P-001', 'purchase', p_greenshade, c_greenshade_exp1, 'Thép Hòa Phát HN', '2024-05-01', '2024-06-01', 5000000000, 500000000, 5500000000, 5500000000, 0, 'paid', 'Vật liệu xây dựng'),
    ('INV-GS-P-002', 'purchase', p_greenshade, c_greenshade_exp1, 'Thép Hòa Phát HN', '2025-01-05', '2025-02-05', 3500000000, 350000000, 3850000000, 0, 3850000000, 'pending', 'Vật liệu xây dựng'),
    -- Brother Complex Expenses
    ('INV-BR-P-001', 'purchase', p_brother, c_brother_exp1, 'Bê tông An Việt', '2024-07-01', '2024-08-01', 2000000000, 200000000, 2200000000, 2200000000, 0, 'paid', 'Bê tông'),
    ('INV-BR-P-002', 'purchase', p_brother, c_brother_exp1, 'Bê tông An Việt', '2025-01-08', '2025-02-08', 2500000000, 250000000, 2750000000, 0, 2750000000, 'pending', 'Bê tông'),
    -- Tiên Sơn Expenses
    ('INV-TS-P-001', 'purchase', p_tienson, c_tienson_exp1, 'Thép SMC', '2023-11-01', '2023-12-01', 10000000000, 1000000000, 11000000000, 11000000000, 0, 'paid', 'Vật liệu xây dựng'),
    ('INV-TS-P-002', 'purchase', p_tienson, c_tienson_exp1, 'Thép SMC', '2025-01-10', '2025-02-10', 8000000000, 800000000, 8800000000, 0, 8800000000, 'pending', 'Vật liệu xây dựng')
    ON CONFLICT (invoice_code) DO NOTHING;

    -- =========================================================
    -- 5. CREATE PAYMENTS - THANH TOÁN
    -- =========================================================
    
    -- === RECEIPT PAYMENTS (Thu) ===
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, payment_date, amount, partner_name, payment_method, status, description) VALUES
    -- King Palace
    ('PAY-KP-R-001', 'receipt', p_kingpalace, c_kingpalace_rev, '2019-09-25', 55000000000, 'Công ty CP BĐS Hoa Anh Đào', 'Chuyển khoản', 'completed', 'Thu đợt 1 - Tạm ứng thi công'),
    ('PAY-KP-R-002', 'receipt', p_kingpalace, c_kingpalace_rev, '2020-04-10', 110000000000, 'Công ty CP BĐS Hoa Anh Đào', 'Chuyển khoản', 'completed', 'Thu đợt 2 - Hoàn thiện phần thô'),
    ('PAY-KP-R-003', 'receipt', p_kingpalace, c_kingpalace_rev, '2021-01-15', 93500000000, 'Công ty CP BĐS Hoa Anh Đào', 'Chuyển khoản', 'completed', 'Thu đợt 3 - Quyết toán'),
    -- Sun Urban City
    ('PAY-SU-R-001', 'receipt', p_sunurban, c_sunurban_rev, '2023-06-28', 275000000000, 'Tập đoàn SUN Group', 'Chuyển khoản', 'completed', 'Tạm ứng đợt 1'),
    ('PAY-SU-R-002', 'receipt', p_sunurban, c_sunurban_rev, '2024-02-10', 275000000000, 'Tập đoàn SUN Group', 'Chuyển khoản', 'completed', 'Thanh toán đợt 2'),
    ('PAY-SU-R-003', 'receipt', p_sunurban, c_sunurban_rev, '2024-09-28', 275000000000, 'Tập đoàn SUN Group', 'Chuyển khoản', 'completed', 'Thanh toán đợt 3'),
    -- Green Shade
    ('PAY-GS-R-001', 'receipt', p_greenshade, c_greenshade_rev, '2024-03-25', 16500000000, 'Bất động sản LuxHome', 'Chuyển khoản', 'completed', 'Tạm ứng thi công'),
    -- Brother Complex
    ('PAY-BR-R-001', 'receipt', p_brother, c_brother_rev, '2024-06-28', 22000000000, 'Brother Development Inc.', 'Chuyển khoản', 'completed', 'Thu đợt 1'),
    ('PAY-BR-R-002', 'receipt', p_brother, c_brother_rev, '2025-01-10', 15400000000, 'Brother Development Inc.', 'Chuyển khoản', 'completed', 'Thu đợt 2'),
    -- Tiên Sơn
    ('PAY-TS-R-001', 'receipt', p_tienson, c_tienson_rev, '2023-09-28', 33000000000, 'UBND Tỉnh Bắc Ninh', 'Chuyển khoản', 'completed', 'Tạm ứng ngân sách')
    ON CONFLICT (payment_code) DO NOTHING;

    -- === DISBURSEMENT PAYMENTS (Chi) ===
    INSERT INTO payments (payment_code, payment_type, project_id, contract_id, payment_date, amount, partner_name, payment_method, status, description) VALUES
    -- King Palace
    ('PAY-KP-D-001', 'disbursement', p_kingpalace, c_kingpalace_exp1, '2019-11-10', 27500000000, 'Thép Hòa Phát Miền Bắc', 'Chuyển khoản', 'completed', 'Thanh toán thép đợt 1'),
    ('PAY-KP-D-002', 'disbursement', p_kingpalace, c_kingpalace_exp1, '2020-05-15', 22000000000, 'Thép Hòa Phát Miền Bắc', 'Chuyển khoản', 'completed', 'Thanh toán thép đợt 2'),
    ('PAY-KP-D-003', 'disbursement', p_kingpalace, c_kingpalace_exp2, '2020-07-10', 35200000000, 'Coteccons Glass JSC', 'Chuyển khoản', 'completed', 'Thanh toán kính mặt dựng'),
    -- Sun Urban City
    ('PAY-SU-D-001', 'disbursement', p_sunurban, c_sunurban_exp1, '2023-08-28', 88000000000, 'Tổng công ty Hòa Bình', 'Chuyển khoản', 'completed', 'Chi trả NTP đợt 1'),
    ('PAY-SU-D-002', 'disbursement', p_sunurban, c_sunurban_exp1, '2024-05-10', 77000000000, 'Tổng công ty Hòa Bình', 'Chuyển khoản', 'completed', 'Chi trả NTP đợt 2'),
    ('PAY-SU-D-003', 'disbursement', p_sunurban, c_sunurban_exp2, '2023-10-28', 52800000000, 'Thép Pomina', 'Chuyển khoản', 'completed', 'Thanh toán thép đợt 1'),
    -- Green Shade
    ('PAY-GS-D-001', 'disbursement', p_greenshade, c_greenshade_exp1, '2024-05-28', 5500000000, 'Thép Hòa Phát HN', 'Chuyển khoản', 'completed', 'Thanh toán thép tầng hầm'),
    -- Brother Complex
    ('PAY-BR-D-001', 'disbursement', p_brother, c_brother_exp1, '2024-07-28', 2200000000, 'Bê tông An Việt', 'Chuyển khoản', 'completed', 'Thanh toán bê tông móng'),
    -- Tiên Sơn
    ('PAY-TS-D-001', 'disbursement', p_tienson, c_tienson_exp1, '2023-11-28', 11000000000, 'Thép SMC', 'Chuyển khoản', 'completed', 'Thanh toán thép xây dựng')
    ON CONFLICT (payment_code) DO NOTHING;

    -- =========================================================
    -- 6. BANK GUARANTEES - BẢO LÃNH NGÂN HÀNG
    -- (Sử dụng đúng tên cột: guarantee_code, guarantee_type, guarantee_value)
    -- =========================================================
    INSERT INTO bank_guarantees (guarantee_code, guarantee_type, project_id, bank_name, guarantee_value, issue_date, expiry_date, status) VALUES
    -- Sun Urban City
    ('BL-SU-THUC-001', 'Bảo lãnh thực hiện HĐ', p_sunurban, 'BIDV Chi nhánh Hà Nam', 125000000000, '2023-01-01', '2027-06-30', 'active'),
    ('BL-SU-UNG-001', 'Bảo lãnh tạm ứng', p_sunurban, 'Vietcombank Phủ Lý', 200000000000, '2023-01-01', '2025-12-31', 'active'),
    ('BL-SU-BH-001', 'Bảo lãnh bảo hành', p_sunurban, 'BIDV Chi nhánh Hà Nam', 75000000000, '2023-01-01', '2028-12-31', 'active'),
    -- Green Shade
    ('BL-GS-THUC-001', 'Bảo lãnh thực hiện HĐ', p_greenshade, 'Techcombank Hà Nội', 2250000000, '2024-01-15', '2026-06-30', 'active'),
    ('BL-GS-UNG-001', 'Bảo lãnh tạm ứng', p_greenshade, 'Vietinbank', 5000000000, '2024-01-15', '2025-06-30', 'active'),
    -- Brother Complex
    ('BL-BR-THUC-001', 'Bảo lãnh thực hiện HĐ', p_brother, 'ACB TP.HCM', 4250000000, '2024-03-01', '2026-03-31', 'active'),
    -- Tiên Sơn
    ('BL-TS-THUC-001', 'Bảo lãnh thực hiện HĐ', p_tienson, 'BIDV Bắc Ninh', 6000000000, '2023-06-01', '2025-12-31', 'active'),
    ('BL-TS-BH-001', 'Bảo lãnh bảo hành', p_tienson, 'BIDV Bắc Ninh', 3600000000, '2023-06-01', '2027-06-30', 'active')
    ON CONFLICT (guarantee_code) DO NOTHING;

    -- =========================================================
    -- 7. PAYMENT REQUESTS - YÊU CẦU THANH TOÁN
    -- (Sử dụng đúng tên cột: request_code)
    -- =========================================================
    INSERT INTO payment_requests (request_code, contract_id, project_id, partner_name, request_date, amount, status) VALUES
    -- Sun Urban City
    ('YTTP-SU-001', c_sunurban_exp1, p_sunurban, 'Tổng công ty Hòa Bình', '2025-01-10', 45000000000, 'submitted'),
    ('YTTP-SU-002', c_sunurban_exp2, p_sunurban, 'Thép Pomina', '2025-01-12', 35000000000, 'reviewing'),
    -- Green Shade
    ('YTTP-GS-001', c_greenshade_exp1, p_greenshade, 'Thép Hòa Phát HN', '2025-01-08', 3500000000, 'approved'),
    -- Brother Complex
    ('YTTP-BR-001', c_brother_exp1, p_brother, 'Bê tông An Việt', '2025-01-05', 2500000000, 'draft'),
    -- Tiên Sơn
    ('YTTP-TS-001', c_tienson_exp1, p_tienson, 'Thép SMC', '2025-01-10', 8000000000, 'reviewing')
    ON CONFLICT (request_code) DO NOTHING;

    -- =========================================================
    -- 8. CASH FLOW MONTHLY - DÒNG TIỀN THEO THÁNG
    -- =========================================================
    INSERT INTO cash_flow_monthly (month_label, month_index, year, inflow, outflow) VALUES
    -- 2024
    ('T1', 1, 2024, 35000000000, 28000000000),
    ('T2', 2, 2024, 42000000000, 35000000000),
    ('T3', 3, 2024, 38000000000, 42000000000),
    ('T4', 4, 2024, 55000000000, 48000000000),
    ('T5', 5, 2024, 68000000000, 55000000000),
    ('T6', 6, 2024, 95000000000, 75000000000),
    ('T7', 7, 2024, 85000000000, 72000000000),
    ('T8', 8, 2024, 78000000000, 68000000000),
    ('T9', 9, 2024, 320000000000, 180000000000),
    ('T10', 10, 2024, 125000000000, 98000000000),
    ('T11', 11, 2024, 145000000000, 115000000000),
    ('T12', 12, 2024, 158000000000, 128000000000),
    -- 2025
    ('T1', 1, 2025, 168000000000, 142000000000);

    RAISE NOTICE 'Hoàn thành seed dữ liệu tài chính!';
    RAISE NOTICE 'Contracts: 18, Invoices: ~30, Payments: ~20, Guarantees: 8, Payment Requests: 5';
    
END $$;
