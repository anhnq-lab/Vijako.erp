-- HRM Tables
CREATE TABLE IF NOT EXISTS employees (
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

-- Attendance (Chấm công)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id),
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    site_id TEXT,
    status TEXT DEFAULT 'present'
);

-- Finance Tables
CREATE TABLE IF NOT EXISTS contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_code TEXT UNIQUE NOT NULL,
    partner_name TEXT NOT NULL,
    project_id UUID REFERENCES projects(id),
    value NUMERIC(20, 2) DEFAULT 0,
    paid_amount NUMERIC(20, 2) DEFAULT 0,
    retention_amount NUMERIC(20, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed', 'terminated')) DEFAULT 'active',
    is_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public access" ON employees FOR ALL USING (true);
CREATE POLICY "Public access" ON attendance FOR ALL USING (true);
CREATE POLICY "Public access" ON contracts FOR ALL USING (true);

-- Seed Employees
INSERT INTO employees (employee_code, full_name, role, department, site, status)
VALUES 
('VJ-0056', 'Nguyễn Văn An', 'Chỉ huy trưởng', 'Ban QLDA', 'Vijako Tower', 'active'),
('VJ-0112', 'Trần Thị Bình', 'Kế toán công trường', 'Phòng Kế toán', 'Vijako Tower', 'active'),
('VJ-0089', 'Lê Hoàng Cường', 'Giám sát MEP', 'Kỹ thuật', 'The Nine', 'leave');
