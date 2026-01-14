import { supabase } from '../lib/supabase';
import { Vendor, PurchaseOrder, InventoryItem } from '../../types';

export const supplyChainService = {
    // Vendors
    async getAllVendors(): Promise<Vendor[]> {
        const { data, error } = await supabase
            .from('supply_chain_vendors')
            .select('*')
            .order('rating', { ascending: false });

        if (error) {
            console.error('Error fetching vendors:', error);
            throw error;
        }
        return data || [];
    },

    // Purchase Orders
    async getAllOrders(): Promise<PurchaseOrder[]> {
        const { data, error } = await supabase
            .from('supply_chain_orders')
            .select(`
                *,
                vendor:vendor_id (name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }

        // Map vendor name to flatten structure if needed, or keep as is.
        // For simple display, let's map it.
        return (data || []).map((item: any) => ({
            ...item,
            vendor_name: item.vendor?.name || 'Unknown'
        }));
    },

    // Inventory
    async getAllInventory(): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('supply_chain_inventory')
            .select('*')
            .order('status', { ascending: true }); // Low stock first (alphabetically L < N ?) No, 'Low' < 'Normal'. So Low first.

        if (error) {
            console.error('Error fetching inventory:', error);
            throw error;
        }
        return data || [];
    }
};
