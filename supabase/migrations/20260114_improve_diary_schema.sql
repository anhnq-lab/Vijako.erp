-- Add new columns to daily_logs for detailed tracking
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
ADD COLUMN IF NOT EXISTS manpower_details JSONB DEFAULT '[]', --Array of { role: "Mason", count: 5, company: "Subcon A" }
ADD COLUMN IF NOT EXISTS equipment_details JSONB DEFAULT '[]', -- Array of { name: "Crane", count: 1, status: "Working" }
ADD COLUMN IF NOT EXISTS safety_details TEXT;

-- Add index for date querying which will be common
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date ON daily_logs(project_id, date);
