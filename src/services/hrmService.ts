import { supabase } from '../lib/supabase';
import { Employee, Attendance } from '../../types';

export const hrmService = {
    async getAllEmployees(): Promise<Employee[]> {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('employee_code', { ascending: true });

        if (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }

        return (data as Employee[]) || [];
    },

    async createEmployee(employee: Omit<Employee, 'id'>) {
        const { data, error } = await supabase
            .from('employees')
            .insert(employee)
            .select()
            .single();

        if (error) {
            console.error('Error creating employee:', error);
            throw error;
        }

        return data;
    },

    async checkIn(attendance: Omit<Attendance, 'id' | 'status'>) {
        const { data, error } = await supabase
            .from('attendance')
            .insert({ ...attendance, status: 'present' })
            .select()
            .single();

        if (error) {
            console.error('Error checking in:', error);
            throw error;
        }

        // Update employee's last checkin
        await supabase
            .from('employees')
            .update({ last_checkin: attendance.check_in })
            .eq('id', attendance.employee_id);

        return data;
    },

    async checkOut(id: string, checkOutTime: string) {
        const { data, error } = await supabase
            .from('attendance')
            .update({ check_out: checkOutTime })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error checking out:', error);
            throw error;
        }

        return data;
    }
};
