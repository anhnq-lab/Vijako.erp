import { supabase } from '../lib/supabase';
import { ApprovalRequest, ApprovalStatus } from '../../types';
import { mockApprovals } from '../mock/workspaceData';

export const approvalService = {
    async getApprovalRequests() {
        // Mock data
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockApprovals), 400);
        }) as Promise<ApprovalRequest[]>;
        /*
        const { data, error } = await supabase
            .from('approval_requests')
            .select(`
        *,
        projects:project_id (name)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching approval requests:', error);
            throw error;
        }

        return (data || []).map(item => ({
            ...item,
            project_name: item.projects?.name
        })) as ApprovalRequest[];
        */
    },

    async getApprovalRequestById(id: string) {
        const { data, error } = await supabase
            .from('approval_requests')
            .select(`
        *,
        projects:project_id (name),
        approval_request_steps (
          id,
          step_id,
          status,
          approver_id,
          approved_at,
          comments,
          created_at,
          approval_workflow_steps (
            name,
            approver_role
          ),
          approver:approver_id (full_name)
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching approval request:', error);
            throw error;
        }

        // Transform nested steps
        const steps = (data.approval_request_steps || []).map((step: any) => ({
            ...step,
            step_name: step.approval_workflow_steps?.name,
            approver_role: step.approval_workflow_steps?.approver_role,
            approver_name: step.approver?.full_name
        })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return {
            ...data,
            project_name: data.projects?.name,
            steps: steps
        } as ApprovalRequest & { steps?: any[] };
    },

    async createApprovalRequest(request: Partial<ApprovalRequest>) {
        const { data, error } = await supabase
            .from('approval_requests')
            .insert([
                {
                    ...request,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating approval request:', error);
            throw error;
        }

        return data as ApprovalRequest;
    },

    async updateApprovalStatus(id: string, status: ApprovalStatus) {
        const { data, error } = await supabase
            .from('approval_requests')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating approval status:', error);
            throw error;
        }

        return data as ApprovalRequest;
    },

    // --- New Workflow Methods ---

    async getWorkflows() {
        const { data, error } = await supabase
            .from('approval_workflows')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    },

    async updateStepStatus(stepId: string, status: ApprovalStatus, approverId: string, comments?: string) {
        const { data, error } = await supabase
            .from('approval_request_steps')
            .update({
                status,
                approver_id: approverId,
                approved_at: new Date().toISOString(),
                comments,
            })
            .eq('id', stepId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
