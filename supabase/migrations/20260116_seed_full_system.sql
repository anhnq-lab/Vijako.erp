-- Seed Data for Full System (HRM, Projects, Finance)

-- 1. Employees (HRM)
INSERT INTO employees (employee_code, full_name, role, department, site, status, phone, email, date_joined, salary) VALUES
('EMP001', 'Nguyễn Văn Hùng', 'Project Manager', 'Project Dept', 'Vijako Tower', 'active', '0912345678', 'hung.nv@vijako.com.vn', '2020-01-15', 35000000),
('EMP002', 'Lê Thị Mai', 'Accountant', 'Finance Dept', 'Head Office', 'active', '0987654321', 'mai.lt@vijako.com.vn', '2021-03-10', 18000000),
('EMP003', 'Trần Văn Nam', 'Site Engineer', 'Project Dept', 'Vijako Tower', 'active', '0909123456', 'nam.tv@vijako.com.vn', '2022-05-20', 15000000),
('EMP004', 'Lê Văn Ba', 'Site Supervisor', 'Project Dept', 'Vijako Tower', 'active', '0918273645', 'ba.lv@vijako.com.vn', '2019-11-01', 20000000),
('EMP005', 'Phạm Thị Lan', 'HR Specialist', 'HR Dept', 'Head Office', 'active', '0933445566', 'lan.pt@vijako.com.vn', '2023-08-01', 12000000),
('EMP006', 'Dương Văn Tùng', 'Worker', 'Construction Team', 'Vijako Tower', 'leave', '0944556677', NULL, '2024-01-10', 8000000)
ON CONFLICT (employee_code) DO NOTHING;

-- 2. Projects (If not exists)
INSERT INTO projects (code, name, location, manager, status, start_date, end_date, progress, plan_progress, budget, owner, type, area, description) VALUES
('PRJ001', 'Vijako Tower', '123 Phạm Hùng, Hà Nội', 'Nguyễn Văn Hùng', 'active', '2024-01-01', '2025-12-31', 35, 40, 500000000000, 'Tập đoàn Vijako', 'Cao ốc văn phòng', '25,000 m2', 'Tòa nhà văn phòng hạng A, 35 tầng nổi, 3 tầng hầm'),
('PRJ002', 'Vinhomes Smart City - Phân khu 2', 'Tây Mỗ, Nam Từ Liêm, Hà Nội', 'Trần Quốc Tuấn', 'active', '2023-06-01', '2025-06-30', 60, 60, 1200000000000, 'VinGroup', 'Khu đô thị', '50,000 m2', 'Thi công thô và hoàn thiện mặt ngoài 5 tòa chung cư')
ON CONFLICT (code) DO NOTHING;

-- Get IDs for relationships
DO $$
DECLARE
    prj_vijako_id UUID;
    partner_vingroup_id UUID;
    partner_hoaphat_id UUID;
    emp_hung_id UUID;
    emp_nam_id UUID;
BEGIN
    SELECT id INTO prj_vijako_id FROM projects WHERE code = 'PRJ001' LIMIT 1;
    SELECT id INTO partner_vingroup_id FROM partners WHERE code = 'CUS001' LIMIT 1;
    SELECT id INTO partner_hoaphat_id FROM partners WHERE code = 'SUP001' LIMIT 1;
    SELECT id INTO emp_hung_id FROM employees WHERE employee_code = 'EMP001' LIMIT 1;
    SELECT id INTO emp_nam_id FROM employees WHERE employee_code = 'EMP003' LIMIT 1;

    -- 3. WBS / Tasks (Schedule) for Vijako Tower
    IF prj_vijako_id IS NOT NULL THEN
        INSERT INTO project_wbs (project_id, wbs_code, name, start_date, end_date, progress, status, level, parent_id, assigned_to) VALUES
        (prj_vijako_id, '1.0', 'Phần ngầm', '2024-01-01', '2024-04-30', 100, 'done', 0, NULL, 'Nguyễn Văn Hùng'),
             (prj_vijako_id, '1.1', 'Đào đất hố móng', '2024-01-01', '2024-02-15', 100, 'done', 1, NULL, 'Trần Văn Nam'),
             (prj_vijako_id, '1.2', 'Thi công cọc khoan nhồi', '2024-02-16', '2024-03-31', 100, 'done', 1, NULL, 'Trần Văn Nam'),
             (prj_vijako_id, '1.3', 'Thi công đài giằng', '2024-04-01', '2024-04-30', 100, 'done', 1, NULL, 'Lê Văn Ba'),
        
        (prj_vijako_id, '2.0', 'Phần thân', '2024-05-01', '2025-06-30', 30, 'active', 0, NULL, 'Nguyễn Văn Hùng'),
             (prj_vijako_id, '2.1', 'Thi công cột dầm sàn Tầng 1-5', '2024-05-01', '2024-07-31', 100, 'done', 1, NULL, 'Trần Văn Nam'),
             (prj_vijako_id, '2.2', 'Thi công cột dầm sàn Tầng 6-15', '2024-08-01', '2024-12-31', 80, 'active', 1, NULL, 'Lê Văn Ba'),
             (prj_vijako_id, '2.3', 'Thi công cột dầm sàn Tầng 16-25', '2025-01-01', '2025-04-30', 0, 'pending', 1, NULL, 'Dự kiến'),
             (prj_vijako_id, '2.4', 'Thi công cột dầm sàn Tầng 26-35', '2025-05-01', '2025-06-30', 0, 'pending', 1, NULL, 'Dự kiến'),
        
        (prj_vijako_id, '3.0', 'Hoàn thiện', '2024-10-01', '2025-12-31', 10, 'active', 0, NULL, 'Nguyễn Văn Hùng'),
             (prj_vijako_id, '3.1', 'Xây trát tường ngăn', '2024-10-01', '2025-06-30', 20, 'active', 1, NULL, 'Lê Văn Ba')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Contracts
    IF prj_vijako_id IS NOT NULL AND partner_vingroup_id IS NOT NULL THEN
        INSERT INTO contracts (contract_code, project_id, partner_name, value, paid_amount, retention_amount, status, contract_type, start_date, end_date) VALUES
        ('HDKT-001/2024', prj_vijako_id, 'Tập đoàn VinGroup', 500000000000, 150000000000, 25000000000, 'active', 'revenue', '2024-01-01', '2025-12-31');
    END IF;

    IF prj_vijako_id IS NOT NULL AND partner_hoaphat_id IS NOT NULL THEN
         INSERT INTO contracts (contract_code, project_id, partner_name, value, paid_amount, retention_amount, status, contract_type, start_date, end_date) VALUES
        ('HDMB-HP-001', prj_vijako_id, 'Thép Hòa Phát', 20000000000, 15000000000, 0, 'active', 'expense', '2024-01-15', '2024-12-31');
    END IF;

    -- 5. Invoices & Payments (Finance)
    -- Insert example invoices
    INSERT INTO invoices (invoice_code, project_name, vendor_name, contract_code, total_amount, issued_date, due_date, status, invoice_type) VALUES
    ('INV-2024-001', 'Vijako Tower', 'Thép Hòa Phát', 'HDMB-HP-001', 5000000000, '2024-02-20', '2024-03-20', 'paid', 'purchase'),
    ('INV-2024-002', 'Vijako Tower', 'Thép Hòa Phát', 'HDMB-HP-001', 3000000000, '2024-04-15', '2024-05-15', 'paid', 'purchase'),
    ('INV-2024-003', 'Vijako Tower', 'Bê tông Lê Phan', NULL, 1200000000, '2024-04-20', '2024-05-20', 'overdue', 'purchase'),
    ('INV-SALES-001', 'Vijako Tower', 'Tập đoàn VinGroup', 'HDKT-001/2024', 25000000000, '2024-03-01', '2024-03-31', 'paid', 'sales')
    ON CONFLICT (invoice_code) DO NOTHING;

    -- Insert example payments
    INSERT INTO payments (payment_code, project_name, partner_name, contract_code, amount, payment_date, payment_method, payment_type, status, description) VALUES
    ('PAY-001', 'Vijako Tower', 'Thép Hòa Phát', 'HDMB-HP-001', 5000000000, '2024-03-15', 'bank_transfer', 'disbursement', 'completed', 'Thanh toán đợt 1 thép'),
    ('PAY-002', 'Vijako Tower', 'Thép Hòa Phát', 'HDMB-HP-001', 3000000000, '2024-05-10', 'bank_transfer', 'disbursement', 'completed', 'Thanh toán đợt 2 thép'),
    ('REC-001', 'Vijako Tower', 'Tập đoàn VinGroup', 'HDKT-001/2024', 25000000000, '2024-03-10', 'bank_transfer', 'receipt', 'completed', 'Tạm ứng hợp đồng đợt 1')
    ON CONFLICT (payment_code) DO NOTHING;

END $$;
