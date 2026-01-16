-- Migration: Enhance Site Diary Schema
-- Description: Adds detailed manpower and equipment tracking tables linked to daily_logs.

-- 1. Daily Log Manpower Table (Chi tiết nhân lực)
CREATE TABLE IF NOT EXISTS daily_log_manpower (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    contractor_name TEXT NOT NULL, -- Nhà thầu phụ hoặc tổ đội
    role TEXT NOT NULL, -- Công việc/Chức danh: Thợ nề, Thợ sắt, Giám sát...
    quantity INTEGER DEFAULT 0, -- Số lượng người
    notes TEXT, -- Ghi chú thêm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daily Log Equipment Table (Chi tiết máy móc)
CREATE TABLE IF NOT EXISTS daily_log_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL, -- Tên máy: Máy xúc, Cần cẩu...
    quantity INTEGER DEFAULT 0, -- Số lượng
    status TEXT DEFAULT 'working', -- working, idle, maintenance
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE daily_log_manpower ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_log_equipment ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Simple open access for authenticated users for now, relying on App-level logic)
-- Manpower
CREATE POLICY "Enable read access for all users" ON daily_log_manpower FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON daily_log_manpower FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON daily_log_manpower FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON daily_log_manpower FOR DELETE USING (true);

-- Equipment
CREATE POLICY "Enable read access for all users" ON daily_log_equipment FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON daily_log_equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON daily_log_equipment FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON daily_log_equipment FOR DELETE USING (true);

-- 5. Add status column to daily_logs if not exists (to track approval workflow)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'status') THEN
        ALTER TABLE daily_logs ADD COLUMN status TEXT DEFAULT 'draft'; -- draft, submitted, approved, rejected
    END IF;
END $$;
