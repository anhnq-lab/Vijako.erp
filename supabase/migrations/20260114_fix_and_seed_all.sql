-- 1. Create project_documents table (if not exists)
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- e.g., 'pdf', 'docx', 'jpg'
    size INTEGER, -- in bytes
    url TEXT NOT NULL,
    uploaded_by TEXT, -- could be user id or name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS and Policies for project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_documents' AND policyname = 'Allow public read access on project_documents') THEN
        CREATE POLICY "Allow public read access on project_documents" ON public.project_documents FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_documents' AND policyname = 'Allow public insert access on project_documents') THEN
        CREATE POLICY "Allow public insert access on project_documents" ON public.project_documents FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_documents' AND policyname = 'Allow public update access on project_documents') THEN
        CREATE POLICY "Allow public update access on project_documents" ON public.project_documents FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_documents' AND policyname = 'Allow public delete access on project_documents') THEN
        CREATE POLICY "Allow public delete access on project_documents" ON public.project_documents FOR DELETE USING (true);
    END IF;
END $$;

-- 3. Seed Sample Issues and Documents for Projects P-001 and P-005
DO $$
DECLARE
    v_p001_id UUID;
    v_p005_id UUID;
BEGIN
    -- Get Project IDs
    SELECT id INTO v_p001_id FROM public.projects WHERE code = 'P-001' LIMIT 1;
    SELECT id INTO v_p005_id FROM public.projects WHERE code = 'P-005' LIMIT 1;

    -- --- Seed for P-001 (Vijako Tower) ---
    IF v_p001_id IS NOT NULL THEN
        -- Sample Issues
        DELETE FROM public.project_issues WHERE project_id = v_p001_id AND code IN ('NCR-001', 'RFI-001', 'ISSUE-782');
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_p001_id, 'NCR-001', 'NCR', 'Thép dầm sàn tầng 5 sai khoảng cách thiết kế', 'High', 'Open', '2026-01-20', 'Nguyễn Văn Nam'),
        (v_p001_id, 'RFI-001', 'RFI', 'Làm rõ chi tiết mối nối ống nước trục A-4', 'Medium', 'Resolved', '2026-01-15', 'Trần Minh Tuấn'),
        (v_p001_id, 'ISSUE-782', 'General', 'Chưa có bản vẽ điều chỉnh hệ thống PCCC tầng hầm', 'High', 'Open', '2026-01-25', 'Lê Hoàng Anh');

        -- Sample Documents
        DELETE FROM public.project_documents WHERE project_id = v_p001_id AND name IN ('Ban-ve-Ket-cau-Tang-5.pdf', 'Bien-ban-Nghiem-thu-Thep.docx', 'Hinh-anh-Hien-truong-1401.jpg');
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_p001_id, 'Ban-ve-Ket-cau-Tang-5.pdf', 'pdf', 5242880, 'https://example.com/docs/p001/structural_p5.pdf', 'Admin'),
        (v_p001_id, 'Bien-ban-Nghiem-thu-Thep.docx', 'docx', 102400, 'https://example.com/docs/p001/inspection_steel.docx', 'Giám sát'),
        (v_p001_id, 'Hinh-anh-Hien-truong-1401.jpg', 'jpg', 2097152, 'https://images.unsplash.com/photo-1503387762-592dea58ef21?q=80&w=800&auto=format&fit=crop', 'Trần Minh Tuấn');
    END IF;

    -- --- Seed for P-005 (Trường Tiểu học Tiên Sơn) ---
    IF v_p005_id IS NOT NULL THEN
        -- Sample Issues
        DELETE FROM public.project_issues WHERE project_id = v_p005_id AND code IN ('NCR-105', 'RFI-042');
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_p005_id, 'NCR-105', 'NCR', 'Bề mặt bê tông cột trục 2-C bị rỗ dăm', 'Medium', 'Open', '2026-01-18', 'Nguyễn Quốc Anh'),
        (v_p005_id, 'RFI-042', 'RFI', 'Thay đổi chủng loại gạch lát nền khu vệ sinh', 'Low', 'Closed', '2026-01-10', 'Phạm Công Thành');

        -- Sample Documents
        DELETE FROM public.project_documents WHERE project_id = v_p005_id AND name IN ('Quy-et-dinh-Phe-duyet-Du-an.pdf', 'Thong-so-Ky-thuat-Vat-lieu.pdf', 'Anh-Nghiem-thu-Cach-nhiet-Mai.jpg');
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_p005_id, 'Quy-et-dinh-Phe-duyet-Du-an.pdf', 'pdf', 1572864, 'https://example.com/docs/p005/approval_decision.pdf', 'Admin'),
        (v_p005_id, 'Thong-so-Ky-thuat-Vat-lieu.pdf', 'pdf', 3145728, 'https://example.com/docs/p005/material_specs.pdf', 'Kỹ thuật'),
        (v_p005_id, 'Anh-Nghiem-thu-Cach-nhiet-Mai.jpg', 'jpg', 4194304, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop', 'Nguyễn Quốc Anh');
    END IF;
END $$;
