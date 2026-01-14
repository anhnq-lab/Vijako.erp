-- Workspace specific tables
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    sub TEXT,
    time TEXT,
    status TEXT CHECK (status IN ('done', 'active', 'pending')) DEFAULT 'pending',
    type TEXT CHECK (type IN ('meeting', 'site', 'doc')) DEFAULT 'doc',
    file TEXT,
    priority TEXT CHECK (priority IN ('high', 'normal')) DEFAULT 'normal',
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001', -- Hardcoded for demo/simplicity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT,
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001', -- Hardcoded for demo/simplicity
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public all access on user_tasks" ON public.user_tasks FOR ALL USING (true);
CREATE POLICY "Allow public all access on user_notes" ON public.user_notes FOR ALL USING (true);

-- Seed Initial Tasks
INSERT INTO public.user_tasks (title, sub, time, status, type, priority) VALUES
('Giao ban công trường', 'Họp điều phối nhà thầu phụ tại Zone A', '08:00', 'done', 'meeting', 'normal'),
('Nghiệm thu thép sàn tầng 5', 'Kiểm tra khoảng cách đai, móc neo theo TCVN', '09:30', 'active', 'site', 'high'),
('Kiểm tra an toàn giàn giáo', 'Khu vực mặt ngoài trục 1-4 (Giáo Ringlock)', '14:00', 'pending', 'site', 'normal'),
('Ký duyệt hồ sơ thanh toán', 'Tổng hợp khối lượng tuần 3 tháng 10', '16:30', 'pending', 'doc', 'normal');

-- Seed Initial Note
INSERT INTO public.user_notes (content) VALUES ('- Gọi lại cho anh Bình bên Bê tông Việt Úc trước 3h chiều.\n- Kiểm tra lại bản vẽ Shop tầng 5.');
