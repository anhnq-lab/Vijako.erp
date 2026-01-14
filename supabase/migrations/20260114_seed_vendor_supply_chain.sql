-- Seeding Vendor and Supply Chain Data for New Projects
-- This script adds various subcontractors, suppliers, POs, and contracts.

DO $$
DECLARE
    v_kp_id UUID; -- King Palace
    v_leg_id UUID; -- The Legend
    v_ia20_id UUID; -- IA20
    v_sun_id UUID; -- Sunshine City
    v_urb_id UUID; -- Sun Urban

    v_v_hoa_phat UUID;
    v_v_viet_uc UUID;
    v_v_dulux UUID;
    v_v_electra UUID;
    v_v_piling_pro UUID;
    v_v_finish_master UUID;
BEGIN
    -- 1. Get Project IDs
    SELECT id INTO v_kp_id FROM public.projects WHERE code = 'P-KINGPALACE' LIMIT 1;
    SELECT id INTO v_leg_id FROM public.projects WHERE code = 'P-LEGEND' LIMIT 1;
    SELECT id INTO v_ia20_id FROM public.projects WHERE code = 'P-IA20' LIMIT 1;
    SELECT id INTO v_sun_id FROM public.projects WHERE code = 'P-SUNCITY' LIMIT 1;
    SELECT id INTO v_urb_id FROM public.projects WHERE code = 'P-SUNURBAN' LIMIT 1;

    -- 2. Seed Vendors (Subcontractors & Suppliers)
    -- Using UPSERT style to avoid duplicates
    INSERT INTO public.supply_chain_vendors (name, category, rating, total_projects, last_evaluation, status) 
    VALUES 
    ('Thép Hòa Phát - Miền Bắc', 'Vật liệu xây dựng', 5.0, 45, '01/2024 - Xuất sắc', 'approved'),
    ('Bê tông Chèm - Việt Úc', 'Vật liệu xây dựng', 4.7, 30, '12/2023 - Tốt', 'approved'),
    ('Công ty CP Electra Việt Nam', 'Thầu phụ thi công', 4.5, 15, '11/2023 - Chuyên nghiệp', 'approved'),
    ('Piling Foundation Pro', 'Thầu phụ thi công', 4.2, 8, '10/2023 - Khá', 'approved'),
    ('Hệ thống Phân phối Dulux Professional', 'Hoàn thiện', 4.6, 20, '02/2024 - Rất tốt', 'approved'),
    ('Finishing Master JSC', 'Hoàn thiện', 3.8, 12, '01/2024 - Trung bình', 'approved'),
    ('Nhà thầu MEP Hư hỏng', 'Thầu phụ thi công', 1.5, 3, 'Chậm tiến độ & Thi công sai', 'restricted')
    ON CONFLICT (name) DO NOTHING;

    -- Get Vendor IDs
    SELECT id INTO v_v_hoa_phat FROM public.supply_chain_vendors WHERE name = 'Thép Hòa Phát - Miền Bắc' LIMIT 1;
    SELECT id INTO v_v_viet_uc FROM public.supply_chain_vendors WHERE name = 'Bê tông Chèm - Việt Úc' LIMIT 1;
    SELECT id INTO v_v_dulux FROM public.supply_chain_vendors WHERE name = 'Hệ thống Phân phối Dulux Professional' LIMIT 1;
    SELECT id INTO v_v_electra FROM public.supply_chain_vendors WHERE name = 'Công ty CP Electra Việt Nam' LIMIT 1;
    SELECT id INTO v_v_piling_pro FROM public.supply_chain_vendors WHERE name = 'Piling Foundation Pro' LIMIT 1;
    SELECT id INTO v_v_finish_master FROM public.supply_chain_vendors WHERE name = 'Finishing Master JSC' LIMIT 1;

    -- 3. Seed Contracts (Thầu phụ) for Projects
    -- P-SUNURBAN (Active)
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk)
        VALUES 
        ('CONT-SUN-001', 'Piling Foundation Pro', v_urb_id, 25000000000, 15000000000, 1250000000, 'active', FALSE),
        ('CONT-SUN-002', 'Công ty CP Electra Việt Nam', v_urb_id, 18000000000, 2000000000, 900000000, 'active', FALSE)
        ON CONFLICT (contract_code) DO NOTHING;
    END IF;

    -- P-KINGPALACE (Completed)
    IF v_kp_id IS NOT NULL THEN
        INSERT INTO public.contracts (contract_code, partner_name, project_id, value, paid_amount, retention_amount, status, is_risk)
        VALUES 
        ('CONT-KING-DELIVERY', 'Finishing Master JSC', v_kp_id, 12000000000, 12000000000, 0, 'completed', FALSE)
        ON CONFLICT (contract_code) DO NOTHING;
    END IF;

    -- 4. Seed Purchase Orders (Orders)
    -- P-SUNURBAN (Current Orders)
    IF v_urb_id IS NOT NULL THEN
        INSERT INTO public.supply_chain_orders (po_number, vendor_id, items_summary, location, total_amount, delivery_date, status)
        VALUES 
        ('PO-SUN-24-001', v_v_hoa_phat, 'Thép D10-D25 (50 Tấn)', 'Sun Urban Hà Nam', 850000000, '2024-01-20', 'Completed'),
        ('PO-SUN-24-002', v_v_viet_uc, 'Bê tông tươi M350 (200m3)', 'Sun Urban Hà Nam', 280000000, '2024-02-15', 'Delivering'),
        ('PO-SUN-24-003', v_v_hoa_phat, 'Thép cuộn D6 (20 Tấn)', 'Sun Urban Hà Nam', 320000000, '2024-03-01', 'Pending')
        ON CONFLICT (po_number) DO NOTHING;
    END IF;

    -- P-IA20 & SUNCITY (Historical Orders)
    IF v_ia20_id IS NOT NULL THEN
        INSERT INTO public.supply_chain_orders (po_number, vendor_id, items_summary, location, total_amount, delivery_date, status)
        VALUES 
        ('PO-IA20-HIST', v_v_viet_uc, 'Tổng cung cấp bê tông IA20', 'IA20 Ciputra', 45000000000, '2019-12-30', 'Completed')
        ON CONFLICT (po_number) DO NOTHING;
    END IF;

    IF v_sun_id IS NOT NULL THEN
        INSERT INTO public.supply_chain_orders (po_number, vendor_id, items_summary, location, total_amount, delivery_date, status)
        VALUES 
        ('PO-SUN-GOLD', v_v_dulux, 'Sơn Dulux Professional trang trí', 'Sunshine City', 1500000000, '2020-05-20', 'Completed')
        ON CONFLICT (po_number) DO NOTHING;
    END IF;

END $$;
