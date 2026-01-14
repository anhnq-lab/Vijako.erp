import { supabase } from '../lib/supabase';
import { Alert, AlertType, AlertSeverity } from '../../types';

export const alertService = {
    /**
     * Get all alerts with project info
     */
    async getAllAlerts(): Promise<Alert[]> {
        const { data, error } = await supabase
            .from('alerts')
            .select(`
                *,
                projects:project_id (name, code)
            `)
            .eq('is_dismissed', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }

        return (data || []).map((a: any) => ({
            ...a,
            project_name: a.projects?.name
        }));
    },

    /**
     * Get unread alerts count
     */
    async getUnreadCount(): Promise<number> {
        const { count, error } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .eq('is_dismissed', false);

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }

        return count || 0;
    },

    /**
     * Create a manual alert
     */
    async createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'is_read' | 'is_dismissed'>): Promise<Alert | null> {
        const { data, error } = await supabase
            .from('alerts')
            .insert([alert])
            .select()
            .single();

        if (error) {
            console.error('Error creating alert:', error);
            throw error;
        }

        return data;
    },

    /**
     * Mark alert as read
     */
    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('alerts')
            .update({ is_read: true })
            .eq('id', id);

        if (error) {
            console.error(`Error marking alert ${id} as read:`, error);
            throw error;
        }
    },

    /**
     * Dismiss alert
     */
    async dismissAlert(id: string): Promise<void> {
        const { error } = await supabase
            .from('alerts')
            .update({ is_dismissed: true })
            .eq('id', id);

        if (error) {
            console.error(`Error dismissing alert ${id}:`, error);
            throw error;
        }
    },

    /**
     * Batch generate auto-alerts based on system state
     * This would typically be a background cron job, but we implement the logic here for demo
     */
    async checkAndGenerateAutoAlerts(): Promise<void> {
        // Logic would go here to:
        // 1. Check for overdue tasks
        // 2. Check for expiring bank guarantees
        // 3. Check for high risks
        // 4. Check for documents pending approval
        console.log('Auto-alert generation logic triggered');
    }
};

export default alertService;
