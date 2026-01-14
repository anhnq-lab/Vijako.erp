-- Comprehensive Seed for New Projects: Detailed Child Records
-- This script adds WBS, Budget, Issues, and Daily Logs for the 5 new projects.

DO $$
DECLARE
    v_kp_id UUID; -- King Palace
    v_leg_id UUID; -- The Legend
    v_ia20_id UUID; -- IA20
    v_sun_id UUID; -- Sunshine City
    v_urb_id UUID; -- Sun Urban
BEGIN
    -- 1. Get Project IDs
    SELECT id INTO v_kp_id FROM public.projects WHERE code = 'P-KINGPALACE' LIMIT 1;
    SELECT id INTO v_leg_id FROM public.projects WHERE code = 'P-LEGEND' LIMIT 1;
    SELECT id INTO v_ia20_id FROM public.projects WHERE code = 'P-IA20' LIMIT 1;
    SELECT id INTO v_sun_id FROM public.projects WHERE code = 'P-SUNCITY' LIMIT 1;
    SELECT id INTO v_urb_id FROM public.projects WHERE code = 'P-SUNURBAN' LIMIT 1;

    -- --- SEED FOR P-KINGPALACE (King Palace Residences Hà Nội) ---
    IF v_kp_id IS NOT NULL THEN
        -- Cleanup existing to prevent duplicates
        DELETE FROM public.project_wbs WHERE project_id = v_kp_id;
        DELETE FROM public.project_budget WHERE project_id = v_kp_id;
        DELETE FROM public.project_issues WHERE project_id = v_kp_id;
        DELETE FROM public.daily_logs WHERE project_id = v_kp_id;

        -- WBS (Completed Project)
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_kp_id, 'Phần mầm & Cọc khoan nhồi', 0, 100, '2019-07-05', '2019-10-30', 'done', 'Đội móng'),
        (v_kp_id, 'Kết cấu Thân tòa A', 0, 100, '2019-11-01', '2020-05-15', 'done', 'Ban chỉ huy'),
        (v_kp_id, 'Xây trát & Hoàn thiện căn hộ', 0, 100, '2020-06-01', '2020-11-30', 'done', 'Tổ đội hoàn thiện'),
        (v_kp_id, 'Lắp đặt hệ thống M&E', 0, 100, '2020-05-01', '2020-12-15', 'done', 'NTP Cơ điện');

        -- Budget
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_kp_id, 'Xây lắp vách hầm', 4500000000, 4500000000, 0),
        (v_kp_id, 'Kết cấu thân', 12000000000, 11850000000, 0),
        (v_kp_id, 'Hoàn thiện & Nội thất', 15000000000, 14900000000, 0);

        -- Issues (Historical)
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_kp_id, 'KP-NCR-001', 'NCR', 'Nghiệm thu thép dầm lỗi', 'High', 'Resolved', '2020-03-20', 'Nguyễn Văn Nam'),
        (v_kp_id, 'KP-RFI-012', 'RFI', 'Làm rõ chi tiết sảnh đón', 'Medium', 'Closed', '2020-08-15', 'Trần Minh Tuấn');

        -- Daily Logs (Sample from delivery phase)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues) VALUES
        (v_kp_id, '2020-12-20', '{"temp": 18, "condition": "Cloudy"}', 85, 'Dọn dẹp vệ sinh công nghiệp bàn giao căn hộ tầng 10-15', 'Không có sự cố');
    END IF;

    -- --- SEED FOR P-LEGEND (The Legend) ---
    IF v_leg_id IS NOT NULL THEN
        DELETE FROM public.project_wbs WHERE project_id = v_leg_id;
        DELETE FROM public.project_budget WHERE project_id = v_leg_id;
        DELETE FROM public.project_issues WHERE project_id = v_leg_id;
        DELETE FROM public.daily_logs WHERE project_id = v_leg_id;

        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_leg_id, 'Giải phóng mặt bằng', 0, 100, '2017-09-01', '2017-10-15', 'done', 'Ban dự án'),
        (v_leg_id, 'Thanh toán & Bàn giao', 0, 100, '2019-01-01', '2019-04-30', 'done', 'Phòng kinh doanh');

        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_leg_id, 'Chi phí quản lý dự án', 2000000000, 1950000000, 0),
        (v_leg_id, 'Tư vấn giám sát', 1500000000, 1500000000, 0);

        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues) VALUES
        (v_leg_id, '2019-04-15', '{"temp": 28, "condition": "Sunny"}', 20, 'Kiểm tra lần cuối hệ thống PCCC trước khi nghiệm thu nhà nước', 'Mọi thứ ổn định');
    END IF;

    -- --- SEED FOR P-IA20 (Công trình nhà ở IA20) ---
    IF v_ia20_id IS NOT NULL THEN
        DELETE FROM public.project_wbs WHERE project_id = v_ia20_id;
        DELETE FROM public.project_budget WHERE project_id = v_ia20_id;
        DELETE FROM public.project_issues WHERE project_id = v_ia20_id;
        DELETE FROM public.daily_logs WHERE project_id = v_ia20_id;

        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_ia20_id, 'Khai thác hầm & Tường vây', 0, 100, '2018-12-10', '2019-03-30', 'done', 'NTP Delta'),
        (v_ia20_id, 'Kết cấu Thân Tòa A1, A2, B', 0, 100, '2019-04-01', '2019-12-20', 'done', 'Vijako Team');

        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_ia20_id, 'Cung cấp bê tông thương phẩm', 85000000000, 84200000000, 0),
        (v_ia20_id, 'Cung cấp thép xây dựng', 120000000000, 119500000000, 0);
    END IF;

    -- --- SEED FOR P-SUNCITY (Sunshine City) ---
    IF v_sun_id IS NOT NULL THEN
        DELETE FROM public.project_wbs WHERE project_id = v_sun_id;
        DELETE FROM public.project_budget WHERE project_id = v_sun_id;
        DELETE FROM public.project_issues WHERE project_id = v_sun_id;
        DELETE FROM public.daily_logs WHERE project_id = v_sun_id;

        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_sun_id, 'Thi công Biệt thự thấp tầng', 0, 100, '2017-10-15', '2019-05-30', 'done', 'Đội thi công 1'),
        (v_sun_id, 'Cảnh quan & Bể bơi dát vàng', 0, 100, '2019-06-01', '2020-09-25', 'done', 'Landscape Team');

        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_sun_id, 'Gói thầu cơ sở hạ tầng', 15000000000, 14800000000, 0),
        (v_sun_id, 'Vật liệu dát vàng nội thất', 5000000000, 5200000000, 0);
    END IF;

    -- --- SEED FOR P-SUNURBAN (Sun Urban City Hà Nam) ---
    -- This is an ACTIVE project
    IF v_urb_id IS NOT NULL THEN
        DELETE FROM public.project_wbs WHERE project_id = v_urb_id;
        DELETE FROM public.project_budget WHERE project_id = v_urb_id;
        DELETE FROM public.project_issues WHERE project_id = v_urb_id;
        DELETE FROM public.daily_logs WHERE project_id = v_urb_id;

        -- WBS
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_urb_id, 'Giai đoạn Chuẩn bị & Hạ tầng kỹ thuật', 0, 100, '2023-01-01', '2023-06-30', 'done', 'Ban dự án Hà Nam'),
        (v_urb_id, 'Thi công Cọc & Móng khu biệt thự', 0, 85, '2023-07-01', '2024-03-30', 'active', 'Đội cọc 1'),
        (v_urb_id, 'Kết cấu thân khu Shophouse', 0, 30, '2024-01-15', '2024-12-30', 'active', 'Vijako Team A'),
        (v_urb_id, 'Hoàn thiện & Cảnh quan đợt 1', 0, 0, '2025-01-01', '2025-08-30', 'pending', 'Tổ đội hoàn thiện');

        -- Budget
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_urb_id, 'Gói thầu Cọc & Móng', 15000000000, 12500000000, 2000000000),
        (v_urb_id, 'Vật tư Thép quý 1', 8000000000, 7500000000, 500000000),
        (v_urb_id, 'Bê tông thương phẩm đợt 2', 4000000000, 1200000000, 2000000000);

        -- Issues
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_urb_id, 'SUN-ISS-001', 'General', 'Chưa giải phóng hết mặt bằng khu C', 'High', 'Open', '2024-02-15', 'Nguyễn Văn Hải'),
        (v_urb_id, 'SUN-RFI-005', 'RFI', 'Làm rõ hướng thoát nước trục chính', 'Medium', 'Open', '2024-01-30', 'Lê Công Thành');

        -- Daily Logs (Recent)
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues) VALUES
        (v_urb_id, CURRENT_DATE, '{"temp": 22, "condition": "Fair"}', 145, 'Ép cọc D500 lô B1-B5. Thi công ván khuôn dầm sàn Shophouse S10. Vận chuyển vật tư về bãi.', 'Máy ép cọc thi thoảng trục trặc thủy lực'),
        (v_urb_id, CURRENT_DATE - INTERVAL '1 day', '{"temp": 20, "condition": "Rainy"}', 110, 'Đổ bê tông lót móng khu biệt thự. Lắp dựng cốt thép dầm sàn.', 'Mưa lớn buổi chiều làm gián đoạn thi công 3h');

        -- Update main project progress based on WBS
        UPDATE public.projects SET progress = 35 WHERE id = v_urb_id;
    END IF;

    -- Update other project progress for consistency
    UPDATE public.projects SET progress = 100 WHERE id IN (v_kp_id, v_leg_id, v_ia20_id, v_sun_id);

END $$;
