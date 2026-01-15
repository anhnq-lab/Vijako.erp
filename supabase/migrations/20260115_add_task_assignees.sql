-- Add assignee_ids to user_tasks
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';

-- Update RLS Policies
-- Policy 1: Users can view tasks they created OR are assigned to
DROP POLICY IF EXISTS "Users can view own tasks" ON public.user_tasks;
CREATE POLICY "Users can view own or assigned tasks" ON public.user_tasks
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = ANY(assignee_ids));

-- Policy 2: Users can update tasks they created OR are assigned to
DROP POLICY IF EXISTS "Users can update own tasks" ON public.user_tasks;
CREATE POLICY "Users can update own or assigned tasks" ON public.user_tasks
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = ANY(assignee_ids));

-- Policy 3: Only creators can delete (optional, or allow assignees too? Let's keep it creator-only for now for safety)
-- Keeping existing delete policy "Users can delete own tasks" which checks user_id matches auth.uid
