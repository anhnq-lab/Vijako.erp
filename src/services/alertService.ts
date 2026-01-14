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
                projects:project_id (name, code, manager)
            `)
            .eq('is_dismissed', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }

        return (data || []).map((a: any) => ({
            ...a,
            project_name: a.projects?.name,
            project_code: a.projects?.code,
            project_manager: a.projects?.manager
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
     * This logic scans multiple modules to identify issues that need attention
     */
    async checkAndGenerateAutoAlerts(): Promise<void> {
        console.log('Starting auto-alert generation...');
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 0. Get existing alert source IDs to avoid duplicates for the same "active" issue
        const { data: existingAlerts } = await supabase
            .from('alerts')
            .select('source_id')
            .eq('is_dismissed', false);
        const existingSourceIds = new Set(existingAlerts?.map(a => a.source_id) || []);

        const newAlerts: any[] = [];

        // 1. Check for expiring Bank Guarantees (< 30 days)
        const { data: guarantees } = await supabase
            .from('bank_guarantees')
            .select('*')
            .lt('expiry_date', thirtyDaysFromNow)
            .neq('status', 'released');

        guarantees?.forEach(g => {
            if (!existingSourceIds.has(g.id)) {
                newAlerts.push({
                    type: 'contract',
                    severity: 'high',
                    title: `Bảo lãnh sắp hết hạn: ${g.code}`,
                    description: `Bảo lãnh ${g.type} cho dự án sắp hết hạn vào ngày ${new Date(g.expiry_date).toLocaleDateString('vi-VN')}.`,
                    source_type: 'bank_guarantee',
                    source_id: g.id,
                    project_id: g.project_id,
                    due_date: g.expiry_date
                });
            }
        });

        // 2. Check for Critical Risks (Score >= 17)
        const { data: risks } = await supabase
            .from('project_risks')
            .select('*')
            .gte('risk_score', 17)
            .neq('status', 'closed');

        risks?.forEach(r => {
            if (!existingSourceIds.has(r.id)) {
                newAlerts.push({
                    type: 'risk',
                    severity: 'critical',
                    title: `Rủi ro nghiêm trọng: ${r.title}`,
                    description: `Phát hiện rủi ro mức độ 'Critical' (Điểm: ${r.risk_score}). Cần có kế hoạch ứng phó ngay.`,
                    source_type: 'project_risk',
                    source_id: r.id,
                    project_id: r.project_id
                });
            }
        });

        // 3. Check for Stale WIP Documents (> 7 days without update/share)
        const { data: staleDocs } = await supabase
            .from('project_documents')
            .select('*')
            .eq('status', 'WIP')
            .lt('created_at', sevenDaysAgo);

        staleDocs?.forEach(d => {
            if (!existingSourceIds.has(d.id)) {
                newAlerts.push({
                    type: 'document',
                    severity: 'medium',
                    title: `Tài liệu WIP quá hạn: ${d.name}`,
                    description: `Tài liệu này đã ở trạng thái WIP hơn 7 ngày. Hãy cập nhật hoặc chia sẻ (Shared) lên CDE.`,
                    source_type: 'project_document',
                    source_id: d.id,
                    project_id: d.project_id
                });
            }
        });

        // 4. Check for Expiring Contracts (< 30 days)
        const { data: contracts } = await supabase
            .from('contracts')
            .select('*')
            .lt('end_date', thirtyDaysFromNow)
            .neq('status', 'completed');

        contracts?.forEach(c => {
            if (!existingSourceIds.has(c.id)) {
                newAlerts.push({
                    type: 'contract',
                    severity: 'high',
                    title: `Hợp đồng sắp hết hạn: ${c.contract_code}`,
                    description: `Hợp đồng '${c.name}' dự kiến kết thúc vào ${new Date(c.end_date).toLocaleDateString('vi-VN')}. Hãy chuẩn bị thủ tục gia hạn hoặc quyết toán.`,
                    source_type: 'contract',
                    source_id: c.id,
                    project_id: c.project_id,
                    due_date: c.end_date
                });
            }
        });

        // Insert new alerts in batch
        if (newAlerts.length > 0) {
            const { error: insertError } = await supabase
                .from('alerts')
                .insert(newAlerts);

            if (insertError) {
                console.error('Error inserting auto-alerts:', insertError);
            } else {
                console.log(`Successfully generated ${newAlerts.length} new auto-alerts`);
            }
        } else {
            console.log('No new alerts to generate');
        }
    }
};

export default alertService;
