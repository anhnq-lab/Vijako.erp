-- Seed Data for Project P-005 (Trường Tiểu học Tiên Sơn)

DO $$
DECLARE
    v_project_id UUID;
BEGIN
    -- 1. Get Project ID
    SELECT id INTO v_project_id FROM public.projects WHERE code = 'P-005' LIMIT 1;

    IF v_project_id IS NOT NULL THEN
        -- 2. Update Image (Using a reliable construction image)
        UPDATE public.projects 
        SET avatar = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop'
        WHERE id = v_project_id;

        -- 3. Seed WBS (Tiến độ chi tiết)
        DELETE FROM public.project_wbs WHERE project_id = v_project_id; -- Clear old mock if any
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_project_id, 'Phần ngầm & Móng', 0, 100, '2024-03-01', '2024-04-15', 'done', 'Ban chỉ huy'),
        (v_project_id, 'Đào đất hố móng', 1, 100, '2024-03-01', '2024-03-10', 'done', 'Tổ đội xe máy'),
        (v_project_id, 'Ép cọc đại trà', 1, 100, '2024-03-11', '2024-03-30', 'done', 'Nhà thầu phụ Ép cọc'),
        (v_project_id, 'Bê tông đài giằng', 1, 100, '2024-04-01', '2024-04-15', 'done', 'Tổ đội Bê tông 1'),
        
        (v_project_id, 'Phần thân (Khối phòng học)', 0, 100, '2024-04-16', '2024-06-30', 'done', 'Ban chỉ huy'),
        (v_project_id, 'Cột vách tầng 1', 1, 100, '2024-04-16', '2024-04-30', 'done', 'Tổ đội Cốp pha 2'),
        (v_project_id, 'Dầm sàn tầng 2', 1, 100, '2024-05-01', '2024-05-20', 'done', 'Tổ đội Cốp pha 2'),
        (v_project_id, 'Kết cấu thép mái', 1, 100, '2024-06-01', '2024-06-20', 'done', 'Nhà thầu phụ KCT'),
        
        (v_project_id, 'Hoàn thiện & MEP', 0, 95, '2024-06-15', '2024-08-30', 'active', 'Ban chỉ huy'),
        (v_project_id, 'Xây trát tường', 1, 100, '2024-06-15', '2024-07-15', 'done', 'Tổ đội Xây trát'),
        (v_project_id, 'Lắp đặt điện nước', 1, 90, '2024-07-01', '2024-08-20', 'active', 'Tổ đội MEP'),
        (v_project_id, 'Sơn bả', 1, 80, '2024-08-01', '2024-08-30', 'active', 'Tổ đội Sơn');

        -- 4. Seed Contracts (Hợp đồng)
        DELETE FROM public.contracts WHERE project_id = v_project_id;
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk) VALUES
        ('HĐ-TS-001', 'Công ty CP Đầu tư CapitalLand', v_project_id, 15000000000, 12000000000, 1500000000, 'active', FALSE),
        ('HĐ-NTP-01', 'Công ty Bê tông Xuyên Á', v_project_id, 2500000000, 2000000000, 0, 'active', FALSE),
        ('HĐ-NTP-02', 'Đội khoán nhân công A Ba', v_project_id, 1200000000, 1000000000, 50000000, 'completed', FALSE);

        -- 5. Seed Project Budget (Ngân sách & Chi phí)
        DELETE FROM public.project_budget WHERE project_id = v_project_id;
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_project_id, 'Vật tư (Materials)', 8000000000, 7200000000, 500000000),
        (v_project_id, 'Nhân công (Labor)', 4500000000, 4100000000, 200000000),
        (v_project_id, 'Máy thi công (Equipment)', 1500000000, 1400000000, 50000000),
        (v_project_id, 'Chi phí quản lý (Overhead)', 1000000000, 800000000, 50000000);

    END IF;
END $$;
