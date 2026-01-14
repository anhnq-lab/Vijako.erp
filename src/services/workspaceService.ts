import { supabase } from '../lib/supabase';

export interface UserTask {
    id: string;
    title: string;
    sub: string;
    time: string;
    status: 'done' | 'active' | 'pending';
    type: 'meeting' | 'site' | 'doc';
    file?: string;
    priority?: 'high' | 'normal';
}

export interface UserNote {
    id: string;
    content: string;
}

export const workspaceService = {
    // --- Tasks management ---
    async getTasks(): Promise<UserTask[]> {
        const { data, error } = await supabase
            .from('user_tasks')
            .select('*')
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        return data || [];
    },

    async updateTaskStatus(id: string, status: 'done' | 'active' | 'pending'): Promise<UserTask | null> {
        const { data, error } = await supabase
            .from('user_tasks')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating task status:', error);
            return null;
        }

        return data;
    },

    async deleteTask(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('user_tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            return false;
        }

        return true;
    },

    // --- Notes management ---
    async getNote(): Promise<UserNote | null> {
        const { data, error } = await supabase
            .from('user_notes')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching note:', error);
            return null;
        }

        return data;
    },

    async saveNote(content: string): Promise<UserNote | null> {
        const existing = await this.getNote();

        if (existing) {
            const { data, error } = await supabase
                .from('user_notes')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating note:', error);
                return null;
            }
            return data;
        } else {
            const { data, error } = await supabase
                .from('user_notes')
                .insert({ content })
                .select()
                .single();

            if (error) {
                console.error('Error creating note:', error);
                return null;
            }
            return data;
        }
    },

    // --- Check-in management ---
    async getCheckInStatus(employeeCode: string = 'VJ-0056'): Promise<any> {
        const today = new Date().toISOString().split('T')[0];
        const { data: employee } = await supabase
            .from('employees')
            .select('id')
            .eq('employee_code', employeeCode)
            .single();

        if (!employee) return null;

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', employee.id)
            .gte('check_in', `${today}T00:00:00`)
            .lte('check_in', `${today}T23:59:59`)
            .maybeSingle();

        if (error) {
            console.error('Error fetching check-in status:', error);
            return null;
        }

        return data;
    },

    async toggleCheckIn(employeeCode: string = 'VJ-0056'): Promise<boolean> {
        const status = await this.getCheckInStatus(employeeCode);
        const { data: employee } = await supabase
            .from('employees')
            .select('id')
            .eq('employee_code', employeeCode)
            .single();

        if (!employee) return false;

        if (status) {
            // Check out if check-in exists but no check-out
            if (!status.check_out) {
                await supabase
                    .from('attendance')
                    .update({ check_out: new Date().toISOString() })
                    .eq('id', status.id);
                return true;
            }
            return false;
        } else {
            // Check in
            await supabase
                .from('attendance')
                .insert({
                    employee_id: employee.id,
                    check_in: new Date().toISOString(),
                    status: 'present'
                });
            return true;
        }
    }
};
