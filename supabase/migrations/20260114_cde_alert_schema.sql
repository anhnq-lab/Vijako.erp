-- 1. Mở rộng bảng project_documents để hỗ trợ CDE ISO 19650
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS revision VARCHAR(10) DEFAULT 'P01';
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'WIP';
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS discipline VARCHAR(50); -- ARCH, STR, MEP, etc.
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS approver TEXT;
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.project_documents ADD COLUMN IF NOT EXISTS folder_path TEXT DEFAULT '/';

-- 2. Tạo bảng nhật ký hoạt động tài liệu (Audit Log)
CREATE TABLE IF NOT EXISTS public.document_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.project_documents(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'upload', 'download', 'approve', 'share', 'archive', 'delete'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS cho document_activities
ALTER TABLE public.document_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on document_activities" ON public.document_activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on document_activities" ON public.document_activities FOR INSERT WITH CHECK (true);

-- 3. Tạo bảng Trung tâm cảnh báo
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'deadline', 'risk', 'document', 'contract', 'approval', 'safety'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title TEXT NOT NULL,
    description TEXT,
    source_type VARCHAR(50), -- 'project_issues', 'project_documents', 'contracts', 'project_risks'
    source_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS cho alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on alerts" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on alerts" ON public.alerts FOR DELETE USING (true);

-- 4. Seed dữ liệu mẫu cho Cảnh báo (Alerts)
INSERT INTO public.alerts (type, severity, title, description, is_read, due_date) VALUES
('deadline', 'high', 'Nghiệm thu thép sàn tầng 5', 'Hạn chót vào lúc 16:30 chiều nay. Cần chuẩn bị hồ sơ KCS.', false, now() + interval '4 hours'),
('risk', 'critical', 'Nguy cơ chậm tiến độ Zone B', 'Tiến độ đang bị chậm 3 ngày do thiếu nhân công đội nề.', false, now() + interval '1 day'),
('document', 'medium', '5 bản vẽ ARCH đang chờ duyệt', 'Bản vẽ từ tầng 2 đến tầng 5 cần được phê duyệt để phát hành.', false, now() + interval '2 days');

-- 5. Seed dữ liệu mẫu bổ sung cho Project Documents (CDE)
UPDATE public.project_documents SET revision = 'P03', status = 'PUBLISHED', discipline = 'ARCH', approver = 'Trần Văn An' WHERE name = 'VJK-ARCH-L05-101.rvt';
UPDATE public.project_documents SET revision = 'C01', status = 'SHARED', discipline = 'ARCH' WHERE name = 'VJK-ARCH-L05-101.dwg';
UPDATE public.project_documents SET status = 'WIP', discipline = 'QS' WHERE name = 'Bang_tinh_khoi_luong_T5.xlsx';
