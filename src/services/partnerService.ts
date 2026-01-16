import { supabase } from '../lib/supabase';
import { Partner } from '../../types';

export const partnerService = {
    // Get all partners
    async getAllPartners() {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Partner[];
    },

    // Get partners by type
    async getPartnersByType(type: Partner['type']) {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .eq('type', type)
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Partner[];
    },

    // Create partner
    async createPartner(partner: Omit<Partner, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('partners')
            .insert(partner)
            .select()
            .single();

        if (error) throw error;
        return data as Partner;
    },

    // Update partner
    async updatePartner(id: string, updates: Partial<Partner>) {
        const { data, error } = await supabase
            .from('partners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Partner;
    },

    // Delete partner
    async deletePartner(id: string) {
        const { error } = await supabase
            .from('partners')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
