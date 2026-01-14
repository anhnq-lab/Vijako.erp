-- =====================================================
-- COMPREHENSIVE REALISTIC DATA SEED
-- Vijako ERP - Dữ liệu mẫu sống động và chính xác
-- =====================================================

DO $$
DECLARE
    v_kp_id UUID; -- King Palace
    v_leg_id UUID; -- The Legend
    v_ia20_id UUID; -- IA20
    v_sun_id UUID; -- Sunshine City
    v_urb_id UUID; -- Sun Urban
    v_p001_id UUID; -- Vijako Tower (existing)
    
    -- Vendor IDs
    v_hoa_phat UUID;
    v_viet_uc UUID;
    v_electra UUID;
    v_delta UUID;
    
    -- Employee IDs
    v_emp_hai UUID;
    v_emp_thanh UUID;
    v_emp_duc UUID;
BEGIN
    -- Get all project IDs
    SELECT id INTO v_kp_id FROM public.projects WHERE code = 'P-KINGPALACE' LIMIT 1;
    SELECT id INTO v_leg_id FROM public.projects WHERE code = 'P-LEGEND' LIMIT 1;
    SELECT id INTO v_ia20_id FROM public.projects WHERE code = 'P-IA20' LIMIT 1;
    SELECT id INTO v_sun_id FROM public.projects WHERE code = 'P-SUNCITY' LIMIT 1;
    SELECT id INTO v_urb_id FROM public.projects WHERE code = 'P-SUNURBAN' LIMIT 1;
    SELECT id INTO v_p001_id FROM public.projects WHERE code = 'P-001' LIMIT 1;

    -- =====================================================
    -- 1. THÊM NHIỀU WBS CHI TIẾT CHO SUN URBAN (DỰ ÁN ĐANG THI CÔNG)
    -- =====================================================
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        -- Giai đoạn Móng
        (v_urb_id, 'Ép cọc D500 khu Biệt thự B1-B5', 1, 100, '2023-08-01', '2023-10-15', 'done', 'Piling Foundation Pro'),
        (v_urb_id, 'Ép cọc D600 khu Shophouse S1-S10', 1, 85, '2023-10-20', '2024-01-30', 'active', 'Piling Foundation Pro'),
        (v_urb_id, 'Đào đất hố móng khu B1-B3', 1, 100, '2023-11-01', '2023-12-15', 'done', 'Đội xe máy'),
        (v_urb_id, 'Bê tông lót móng B1-B3', 1, 100, '2023-12-18', '2023-12-28', 'done', 'Vijako Team'),
        (v_urb_id, 'Cốt thép móng băng B1', 1, 100, '2024-01-02', '2024-01-12', 'done', 'Tổ thép 1'),
        (v_urb_id, 'Đổ bê tông móng B1 - M350', 1, 100, '2024-01-13', '2024-01-15', 'done', 'Vijako + Việt Úc'),
        -- Giai đoạn Thân
        (v_urb_id, 'Thi công cột tầng 1 Shophouse S1-S3', 1, 60, '2024-01-20', '2024-02-28', 'active', 'Tổ cốp pha 1'),
        (v_urb_id, 'Xây tường bao khu B1', 1, 40, '2024-02-01', '2024-03-15', 'active', 'Tổ xây 1'),
        (v_urb_id, 'Lắp đặt điện ngầm khu hạ tầng', 1, 25, '2024-02-15', '2024-04-30', 'active', 'Electra Việt Nam'),
        -- Công việc sắp tới
        (v_urb_id, 'Hoàn thiện mặt ngoài Shophouse', 1, 0, '2024-06-01', '2024-09-30', 'pending', 'Finishing Master'),
        (v_urb_id, 'Cảnh quan khu vực trung tâm', 1, 0, '2024-10-01', '2025-03-30', 'pending', 'Landscape Team')
        ON CONFLICT DO NOTHING;
    END IF;

    -- =====================================================
    -- 2. THÊM NHẬT KÝ THI CÔNG NHIỀU NGÀY (7 NGÀY GẦN NHẤT)
    -- =====================================================
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.daily_logs (project_id, date, weather, manpower_total, work_content, issues) VALUES
        (v_urb_id, CURRENT_DATE - INTERVAL '2 days', '{"temp": 24, "condition": "Sunny", "humidity": 65}', 156, 
         'Ép cọc D600 lô S7-S8 đạt 12 cọc. Đổ bê tông cột tầng 1 lô S1. Lắp ván khuôn dầm sàn S2.', 
         'Máy ép cọc số 2 cần bảo dưỡng định kỳ'),
        (v_urb_id, CURRENT_DATE - INTERVAL '3 days', '{"temp": 22, "condition": "Cloudy", "humidity": 75}', 148,
         'Hoàn thành ép cọc lô S6. Thi công cốt thép dầm sàn S1. Xây tường tầng 1 biệt thự B2.',
         'Không có sự cố'),
        (v_urb_id, CURRENT_DATE - INTERVAL '4 days', '{"temp": 19, "condition": "Rainy", "humidity": 88}', 95,
         'Mưa lớn buổi sáng, chỉ thi công được buổi chiều. Tập trung cốt thép trong nhà kho.',
         'Ngừng đổ bê tông do mưa, dời sang ngày mai'),
        (v_urb_id, CURRENT_DATE - INTERVAL '5 days', '{"temp": 26, "condition": "Sunny", "humidity": 60}', 165,
         'Đổ bê tông sàn tầng 1 lô S1 - 85m3 M350. Ép cọc lô S5 đạt 8 cọc. Nghiệm thu cốt thép móng B4.',
         'Bơm bê tông số 3 hỏng van, đã thay thế'),
        (v_urb_id, CURRENT_DATE - INTERVAL '6 days', '{"temp": 25, "condition": "Partly Cloudy", "humidity": 68}', 158,
         'Lắp dựng cốt thép cột tầng 1 lô S2-S3. Xây tường bao biệt thự B1. Vận chuyển thép D25 về kho.',
         'Thiếu thép D10, đã đặt bổ sung'),
        (v_urb_id, CURRENT_DATE - INTERVAL '7 days', '{"temp": 23, "condition": "Sunny", "humidity": 62}', 152,
         'Đào đất hố móng biệt thự B5. Nghiệm thu hoàn thành móng B3. Khởi công hạng mục điện ngầm khu A.',
         'Không có sự cố')
        ON CONFLICT DO NOTHING;
    END IF;

    -- =====================================================
    -- 3. THÊM NHIỀU SỰ CỐ & VẤN ĐỀ (NCR, RFI, General)
    -- =====================================================
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_urb_id, 'SUN-NCR-002', 'NCR', 'Bê tông cột S2-C3 bị rỗ tổ ong 20cm2', 'High', 'Open', '2024-02-20', 'Trần Công Thành'),
        (v_urb_id, 'SUN-NCR-003', 'NCR', 'Thép dầm D1-S1 sai khoảng cách đai 50mm', 'Medium', 'Resolved', '2024-02-10', 'Lê Minh Đức'),
        (v_urb_id, 'SUN-RFI-003', 'RFI', 'Xác nhận chi tiết mối nối thép dầm chính', 'Medium', 'Open', '2024-02-25', 'Nguyễn Văn Hải'),
        (v_urb_id, 'SUN-RFI-004', 'RFI', 'Làm rõ cao độ đáy móng băng khu B4-B5', 'Low', 'Closed', '2024-01-28', 'Lê Minh Đức'),
        (v_urb_id, 'SUN-ISS-002', 'General', 'Thiếu hụt thép D10 dự kiến 2 tuần', 'High', 'Open', '2024-02-18', 'Phạm Thu Hằng'),
        (v_urb_id, 'SUN-ISS-003', 'General', 'Nhà thầu phụ điện chậm tiến độ 5 ngày', 'Medium', 'Open', '2024-03-01', 'Nguyễn Văn Hải')
        ON CONFLICT DO NOTHING;
    END IF;

    -- King Palace (dự án đã hoàn thành - issues lịch sử)
    IF v_kp_id IS NOT NULL THEN
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_kp_id, 'KP-NCR-002', 'NCR', 'Sơn tường tầng 15 bị bong tróc', 'Medium', 'Resolved', '2020-09-15', 'Đỗ Quang Minh'),
        (v_kp_id, 'KP-RFI-002', 'RFI', 'Thay đổi layout căn hộ theo yêu cầu CĐT', 'High', 'Closed', '2020-06-20', 'Đỗ Quang Minh')
        ON CONFLICT DO NOTHING;
    END IF;

    -- =====================================================
    -- 4. THÊM NHIỀU HỢP ĐỒNG (CONTRACTS) - GIÁ TRỊ THỰC TẾ
    -- =====================================================
    -- Sun Urban contracts
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk) VALUES
        ('CONT-SUN-003', 'Finishing Master JSC', v_urb_id, 35000000000, 0, 0, 'active', FALSE),
        ('CONT-SUN-004', 'Bê tông Chèm - Việt Úc', v_urb_id, 28000000000, 8500000000, 1400000000, 'active', FALSE),
        ('CONT-SUN-005', 'Thép Hòa Phát - Miền Bắc', v_urb_id, 42000000000, 15000000000, 2100000000, 'active', FALSE),
        ('CONT-SUN-006', 'Nhà thầu MEP Hư hỏng', v_urb_id, 8000000000, 2000000000, 400000000, 'active', TRUE)
        ON CONFLICT (contract_code) DO NOTHING;
    END IF;

    -- King Palace contracts (historical)
    IF v_kp_id IS NOT NULL THEN
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk) VALUES
        ('CONT-KP-001', 'Công ty CP Electra Việt Nam', v_kp_id, 22000000000, 22000000000, 0, 'completed', FALSE),
        ('CONT-KP-002', 'Bê tông Chèm - Việt Úc', v_kp_id, 18500000000, 18500000000, 0, 'completed', FALSE)
        ON CONFLICT (contract_code) DO NOTHING;
    END IF;

    -- IA20 contracts (historical)
    IF v_ia20_id IS NOT NULL THEN
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk) VALUES
        ('CONT-IA20-001', 'Delta Piling Corp', v_ia20_id, 65000000000, 65000000000, 0, 'completed', FALSE),
        ('CONT-IA20-002', 'Công ty CP Electra Việt Nam', v_ia20_id, 48000000000, 48000000000, 0, 'completed', FALSE)
        ON CONFLICT (contract_code) DO NOTHING;
    END IF;

    -- =====================================================
    -- 5. THÊM NHIỀU ĐƠN ĐẶT HÀNG (POs) - ĐA DẠNG TRẠNG THÁI
    -- =====================================================
    SELECT id INTO v_hoa_phat FROM public.supply_chain_vendors WHERE name LIKE '%Hòa Phát%' LIMIT 1;
    SELECT id INTO v_viet_uc FROM public.supply_chain_vendors WHERE name LIKE '%Việt Úc%' LIMIT 1;
    
    IF v_hoa_phat IS NOT NULL THEN
        INSERT INTO public.supply_chain_orders (po_number, vendor_id, items_summary, location, total_amount, delivery_date, status) VALUES
        ('PO-SUN-24-004', v_hoa_phat, 'Thép D10 cuộn (15 Tấn)', 'Sun Urban Hà Nam', 245000000, '2024-02-20', 'Pending'),
        ('PO-SUN-24-005', v_hoa_phat, 'Thép D20 thanh (30 Tấn)', 'Sun Urban Hà Nam', 510000000, '2024-02-25', 'Pending'),
        ('PO-SUN-24-006', v_viet_uc, 'Bê tông M300 (150m3)', 'Sun Urban Hà Nam', 210000000, '2024-02-18', 'Delivering'),
        ('PO-SUN-24-007', v_viet_uc, 'Bê tông M400 (80m3)', 'Sun Urban Hà Nam', 128000000, '2024-02-22', 'Pending')
        ON CONFLICT (po_number) DO NOTHING;
    END IF;

    -- =====================================================
    -- 6. THÊM NHIỀU NHÂN VIÊN ĐA DẠNG VỊ TRÍ
    -- =====================================================
    INSERT INTO public.employees (employee_code, full_name, role, department, site, status) VALUES
    -- Nhân sự văn phòng
    ('VJ-HQ-001', 'Nguyễn Thị Mai', 'Giám đốc Tài chính', 'Ban Giám đốc', 'Văn phòng HN', 'active'),
    ('VJ-HQ-002', 'Trần Quốc Anh', 'Trưởng phòng Kỹ thuật', 'Phòng Kỹ thuật', 'Văn phòng HN', 'active'),
    ('VJ-HQ-003', 'Lê Thị Hương', 'Nhân viên Nhân sự', 'Phòng HC-NS', 'Văn phòng HN', 'active'),
    -- Sun Urban thêm
    ('VJ-SUN-006', 'Đặng Văn Tùng', 'Tổ trưởng Cốp pha', 'Tổ đội', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-007', 'Ngô Minh Quân', 'Tổ trưởng Thép', 'Tổ đội', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-008', 'Phạm Văn Kiên', 'Lái máy xúc', 'Đội xe máy', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-009', 'Hoàng Đức Thắng', 'Thợ hàn', 'Tổ đội', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-010', 'Vũ Văn Nam', 'Công nhân xây', 'Tổ đội', 'Sun Urban Hà Nam', 'active'),
    -- Dự án khác
    ('VJ-LEG-002', 'Đỗ Thị Hạnh', 'Kỹ sư QS', 'Phòng Kỹ thuật', 'The Legend', 'inactive'),
    ('VJ-SUN-011', 'Bùi Văn Đạt', 'Giám sát Cảnh quan', 'Phòng Kỹ thuật', 'Sunshine City', 'inactive')
    ON CONFLICT (employee_code) DO NOTHING;

    -- =====================================================
    -- 7. THÊM CHẤM CÔNG GPS CHO NHIỀU NGÀY VÀ NHIỀU NGƯỜI
    -- =====================================================
    SELECT id INTO v_emp_hai FROM public.employees WHERE employee_code = 'VJ-SUN-001' LIMIT 1;
    SELECT id INTO v_emp_thanh FROM public.employees WHERE employee_code = 'VJ-SUN-002' LIMIT 1;
    SELECT id INTO v_emp_duc FROM public.employees WHERE employee_code = 'VJ-SUN-003' LIMIT 1;

    IF v_emp_hai IS NOT NULL THEN
        -- Chấm công tuần trước
        INSERT INTO public.attendance (employee_id, check_in, check_out, location_lat, location_lng, site_id, status) VALUES
        (v_emp_hai, (CURRENT_DATE - INTERVAL '3 days') + TIME '07:28:00', (CURRENT_DATE - INTERVAL '3 days') + TIME '18:05:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        (v_emp_hai, (CURRENT_DATE - INTERVAL '4 days') + TIME '07:35:00', (CURRENT_DATE - INTERVAL '4 days') + TIME '17:50:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        (v_emp_hai, (CURRENT_DATE - INTERVAL '5 days') + TIME '07:22:00', (CURRENT_DATE - INTERVAL '5 days') + TIME '18:15:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        (v_emp_thanh, (CURRENT_DATE - INTERVAL '3 days') + TIME '07:40:00', (CURRENT_DATE - INTERVAL '3 days') + TIME '17:45:00', 20.5420, 105.9130, 'SUN-URBAN', 'present'),
        (v_emp_thanh, (CURRENT_DATE - INTERVAL '4 days') + TIME '07:48:00', (CURRENT_DATE - INTERVAL '4 days') + TIME '17:38:00', 20.5420, 105.9130, 'SUN-URBAN', 'present'),
        (v_emp_duc, (CURRENT_DATE - INTERVAL '3 days') + TIME '06:55:00', (CURRENT_DATE - INTERVAL '3 days') + TIME '17:30:00', 20.5425, 105.9125, 'SUN-URBAN', 'present'),
        (v_emp_duc, (CURRENT_DATE - INTERVAL '5 days') + TIME '07:05:00', (CURRENT_DATE - INTERVAL '5 days') + TIME '18:00:00', 20.5425, 105.9125, 'SUN-URBAN', 'present')
        ON CONFLICT DO NOTHING;
    END IF;

    -- =====================================================
    -- 8. THÊM NHIỀU VẬT TƯ TỒN KHO VỚI TRẠNG THÁI ĐA DẠNG
    -- =====================================================
    INSERT INTO public.supply_chain_inventory (code, name, category, warehouse, quantity, unit, min_quantity) VALUES
    -- Sun Urban - thêm nhiều vật tư
    ('CEM-PCB50-SUN', 'Xi măng Vicem PCB50', 'Cement', 'Kho Sun Urban', 280, 'bao', 100),
    ('STL-D32-SUN', 'Thép Hòa Phát D32 CB400', 'Steel', 'Kho Sun Urban', 4500, 'kg', 2000),
    ('BRK-BLOCK-SUN', 'Gạch Block xây tường', 'Brick', 'Kho Sun Urban', 8000, 'viên', 3000),
    ('OTH-WIRE-SUN', 'Dây buộc thép mạ kẽm', 'Other', 'Kho Sun Urban', 500, 'kg', 100),
    ('OTH-NAIL-SUN', 'Đinh đóng ván khuôn', 'Other', 'Kho Sun Urban', 200, 'kg', 50),
    -- Vật tư tồn thấp (cảnh báo)
    ('STL-D8-SUN', 'Thép Hòa Phát D8 CB300', 'Steel', 'Kho Sun Urban', 300, 'kg', 800),
    ('CEM-BUILD-SUN', 'Xi măng xây trát', 'Cement', 'Kho Sun Urban', 40, 'bao', 150)
    ON CONFLICT (code) DO NOTHING;

    -- =====================================================
    -- 9. THÊM NHIỀU TÀI LIỆU DỰ ÁN
    -- =====================================================
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_urb_id, 'Tien-do-Tong-the-Cap-nhat.mpp', 'mpp', 3145728, 'https://example.com/docs/sunurban/schedule.mpp', 'Nguyễn Văn Hải'),
        (v_urb_id, 'So-do-To-chuc-Cong-truong.pdf', 'pdf', 1048576, 'https://example.com/docs/sunurban/org_chart.pdf', 'Phòng HC'),
        (v_urb_id, 'Bao-cao-An-toan-Thang-01.pdf', 'pdf', 2097152, 'https://example.com/docs/sunurban/safety_jan.pdf', 'Hoàng Văn Long'),
        (v_urb_id, 'Bien-ban-Hop-Giao-ban-20240115.docx', 'docx', 524288, 'https://example.com/docs/sunurban/meeting_0115.docx', 'Phạm Thu Hằng'),
        (v_urb_id, 'Phieu-Yeu-cau-Vat-tu-Thang-02.xlsx', 'xlsx', 262144, 'https://example.com/docs/sunurban/material_req.xlsx', 'Phạm Thu Hằng')
        ON CONFLICT DO NOTHING;
    END IF;

    -- =====================================================
    -- 10. CẬP NHẬT TIẾN ĐỘ DỰ ÁN CHÍNH XÁC
    -- =====================================================
    UPDATE public.projects SET progress = 38, plan_progress = 42 WHERE id = v_urb_id;
    UPDATE public.projects SET progress = 100, plan_progress = 100 WHERE id IN (v_kp_id, v_leg_id, v_ia20_id, v_sun_id);

    -- =====================================================
    -- 11. THÊM NGÂN SÁCH CHI TIẾT HƠN
    -- =====================================================
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_urb_id, 'Chi phí Điện - Nước thi công', 450000000, 180000000, 120000000),
        (v_urb_id, 'Chi phí Lán trại - Văn phòng', 320000000, 320000000, 0),
        (v_urb_id, 'Chi phí An toàn lao động', 280000000, 95000000, 85000000),
        (v_urb_id, 'Chi phí Bảo hiểm công trình', 1200000000, 1200000000, 0),
        (v_urb_id, 'Dự phòng phát sinh', 5000000000, 0, 0)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
