-- Create Cash Flow View
DROP VIEW IF EXISTS view_cash_flow_realtime;
CREATE OR REPLACE VIEW view_cash_flow_realtime AS
SELECT
  EXTRACT(YEAR FROM payment_date) as year,
  EXTRACT(MONTH FROM payment_date) as month_index,
  SUM(CASE WHEN payment_type = 'receipt' THEN amount ELSE 0 END) as inflow,
  SUM(CASE WHEN payment_type = 'disbursement' THEN amount ELSE 0 END) as outflow,
  SUM(CASE WHEN payment_type = 'receipt' THEN amount ELSE -amount END) as net_flow
FROM payments
GROUP BY 1, 2;

-- 1. Create Projects
INSERT INTO projects (code, name, location, manager, progress, status)
VALUES 
  ('SLT-01', 'Skyline Tower', 'Tây Hồ, Hà Nội', 'Nguyễn Văn An', 45, 'active'),
  ('RSV-01', 'Riverside Villa', 'Long Biên, Hà Nội', 'Trần Thị B', 30, 'active')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- 2. Create Contracts
-- Revenue Contracts
INSERT INTO contracts (contract_code, partner_name, project_id, contract_value, paid_amount, retention_amount, status, contract_type)
VALUES 
  ('HD-2024/SLT-01', 'Skyline Invest Group', (SELECT id FROM projects WHERE code = 'SLT-01'), 15000000000, 5800000000, 0, 'active', 'revenue'),
  ('HD-2024/RSV-05', 'Riverside Development', (SELECT id FROM projects WHERE code = 'RSV-01'), 8000000000, 0, 0, 'active', 'revenue')
ON CONFLICT (contract_code) DO NOTHING;

-- Expense Contracts
INSERT INTO contracts (contract_code, partner_name, project_id, contract_value, paid_amount, retention_amount, status, contract_type)
VALUES 
  ('HD-TP/HP-01', 'Thép Hòa Phát', (SELECT id FROM projects WHERE code = 'SLT-01'), 2000000000, 850000000, 100000000, 'active', 'expense'),
  ('HD-XM/HT-02', 'Xi măng Hà Tiên', (SELECT id FROM projects WHERE code = 'RSV-01'), 1200000000, 200000000, 60000000, 'active', 'expense'),
  ('HD-NC/VJK-01', 'Nhân công An Phát', (SELECT id FROM projects WHERE code = 'SLT-01'), 500000000, 0, 0, 'active', 'expense')
ON CONFLICT (contract_code) DO NOTHING;

-- 3. Create Invoices
INSERT INTO invoices (invoice_code, invoice_type, project_id, contract_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
VALUES
  ('INV-2024-001', 'sales', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-2024/SLT-01'), 'Skyline Invest Group', '2024-10-15', '2024-11-15', 5200000000, 5200000000, 2000000000, 3200000000, 'pending'),
  ('INV-2024-002', 'sales', (SELECT id FROM projects WHERE code = 'RSV-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-2024/RSV-05'), 'Riverside Development', '2024-10-20', '2024-11-20', 1500000000, 1500000000, 0, 1500000000, 'pending'),
  ('INV-2024-003', 'sales', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-2024/SLT-01'), 'Skyline Invest Group', '2024-09-01', '2024-10-01', 3800000000, 3800000000, 3800000000, 0, 'paid'),
  
  ('PUR-2024-105', 'purchase', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-TP/HP-01'), 'Thép Hòa Phát', '2024-10-10', '2024-11-10', 850000000, 850000000, 0, 850000000, 'pending'),
  ('PUR-2024-106', 'purchase', (SELECT id FROM projects WHERE code = 'RSV-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-XM/HT-02'), 'Xi măng Hà Tiên', '2024-10-12', '2024-11-12', 420000000, 420000000, 200000000, 220000000, 'pending'),
  ('PUR-2024-099', 'purchase', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-NC/VJK-01'), 'Nhân công An Phát', '2024-09-25', '2024-10-25', 150000000, 150000000, 0, 150000000, 'overdue')
ON CONFLICT (invoice_code) DO NOTHING;

-- 4. Create Payments
INSERT INTO payments (payment_code, payment_type, project_id, contract_id, partner_name, payment_date, amount, payment_method, status, description)
VALUES
  ('PAY-IN-001', 'receipt', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-2024/SLT-01'), 'Skyline Invest Group', '2024-10-18', 2000000000, 'bank_transfer', 'completed', 'Thanh toán đợt 1 HĐ HD-2024/SLT-01'),
  ('PAY-IN-002', 'receipt', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-2024/SLT-01'), 'Skyline Invest Group', '2024-09-05', 3800000000, 'bank_transfer', 'completed', 'Tạm ứng hợp đồng'),
  
  ('PAY-OUT-001', 'disbursement', (SELECT id FROM projects WHERE code = 'RSV-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-XM/HT-02'), 'Xi măng Hà Tiên', '2024-10-20', 200000000, 'bank_transfer', 'completed', 'Thanh toán tiền xi măng đợt 1'),
  ('PAY-OUT-002', 'disbursement', (SELECT id FROM projects WHERE code = 'SLT-01'), (SELECT id FROM contracts WHERE contract_code = 'HD-TP/HP-01'), 'Thép Hòa Phát', '2024-10-22', 50000000, 'cash', 'pending', 'Thanh toán vật tư phụ')
ON CONFLICT (payment_code) DO NOTHING;
