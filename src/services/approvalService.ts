import { supabase } from '../lib/supabase';
import { ApprovalRequest, ApprovalStatus } from '../types';

export const approvalService = {
    async getApprovalRequests() {
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
    },

    async getApprovalRequestById(id: string) {
        const { data, error } = await supabase
            .from('approval_requests')
            .select(`
        *,
        projects:project_id (name)
      `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching approval request:', error);
            throw error;
        }

        return {
            ...data,
            project_name: data.projects?.name
        } as ApprovalRequest;
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
    }
};
