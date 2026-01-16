import { supabase } from '../lib/supabase';
import { Notification } from '../../types';

export const notificationService = {
    // Get notifications for current user
    async getNotifications() {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    },

    // Mark single as read
    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    // Mark all as read
    async markAllAsRead() {
        // Current user context is handled by RLS policy "Users can update own notifications"
        // We just need to update where is_read is false
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
    },

    // Send notification (Helpers)
    // Note: sending requires knowing the target user's UUID (from auth.users), NOT employee_id.
    // Ideally this is done via Database Function or Edge Function.
    // For Client-side demo where we have "Open RLS for Insert", we need to map EmployeeID -> UserID if we want to notify "PM".
    // This is a common complexity.
    // Workaround: We will use a stored procedure if possible, or just look up if we have the mapping.
    // Since `employees` table has `user_id` (linked in auth v2 migration), we can lookup.

    async sendNotificationToEmployee(employeeId: string, title: string, message: string, link?: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        // 1. Get user_id from employeeId
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('user_id')
            .eq('id', employeeId)
            .single();

        if (empError || !employee?.user_id) {
            console.warn('Cannot send notification: Employee has no linked user account', employeeId);
            return;
        }

        // 2. Insert notification
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: employee.user_id,
                title,
                message,
                link,
                type
            });

        if (error) throw error;
    },

    // Send to Role (e.g. Notify all PMs)
    async notifyRole(role: string, title: string, message: string, link?: string) {
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('user_id')
            .eq('role', role)
            .not('user_id', 'is', null);

        if (empError || !employees) return;

        const notifications = employees.map(emp => ({
            user_id: emp.user_id,
            title,
            message,
            link,
            type: 'info'
        }));

        if (notifications.length > 0) {
            const { error } = await supabase
                .from('notifications')
                .insert(notifications);
            if (error) console.error("Error notifying role", error);
        }
    }
};
