import { supabase } from '../lib/supabase';
import { ProjectRisk, RiskMatrixData, RiskSeverity } from '../../types';

/**
 * Risk Service - Handles all Risk Matrix operations
 */

// Helper to calculate severity level and color from risk score
function getRiskSeverity(riskScore: number): { severity: RiskSeverity; color: string } {
    if (riskScore >= 17) return { severity: 'Critical', color: '#EF4444' }; // Red
    if (riskScore >= 10) return { severity: 'High', color: '#F97316' };     // Orange
    if (riskScore >= 5) return { severity: 'Medium', color: '#FACC15' };    // Yellow
    return { severity: 'Low', color: '#07883d' };                            // Green
}

// Transform DB risk to matrix data point
function toMatrixData(risk: ProjectRisk): RiskMatrixData {
    const { severity, color } = getRiskSeverity(risk.risk_score);
    return {
        x: risk.probability * 20, // Convert 1-5 to 20-100%
        y: risk.impact * 20,
        z: risk.risk_score * 40, // Bubble size
        name: risk.project_name || 'Unknown Project',
        status: severity,
        color,
        projectId: risk.project_id,
        riskId: risk.id,
        title: risk.title
    };
}

export const riskService = {
    /**
     * Get all risks with project info
     */
    async getAllRisks(): Promise<ProjectRisk[]> {
        const { data, error } = await supabase
            .from('project_risks')
            .select(`
        *,
        projects:project_id (name, code)
      `)
            .order('risk_score', { ascending: false });

        if (error) {
            console.error('Error fetching risks:', error);
            return [];
        }

        return (data || []).map((r: any) => ({
            ...r,
            project_name: r.projects?.name,
            project_code: r.projects?.code
        }));
    },

    /**
     * Get risks for a specific project
     */
    async getRisksByProject(projectId: string): Promise<ProjectRisk[]> {
        const { data, error } = await supabase
            .from('project_risks')
            .select('*')
            .eq('project_id', projectId)
            .order('risk_score', { ascending: false });

        if (error) {
            console.error('Error fetching project risks:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get aggregated risk matrix data for Dashboard
     * Returns the highest risk per project for visualization
     */
    async getRiskMatrix(): Promise<RiskMatrixData[]> {
        const { data, error } = await supabase
            .from('project_risks')
            .select(`
        *,
        projects:project_id (name, code)
      `)
            .neq('status', 'closed') // Exclude closed risks
            .order('risk_score', { ascending: false });

        if (error) {
            console.error('Error fetching risk matrix:', error);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Group by project and take highest risk per project
        const projectRisks = new Map<string, ProjectRisk>();
        for (const r of data) {
            const risk: ProjectRisk = {
                ...r,
                project_name: r.projects?.name,
                project_code: r.projects?.code
            };
            const existing = projectRisks.get(risk.project_id);
            if (!existing || risk.risk_score > existing.risk_score) {
                projectRisks.set(risk.project_id, risk);
            }
        }

        return Array.from(projectRisks.values()).map(toMatrixData);
    },

    /**
     * Create a new risk
     */
    async createRisk(risk: Omit<ProjectRisk, 'id' | 'risk_score' | 'created_at' | 'updated_at'>): Promise<ProjectRisk | null> {
        const { data, error } = await supabase
            .from('project_risks')
            .insert([risk])
            .select()
            .single();

        if (error) {
            console.error('Error creating risk:', error);
            return null;
        }

        return data;
    },

    /**
     * Update an existing risk
     */
    async updateRisk(id: string, updates: Partial<ProjectRisk>): Promise<ProjectRisk | null> {
        const { data, error } = await supabase
            .from('project_risks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating risk:', error);
            return null;
        }

        return data;
    },

    /**
     * Delete a risk
     */
    async deleteRisk(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('project_risks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting risk:', error);
            return false;
        }

        return true;
    },

    /**
     * Get risk summary statistics
     */
    async getRiskSummary(): Promise<{
        total: number;
        bySeverity: Record<RiskSeverity, number>;
        byCategory: Record<string, number>;
        byStatus: Record<string, number>;
    }> {
        const risks = await this.getAllRisks();

        const bySeverity: Record<RiskSeverity, number> = {
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0
        };

        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        for (const risk of risks) {
            // Count by severity
            const { severity } = getRiskSeverity(risk.risk_score);
            bySeverity[severity]++;

            // Count by category
            const cat = risk.category || 'unknown';
            byCategory[cat] = (byCategory[cat] || 0) + 1;

            // Count by status
            const status = risk.status || 'open';
            byStatus[status] = (byStatus[status] || 0) + 1;
        }

        return {
            total: risks.length,
            bySeverity,
            byCategory,
            byStatus
        };
    }
};

export default riskService;
