-- Create daily_logs table for Construction Diary
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather JSONB, -- { "temp": 30, "condition": "Sunny", "humidity": 70 }
    manpower_total INTEGER DEFAULT 0,
    work_content TEXT,
    issues TEXT,
    images TEXT[], -- Array of image URLs
    progress_update JSONB, -- { "wbs_id": 100, "node_name": "Floor1" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON daily_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON daily_logs FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON daily_logs FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE daily_logs IS 'Stores daily construction logs including weather, manpower, and work content.';
