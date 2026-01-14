import { supabase } from '../lib/supabase';

export interface Employee {
    id: string;
    employee_code: string;
    full_name: string;
    role: string;
    department: string;
    site: string;
    status: 'active' | 'leave' | 'inactive';
    last_checkin?: string;
}

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
    }
};
