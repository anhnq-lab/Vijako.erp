-- Add members column if not exists
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS members TEXT[] DEFAULT '{}';

-- Update Managers and Members for projects
UPDATE public.projects SET 
    manager = 'Nguyễn Quốc Anh (BCH Vijako)',
    members = ARRAY['Nguyễn Quốc Anh', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Vũ Minh Tuấn']
WHERE code = 'P-GREENSHADE';

UPDATE public.projects SET 
    manager = 'Đỗ Văn Toàn',
    members = ARRAY['Đỗ Văn Toàn', 'Hoàng Văn Thái', 'Võ Nguyên Giáp']
WHERE code = 'P-BROTHER';

UPDATE public.projects SET 
    manager = 'Lý Công Uẩn',
    members = ARRAY['Lý Công Uẩn', 'Lê Thái Tổ', 'Trần Nhân Tông']
WHERE code = 'P-TCI-PRECISION';

UPDATE public.projects SET 
    manager = 'Hồ Xuân Hương',
    members = ARRAY['Hồ Xuân Hương', 'Đoàn Thị Điểm', 'Bà Huyện Thanh Quan']
WHERE code = 'P-DREAM-RESIDENCE';

UPDATE public.projects SET 
    manager = 'Phạm Tuân',
    members = ARRAY['Phạm Tuân', 'Hồ Thanh Hải', 'Bùi Thanh Liêm']
WHERE code = 'P-GAMUDA-ZEN';

UPDATE public.projects SET 
    manager = 'Ban chỉ huy Vijako',
    members = ARRAY['Nguyễn Quốc Anh', 'Trần Phú', 'Hồ Tùng Mậu']
WHERE code = 'P-005';

-- Seed Contracts
-- Project Greenshade
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, status, signing_date, start_date, end_date)
SELECT 
    'HD-GS-001', 'revenue', 'Công ty Cổ phần Lux Decor Việt Nam', id, 45000000000, 9000000000, 2250000000, 'active', '2024-12-15', '2025-01-01', '2025-06-30'
FROM public.projects WHERE code = 'P-GREENSHADE'
ON CONFLICT (contract_code) DO NOTHING;

INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status, signing_date)
SELECT 
    'HD-GS-SUB-01', 'expense', 'NTP Cơ điện Toàn Cầu', id, 10000000000, 2000000000, 'active', '2025-01-05'
FROM public.projects WHERE code = 'P-GREENSHADE'
ON CONFLICT (contract_code) DO NOTHING;

-- Project Brother
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, retention_amount, status, start_date, end_date)
SELECT 
    'HD-BR-001', 'revenue', 'Công ty TNHH Brother Industries Việt Nam', id, 120000000000, 115000000000, 5000000000, 'completed', '2020-03-01', '2020-11-30'
FROM public.projects WHERE code = 'P-BROTHER'
ON CONFLICT (contract_code) DO NOTHING;

-- Project Tiên Sơn
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, paid_amount, status, start_date, end_date)
SELECT 
    'HD-TS-001', 'revenue', 'CAPITALAND', id, 15000000000, 15000000000, 'completed', '2024-03-01', '2024-08-30'
FROM public.projects WHERE code = 'P-005'
ON CONFLICT (contract_code) DO NOTHING;

-- Seed Payment Requests
-- Project Greenshade requests
INSERT INTO public.payment_requests (request_code, project_id, contract_id, partner_name, request_date, amount, status, work_description, progress_percentage)
SELECT 
    'PR-GS-001', p.id, c.id, 'NTP Cơ điện Toàn Cầu', '2025-02-15', 500000000, 'approved', 'Thanh toán đợt 1 - Tạm ứng vật tư', 20
FROM public.projects p JOIN public.contracts c ON p.id = c.project_id
WHERE p.code = 'P-GREENSHADE' AND c.contract_code = 'HD-GS-SUB-01'
ON CONFLICT (request_code) DO NOTHING;

INSERT INTO public.payment_requests (request_code, project_id, contract_id, partner_name, request_date, amount, status, work_description, progress_percentage)
SELECT 
    'PR-GS-002', p.id, c.id, 'NTP Cơ điện Toàn Cầu', '2025-03-10', 800000000, 'reviewing', 'Thanh toán đợt 2 - Thi công máng cáp tầng 1', 35
FROM public.projects p JOIN public.contracts c ON p.id = c.project_id
WHERE p.code = 'P-GREENSHADE' AND c.contract_code = 'HD-GS-SUB-01'
ON CONFLICT (request_code) DO NOTHING;

-- Project Tiên Sơn requests
INSERT INTO public.payment_requests (request_code, project_id, contract_id, partner_name, request_date, amount, status, work_description, progress_percentage)
SELECT 
    'PR-TS-FINAL', p.id, c.id, 'VIJAKO', '2024-09-15', 3000000000, 'paid', 'Quyết toán công trình Trường tiểu học Tiên Sơn', 100
FROM public.projects p JOIN public.contracts c ON p.id = c.project_id
WHERE p.code = 'P-005' AND c.contract_code = 'HD-TS-001'
ON CONFLICT (request_code) DO NOTHING;
