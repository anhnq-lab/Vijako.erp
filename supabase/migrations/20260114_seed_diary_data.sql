-- Seed Diary Data for Project P-005 (Trường Tiểu học Tiên Sơn)

DO $$
DECLARE
    v_project_id UUID;
BEGIN
    -- 1. Get Project ID (P-005 is Tienson)
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-005' LIMIT 1;

    IF v_project_id IS NOT NULL THEN
        
        DELETE FROM public.daily_logs WHERE project_id = v_project_id; -- Clear logging history to avoid dupes

        -- Log 1: Today (Cloudy, finishing MEP)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE,
            '{"temp": 28, "condition": "Nhiều mây", "humidity": 75}',
            45,
            E'- Tiếp tục lắp đặt hệ thống điện tầng 2\n- Hoàn thiện sơn bả tường ngoài nhà trục A-B\n- Dọn dẹp vệ sinh công nghiệp tầng 1',
            NULL,
            ARRAY['https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800','https://images.unsplash.com/photo-1590486803833-1c5dc8ce2ac6?q=80&w=800'],
            '{"Wall_01": "completed", "Floor_01": "completed"}'
        );

        -- Log 2: Yesterday (Sunny, good progress)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE - INTERVAL '1 day',
            '{"temp": 32, "condition": "Nắng", "humidity": 60}',
            48,
            E'- Thi công trần thạch cao hành lang\n- Lắp đặt thiết bị vệ sinh khu WC nam/nữ\n- Kiểm tra, nghiệm thu đầu vào gạch ốp lát',
            NULL,
            ARRAY['https://images.unsplash.com/photo-1581094794329-cd6829515189?q=80&w=800'],
            '{"Floor_01": "completed"}'
        );

        -- Log 3: 2 Days ago (Rain, indoor work only)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE - INTERVAL '2 days',
            '{"temp": 25, "condition": "Mưa rào", "humidity": 90}',
            35,
            E'- Tạm dừng công tác sơn bả ngoài trời do mưa\n- Tập trung nhân lực đi dây điện âm tường\n- Gia công ống gió tại xưởng',
            'Mưa lớn ảnh hưởng tiến độ sơn ngoài nhà',
            ARRAY['https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?q=80&w=800'],
            '{"Column_01": "completed"}'
        );

        -- Log 4: 3 Days ago (Sunny)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, images, progress_update)
        VALUES (
            v_project_id,
            CURRENT_DATE - INTERVAL '3 days',
            '{"temp": 33, "condition": "Nắng gắt", "humidity": 55}',
            50,
            E'- Đổ bê tông lanh tô cửa sổ\n- Lắp dựng giàn giáo hoàn thiện mặt đứng chính\n- Nhập vật tư sơn nước đợt 2',
            NULL,
            NULL,
            '{"Column_01": "in_progress"}'
        );

    END IF;
END $$;
