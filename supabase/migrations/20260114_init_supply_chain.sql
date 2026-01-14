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
    po_number TEXT NOT NULL UNIQUE, -- e.g., PO-2023-089
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

-- Create basic policies (allow all authenticated users to read/write for now)
CREATE POLICY "Allow all access to supply_chain_vendors" ON public.supply_chain_vendors FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to supply_chain_orders" ON public.supply_chain_orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to supply_chain_inventory" ON public.supply_chain_inventory FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Seed Data for Vendors
INSERT INTO public.supply_chain_vendors (name, category, rating, total_projects, last_evaluation, status) VALUES
('Bê tông Việt Úc', 'Vật liệu xây dựng', 4.8, 12, '10/2023 - Tốt', 'approved'),
('Thép Hòa Phát', 'Vật liệu xây dựng', 5.0, 24, '09/2023 - Xuất sắc', 'approved'),
('Nhà thầu Cơ điện M&E X', 'Thầu phụ thi công', 2.1, 2, '08/2023 - Chậm tiến độ', 'restricted'),
('Sơn Dulux (Đại lý cấp 1)', 'Hoàn thiện', 4.2, 5, '05/2023 - Khá', 'approved');

-- Seed Data for Orders (using temporary variables for vendor IDs would be ideal, but for simplicity we will insert independently or fetch first. 
-- However, since we need valid FKs, let's use a DO block to insert related data consistently)
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
    ('PO-2023-091', v_vendor_paint, 'Sơn nội thất (50 Thùng)', 'Aeon Mall', 125000000, '2024-05-28', 'Pending');
END $$;

-- Seed Data for Inventory
INSERT INTO public.supply_chain_inventory (code, name, category, warehouse, quantity, unit, min_quantity) VALUES
('STL-D20-HP', 'Thép Hòa Phát D20 CB400', 'Steel', 'Kho Vijako Tower', 12500, 'kg', 2000),
('CEM-PCB40', 'Xi măng Vicem PCB40', 'Cement', 'Kho The Nine', 50, 'bao', 200),
('STL-D10-HP', 'Thép Hòa Phát D10 CB300', 'Steel', 'Kho Vijako Tower', 5600, 'kg', 1000),
('BRK-TN-A1', 'Gạch Tuynel A1', 'Brick', 'Kho Aeon Mall', 12000, 'viên', 5000);
