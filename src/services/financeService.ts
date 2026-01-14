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

    async createContract(contract: Omit<Contract, 'id'>): Promise<Contract | null> {
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
    },

    async getContractById(id: string): Promise<Contract | null> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching contract ${id}:`, error);
            return null;
        }

        return data;
    },

    async updateContract(id: string, updates: Partial<Contract>): Promise<Contract | null> {
        const { data, error } = await supabase
            .from('contracts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating contract ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteContract(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting contract ${id}:`, error);
            throw error;
        }

        return true;
    }
};
