-- Create project_wbs table
CREATE TABLE IF NOT EXISTS public.project_wbs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('active', 'done', 'delayed', 'pending')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_issues table
CREATE TABLE IF NOT EXISTS public.project_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('NCR', 'RFI', 'General')),
    title TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT CHECK (status IN ('Open', 'Closed', 'Resolved')),
    due_date DATE,
    pic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_budget table
CREATE TABLE IF NOT EXISTS public.project_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    budget_amount NUMERIC DEFAULT 0,
    actual_amount NUMERIC DEFAULT 0,
    committed_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_wbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public access for demo)
CREATE POLICY "Allow public read access on project_wbs" ON public.project_wbs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_wbs" ON public.project_wbs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_wbs" ON public.project_wbs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_wbs" ON public.project_wbs FOR DELETE USING (true);

CREATE POLICY "Allow public read access on project_issues" ON public.project_issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_issues" ON public.project_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_issues" ON public.project_issues FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_issues" ON public.project_issues FOR DELETE USING (true);

CREATE POLICY "Allow public read access on project_budget" ON public.project_budget FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on project_budget" ON public.project_budget FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on project_budget" ON public.project_budget FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on project_budget" ON public.project_budget FOR DELETE USING (true);

-- Seed Data (Insert data for the first project found)
DO $$
DECLARE
    v_project_id UUID;
BEGIN
    SELECT id INTO v_project_id FROM public.projects LIMIT 1;

    IF v_project_id IS NOT NULL THEN
        -- Seed WBS
        INSERT INTO public.project_wbs (project_id, name, level, progress, start_date, end_date, status, assigned_to) VALUES
        (v_project_id, 'Phần ngầm (Substructure)', 0, 100, '2023-01-01', '2023-03-30', 'done', 'Ban chỉ huy'),
        (v_project_id, 'Đào đất hố móng C1', 1, 100, '2023-01-05', '2023-01-20', 'done', 'Đội xe máy'),
        (v_project_id, 'Phần thân (Superstructure)', 0, 45, '2023-04-01', '2023-12-30', 'active', 'Ban chỉ huy'),
        (v_project_id, 'Bê tông cột vách T5', 1, 75, '2023-06-01', '2023-06-15', 'active', 'Tổ đội 1'),
        (v_project_id, 'Xây trát hoàn thiện T8', 1, 0, '2023-08-01', '2023-09-15', 'pending', 'Tổ đội 2');

        -- Seed Issues
        INSERT INTO public.project_issues (project_id, code, type, title, priority, status, due_date, pic) VALUES
        (v_project_id, 'NCR-102', 'NCR', 'Sai lệch vị trí thép cột trục 5', 'High', 'Open', '2023-10-25', 'Nguyễn Văn A'),
        (v_project_id, 'RFI-045', 'RFI', 'Xác nhận độ sụt bê tông móng', 'Medium', 'Closed', '2023-09-10', 'Trần Thị B');

        -- Seed Budget
        INSERT INTO public.project_budget (project_id, category, budget_amount, actual_amount, committed_amount) VALUES
        (v_project_id, 'Vật tư (Materials)', 5000000000, 2400000000, 1200000000),
        (v_project_id, 'Nhân công (Labor)', 3000000000, 1500000000, 500000000),
        (v_project_id, 'Máy thi công (Equipment)', 2000000000, 1800000000, 100000000);
    END IF;
END $$;
