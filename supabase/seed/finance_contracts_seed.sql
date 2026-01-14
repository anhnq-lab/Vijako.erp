-- =====================================================
-- SEED DATA FOR VIJAKO ERP - FINANCE & CONTRACTS
-- Test data for development
-- =====================================================

-- Sample Contracts
INSERT INTO contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, status, signing_date, start_date, end_date) VALUES
('HĐ-AB-2024-001', 'revenue', 'UBND Huyện Sóc Sơn', (SELECT id FROM projects LIMIT 1), 15000000000, 12000000000, 750000000, 'active', '2024-01-15', '2024-02-01', '2024-12-31'),
('HĐ-BC-2024-001', 'expense', 'Công ty TNHH Thảm Hà Nội', (SELECT id FROM projects LIMIT 1), 2500000000, 2000000000, 125000000, 'active', '2024-02-01', '2024-02-15', '2024-11-30'),
('HĐ-BC-2024-002', 'expense', 'Công ty CP Xây dựng ABC', (SELECT id FROM projects LIMIT 1), 3200000000, 1800000000, 160000000, 'active', '2024-03-01', '2024-03-15', '2024-12-15'),
('HĐ-AB-2024-002', 'revenue', 'Ban QLDA Khu kinh tế', (SELECT id FROM projects LIMIT 1 OFFSET 1), 25000000000, 15000000000, 1250000000, 'active', '2024-01-10', '2024-02-01', '2025-06-30');

-- Sample Bidding Packages
INSERT INTO bidding_packages (package_code, title, project_id, budget, publish_date, submission_deadline, status) VALUES
('GT-2024-001', 'Gói thầu Thi công móng và kết cấu', (SELECT id FROM projects LIMIT 1), 5000000000, '2024-01-05', '2024-01-20', 'awarded'),
('GT-2024-002', 'Gói thầu Hoàn thiện nội ngoại thất', (SELECT id FROM projects LIMIT 1), 3500000000, '2024-02-01', '2024-02-15', 'published'),
('GT-2024-003', 'Gói thầu Hệ thống M&E', (SELECT id FROM projects LIMIT 1), 2800000000, '2024-03-01', '2024-03-15', 'draft');

-- Sample Bank Guarantees
INSERT INTO bank_guarantees (guarantee_code, guarantee_type, project_id, bank_name, guarantee_value, issue_date, expiry_date, status) VALUES
('BL-2024-001', 'Bảo lãnh thực hiện HĐ', (SELECT id FROM projects LIMIT 1), 'Ngân hàng BIDV', 750000000, '2024-01-15', '2025-01-15', 'active'),
('BL-2024-002', 'Bảo lãnh bảo hành', (SELECT id FROM projects LIMIT 1), 'Vietcombank', 375000000, '2024-02-01', '2026-02-01', 'active'),
('BL-2024-003', 'Bảo lãnh dự thầu', (SELECT id FROM projects LIMIT 1), 250000000, '2024-01-05', '2024-06-30', 'expired');

-- Sample Invoices
INSERT INTO invoices (invoice_code, invoice_type, project_id, vendor_name, vendor_tax_code, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, budget_category) VALUES
('HD-2024-001', 'sales', (SELECT id FROM projects LIMIT 1), 'UBND Huyện Sóc Sơn', '0123456789', '2024-03-01', '2024-03-31', 2000000000, 200000000, 2200000000, 2200000000, 0, 'paid', 'Revenue'),
('HD-2024-002', 'purchase', (SELECT id FROM projects LIMIT 1), 'Công ty TNHH Vật tư XD', '9876543210', '2024-03-15', '2024-04-15', 500000000, 50000000, 550000000, 300000000, 250000000, 'pending', 'Materials'),
('HD-2024-003', 'purchase', (SELECT id FROM projects LIMIT 1), 'Công ty CP Thép Việt', '1122334455', '2024-03-20', '2024-04-20', 800000000, 80000000, 880000000, 0, 880000000, 'overdue', 'Materials');

-- Sample Payments
INSERT INTO payments (payment_code, payment_type, project_id, payment_date, amount, payment_method, partner_name, bank_name, status) VALUES
('TT-2024-001', 'receipt', (SELECT id FROM projects LIMIT 1), '2024-03-31', 2200000000, 'Bank Transfer', 'UBND Huyện Sóc Sơn', 'BIDV', 'completed'),
('TT-2024-002', 'disbursement', (SELECT id FROM projects LIMIT 1), '2024-04-01', 300000000, 'Bank Transfer', 'Công ty TNHH Vật tư XD', 'Vietcombank', 'completed'),
('TT-2024-003', 'disbursement', (SELECT id FROM projects LIMIT 1), '2024-04-05', 550000000, 'Bank Transfer', 'Công ty CP Thép Việt', 'ACB', 'pending');

-- Sample Cash Flow Records
INSERT INTO cash_flow_records (record_date, flow_type, category, project_id, amount, description) VALUES
('2024-03-31', 'inflow', 'Contract Payment', (SELECT id FROM projects LIMIT 1), 2200000000, 'Thanh toán đợt 1 từ Chủ đầu tư'),
('2024-04-01', 'outflow', 'Materials', (SELECT id FROM projects LIMIT 1), 300000000, 'Thanh toán vật liệu xây dựng'),
('2024-04-05', 'outflow', 'Subcontractor', (SELECT id FROM projects LIMIT 1), 550000000, 'Thanh toán nhà thầu phụ'),
('2024-04-10', 'inflow', 'Advance Payment', (SELECT id FROM projects LIMIT 1), 1500000000, 'Ứng trước từ Chủ đầu tư'),
('2024-04-15', 'outflow', 'Labor', (SELECT id FROM projects LIMIT 1), 450000000, 'Lương công nhân tháng 3');

-- Sample Payment Requests
INSERT INTO payment_requests (request_code, project_id, partner_name, request_date, amount, work_description, progress_percentage, status, quality_check_passed) VALUES
('YC-TT-2024-001', (SELECT id FROM projects LIMIT 1), 'Công ty TNHH Thảm Hà Nội', '2024-04-01', 800000000, 'Hoàn thành thi công thảm tầng 1-3', 60.00, 'approved', true),
('YC-TT-2024-002', (SELECT id FROM projects LIMIT 1), 'Công ty CP Xây dựng ABC', '2024-04-05', 1200000000, 'Hoàn thành kết cấu tầng 4-6', 45.00, 'reviewing', false),
('YC-TT-2024-003', (SELECT id FROM projects LIMIT 1), 'Công ty TNHH Thảm Hà Nội', '2024-04-10', 700000000, 'Hoàn thành thảm tầng 4-5', 80.00, 'submitted', false);

-- Verify data
SELECT 'Contracts created: ' || COUNT(*) FROM contracts;
SELECT 'Bidding packages created: ' || COUNT(*) FROM bidding_packages;
SELECT 'Bank guarantees created: ' || COUNT(*) FROM bank_guarantees;
SELECT 'Invoices created: ' || COUNT(*) FROM invoices;
SELECT 'Payments created: ' || COUNT(*) FROM payments;
SELECT 'Cash flow records created: ' || COUNT(*) FROM cash_flow_records;
SELECT 'Payment requests created: ' || COUNT(*) FROM payment_requests;
