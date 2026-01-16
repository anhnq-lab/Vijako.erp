import { supabase } from '../lib/supabase';
import { MaterialRequest, MaterialRequestItem } from '../../types';

export const supplyChainService = {
    // --- Procurement (Material Requests) ---
    // Get all requests (optionally filter by project)
    async getRequests(projectId?: string) {
        let query = supabase
            .from('material_requests')
            .select(`
        *,
        project:projects(name),
        requester:employees(full_name)
      `)
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Map joined fields
        return data.map((item: any) => ({
            ...item,
            project_name: item.project?.name,
            requester_name: item.requester?.full_name
        }));
    },

    // Get single request detail
    async getRequestById(id: string) {
        const { data, error } = await supabase
            .from('material_requests')
            .select(`
        *,
        project:projects(name),
        requester:employees(full_name),
        items:material_request_items(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return {
            ...data,
            project_name: data.project?.name,
            requester_name: data.requester?.full_name
        };
    },

    // Create Request
    async createRequest(requestData: Partial<MaterialRequest>, items: Partial<MaterialRequestItem>[]) {
        // 1. Create Header
        const { data: request, error } = await supabase
            .from('material_requests')
            .insert({
                ...requestData,
                status: 'pending',
                request_code: `PR-${Date.now().toString().slice(-6)}` // Simple auto-gen
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Create Items
        if (items.length > 0) {
            const itemsWithId = items.map(item => ({
                ...item,
                request_id: request.id
            }));

            const { error: itemsError } = await supabase
                .from('material_request_items')
                .insert(itemsWithId);

            if (itemsError) throw itemsError;
        }

        // 3. Notify Admins/Approvers
        // In a real app, this should be a DB Trigger or Edge Function.
        // Here we use client-side logic for demo purposes.
        const { notificationService } = require('./notificationService'); // Lazy require to avoid circular dependency if any

        // Notify all Admins and Project Managers
        notificationService.notifyRole('Admin', 'Yêu cầu Vật tư mới', `Một PR mới (${request.request_code}) vừa được tạo.`, '/supply?tab=requests');
        notificationService.notifyRole('Project Manager', 'Yêu cầu Vật tư mới', `Một PR mới (${request.request_code}) vừa được tạo.`, '/supply?tab=requests');

        return request;
    },

    // Update Status (Approve/Reject)
    async updateStatus(id: string, status: string, approverId?: string) {
        const updates: any = { status };
        if (status === 'approved') {
            updates.approved_at = new Date().toISOString();
            if (approverId) updates.approved_by = approverId;
        }

        const { data, error } = await supabase
            .from('material_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- Existing Methods (Restored) ---
    // Mock implementations or Supabase calls if tables exist
    // Assuming tables: vendors, purchase_orders, inventory
    async getAllVendors() {
        const { data, error } = await supabase.from('vendors').select('*');
        // If table doesn't exist, return empty array to prevent crash
        if (error) return [];
        return data;
    },

    async getAllOrders() {
        const { data, error } = await supabase.from('purchase_orders').select('*');
        if (error) return [];
        return data;
    },

    async getAllInventory() {
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) return [];
        return data;
    },

    async createOrder(order: any) {
        const { data, error } = await supabase.from('purchase_orders').insert(order).select().single();
        if (error) throw error;
        return data;
    },

    async updateInventoryQuantity(id: string, newQuantity: number) {
        const { data, error } = await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', id);
        if (error) throw error;
        return data;
    }
};
