import { supabase } from '../lib/supabase';
import { DailyLog } from '../../types';

export const diaryService = {
    async getRecentLogs(projectId: string, limit: number = 7): Promise<DailyLog[]> {
        const { data, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('project_id', projectId)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching diary logs:', error);
            return [];
        }

        return data || [];
    },

    async getLogsByDateRange(projectId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
        const { data, error } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('project_id', projectId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching diary logs by range:', error);
            return [];
        }

        return data || [];
    },

    async createLog(log: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>): Promise<DailyLog | null> {
        const { data, error } = await supabase
            .from('daily_logs')
            .insert(log)
            .select()
            .single();

        if (error) {
            console.error('Error creating diary log:', error);
            throw error;
        }

        return data;
    },

    async updateLog(id: string, updates: Partial<DailyLog>): Promise<DailyLog | null> {
        const { data, error } = await supabase
            .from('daily_logs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating diary log ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteLog(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('daily_logs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting diary log ${id}:`, error);
            throw error;
        }

        return true;
    },

    async uploadDiaryImage(projectId: string, file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${projectId}/diary_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files') // Reusing existing bucket, ensure strict folder structure if needed
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading diary image:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error in uploadDiaryImage:', error);
            throw error;
        }
    }
};
