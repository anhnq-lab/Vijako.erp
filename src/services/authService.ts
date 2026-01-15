import { supabase } from '../lib/supabase';
import { Employee, User } from '../../types';

export const authService = {
    // Sign in with email and password
    async signIn(email: string, pass: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
        if (error) throw error;
        return data;
    },

    // Sign up new user
    async signUp(email: string, pass: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Get current user details including employee profile
    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        // Fetch associated employee profile
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If no employee record found (maybe admin or unlinked), return basic user info
        // But ideally we want the employee info as main profile
        if (error || !employee) {
            // Fallback or try to link by email if not linked yet (optional auto-healing)
            // For now, return basic info
            return {
                id: user.id,
                email: user.email || '',
            };
        }

        return {
            id: user.id,
            email: user.email || '',
            full_name: employee.full_name,
            avatar_url: employee.avatar_url,
            role: employee.role,
            employee_id: employee.id,
        };
    },

    // Update user profile (wrapper around employees update)
    async updateProfile(userId: string, updates: Partial<Employee>) {
        // User can only update their own linked employee record
        const { data, error } = await supabase
            .from('employees')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
