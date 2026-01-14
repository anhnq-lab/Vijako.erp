-- Comprehensive Seed for HRM, Documents, and Inventory Data
-- This script adds employees, attendance, project documents, and inventory for new projects.

DO $$
DECLARE
    v_kp_id UUID; -- King Palace
    v_leg_id UUID; -- The Legend
    v_ia20_id UUID; -- IA20
    v_sun_id UUID; -- Sunshine City
    v_urb_id UUID; -- Sun Urban

    v_emp_1 UUID;
    v_emp_2 UUID;
    v_emp_3 UUID;
    v_emp_4 UUID;
    v_emp_5 UUID;
BEGIN
    -- 1. Get Project IDs
    SELECT id INTO v_kp_id FROM public.projects WHERE code = 'P-KINGPALACE' LIMIT 1;
    SELECT id INTO v_leg_id FROM public.projects WHERE code = 'P-LEGEND' LIMIT 1;
    SELECT id INTO v_ia20_id FROM public.projects WHERE code = 'P-IA20' LIMIT 1;
    SELECT id INTO v_sun_id FROM public.projects WHERE code = 'P-SUNCITY' LIMIT 1;
    SELECT id INTO v_urb_id FROM public.projects WHERE code = 'P-SUNURBAN' LIMIT 1;

    -- ========================
    -- PART 1: EMPLOYEES (HRM)
    -- ========================
    INSERT INTO public.employees (employee_code, full_name, role, department, site, status)
    VALUES 
    ('VJ-SUN-001', 'Nguyễn Văn Hải', 'Chỉ huy trưởng', 'Ban QLDA', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-002', 'Trần Công Thành', 'Kỹ sư kết cấu', 'Phòng Kỹ thuật', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-003', 'Lê Minh Đức', 'Giám sát Cọc & Móng', 'Phòng Kỹ thuật', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-004', 'Phạm Thu Hằng', 'Kế toán công trường', 'Phòng Tài chính', 'Sun Urban Hà Nam', 'active'),
    ('VJ-SUN-005', 'Hoàng Văn Long', 'Nhân viên An toàn', 'Phòng ATLĐ', 'Sun Urban Hà Nam', 'active'),
    ('VJ-KP-001', 'Đỗ Quang Minh', 'Chỉ huy trưởng', 'Ban QLDA', 'King Palace', 'inactive'),
    ('VJ-LEG-001', 'Vũ Thị Lan', 'Kế toán trưởng', 'Phòng Tài chính', 'The Legend', 'inactive'),
    ('VJ-IA20-001', 'Bùi Anh Tuấn', 'Giám sát MEP', 'Phòng Kỹ thuật', 'IA20 Ciputra', 'inactive')
    ON CONFLICT (employee_code) DO NOTHING;

    -- Get Employee IDs for Attendance
    SELECT id INTO v_emp_1 FROM public.employees WHERE employee_code = 'VJ-SUN-001' LIMIT 1;
    SELECT id INTO v_emp_2 FROM public.employees WHERE employee_code = 'VJ-SUN-002' LIMIT 1;
    SELECT id INTO v_emp_3 FROM public.employees WHERE employee_code = 'VJ-SUN-003' LIMIT 1;
    SELECT id INTO v_emp_4 FROM public.employees WHERE employee_code = 'VJ-SUN-004' LIMIT 1;
    SELECT id INTO v_emp_5 FROM public.employees WHERE employee_code = 'VJ-SUN-005' LIMIT 1;

    -- ========================
    -- PART 2: ATTENDANCE (GPS Check-in)
    -- ========================
    IF v_emp_1 IS NOT NULL THEN
        INSERT INTO public.attendance (employee_id, check_in, check_out, location_lat, location_lng, site_id, status)
        VALUES 
        (v_emp_1, CURRENT_DATE + TIME '07:30:00', CURRENT_DATE + TIME '17:45:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        (v_emp_2, CURRENT_DATE + TIME '07:45:00', CURRENT_DATE + TIME '17:30:00', 20.5420, 105.9130, 'SUN-URBAN', 'present'),
        (v_emp_3, CURRENT_DATE + TIME '08:00:00', NULL, 20.5425, 105.9125, 'SUN-URBAN', 'present'),
        (v_emp_4, CURRENT_DATE + TIME '08:15:00', CURRENT_DATE + TIME '17:00:00', 20.5418, 105.9132, 'SUN-URBAN', 'present'),
        (v_emp_5, CURRENT_DATE + TIME '06:45:00', CURRENT_DATE + TIME '18:00:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        -- Yesterday's records
        (v_emp_1, (CURRENT_DATE - INTERVAL '1 day') + TIME '07:25:00', (CURRENT_DATE - INTERVAL '1 day') + TIME '17:50:00', 20.5422, 105.9128, 'SUN-URBAN', 'present'),
        (v_emp_2, (CURRENT_DATE - INTERVAL '1 day') + TIME '07:50:00', (CURRENT_DATE - INTERVAL '1 day') + TIME '17:40:00', 20.5420, 105.9130, 'SUN-URBAN', 'present');
    END IF;

    -- ========================
    -- PART 3: PROJECT DOCUMENTS
    -- ========================
    -- Sun Urban (Active Project - Many docs)
    IF v_urb_id IS NOT NULL THEN
        DELETE FROM public.project_documents WHERE project_id = v_urb_id;
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_urb_id, 'Ban-ve-Mat-bang-Tong-the.pdf', 'pdf', 15728640, 'https://example.com/docs/sunurban/masterplan.pdf', 'Admin'),
        (v_urb_id, 'Ban-ve-Ket-cau-Biet-thu-B1.dwg', 'dwg', 8388608, 'https://example.com/docs/sunurban/struct_b1.dwg', 'Kỹ thuật'),
        (v_urb_id, 'Bien-ban-Nghiem-thu-Coc-Dot-1.pdf', 'pdf', 2097152, 'https://example.com/docs/sunurban/piling_acceptance.pdf', 'Giám sát'),
        (v_urb_id, 'Hinh-anh-Thi-cong-Tuan-02.jpg', 'jpg', 5242880, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', 'Trần Công Thành'),
        (v_urb_id, 'Hop-dong-Thau-phu-Coc.pdf', 'pdf', 3145728, 'https://example.com/docs/sunurban/piling_contract.pdf', 'Phòng TC'),
        (v_urb_id, 'Bao-cao-Tien-do-Thang-01.xlsx', 'xlsx', 1048576, 'https://example.com/docs/sunurban/progress_jan.xlsx', 'Nguyễn Văn Hải');
    END IF;

    -- King Palace (Completed - Final docs)
    IF v_kp_id IS NOT NULL THEN
        DELETE FROM public.project_documents WHERE project_id = v_kp_id;
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_kp_id, 'Ho-so-Hoan-cong-Tong-hop.pdf', 'pdf', 52428800, 'https://example.com/docs/kingpalace/as_built.pdf', 'Admin'),
        (v_kp_id, 'Bien-ban-Ban-giao-Toa-A.pdf', 'pdf', 2097152, 'https://example.com/docs/kingpalace/handover_a.pdf', 'QLDA'),
        (v_kp_id, 'Anh-Hoan-thien-Sanh-Chinh.jpg', 'jpg', 4194304, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'Marketing');
    END IF;

    -- Sunshine City (Completed)
    IF v_sun_id IS NOT NULL THEN
        DELETE FROM public.project_documents WHERE project_id = v_sun_id;
        INSERT INTO public.project_documents (project_id, name, type, size, url, uploaded_by) VALUES
        (v_sun_id, 'Album-Anh-Biet-thu-Mau.pdf', 'pdf', 20971520, 'https://example.com/docs/suncity/villa_album.pdf', 'Marketing'),
        (v_sun_id, 'Video-Flythrough-Canh-quan.mp4', 'mp4', 104857600, 'https://example.com/docs/suncity/landscape_video.mp4', 'Design');
    END IF;

    -- ========================
    -- PART 4: INVENTORY (Vật tư tồn kho)
    -- ========================
    INSERT INTO public.supply_chain_inventory (code, name, category, warehouse, quantity, unit, min_quantity)
    VALUES 
    -- Sun Urban Warehouse
    ('STL-D16-SUN', 'Thép Hòa Phát D16 CB400', 'Steel', 'Kho Sun Urban', 8500, 'kg', 2000),
    ('STL-D25-SUN', 'Thép Hòa Phát D25 CB400', 'Steel', 'Kho Sun Urban', 12000, 'kg', 3000),
    ('CEM-PCB40-SUN', 'Xi măng Vicem PCB40', 'Cement', 'Kho Sun Urban', 350, 'bao', 100),
    ('BRK-TN-SUN', 'Gạch Tuynel A1', 'Brick', 'Kho Sun Urban', 25000, 'viên', 10000),
    -- Low stock items for alerts
    ('STL-D10-SUN', 'Thép Hòa Phát D10 CB300', 'Steel', 'Kho Sun Urban', 500, 'kg', 1500),
    ('CEM-PCB30-SUN', 'Xi măng Vicem PCB30', 'Cement', 'Kho Sun Urban', 20, 'bao', 80),
    -- Other project warehouses (historical)
    ('STL-D20-KP', 'Thép Hòa Phát D20 (Còn lại)', 'Steel', 'Kho King Palace', 200, 'kg', 0),
    ('OTH-FORMWORK-SUN', 'Ván khuôn thép định hình', 'Other', 'Kho Sun Urban', 150, 'bộ', 50)
    ON CONFLICT (code) DO NOTHING;

END $$;
