-- Add budget_category column to contracts table
-- This links expense contracts to budget categories for auto-calculation

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS budget_category TEXT;

-- Add comment for documentation
COMMENT ON COLUMN contracts.budget_category IS 'Links expense contracts to budget categories: Vật tư (Materials), Nhân công (Labor), Máy thi công (Equipment), Chi phí quản lý (Overhead), Chi phí khác (Other)';
