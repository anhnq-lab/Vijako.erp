-- Phase 2: Schema Updates & Data Seeding
-- Refactored to use plain SQL to avoid PL/pgSQL planning issues with schema changes

-- 1. Update Schema
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS value NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS retention_amount NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'expense';

ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED';

-- 2. Seed Data using SQL and Subqueries

-- A. Owner Contract
DELETE FROM public.contracts WHERE contract_code = 'HĐ-Dream-001/2015';

INSERT INTO public.contracts (
    id, contract_code, name, partner_name, project_id, value, paid_amount, retention_amount, status, type, start_date, end_date
)
SELECT 
    gen_random_uuid(),
    'HĐ-Dream-001/2015',
    'Hợp đồng Tổng thầu thi công xây dựng Khách sạn Dream Residence',
    'CÔNG TY CỔ PHẦN ĐẦU TƯ DREAM RESIDENCE',
    id,
    150000000000, -- 150 billion
    145000000000,
    5000000000,
    'completed',
    'revenue',
    '2015-12-01',
    '2017-02-28'
FROM public.projects 
WHERE code = 'P-DREAM-RESIDENCE';

-- B. Documents
DELETE FROM public.project_documents WHERE project_id = (SELECT id FROM public.projects WHERE code = 'P-DREAM-RESIDENCE');

-- Legal Documents
INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Giấy phép xây dựng số 123/GPXD', 'PDF', 'Pháp lý', 2500000, 'https://example.com/gpxd.pdf', 'PUBLISHED', '2015-11-15'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Quyết định phê duyệt dự án đầu tư', 'PDF', 'Pháp lý', 1800000, 'https://example.com/qd-da.pdf', 'PUBLISHED', '2015-10-20'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Giấy chứng nhận QSD đất', 'PDF', 'Pháp lý', 3200000, 'https://example.com/so-do.pdf', 'PUBLISHED', '2015-09-05'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

-- Design Documents
INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Bản vẽ Kiến trúc - Mặt bằng tổng thể', 'DWG', 'Thiết kế', 15000000, 'https://example.com/kt-mbtt.dwg', 'PUBLISHED', '2015-12-01'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Bản vẽ Kiến trúc - Chi tiết mặt đứng', 'PDF', 'Thiết kế', 8500000, 'https://example.com/kt-md.pdf', 'PUBLISHED', '2015-12-05'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Bản vẽ Kết cấu - Móng cọc', 'DWG', 'Thiết kế', 12000000, 'https://example.com/kc-mong.dwg', 'PUBLISHED', '2015-12-10'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Bản vẽ MEP - Hệ thống điện tầng điển hình', 'PDF', 'Thiết kế', 5600000, 'https://example.com/mep-dien.pdf', 'PUBLISHED', '2016-01-15'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

-- Contract Documents
INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Hợp đồng thi công xây dựng (Scan)', 'PDF', 'Hợp đồng', 4500000, 'https://example.com/hd-scan.pdf', 'PUBLISHED', '2015-12-01'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Phụ lục hợp đồng 01 - Tiến độ', 'PDF', 'Hợp đồng', 1200000, 'https://example.com/pl-01.pdf', 'PUBLISHED', '2015-12-01'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Quyết định thành lập Ban chỉ huy công trường', 'PDF', 'Hành chính', 800000, 'https://example.com/qd-bch.pdf', 'PUBLISHED', '2015-11-25'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at)
SELECT id, 'Sơ đồ tổ chức công trường', 'JPG', 'Hành chính', 1500000, 'https://example.com/org-chart.jpg', 'PUBLISHED', '2015-11-25'
FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

-- 3. ACTIVATE BIM DEMO MODE
UPDATE public.projects 
SET model_url = 'demo-highrise' 
WHERE code = 'P-DREAM-RESIDENCE';
