import { supabase } from '../lib/supabase';
import { BiddingPackage, BiddingQuote } from '../../types';

export const biddingService = {
    async getAllPackages(): Promise<BiddingPackage[]> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bidding packages:', error);
            throw error;
        }

        return (data as BiddingPackage[]) || [];
    },

    async getQuotesByPackage(packageId: string): Promise<BiddingQuote[]> {
        const { data, error } = await supabase
            .from('bidding_quotes')
            .select(`
                *,
                vendor:vendor_id (name)
            `)
            .eq('package_id', packageId)
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching quotes:', error);
            throw error;
        }

        return (data || []).map((q: any) => ({
            ...q,
            vendor_name: q.vendor?.name || 'Unknown'
        }));
    },

    async publishPackage(id: string) {
        const { data, error } = await supabase
            .from('bidding_packages')
            .update({ status: 'published' })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error publishing package:', error);
            throw error;
        }

        return data;
    },

    async awardQuote(quoteId: string, packageId: string) {
        // Start a transaction-like update
        const { error: quoteError } = await supabase
            .from('bidding_quotes')
            .update({ status: 'awarded' })
            .eq('id', quoteId);

        if (quoteError) throw quoteError;

        const { error: pkgError } = await supabase
            .from('bidding_packages')
            .update({ status: 'awarded' })
            .eq('id', packageId);

        if (pkgError) throw pkgError;

        return true;
    }
};
