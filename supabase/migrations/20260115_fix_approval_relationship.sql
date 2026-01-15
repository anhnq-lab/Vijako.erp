-- Fix missing relationship between approval_requests and projects
-- This is necessary for the frontend to fetch project names (e.g. projects:project_id (name))

-- 1. Add Foreign Key Constraint
ALTER TABLE public.approval_requests
ADD CONSTRAINT approval_requests_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES public.projects (id)
ON DELETE SET NULL;

-- 2. Ensure RLS allows reading (just in case)
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.approval_requests;
CREATE POLICY "Enable read access for all users" ON public.approval_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.approval_requests;
CREATE POLICY "Enable insert access for all users" ON public.approval_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.approval_requests;
CREATE POLICY "Enable update access for all users" ON public.approval_requests FOR UPDATE USING (true);
