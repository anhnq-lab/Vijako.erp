-- Migration: Add multi-level approval workflows
-- Description: Adds tables for workflows, steps, and request progress. Includes automation function.

-- 1. Create approval_workflows table
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create approval_workflow_steps table
CREATE TABLE IF NOT EXISTS public.approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name TEXT NOT NULL, -- e.g. "Trưởng bộ phận", "Giám đốc"
    approver_role TEXT NOT NULL, -- e.g. "Manager", "Director" - maps to employees.role or logic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workflow_id, step_order)
);

-- 3. Update approval_requests table
ALTER TABLE public.approval_requests 
ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.approval_workflows(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS current_step_id UUID; -- Will link to approval_request_steps.id (or workflow_steps.id depending on design, let's use workflow_steps.id for tracking definition)

-- 4. Create approval_request_steps table (Instantiated steps for a specific request)
CREATE TABLE IF NOT EXISTS public.approval_request_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES public.approval_workflow_steps(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    approver_id UUID REFERENCES public.employees(id), -- The actual person who approved
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_steps ENABLE ROW LEVEL SECURITY;

-- Public access policies (for development simplicity as requested)
-- Public access policies (for development simplicity as requested)
DROP POLICY IF EXISTS "Public read workflows" ON public.approval_workflows;
CREATE POLICY "Public read workflows" ON public.approval_workflows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read workflow steps" ON public.approval_workflow_steps;
CREATE POLICY "Public read workflow steps" ON public.approval_workflow_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read request steps" ON public.approval_request_steps;
CREATE POLICY "Public read request steps" ON public.approval_request_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert request steps" ON public.approval_request_steps;
CREATE POLICY "Public insert request steps" ON public.approval_request_steps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update request steps" ON public.approval_request_steps;
CREATE POLICY "Public update request steps" ON public.approval_request_steps FOR UPDATE USING (true);

-- 5. Automation: Generate Request Steps on Request Creation
CREATE OR REPLACE FUNCTION public.fn_initialize_approval_steps()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run if workflow_id is present
    IF NEW.workflow_id IS NOT NULL THEN
        -- Insert steps for this request based on the workflow definition
        INSERT INTO public.approval_request_steps (request_id, step_id, status)
        SELECT 
            NEW.id,
            s.id,
            'pending' -- All start as pending, or logic to set first as pending and others as 'waiting' 
        FROM public.approval_workflow_steps s
        WHERE s.workflow_id = NEW.workflow_id
        ORDER BY s.step_order;

        -- Set the current_step to the first step (lowest order)
        UPDATE public.approval_requests
        SET current_step_id = (
            SELECT id FROM public.approval_workflow_steps 
            WHERE workflow_id = NEW.workflow_id 
            ORDER BY step_order ASC LIMIT 1
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_initialize_approval_steps ON public.approval_requests;
CREATE TRIGGER tr_initialize_approval_steps
AFTER INSERT ON public.approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.fn_initialize_approval_steps();


-- 6. Automation: Handle Step Approval/Rejection
CREATE OR REPLACE FUNCTION public.fn_handle_step_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_workflow_id UUID;
    v_current_step_order INTEGER;
    v_next_step_id UUID;
BEGIN
    -- Get workflow context
    SELECT ar.workflow_id INTO v_workflow_id
    FROM public.approval_requests ar
    WHERE ar.id = NEW.request_id;

    -- If Rejected, Reject entire request
    IF NEW.status = 'rejected' THEN
        UPDATE public.approval_requests
        SET status = 'rejected', updated_at = now()
        WHERE id = NEW.request_id;
    END IF;

    -- If Approved, Check for next step or Complete
    IF NEW.status = 'approved' THEN
        -- Get order of the step just approved
        SELECT step_order INTO v_current_step_order
        FROM public.approval_workflow_steps
        WHERE id = NEW.step_id;

        -- Find next step
        SELECT id INTO v_next_step_id
        FROM public.approval_workflow_steps
        WHERE workflow_id = v_workflow_id
        AND step_order > v_current_step_order
        ORDER BY step_order ASC
        LIMIT 1;

        IF v_next_step_id IS NOT NULL THEN
            -- Move to next step
            UPDATE public.approval_requests
            SET current_step_id = v_next_step_id, updated_at = now()
            WHERE id = NEW.request_id;
        ELSE
            -- No more steps, approve entire request
            UPDATE public.approval_requests
            SET status = 'approved', current_step_id = NULL, updated_at = now()
            WHERE id = NEW.request_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_handle_step_approval ON public.approval_request_steps;
CREATE TRIGGER tr_handle_step_approval
AFTER UPDATE OF status ON public.approval_request_steps
FOR EACH ROW
WHEN (old.status = 'pending' AND new.status IN ('approved', 'rejected'))
EXECUTE FUNCTION public.fn_handle_step_approval();


-- Seed initial Workflows
-- Seed initial Workflows (Idempotent)
INSERT INTO public.approval_workflows (name, description)
SELECT 'Quy trình tiêu chuẩn', 'Nhân viên -> Trưởng phòng -> Giám đốc'
WHERE NOT EXISTS (SELECT 1 FROM public.approval_workflows WHERE name = 'Quy trình tiêu chuẩn');

INSERT INTO public.approval_workflows (name, description)
SELECT 'Quy trình rút gọn', 'Nhân viên -> Trưởng phòng'
WHERE NOT EXISTS (SELECT 1 FROM public.approval_workflows WHERE name = 'Quy trình rút gọn');

-- Seed Steps for 'Quy trình tiêu chuẩn'
DO $$
DECLARE
    v_wf_std_id UUID;
    v_wf_short_id UUID;
BEGIN
    SELECT id INTO v_wf_std_id FROM public.approval_workflows WHERE name = 'Quy trình tiêu chuẩn' LIMIT 1;
    SELECT id INTO v_wf_short_id FROM public.approval_workflows WHERE name = 'Quy trình rút gọn' LIMIT 1;

    -- Steps for Standard Flow
    INSERT INTO public.approval_workflow_steps (workflow_id, step_order, name, approver_role) VALUES
    (v_wf_std_id, 1, 'Trưởng phòng duyệt', 'Manager'),
    (v_wf_std_id, 2, 'Kế toán trưởng kiểm soát', 'Chief Accountant'),
    (v_wf_std_id, 3, 'Giám đốc phê duyệt', 'Director')
    ON CONFLICT (workflow_id, step_order) 
    DO UPDATE SET name = EXCLUDED.name, approver_role = EXCLUDED.approver_role;

    -- Steps for Short Flow
    INSERT INTO public.approval_workflow_steps (workflow_id, step_order, name, approver_role) VALUES
    (v_wf_short_id, 1, 'Trưởng bộ phận', 'Manager'),
    (v_wf_short_id, 2, 'Ban Giám đốc', 'Director')
    ON CONFLICT (workflow_id, step_order) 
    DO UPDATE SET name = EXCLUDED.name, approver_role = EXCLUDED.approver_role;
END $$;
