-- Migration: Setup Auth and RBAC
-- Description: Links employees table to auth.users, adds profile fields, and sets up RLS.

-- 1. Add Auth User Mapping to Employees
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Enable RLS on employees (already enabled in previous migrations but good to ensure)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Employees
-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.employees;
CREATE POLICY "Users can view own profile" 
ON public.employees FOR SELECT 
USING (auth.uid() = user_id);

-- Allow public read access to employees (for directory/mentions, usually needed in ERPs)
-- Or restrict to authenticated users only? Let's restrict to authenticated users for better security.
DROP POLICY IF EXISTS "Authenticated users can view all employees" ON public.employees;
CREATE POLICY "Authenticated users can view all employees" 
ON public.employees FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own profile (e.g. avatar, but maybe not role/dept)
DROP POLICY IF EXISTS "Users can update own profile" ON public.employees;
CREATE POLICY "Users can update own profile" 
ON public.employees FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins (or specific roles) to manage employees - For now, let's keep it simple or use a service key for admin tasks.
-- Setup a trigger to auto-create employee record on auth.user creation? 
-- In this ERP, it's likely the HR creates the Employee record FIRST, then we "Link" it to an Auth User later.
-- OR we auto-link by email if they match.

-- 4. Function to auto-link Employee to Auth User on Login/Signup if emails match
CREATE OR REPLACE FUNCTION public.fn_link_employee_to_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Update employee record with the new user_id if email matches
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE email = NEW.email AND (user_id IS NULL OR user_id = NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (Note: triggers on auth.users are tricky in Supabase pure SQL migrations sometimes, 
-- but this is standard practice if we have access).
-- If we cannot run this on auth.users directly via dashboard SQL editor, we might need to rely on the backend to do the linking.
-- However, let's try to define it.
-- DROP TRIGGER IF EXISTS tr_link_employee_on_signup ON auth.users;
-- CREATE TRIGGER tr_link_employee_on_signup
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.fn_link_employee_to_user();

-- NOTE: Since we are running this likely via client migration tool which might not have permissions on `auth` schema,
-- we'll rely on a manual "Link" or a backend function `linkUser(email)` that admin calls.
-- BUT, `handle_new_user` is a common pattern.

-- Let's at least update our specific test user "Nguyễn Quốc Anh" to have an email that we can test with.
-- Assuming the user will sign up with 'quocanh@vijako.com' or similar.
UPDATE public.employees
SET email = 'anhnq@vijako.com.vn'
WHERE employee_code = 'VJ-0056';

UPDATE public.employees
SET email = 'binhtt@vijako.com.vn'
WHERE employee_code = 'VJ-0112';

