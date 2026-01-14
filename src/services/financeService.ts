import { supabase } from '../lib/supabase';
import { Contract, BankGuarantee, PaymentRequest, CashFlowData } from '../../types';

export type { Contract, BankGuarantee, PaymentRequest, CashFlowData };

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
    },

    async getAllBankGuarantees(): Promise<BankGuarantee[]> {
        const { data, error } = await supabase
            .from('bank_guarantees')
            .select('*, projects(name)')
            .order('expiry_date', { ascending: true });

        if (error) {
            console.error('Error fetching bank guarantees:', error);
            throw error;
        }

        return (data || []).map(bg => ({
            ...bg,
            project_name: (bg.projects as any)?.name
        }));
    },

    async getAllPaymentRequests(): Promise<PaymentRequest[]> {
        const { data, error } = await supabase
            .from('payment_requests')
            .select('*, contracts(partner_name), projects(name)')
            .order('submission_date', { ascending: false });

        if (error) {
            console.error('Error fetching payment requests:', error);
            throw error;
        }

        return (data || []).map(pr => ({
            ...pr,
            partner_name: (pr.contracts as any)?.partner_name,
            project_name: (pr.projects as any)?.name
        }));
    },

    async getCashFlowData(): Promise<CashFlowData[]> {
        const { data, error } = await supabase
            .from('cash_flow_monthly')
            .select('*')
            .order('year', { ascending: true })
            .order('month_index', { ascending: true });

        if (error) {
            console.error('Error fetching cash flow data:', error);
            throw error;
        }

        return (data || []).map(cf => ({
            name: cf.month_label,
            thu: Number(cf.inflow),
            chi: Number(cf.outflow),
            net: Number(cf.net_flow)
        }));
    }
};
