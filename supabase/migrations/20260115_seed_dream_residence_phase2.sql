-- Phase 2: Schema Updates & Data Seeding
-- 1. Update Schema to support new requirements
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS value NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS retention_amount NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'expense';

ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED';

-- 2. Seed Data
DO $$
DECLARE
    p_id UUID;
    owner_contract_id UUID := gen_random_uuid();
BEGIN
    -- Get Project ID
    SELECT id INTO p_id FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

    IF p_id IS NOT NULL THEN
        
        -- A. SEED OWNER CONTRACT (Revenue)
        -- Delete existing if conflict avoiding duplicates
        DELETE FROM public.contracts WHERE contract_code = 'HĐ-Dream-001/2015';

        INSERT INTO public.contracts (id, contract_code, name, partner_name, project_id, value, paid_amount, retention_amount, status, type, start_date, end_date)
        VALUES (
            owner_contract_id,
            'HĐ-Dream-001/2015',
            'Hợp đồng Tổng thầu thi công xây dựng Khách sạn Dream Residence',
            'CÔNG TY CỔ PHẦN ĐẦU TƯ DREAM RESIDENCE',
            p_id,
            150000000000, -- 150 billion
            145000000000, -- Paid most of it
            5000000000,   -- Retention
            'completed',
            'revenue',
            '2015-12-01',
            '2017-02-28'
        );

        -- B. SEED DOCUMENTS (Classified)
        -- Clear old documents for clean seed
        DELETE FROM public.project_documents WHERE project_id = p_id;

        -- Legal Documents
        INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at) VALUES
        (p_id, 'Giấy phép xây dựng số 123/GPXD', 'PDF', 'Pháp lý', 2500000, 'https://example.com/gpxd.pdf', 'PUBLISHED', '2015-11-15'),
        (p_id, 'Quyết định phê duyệt dự án đầu tư', 'PDF', 'Pháp lý', 1800000, 'https://example.com/qd-da.pdf', 'PUBLISHED', '2015-10-20'),
        (p_id, 'Giấy chứng nhận QSD đất', 'PDF', 'Pháp lý', 3200000, 'https://example.com/so-do.pdf', 'PUBLISHED', '2015-09-05');

        -- Design Documents
        INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at) VALUES
        (p_id, 'Bản vẽ Kiến trúc - Mặt bằng tổng thể', 'DWG', 'Thiết kế', 15000000, 'https://example.com/kt-mbtt.dwg', 'PUBLISHED', '2015-12-01'),
        (p_id, 'Bản vẽ Kiến trúc - Chi tiết mặt đứng', 'PDF', 'Thiết kế', 8500000, 'https://example.com/kt-md.pdf', 'PUBLISHED', '2015-12-05'),
        (p_id, 'Bản vẽ Kết cấu - Móng cọc', 'DWG', 'Thiết kế', 12000000, 'https://example.com/kc-mong.dwg', 'PUBLISHED', '2015-12-10'),
        (p_id, 'Bản vẽ MEP - Hệ thống điện tầng điển hình', 'PDF', 'Thiết kế', 5600000, 'https://example.com/mep-dien.pdf', 'PUBLISHED', '2016-01-15');

        -- Contract & Admin Documents
        INSERT INTO public.project_documents (project_id, name, type, category, size, url, status, created_at) VALUES
        (p_id, 'Hợp đồng thi công xây dựng (Scan)', 'PDF', 'Hợp đồng', 4500000, 'https://example.com/hd-scan.pdf', 'PUBLISHED', '2015-12-01'),
        (p_id, 'Phụ lục hợp đồng 01 - Tiến độ', 'PDF', 'Hợp đồng', 1200000, 'https://example.com/pl-01.pdf', 'PUBLISHED', '2015-12-01'),
        (p_id, 'Quyết định thành lập Ban chỉ huy công trường', 'PDF', 'Hành chính', 800000, 'https://example.com/qd-bch.pdf', 'PUBLISHED', '2015-11-25'),
        (p_id, 'Sơ đồ tổ chức công trường', 'JPG', 'Hành chính', 1500000, 'https://example.com/org-chart.jpg', 'PUBLISHED', '2015-11-25');

        -- C. ACTIVATE BIM DEMO MODE
        UPDATE public.projects 
        SET model_url = 'demo-highrise' 
        WHERE id = p_id;

    END IF;
END $$;
