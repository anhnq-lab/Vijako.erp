-- Create user_tasks table
DROP TABLE IF EXISTS public.user_tasks CASCADE;
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('high', 'normal', 'low')) DEFAULT 'normal',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Create Policies
-- Allow users to view/edit ONLY their own tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.user_tasks;
CREATE POLICY "Users can view their own tasks" 
    ON public.user_tasks FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.user_tasks;
CREATE POLICY "Users can insert their own tasks" 
    ON public.user_tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.user_tasks;
CREATE POLICY "Users can update their own tasks" 
    ON public.user_tasks FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.user_tasks;
CREATE POLICY "Users can delete their own tasks" 
    ON public.user_tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- For Development ease, if needed (Optional: remove in production)
-- Allow public access for demo purposes if Auth is not strictly used yet
-- CREATE POLICY "Allow public all on user_tasks" ON public.user_tasks FOR ALL USING (true);

-- Seed some sample data
-- INSERT INTO public.user_tasks (user_id, title, description, status, priority, due_date)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'Soạn thảo hợp đồng NTP A', 'Chuẩn bị phụ lục hợp đồng cho nhà thầu phụ thi công điện nước', 'in_progress', 'high', timezone('utc'::text, now() + interval '2 days')),
--     ('00000000-0000-0000-0000-000000000001', 'Họp giao ban tuần', 'Chuẩn bị tài liệu báo cáo tiến độ tuần 42', 'todo', 'normal', timezone('utc'::text, now() + interval '1 days')),
--     ('00000000-0000-0000-0000-000000000001', 'Kiểm tra vật tư đầu vào', 'Nghiệm thu lô thép Hòa Phát mới về', 'done', 'high', timezone('utc'::text, now() - interval '1 days'));
