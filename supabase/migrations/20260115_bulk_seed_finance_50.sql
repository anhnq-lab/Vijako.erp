-- Bulk Seed 50 Finance Records (Invoices & Payments)
-- Created: 2026-01-15 09:52
-- Fix: Added missing 'amount' column to satisfy NOT NULL constraint

DO $$ 
DECLARE
    gs_id UUID := (SELECT id FROM projects WHERE code = 'P-GREENSHADE' LIMIT 1);
    br_id UUID := (SELECT id FROM projects WHERE code = 'P-BROTHER' LIMIT 1);
    tci_id UUID := (SELECT id FROM projects WHERE code = 'P-TCI-PRECISION' LIMIT 1);
    dr_id UUID := (SELECT id FROM projects WHERE code = 'P-DREAM-RESIDENCE' LIMIT 1);
    gz_id UUID := (SELECT id FROM projects WHERE code = 'P-GAMUDA-ZEN' LIMIT 1);
    ts_id UUID := (SELECT id FROM projects WHERE code = 'P-005' LIMIT 1);
BEGIN

    -- 25 INVOICES (Sales & Purchase)
    -- total_amount = amount + tax_amount (setting tax_amount to 0 for simplicity, so amount = total_amount)
    INSERT INTO invoices (invoice_code, invoice_type, project_id, vendor_name, invoice_date, due_date, amount, total_amount, paid_amount, outstanding_amount, status)
    VALUES
    -- Sales Invoices (AR)
    ('INV-AR-001', 'sales', gs_id, 'Lux Decor Việt Nam', '2024-12-01', '2025-01-01', 5000000000, 5000000000, 5000000000, 0, 'paid'),
    ('INV-AR-002', 'sales', br_id, 'Brother Industries', '2024-12-05', '2025-01-05', 12000000000, 12000000000, 0, 12000000000, 'pending'),
    ('INV-AR-003', 'sales', tci_id, 'TCI Precision', '2024-12-10', '2025-01-10', 8500000000, 8500000000, 4000000000, 4500000000, 'pending'),
    ('INV-AR-004', 'sales', dr_id, 'Dream Group', '2024-11-20', '2024-12-20', 3200000000, 3200000000, 3200000000, 0, 'paid'),
    ('INV-AR-005', 'sales', gz_id, 'Gamuda Land', '2024-12-15', '2025-01-15', 15000000000, 15000000000, 0, 15000000000, 'pending'),
    ('INV-AR-006', 'sales', ts_id, 'UBND Tiên Sơn', '2024-10-30', '2024-11-30', 4500000000, 4500000000, 4500000000, 0, 'paid'),
    ('INV-AR-007', 'sales', gs_id, 'Lux Decor Việt Nam', '2024-11-01', '2024-12-01', 2500000000, 2500000000, 2500000000, 0, 'paid'),
    ('INV-AR-008', 'sales', br_id, 'Brother Industries', '2024-10-15', '2024-11-15', 7800000000, 7800000000, 7800000000, 0, 'paid'),
    ('INV-AR-009', 'sales', tci_id, 'TCI Precision', '2024-09-20', '2024-10-20', 1200000000, 1200000000, 1200000000, 0, 'paid'),
    ('INV-AR-010', 'sales', dr_id, 'Dream Group', '2024-08-25', '2024-09-25', 9800000000, 9800000000, 9800000000, 0, 'paid'),
    ('INV-AR-011', 'sales', gs_id, 'Lux Decor Việt Nam', '2025-01-05', '2025-02-05', 6200000000, 6200000000, 0, 6200000000, 'pending'),
    ('INV-AR-012', 'sales', gz_id, 'Gamuda Land', '2025-01-08', '2025-02-08', 4300000000, 4300000000, 0, 4300000000, 'pending'),
    
    -- Purchase Invoices (AP)
    ('INV-AP-001', 'purchase', gs_id, 'Thép Hòa Phát', '2024-12-20', '2025-01-20', 1200000000, 1200000000, 0, 1200000000, 'pending'),
    ('INV-AP-002', 'purchase', br_id, 'Bê tông An Việt', '2024-12-18', '2025-01-18', 850000000, 850000000, 0, 85000000, 'pending'),
    ('INV-AP-003', 'purchase', tci_id, 'Điện lực Hà Nội', '2024-12-25', '2025-01-25', 120000000, 120000000, 120000000, 0, 'paid'),
    ('INV-AP-004', 'purchase', dr_id, 'Cấp nước sạch', '2024-12-26', '2025-01-26', 45000000, 45000000, 45000000, 0, 'paid'),
    ('INV-AP-005', 'purchase', gz_id, 'NTP Cơ điện Toàn Cầu', '2024-12-05', '2025-01-05', 3500000000, 3500000000, 1000000000, 2500000000, 'pending'),
    ('INV-AP-006', 'purchase', ts_id, 'Vật tư Thái Bình', '2024-12-10', '2025-01-10', 670000000, 670000000, 0, 670000000, 'pending'),
    ('INV-AP-007', 'purchase', gs_id, 'Thanh nhôm Định hình', '2024-11-15', '2024-12-15', 1800000000, 1800000000, 1800000000, 0, 'paid'),
    ('INV-AP-008', 'purchase', br_id, 'Xi măng Hoàng Thạch', '2024-11-20', '2024-12-20', 2100000000, 2100000000, 2100000000, 0, 'paid'),
    ('INV-AP-009', 'purchase', tci_id, 'Đá ốp lát cao cấp', '2024-11-25', '2024-12-25', 950000000, 950000000, 950000000, 0, 'paid'),
    ('INV-AP-010', 'purchase', dr_id, 'Kính cường lực ABC', '2024-11-28', '2024-12-28', 1150000000, 1150000000, 1150000000, 0, 'paid'),
    ('INV-AP-011', 'purchase', gs_id, 'Vận tải Hùng Vương', '2025-01-10', '2025-02-10', 280000000, 280000000, 0, 280000000, 'pending'),
    ('INV-AP-012', 'purchase', gz_id, 'Sơn Dulux Việt Nam', '2025-01-12', '2025-02-12', 420000000, 420000000, 0, 420000000, 'pending'),
    ('INV-AP-013', 'purchase', ts_id, 'Thiết bị vệ sinh Inax', '2025-01-14', '2025-02-14', 890000000, 890000000, 0, 890000000, 'pending')
    ON CONFLICT (invoice_code) DO NOTHING;

    -- 25 PAYMENTS (Receipt & Disbursement)
    INSERT INTO payments (payment_code, payment_type, project_id, payment_date, amount, payment_method, partner_name, status, description)
    VALUES
    -- Receipts (Inflow)
    ('PAY-IN-001', 'receipt', gs_id, '2024-12-05', 5000000000, 'bank_transfer', 'Lux Decor Việt Nam', 'completed', 'Thanh toán hóa đơn INV-AR-001'),
    ('PAY-IN-002', 'receipt', dr_id, '2024-12-22', 3200000000, 'bank_transfer', 'Dream Group', 'completed', 'Thanh toán hóa đơn INV-AR-004'),
    ('PAY-IN-003', 'receipt', ts_id, '2024-11-15', 4500000000, 'bank_transfer', 'UBND Tiên Sơn', 'completed', 'Thanh toán đợt cuối dự án Tiên Sơn'),
    ('PAY-IN-004', 'receipt', tci_id, '2024-12-15', 4000000000, 'bank_transfer', 'TCI Precision', 'completed', 'Tạm ứng đợt 1 INV-AR-003'),
    ('PAY-IN-005', 'receipt', br_id, '2024-11-20', 7800000000, 'bank_transfer', 'Brother Industries', 'completed', 'Thanh toán INV-AR-008'),
    ('PAY-IN-006', 'receipt', gs_id, '2024-12-10', 2500000000, 'bank_transfer', 'Lux Decor Việt Nam', 'completed', 'Thanh toán INV-AR-007'),
    ('PAY-IN-007', 'receipt', gz_id, '2025-01-05', 5000000000, 'bank_transfer', 'Gamuda Land', 'completed', 'Tạm ứng thi công đợt 1 - Cọc móng'),
    ('PAY-IN-008', 'receipt', tci_id, '2025-01-10', 2000000000, 'bank_transfer', 'TCI Precision', 'completed', 'Thanh toán bổ sung'),
    ('PAY-IN-009', 'receipt', dr_id, '2024-10-01', 9800000000, 'bank_transfer', 'Dream Group', 'completed', 'Thanh toán INV-AR-010'),
    ('PAY-IN-010', 'receipt', gs_id, '2024-12-28', 1500000000, 'cash', 'Khách hàng lẻ', 'completed', 'Thu tiền hoàn trả vật tư thừa'),
    ('PAY-IN-011', 'receipt', br_id, '2024-09-15', 12000000000, 'bank_transfer', 'Brother Industries', 'completed', 'Thanh toán đợt 2 - Phần thô'),
    ('PAY-IN-012', 'receipt', gz_id, '2025-01-15', 3000000000, 'bank_transfer', 'Gamuda Land', 'completed', 'Thanh toán tiến độ tháng 01'),

    -- Disbursements (Outflow)
    ('PAY-OUT-001', 'disbursement', gs_id, '2024-12-25', 120000000, 'bank_transfer', 'Điện lực Hà Nội', 'completed', 'Thanh toán hóa đơn điện tháng 12'),
    ('PAY-OUT-002', 'disbursement', dr_id, '2024-12-28', 45000000, 'cash', 'Cấp nước sạch', 'completed', 'Thanh toán tiền nước công trình'),
    ('PAY-OUT-003', 'disbursement', gz_id, '2024-12-15', 1000000000, 'bank_transfer', 'NTP Cơ điện Toàn Cầu', 'completed', 'Tạm ứng vật tư MEP đợt 1'),
    ('PAY-OUT-004', 'disbursement', gs_id, '2024-12-10', 1800000000, 'bank_transfer', 'Thanh nhôm Định hình', 'completed', 'Thanh toán INV-AP-007'),
    ('PAY-OUT-005', 'disbursement', br_id, '2024-12-22', 2100000000, 'bank_transfer', 'Xi măng Hoàng Thạch', 'completed', 'Quyết toán vật tư phần móng'),
    ('PAY-OUT-006', 'disbursement', tci_id, '2024-12-26', 950000000, 'bank_transfer', 'Đá ốp lát cao cấp', 'completed', 'Thanh toán INV-AP-009'),
    ('PAY-OUT-007', 'disbursement', dr_id, '2025-01-05', 1150000000, 'bank_transfer', 'Kính cường lực ABC', 'completed', 'Thanh toán INV-AP-010'),
    ('PAY-OUT-008', 'disbursement', gs_id, '2025-01-12', 500000000, 'bank_transfer', 'Hòa Phát', 'completed', 'Đặt cọc thép đợt 2'),
    ('PAY-OUT-009', 'disbursement', gz_id, '2025-01-15', 1500000000, 'bank_transfer', 'Nhân công xây dựng', 'completed', 'Thành toán lương công nhân tháng 01'),
    ('PAY-OUT-010', 'disbursement', ts_id, '2024-11-20', 350000000, 'cash', 'Vật tư Thái Bình', 'completed', 'Thanh toán vật tư phụ'),
    ('PAY-OUT-011', 'disbursement', br_id, '2024-10-10', 250000000, 'cash', 'Chi phí lán trại', 'completed', 'Bán giao chi phí vận hành ban quản lý'),
    ('PAY-OUT-012', 'disbursement', gs_id, '2024-09-05', 1200000000, 'bank_transfer', 'Thép Việt Úc', 'completed', 'Thanh toán hóa đơn tháng 8'),
    ('PAY-OUT-013', 'disbursement', tci_id, '2024-08-15', 450000000, 'bank_transfer', 'Vận tải Hùng Cường', 'completed', 'Cước vận chuyển thiết bị')
    ON CONFLICT (payment_code) DO NOTHING;

END $$;
