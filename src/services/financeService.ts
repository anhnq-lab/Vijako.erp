import { supabase } from '../lib/supabase';

export interface Contract {
    id: string;
    contract_code: string;
    partner_name: string;
    project_id: string;
    value: number;
    paid_amount: number;
    retention_amount: number;
    status: 'active' | 'completed' | 'terminated';
    is_risk: boolean;
}

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

        return (data as Contract[]) || [];
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
