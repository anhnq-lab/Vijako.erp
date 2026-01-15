-- Bulk Seed Project Data: Contracts, Payment Requests, and Daily Logs

-- 1. SEED CONTRACTS (Revenue & Subcontractors)
-- Using a loop or manual entries for each project to ensure correctness

-- Project: Nhà máy rèm Greenshade (P-GREENSHADE)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('GS-REV-01', 'revenue', 'Lux Decor Việt Nam', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 45000000000, 'active', '2024-12-01', '2025-01-01', '2025-08-30'),
('GS-SUB-CIV', 'expense', 'NTP Xây dựng Bình Minh', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 15000000000, 'active', '2024-12-15', '2025-01-05', '2025-05-30'),
('GS-SUB-MEP', 'expense', 'Cơ điện Toàn Cầu', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 12000000000, 'active', '2025-01-05', '2025-02-01', '2025-07-30'),
('GS-SUB-FIN', 'expense', 'Nội thất Âu Lạc', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), 8000000000, 'draft', '2025-02-15', '2025-03-01', '2025-08-15')
ON CONFLICT (contract_code) DO NOTHING;

-- Project: Nhà máy Brother (P-BROTHER)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('BR-REV-01', 'revenue', 'Brother Industries VN', (SELECT id FROM projects WHERE code = 'P-BROTHER'), 120000000000, 'completed', '2020-02-01', '2020-03-01', '2020-11-30'),
('BR-SUB-01', 'expense', 'Xây lắp 105', (SELECT id FROM projects WHERE code = 'P-BROTHER'), 45000000000, 'completed', '2020-02-15', '2020-03-05', '2020-10-30')
ON CONFLICT (contract_code) DO NOTHING;

-- Project: Nhà máy TCI Precision (P-TCI-PRECISION)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('TCI-REV-01', 'revenue', 'TCI Precision Manufacturing', (SELECT id FROM projects WHERE code = 'P-TCI-PRECISION'), 35000000000, 'completed', '2021-01-10', '2021-02-01', '2021-12-30'),
('TCI-SUB-01', 'expense', 'Thế giới Xây dựng', (SELECT id FROM projects WHERE code = 'P-TCI-PRECISION'), 12000000000, 'completed', '2021-01-25', '2021-02-15', '2021-11-15')
ON CONFLICT (contract_code) DO NOTHING;

-- Project: Khách sạn Hà Nội Dream Residence (P-DREAM-RESIDENCE)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('DR-REV-01', 'revenue', 'Dream Group', (SELECT id FROM projects WHERE code = 'P-DREAM-RESIDENCE'), 150000000000, 'completed', '2022-05-15', '2022-06-01', '2023-12-30'),
('DR-SUB-01', 'expense', 'HVC Group (Bể bơi & Cơ điện)', (SELECT id FROM projects WHERE code = 'P-DREAM-RESIDENCE'), 25000000000, 'completed', '2022-07-01', '2022-07-15', '2023-10-15')
ON CONFLICT (contract_code) DO NOTHING;

-- Project: The Zen – Gamuda Garden (P-GAMUDA-ZEN)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('GZ-REV-01', 'revenue', 'Gamuda Land VN', (SELECT id FROM projects WHERE code = 'P-GAMUDA-ZEN'), 80000000000, 'completed', '2019-01-10', '2019-02-01', '2019-12-30')
ON CONFLICT (contract_code) DO NOTHING;

-- Project: Trường Tiểu học Tiên Sơn (P-005)
INSERT INTO public.contracts (contract_code, contract_type, partner_name, project_id, contract_value, status, signing_date, start_date, end_date)
VALUES 
('TS-REV-01', 'revenue', 'UBND Huyện Tiên Sơn', (SELECT id FROM projects WHERE code = 'P-005'), 15800000000, 'completed', '2024-02-15', '2024-03-01', '2024-09-30'),
('TS-SUB-01', 'expense', 'NTP Cây xanh & Hoàn thiện', (SELECT id FROM projects WHERE code = 'P-005'), 2500000000, 'completed', '2024-04-01', '2024-04-15', '2024-09-15')
ON CONFLICT (contract_code) DO NOTHING;


-- 2. SEED PAYMENT REQUESTS
-- Greenshade - active requests
INSERT INTO public.payment_requests (request_code, project_id, contract_id, partner_name, request_date, amount, status, work_description, progress_percentage)
VALUES 
('GS-PR-001', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), (SELECT id FROM contracts WHERE contract_code = 'GS-SUB-CIV'), 'NTP Xây dựng Bình Minh', '2025-01-20', 1500000000, 'paid', 'Thanh toán đợt 1 - Thi công móng', 20),
('GS-PR-002', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), (SELECT id FROM contracts WHERE contract_code = 'GS-SUB-CIV'), 'NTP Xây dựng Bình Minh', '2025-02-10', 2500000000, 'approved', 'Thanh toán đợt 2 - Cốt thép cột tầng 1', 35),
('GS-PR-003', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), (SELECT id FROM contracts WHERE contract_code = 'GS-SUB-MEP'), 'Cơ điện Toàn Cầu', '2025-02-15', 500000000, 'reviewing', 'Tạm ứng vật tư MEP đợt 1', 10),
('GS-PR-010', (SELECT id FROM projects WHERE code = 'P-GREENSHADE'), (SELECT id FROM contracts WHERE contract_code = 'GS-REV-01'), 'Lux Decor Việt Nam', '2025-02-05', 8000000000, 'paid', 'Hồ sơ thanh toán giai đoạn 1', 20)
ON CONFLICT (request_code) DO NOTHING;


-- 3. SEED DAILY LOGS (Construction Diary)
-- Seeding 5 logs per project for the last few days

DO $$
DECLARE
    p_id UUID;
    p_code TEXT;
    i INTEGER;
    log_date DATE;
BEGIN
    FOR p_code IN SELECT code FROM projects LOOP
        SELECT id INTO p_id FROM projects WHERE code = p_code;
        
        FOR i IN 0..4 LOOP
            log_date := CURRENT_DATE - i;
            INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, status, manpower_details, equipment_details)
            VALUES (
                p_id, 
                log_date, 
                '{"temp": 28, "condition": "Cloudy", "humidity": 65}'::jsonb,
                25 + (i * 5),
                'Thi công các hạng mục theo kế hoạch tuần. Bao gồm công tác cốp pha, cốt thép và đổ bê tông.',
                CASE WHEN i = 2 THEN 'Thiếu vật tư cục bộ tại khu vực trục A-B' ELSE 'Không có vấn đề nghiêm trọng' END,
                'Approved',
                '[{"role": "Cán bộ kỹ thuật", "count": 3, "company": "VIJAKO"}, {"role": "Công nhân nề", "count": 15, "company": "Thầu phụ A"}, {"role": "Công nhân sắt", "count": 10, "company": "Thầu phụ B"}]'::jsonb,
                '[{"name": "Máy xúc", "count": 1, "status": "Working"}, {"name": "Cần trục tháp", "count": 1, "status": "Working"}]'::jsonb
            );
        END LOOP;
    END LOOP;
END $$;
