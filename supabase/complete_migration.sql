-- ==========================================
-- 1. INIT PROJECTS
-- ==========================================

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    manager TEXT,
    progress INTEGER DEFAULT 0,
    plan_progress INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'pending', 'completed', 'delayed')) DEFAULT 'active',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy for all access
DROP POLICY IF EXISTS "Public access" ON public.projects;
CREATE POLICY "Public access" ON public.projects FOR ALL USING (true);

-- Insert mock data seed
INSERT INTO public.projects (code, name, location, manager, progress, plan_progress, status)
VALUES 
('P-001', 'Vijako Tower - Giai đoạn 2', 'KĐT Tây Hồ Tây, Hà Nội', 'Nguyễn Văn An', 45, 48, 'active'),
('P-002', 'Khu Công nghiệp Trấn Yên', 'Trấn Yên, Yên Bái', 'Trần Văn Bình', 80, 75, 'active'),
('P-003', 'The Nine Tower', 'Cầu Giấy, Hà Nội', 'Lê Văn Cường', 100, 100, 'completed'),
('P-004', 'Aeon Mall Huế', 'TP. Huế', 'Phạm Văn Dũng', 10, 15, 'pending')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 2. INIT HRM & FINANCE
-- ==========================================

-- HRM Tables
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    site TEXT,
    status TEXT CHECK (status IN ('active', 'leave', 'inactive')) DEFAULT 'active',
    last_checkin TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    site_id TEXT,
    status TEXT DEFAULT 'present'
);

-- Finance Tables
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_code TEXT UNIQUE NOT NULL,
    partner_name TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    value NUMERIC(20, 2) DEFAULT 0,
    paid_amount NUMERIC(20, 2) DEFAULT 0,
    retention_amount NUMERIC(20, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed', 'terminated')) DEFAULT 'active',
    is_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public access" ON public.employees;
CREATE POLICY "Public access" ON public.employees FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access" ON public.attendance;
CREATE POLICY "Public access" ON public.attendance FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access" ON public.contracts;
CREATE POLICY "Public access" ON public.contracts FOR ALL USING (true);

-- Seed Employees
INSERT INTO public.employees (employee_code, full_name, role, department, site, status)
VALUES 
('VJ-0056', 'Nguyễn Văn An', 'Chỉ huy trưởng', 'Ban QLDA', 'Vijako Tower', 'active'),
('VJ-0112', 'Trần Thị Bình', 'Kế toán công trường', 'Phòng Kế toán', 'Vijako Tower', 'active'),
('VJ-0089', 'Lê Hoàng Cường', 'Giám sát MEP', 'Kỹ thuật', 'The Nine', 'leave')
ON CONFLICT (employee_code) DO NOTHING;


-- ==========================================
-- 3. INIT PROJECT DETAILS
-- ==========================================

-- Create project_wbs table
CREATE TABLE IF NOT EXISTS public.project_wbs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('active', 'done', 'delayed', 'pending')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_issues table
CREATE TABLE IF NOT EXISTS public.project_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('NCR', 'RFI', 'General')),
    title TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT CHECK (status IN ('Open', 'Closed', 'Resolved')),
    due_date DATE,
    pic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_budget table
CREATE TABLE IF NOT EXISTS public.project_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    budget_amount NUMERIC DEFAULT 0,
    actual_amount NUMERIC DEFAULT 0,
    committed_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_wbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for demo)
DROP POLICY IF EXISTS "Allow public read access on project_wbs" ON public.project_wbs;
CREATE POLICY "Allow public read access on project_wbs" ON public.project_wbs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_wbs" ON public.project_wbs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_wbs" ON public.project_wbs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_wbs" ON public.project_wbs FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on project_issues" ON public.project_issues;
CREATE POLICY "Allow public read access on project_issues" ON public.project_issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_issues" ON public.project_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_issues" ON public.project_issues FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_issues" ON public.project_issues FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on project_budget" ON public.project_budget;
CREATE POLICY "Allow public read access on project_budget" ON public.project_budget FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_budget" ON public.project_budget FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_budget" ON public.project_budget FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_budget" ON public.project_budget FOR DELETE USING (true);

-- Seed Data (Insert data for the first project found)
DO $$
DECLARE
    v_project_id UUID;
BEGIN
    SELECT id INTO v_project_id FROM public.projects LIMIT 1;

    IF v_project_id IS NOT NULL THEN
        -- Seed WBS
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_project_id, 'Phần ngầm (Substructure)', 0, 100, '2023-01-01', '2023-03-30', 'done', 'Ban chỉ huy'),
        (v_project_id, 'Đào đất hố móng C1', 1, 100, '2023-01-05', '2023-01-20', 'done', 'Đội xe máy'),
        (v_project_id, 'Phần thân (Superstructure)', 0, 45, '2023-04-01', '2023-12-30', 'active', 'Ban chỉ huy'),
        (v_project_id, 'Bê tông cột vách T5', 1, 75, '2023-06-01', '2023-06-15', 'active', 'Tổ đội 1'),
        (v_project_id, 'Xây trát hoàn thiện T8', 1, 0, '2023-08-01', '2023-09-15', 'pending', 'Tổ đội 2');

        -- Seed Issues
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_project_id, 'NCR-102', 'NCR', 'Sai lệch vị trí thép cột trục 5', 'High', 'Open', '2023-10-25', 'Nguyễn Văn A'),
        (v_project_id, 'RFI-045', 'RFI', 'Xác nhận độ sụt bê tông móng', 'Medium', 'Closed', '2023-09-10', 'Trần Thị B');

        -- Seed Budget
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_project_id, 'Vật tư (Materials)', 5000000000, 2400000000, 1200000000),
        (v_project_id, 'Nhân công (Labor)', 3000000000, 1500000000, 500000000),
        (v_project_id, 'Máy thi công (Equipment)', 2000000000, 1800000000, 100000000);
    END IF;
END $$;


-- ==========================================
-- 4. INIT SUPPLY CHAIN
-- ==========================================

-- Create Vendors table
CREATE TABLE IF NOT EXISTS public.supply_chain_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Vật liệu xây dựng', 'Thầu phụ thi công', 'Hoàn thiện', 'Máy thi công', 'Khác')),
    rating NUMERIC(2, 1) DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    last_evaluation TEXT,
    status TEXT NOT NULL CHECK (status IN ('approved', 'restricted', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Purchase Orders table
CREATE TABLE IF NOT EXISTS public.supply_chain_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE, 
    vendor_id UUID REFERENCES public.supply_chain_vendors(id) ON DELETE SET NULL,
    items_summary TEXT NOT NULL,
    location TEXT NOT NULL,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    delivery_date DATE,
    status TEXT NOT NULL CHECK (status IN ('Delivering', 'Completed', 'Pending', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Inventory table
CREATE TABLE IF NOT EXISTS public.supply_chain_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Steel', 'Cement', 'Brick', 'Other')),
    warehouse TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    min_quantity INTEGER DEFAULT 0,
    status TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN quantity < min_quantity THEN 'Low' 
            ELSE 'Normal' 
        END
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.supply_chain_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_inventory ENABLE ROW LEVEL SECURITY;

-- Create basic policies (ALLOW ALL for demo purposes to avoid auth issues)
DROP POLICY IF EXISTS "Allow all access to supply_chain_vendors" ON public.supply_chain_vendors;
CREATE POLICY "Allow all access to supply_chain_vendors" ON public.supply_chain_vendors FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to supply_chain_orders" ON public.supply_chain_orders;
CREATE POLICY "Allow all access to supply_chain_orders" ON public.supply_chain_orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to supply_chain_inventory" ON public.supply_chain_inventory;
CREATE POLICY "Allow all access to supply_chain_inventory" ON public.supply_chain_inventory FOR ALL USING (true);

-- Seed Data for Vendors
INSERT INTO public.supply_chain_vendors (name, category, rating, total_projects, last_evaluation, status) VALUES
('Bê tông Việt Úc', 'Vật liệu xây dựng', 4.8, 12, '10/2023 - Tốt', 'approved'),
('Thép Hòa Phát', 'Vật liệu xây dựng', 5.0, 24, '09/2023 - Xuất sắc', 'approved'),
('Nhà thầu Cơ điện M&E X', 'Thầu phụ thi công', 2.1, 2, '08/2023 - Chậm tiến độ', 'restricted'),
('Sơn Dulux (Đại lý cấp 1)', 'Hoàn thiện', 4.2, 5, '05/2023 - Khá', 'approved');

-- Seed Data for Orders
DO $$
DECLARE
    v_vendor_steel UUID;
    v_vendor_concrete UUID;
    v_vendor_paint UUID;
BEGIN
    SELECT id INTO v_vendor_steel FROM public.supply_chain_vendors WHERE name = 'Thép Hòa Phát' LIMIT 1;
    SELECT id INTO v_vendor_concrete FROM public.supply_chain_vendors WHERE name = 'Bê tông Việt Úc' LIMIT 1;
    SELECT id INTO v_vendor_paint FROM public.supply_chain_vendors WHERE name LIKE 'Sơn Dulux%' LIMIT 1;

    INSERT INTO public.supply_chain_orders (po_number, vendor_id, items_summary, location, total_amount, delivery_date, status) VALUES
    ('PO-2023-089', v_vendor_steel, 'Thép D20, D25 (40 Tấn)', 'Vijako Tower', 650000000, '2024-05-26', 'Delivering'),
    ('PO-2023-090', v_vendor_concrete, 'Bê tông M350 (120m3)', 'The Nine', 180000000, '2024-05-25', 'Completed'),
    ('PO-2023-091', v_vendor_paint, 'Sơn nội thất (50 Thùng)', 'Aeon Mall', 125000000, '2024-05-28', 'Pending')
    ON CONFLICT (po_number) DO NOTHING;
END $$;

-- Seed Data for Inventory
INSERT INTO public.supply_chain_inventory (code, name, category, warehouse, quantity, unit, min_quantity) VALUES
('STL-D20-HP', 'Thép Hòa Phát D20 CB400', 'Steel', 'Kho Vijako Tower', 12500, 'kg', 2000),
('CEM-PCB40', 'Xi măng Vicem PCB40', 'Cement', 'Kho The Nine', 50, 'bao', 200),
('STL-D10-HP', 'Thép Hòa Phát D10 CB300', 'Steel', 'Kho Vijako Tower', 5600, 'kg', 1000),
('BRK-TN-A1', 'Gạch Tuynel A1', 'Brick', 'Kho Aeon Mall', 12000, 'viên', 5000)
ON CONFLICT (code) DO NOTHING;
