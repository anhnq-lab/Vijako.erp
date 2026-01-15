-- Migration: Seed Admin User Profile
-- Description: Creates the employee profile for the main Admin account.

INSERT INTO public.employees (employee_code, full_name, role, department, site, status, email, avatar_url, is_admin)
VALUES 
(
    'VJ-ADMIN', 
    'Nguyễn Quốc Anh', 
    'Giám đốc', 
    'Ban Giám đốc', 
    'Vijako Tower', 
    'active', 
    'admin@vijako.com.vn',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    true
)
ON CONFLICT (employee_code) 
DO UPDATE SET 
    email = EXCLUDED.email,
    is_admin = true,
    avatar_url = EXCLUDED.avatar_url;

-- Ensure the email is unique
-- If there was another user with this email (e.g. from previous manual insert), we might want to handle it, 
-- but employee_code unique constraint handles the main conflict. 
-- Let's also update the existing user link if we can (manual step usually).
