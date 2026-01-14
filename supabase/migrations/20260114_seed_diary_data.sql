-- 1. SCHMEA: Create daily_logs table if not exists
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather JSONB,
    manpower_total INTEGER DEFAULT 0,
    work_content TEXT,
    issues TEXT,
    images TEXT[],
    progress_update JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (if they don't exist - simplistic check by dropping common ones first or just ignoring error, 
-- but for migration script better to use DO block or simple policy creation)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.daily_logs;
CREATE POLICY "Enable read access for all users" ON public.daily_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.daily_logs;
CREATE POLICY "Enable insert access for all users" ON public.daily_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.daily_logs;
CREATE POLICY "Enable update access for all users" ON public.daily_logs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON public.daily_logs;
CREATE POLICY "Enable delete access for all users" ON public.daily_logs FOR DELETE USING (true);


-- 2. SEED DATA for Project P-005
DO $$
DECLARE
    v_project_id UUID;
BEGIN
    -- Get Project ID (P-005 is Tienson)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-005' LIMIT 1;

    IF v_project_id IS NOT NULL THEN
        
        DELETE FROM public.daily_logs WHERE project_id = v_project_id; -- Clear logging history

        -- Log 1: Today
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE,
            '{"temp": 28, "condition": "Nhiều mây", "humidity": 75}',
            45,
            E'- Tiếp tục lắp đặt hệ thống điện tầng 2\n- Hoàn thiện sơn bả tường ngoài nhà trục A-B\n- Dọn dẹp vệ sinh công nghiệp tầng 1',
            NULL,
            ARRAY['https://placehold.co/600x400/png?text=Site+Photo+1', 'https://placehold.co/600x400/png?text=Site+Photo+2'],
            '{"Wall_01": "completed", "Floor_01": "completed"}'
        );

        -- Log 2: Yesterday
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE - INTERVAL '1 day',
            '{"temp": 32, "condition": "Nắng", "humidity": 60}',
            48,
            E'- Thi công trần thạch cao hành lang\n- Lắp đặt thiết bị vệ sinh khu WC nam/nữ\n- Kiểm tra, nghiệm thu đầu vào gạch ốp lát',
            NULL,
            ARRAY['https://placehold.co/600x400/png?text=Site+Photo+Yesterday'],
            '{"Floor_01": "completed"}'
        );

        -- Log 3: 2 Days ago
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE - INTERVAL '2 days',
            '{"temp": 25, "condition": "Mưa rào", "humidity": 90}',
            35,
            E'- Tạm dừng công tác sơn bả ngoài trời do mưa\n- Tập trung nhân lực đi dây điện âm tường\n- Gia công ống gió tại xưởng',
            'Mưa lớn ảnh hưởng tiến độ sơn ngoài nhà',
            ARRAY['https://placehold.co/600x400/png?text=Rainy+Site'],
            '{"Column_01": "completed"}'
        );

    END IF;
END $$;
