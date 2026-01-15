-- Migration to initialize approval system
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- e.g., 'payment', 'contract', 'leave', 'purchase'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requester_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    approver_id UUID, -- Optional: individual approver
    project_id UUID, -- Optional: link to project
    payload JSONB, -- Flexible storage for type-specific data (e.g., amount, dates)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Simple policy for public access (demo environment)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'approval_requests' 
        AND policyname = 'Allow public all access on approval_requests'
    ) THEN
        CREATE POLICY "Allow public all access on approval_requests" 
        ON public.approval_requests FOR ALL USING (true);
    END IF;
END $$;

-- Seed some initial data
INSERT INTO public.approval_requests (title, description, type, priority, status) VALUES
('Thanh toán đợt 3 - Gói thầu Cơ điện', 'Đề xuất thanh toán khối lượng hoàn thành cho nhà thầu Sigma', 'payment', 'high', 'pending'),
('Trình duyệt hợp đồng mua thép', 'Hợp đồng cung cấp thép Hòa Phát cho dự án Vijako Tower', 'contract', 'normal', 'approved'),
('Đề xuất mua sắm máy toàn đạc mới', 'Máy cũ đã hỏng không thể sửa chữa', 'purchase', 'normal', 'pending'),
('Xin nghỉ phép - Nguyễn Văn An', 'Nghỉ phép đi du lịch gia đình', 'leave', 'low', 'rejected');
