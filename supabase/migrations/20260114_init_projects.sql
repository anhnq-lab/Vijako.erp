-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
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
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (simplified for now, adjust later)
CREATE POLICY "Public access" ON projects FOR ALL USING (true);

-- Insert mock data seed
INSERT INTO projects (code, name, location, manager, progress, plan_progress, status)
VALUES 
('P-001', 'Vijako Tower - Giai đoạn 2', 'KĐT Tây Hồ Tây, Hà Nội', 'Nguyễn Quốc Anh', 45, 48, 'active'),
('P-002', 'Khu Công nghiệp Trấn Yên', 'Trấn Yên, Yên Bái', 'Trần Văn Bình', 80, 75, 'active'),
('P-003', 'The Nine Tower', 'Cầu Giấy, Hà Nội', 'Lê Văn Cường', 100, 100, 'completed'),
('P-004', 'Aeon Mall Huế', 'TP. Huế', 'Phạm Văn Dũng', 10, 15, 'pending');
