-- =====================================================
-- STEP 1: Create Projects Table First
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table (required for foreign keys)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    manager VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    budget DECIMAL(18, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update projects" ON projects FOR UPDATE TO authenticated USING (true);

-- Insert sample project for testing
INSERT INTO projects (code, name, location, manager, status, budget, start_date, end_date)
VALUES 
    ('PR-2024-001', 'Trường Tiểu học Tiên Sơn', 'Huyện Sóc Sơn, Hà Nội', 'UBND Huyện Sóc Sơn', 'active', 15000000000, '2024-01-15', '2024-12-31'),
    ('PR-2024-002', 'Cầu Vượt Láng Hạ', 'Quận Đống Đa, Hà Nội', 'Sở Giao thông Vận tải', 'active', 45000000000, '2024-02-01', '2025-06-30')
ON CONFLICT (code) DO NOTHING;
