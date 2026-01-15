-- Seed detailed data for Khách sạn Hà Nội Dream Residence (P-DREAM-RESIDENCE)

DO $$
DECLARE
    p_id UUID;
BEGIN
    -- Get Project ID
    SELECT id INTO p_id FROM public.projects WHERE code = 'P-DREAM-RESIDENCE';

    IF p_id IS NOT NULL THEN
        
        -- 1. SEED WBS / SCHEDULE (Retroactive dates for completed project)
        -- Clear existing WBS for this project to avoid duplicates if re-seeding
        DELETE FROM public.project_wbs WHERE project_id = p_id;

        INSERT INTO public.project_wbs (project_id, name, start_date, end_date, progress, status, level)
        VALUES 
        (p_id, 'Phần ngầm & Móng', '2015-12-01', '2016-03-15', 100, 'done', 0),
        (p_id, 'Đào đất hố móng & Vận chuyển', '2015-12-01', '2015-12-30', 100, 'done', 1),
        (p_id, 'Bê tông lót & Cốt thép móng', '2016-01-02', '2016-02-15', 100, 'done', 1),
        (p_id, 'Đổ bê tông móng', '2016-02-16', '2016-03-15', 100, 'done', 1),

        (p_id, 'Phần Thân', '2016-03-16', '2016-09-30', 100, 'done', 0),
        (p_id, 'Thi công cột vách tầng 1-5', '2016-03-16', '2016-06-15', 100, 'done', 1),
        (p_id, 'Thi công sàn tầng 1-5', '2016-04-01', '2016-06-30', 100, 'done', 1),
        (p_id, 'Thi công cột vách tầng 6-10', '2016-07-01', '2016-09-30', 100, 'done', 1),

        (p_id, 'Hoàn thiện & MEP', '2016-10-01', '2017-02-28', 100, 'done', 0),
        (p_id, 'Xây trát tường ngăn', '2016-10-01', '2016-12-31', 100, 'done', 1),
        (p_id, 'Hệ thống điện nước (MEP)', '2016-10-15', '2017-01-30', 100, 'done', 1),
        (p_id, 'Lắp đặt thiết bị & Nội thất', '2017-01-01', '2017-02-15', 100, 'done', 1),
        (p_id, 'Vệ sinh công nghiệp & Bàn giao', '2017-02-16', '2017-02-28', 100, 'done', 1);

        -- 2. SEED BUDGET (Detailed breakdown)
        DELETE FROM public.project_budget WHERE project_id = p_id;

        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount)
        VALUES
        (p_id, 'Chi phí Xây dựng (Kết cấu)', 65000000000, 64200000000, 64200000000),
        (p_id, 'Chi phí Hoàn thiện (Kiến trúc)', 45000000000, 48500000000, 48500000000),
        (p_id, 'Hệ thống Cơ điện (MEP)', 25000000000, 24800000000, 24800000000),
        (p_id, 'Thang máy & Thiết bị nâng', 5000000000, 5000000000, 5000000000),
        (p_id, 'Nội thất & Decor', 8000000000, 7500000000, 7500000000),
        (p_id, 'Chi phí Quản lý & Khác', 2000000000, 1800000000, 1800000000);

        -- 3. SEED ISSUES (Historical records)
        DELETE FROM public.project_issues WHERE project_id = p_id;

        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic)
        VALUES 
        (p_id, 'ISS-001', 'NCR', 'Nứt bê tông sàn tầng 3 trục A-B', 'High', 'Resolved', '2016-05-10', 'Nguyễn Quốc Anh'),
        (p_id, 'ISS-002', 'RFI', 'Xung đột đường ống MEP hành lang tầng 5', 'Medium', 'Closed', '2016-11-15', 'Trần Thị Bình'),
        (p_id, 'ISS-003', 'General', 'Chậm tiến độ giao vật tư Gạch ốp lát', 'Low', 'Closed', '2016-12-05', 'Phòng Vật tư');

        -- 4. SEED DAILY LOGS (Just a few samples for 'Last Activity' display if needed)
        DELETE FROM public.daily_logs WHERE project_id = p_id;

        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues, status)
        VALUES 
        (p_id, '2017-02-25', '{"temp": 22, "condition": "Sunny", "humidity": 60}'::jsonb, 45, 'Vệ sinh công nghiệp tầng 8-10. Kiểm tra hoàn thiện lần cuối.', 'Không có', 'Approved'),
        (p_id, '2017-02-26', '{"temp": 23, "condition": "Cloudy", "humidity": 65}'::jsonb, 40, 'Vệ sinh công nghiệp sảnh tầng 1. Chỉnh sửa sơn dặm vá.', 'Không có', 'Approved'),
        (p_id, '2017-02-27', '{"temp": 24, "condition": "Sunny", "humidity": 55}'::jsonb, 35, 'Bàn giao chìa khóa các căn hộ tầng 2-5 cho CĐT.', 'Một số cửa sổ bị kẹt, đã chỉnh sửa ngay', 'Approved');

        -- 5. UPDATE PROJECT MEMBERS (Confirming members list)
        UPDATE public.projects 
        SET members = ARRAY['Hồ Xuân Hương', 'Đoàn Thị Điểm', 'Bà Huyện Thanh Quan']
        WHERE id = p_id;

    END IF;
END $$;
