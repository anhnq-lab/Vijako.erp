import { supabase } from '../lib/supabase';
import { BiddingPackage, BiddingQuote } from '../../types';

export const biddingService = {
    async getAllPackages(): Promise<BiddingPackage[]> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .select('*, projects(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bidding packages:', error);
            throw error;
        }

        return (data || []).map(pkg => ({
            ...pkg,
            project_name: (pkg.projects as any)?.name
        }));
    },

    async getPackageById(id: string): Promise<BiddingPackage | null> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .select('*, projects(name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching bidding package ${id}:`, error);
            return null;
        }

        return { ...data, project_name: (data.projects as any)?.name };
    },

    async createPackage(pkg: Omit<BiddingPackage, 'id'>): Promise<BiddingPackage | null> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .insert(pkg)
            .select()
            .single();

        if (error) {
            console.error('Error creating bidding package:', error);
            throw error;
        }

        return data;
    },

    async updatePackage(id: string, updates: Partial<BiddingPackage>): Promise<BiddingPackage | null> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating bidding package ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deletePackage(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('bidding_packages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting bidding package ${id}:`, error);
            throw error;
        }

        return true;
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

    async createQuote(quote: Omit<BiddingQuote, 'id'>): Promise<BiddingQuote | null> {
        const { data, error } = await supabase
            .from('bidding_quotes')
            .insert(quote)
            .select()
            .single();

        if (error) {
            console.error('Error creating quote:', error);
            throw error;
        }

        return data;
    },

    async updateQuote(id: string, updates: Partial<BiddingQuote>): Promise<BiddingQuote | null> {
        const { data, error } = await supabase
            .from('bidding_quotes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating quote ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteQuote(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('bidding_quotes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting quote ${id}:`, error);
            throw error;
        }

        return true;
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
