-- Migration: Add missing columns to employees table
-- Description: Adds phone, email, date_joined, salary, site, status, department columns

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS date_joined DATE,
ADD COLUMN IF NOT EXISTS salary NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'leave', 'resigned', 'terminated')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
