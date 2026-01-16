import { supabase } from '../lib/supabase';
import { DailyLog, DailyLogManpower, DailyLogEquipment, DiaryStatus } from '../../types';

export const siteDiaryService = {
    // Get all logs for a project
    async getProjectLogs(projectId: string) {
        const { data, error } = await supabase
            .from('daily_logs')
            .select(`
        *,
        daily_log_manpower(*),
        daily_log_equipment(*)
      `)
            .eq('project_id', projectId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single log detail
    async getLogById(logId: string) {
        const { data, error } = await supabase
            .from('daily_logs')
            .select(`
        *,
        daily_log_manpower(*),
        daily_log_equipment(*)
      `)
            .eq('id', logId)
            .single();

        if (error) throw error;
        return data;
    },

    // Create new log (Basic info)
    async createLog(logData: Partial<DailyLog>) {
        const { data, error } = await supabase
            .from('daily_logs')
            .insert(logData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update log
    async updateLog(logId: string, updates: Partial<DailyLog>) {
        const { data, error } = await supabase
            .from('daily_logs')
            .update(updates)
            .eq('id', logId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update status (Submit/Approve/Reject)
    async updateStatus(id: string, status: DiaryStatus) {
        const { data, error } = await supabase
            .from('daily_logs')
            .update({ status })
            .eq('id', id)
            .select(`
        *,
        project:projects(name)
      `)
            .single();

        if (error) throw error;

        // Notify logic
        const { notificationService } = require('./notificationService');
        const projectName = data.project?.name || 'Dự án';

        if (status === 'Submitted') {
            notificationService.notifyRole('Project Manager', 'Nhật ký thi công mới', `Nhật ký ngày ${data.date} tại ${projectName} đã được gửi duyệt.`, '/site-diary');
        } else if (status === 'Approved') {
            // ideally notify the creator, but we need their storekeeper/engineer ID. 
            // For now just notify Site Managers generally
            notificationService.notifyRole('Site Manager', 'Nhật ký được duyệt', `Nhật ký ngày ${data.date} tại ${projectName} đã được phê duyệt.`, '/site-diary');
        } else if (status === 'Rejected') {
            notificationService.notifyRole('Site Manager', 'Nhật ký bị từ chối', `Nhật ký ngày ${data.date} tại ${projectName} bị từ chối.`, '/site-diary');
        }

        return data;
    },

    // Manpower Operations
    async addManpower(item: Omit<DailyLogManpower, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('daily_log_manpower')
            .insert(item)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteManpower(id: string) {
        const { error } = await supabase
            .from('daily_log_manpower')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Equipment Operations
    async addEquipment(item: Omit<DailyLogEquipment, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('daily_log_equipment')
            .insert(item)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteEquipment(id: string) {
        const { error } = await supabase
            .from('daily_log_equipment')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Submit Log for Approval
    async submitLog(logId: string) {
        return this.updateLog(logId, { status: 'submitted' as any });
    },

    // Approve Log
    async approveLog(logId: string) {
        return this.updateLog(logId, { status: 'approved' as any });
    }
};
