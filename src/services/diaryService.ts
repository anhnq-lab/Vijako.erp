import { supabase } from '../lib/supabase';

export interface DailyLog {
    id: string;
    project_id: string;
    date: string;
    weather: {
        temp: number;
        condition: string;
        humidity: number;
    };
    manpower_total: number;
    work_content: string;
    issues: string;
    images: string[];
    progress_update: Record<string, string>; // { "wbs_id": "completed", "node_id": "in_progress" }
    created_at: string;
}

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

    async createLog(log: Omit<DailyLog, 'id' | 'created_at'>): Promise<DailyLog | null> {
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
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating diary log ${id}:`, error);
            throw error;
        }

        return data;
    }
};
