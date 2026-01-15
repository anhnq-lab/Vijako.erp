-- Seed Finance Transactions (Payments) and Debts (Invoices)

-- 1. Seed Invoices (Công nợ)
-- Revenue Invoices (Sales) - AR: totaling ~25.4B
INSERT INTO public.invoices (invoice_code, invoice_type, project_id, vendor_name, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status)
VALUES 
('INV-S-001', 'sales', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 'Công ty CP Lux Decor Việt Nam', '2024-12-15', '2025-01-15', 12000000000, 1200000000, 13200000000, 5000000000, 8200000000, 'pending'),
('INV-S-002', 'sales', (SELECT id FROM projects WHERE code = 'P-BROTHER'), 'Công ty TNHH Brother Industries VN', '2025-01-05', '2025-02-05', 8000000000, 800000000, 8800000000, 0, 8800000000, 'pending'),
('INV-S-003', 'sales', (SELECT id FROM projects WHERE code = 'P-001'), 'Tây Hồ Tây Group', '2024-11-20', '2024-12-20', 5000000000, 500000000, 5500000000, 1000000000, 4500000000, 'overdue'),
('INV-S-004', 'sales', (SELECT id FROM projects WHERE code = 'P-005'), 'CAPITALAND', '2025-01-10', '2025-02-10', 3545454545, 354545454, 3900000000, 0, 3900000000, 'pending')
ON CONFLICT (invoice_code) DO UPDATE SET outstanding_amount = EXCLUDED.outstanding_amount, status = EXCLUDED.status;

-- Purchase Invoices (Expense) - AP: totaling ~18.92B
INSERT INTO public.invoices (invoice_code, invoice_type, project_id, vendor_name, invoice_date, due_date, amount, tax_amount, total_amount, paid_amount, outstanding_amount, status)
VALUES 
('INV-P-001', 'purchase', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 'Hòa Phát Steel', '2024-12-20', '2025-01-20', 6000000000, 600000000, 6600000000, 1000000000, 5600000000, 'pending'),
('INV-P-002', 'purchase', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 'Bê tông An Việt', '2025-01-02', '2025-02-02', 4500000000, 450000000, 4950000000, 500000000, 4450000000, 'pending'),
('INV-P-003', 'purchase', (SELECT id FROM projects WHERE code = 'P-002'), 'Xi măng Hoàng Thạch', '2024-11-15', '2024-12-15', 3000000000, 300000000, 3300000000, 0, 3300000000, 'overdue'),
('INV-P-004', 'purchase', (SELECT id FROM projects WHERE code = 'P-GAMUDA-ZEN'), 'NTP Cảnh quan Xanh', '2025-01-12', '2025-02-12', 5063636363, 506363636, 5570000000, 0, 5570000000, 'pending')
ON CONFLICT (invoice_code) DO UPDATE SET outstanding_amount = EXCLUDED.outstanding_amount, status = EXCLUDED.status;

-- 2. Seed Payments (Giao dịch)
INSERT INTO public.payments (payment_code, payment_type, project_id, payment_date, amount, payment_method, partner_name, status, description)
VALUES 
('PAY-R-001', 'receipt', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), '2025-01-10', 5000000000, 'bank_transfer', 'Công ty CP Lux Decor Việt Nam', 'completed', 'Thu hồi công nợ hóa đơn INV-S-001'),
('PAY-D-001', 'disbursement', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), '2025-01-12', 1000000000, 'bank_transfer', 'Hòa Phát Steel', 'completed', 'Thanh toán đợt 1 hóa đơn INV-P-001'),
('PAY-D-002', 'disbursement', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), '2025-01-14', 500000000, 'cash', 'Bê tông An Việt', 'completed', 'Thanh toán tạm ứng hóa đơn INV-P-002'),
('PAY-R-002', 'receipt', (SELECT id FROM projects WHERE code = 'P-001'), '2024-12-25', 1000000000, 'bank_transfer', 'Tây Hồ Tây Group', 'completed', 'Thu hồi công nợ hóa đơn INV-S-003')
ON CONFLICT (payment_code) DO NOTHING;

-- 3. Seed Cash Flow Records (Synchronize with summary)
INSERT INTO public.cash_flow_records (record_date, flow_type, amount, description, project_id)
VALUES 
('2025-01-10', 'inflow', 5000000000, 'Thu tiền từ dự án Greenshade', (SELECT id FROM projects WHERE code = 'P-GREENSHADE')),
('2025-01-12', 'outflow', 1000000000, 'Trả tiền nhà cung cấp Hòa Phát', (SELECT id FROM projects WHERE code = 'P-GREENSHADE')),
('2025-01-14', 'outflow', 500000000, 'Trả tiền bê tông An Việt', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'));

-- 4. Seed more Payment Requests for the main list
INSERT INTO public.payment_requests (request_code, project_id, partner_name, request_date, amount, status, work_description, progress_percentage)
VALUES 
('PR-GS-003', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 'NTP Kính Hải Long', '2025-01-15', 750000000, 'submitted', 'Gia công lắp đặt kính tầng 1', 15),
('PR-GS-004', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 'Đội nề Nguyễn Văn Tám', '2025-01-14', 120000000, 'approved', 'Xây tường ngăn tầng 2', 45),
('PR-BR-001', (SELECT id FROM projects WHERE code = 'P-BROTHER'), 'NTP Sơn Jotun', '2025-01-10', 500000000, 'paid', 'Sơn hoàn thiện mặt ngoài', 100),
('PR-TCI-001', (SELECT id FROM projects WHERE code = 'P-TCI-PRECISION'), 'Thiết bị Delta', '2025-01-05', 300000000, 'rejected', 'Lắp máy nén khí (Sai quy cách)', 0)
ON CONFLICT (request_code) DO NOTHING;
