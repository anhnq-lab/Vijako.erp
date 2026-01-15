-- Create user_tasks table
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    sub TEXT,
    time TEXT,
    status TEXT CHECK (status IN ('done', 'active', 'pending')) DEFAULT 'pending',
    type TEXT CHECK (type IN ('meeting', 'site', 'doc')),
    file TEXT,
    priority TEXT CHECK (priority IN ('high', 'normal')) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_notes table
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now for simplicity in this demo environment)
CREATE POLICY "Enable all access for all users" ON public.user_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.user_notes FOR ALL USING (true) WITH CHECK (true);

-- Seed Data for user_tasks
INSERT INTO public.user_tasks (title, sub, time, status, type, file, priority)
VALUES
    ('Giao ban công trường', 'Họp điều phối nhà thầu phụ tại Zone A', '08:00', 'done', 'meeting', NULL, 'normal'),
    ('Nghiệm thu thép sàn tầng 5', 'Kiểm tra khoảng cách đai, móc neo theo TCVN', '09:30', 'active', 'site', 'Ban_ve_san_T5_Rev02.pdf', 'high'),
    ('Kiểm tra an toàn giàn giáo', 'Khu vực mặt ngoài trục 1-4 (Giáo Ringlock)', '14:00', 'pending', 'site', NULL, 'normal'),
    ('Ký duyệt hồ sơ thanh toán', 'Tổng hợp khối lượng tuần 3 tháng 10', '16:30', 'pending', 'doc', NULL, 'normal');

-- Seed Data for user_notes
INSERT INTO public.user_notes (content)
VALUES
    ('- Gọi lại cho anh Bình bên Bê tông Việt Úc trước 3h chiều.' || chr(10) || '- Kiểm tra lại bản vẽ Shop tầng 5.');

-- Seed additional Approval Requests if needed (optional, assuming approval_requests table exists)
-- This helps populate the "Cần phê duyệt" section
INSERT INTO public.approval_requests (type, title, description, status, priority, project_id, created_at)
SELECT 'Vật tư', 'Thép Hòa Phát D20', 'Cung cấp cho Zone B - Sàn tầng 6', 'pending', 'high', id, NOW()
FROM public.projects WHERE code = 'VJK-01'
LIMIT 1;

INSERT INTO public.approval_requests (type, title, description, status, priority, project_id, created_at)
SELECT 'Thanh toán', 'Bê tông Việt Úc', 'Thanh toán đợt 2 - HĐ 22/HĐMB', 'pending', 'normal', id, NOW() - INTERVAL '1 hour'
FROM public.projects WHERE code = 'VJK-01'
LIMIT 1;

INSERT INTO public.approval_requests (type, title, description, status, priority, project_id, created_at)
SELECT 'Thiết bị', 'Thuê cẩu 50 tấn', 'Phục vụ lắp dựng kèo thép trục 1-4', 'pending', 'high', id, NOW() - INTERVAL '2 hours'
FROM public.projects WHERE code = 'VJK-01'
LIMIT 1;
