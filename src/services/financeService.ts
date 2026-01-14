import { supabase } from '../lib/supabase';
import { Contract } from '../../types';

export type { Contract }; // Re-export for compatibility if needed

export const financeService = {
    async getAllContracts(): Promise<Contract[]> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contracts:', error);
            throw error;
        }

        return data || [];
    },

    async getContractsByProjectId(projectId: string): Promise<Contract[]> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`Error fetching contracts for project ${projectId}:`, error);
            return [];
        }

        return data || [];
    },

    async createContract(contract: Omit<Contract, 'id'>) {
        const { data, error } = await supabase
            .from('contracts')
            .insert(contract)
            .select()
            .single();

        if (error) {
            console.error('Error creating contract:', error);
            throw error;
        }

        return data;
    }
};
