-- Migration: Setup Procurement (Material Requests)
-- Description: Adds tables for Material Requests (PR) and Request Items.

-- 1. Create Purchase Requests Table
CREATE TABLE IF NOT EXISTS material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    request_code TEXT NOT NULL UNIQUE, -- PR-001, PR-002...
    requester_id UUID REFERENCES employees(id), -- Link to employee who requested
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Normal', -- Low, Normal, High, Urgent
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, ordered, received
    delivery_date DATE, -- Expected delivery
    
    -- Statistics
    total_items INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES employees(id)
);

-- 2. Create Request Items Table
CREATE TABLE IF NOT EXISTS material_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    unit TEXT, -- kg, m3, cai...
    quantity NUMERIC NOT NULL DEFAULT 0,
    estimated_price NUMERIC, -- Optional estimated unit price
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_request_items ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Open for now, app logic handles RBAC)
-- Requests
CREATE POLICY "Enable read access for all users" ON material_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON material_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON material_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON material_requests FOR DELETE USING (true);

-- Items
CREATE POLICY "Enable read access for all users" ON material_request_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON material_request_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON material_request_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON material_request_items FOR DELETE USING (true);

-- 5. Auto-update updated_at trigger
-- (Assuming standard Supabase helper exists or we make one, but skipping for brevity as commonly present)

-- 6. Add notification trigger (Placeholde)
-- COMMENT: 'Trigger for notification system to alert PM on new pending request'
