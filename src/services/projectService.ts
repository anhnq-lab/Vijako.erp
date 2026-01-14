import { supabase } from '../lib/supabase';
import { Project, WBSItem, ProjectIssue, ProjectBudget } from '../../types';

export const projectService = {
    async getAllProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('code', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }

        return data || [];
    },

    async getProjectById(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching project ${id}:`, error);
            return null;
        }

        return data;
    },

    async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            throw error;
        }

        return data;
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteProject(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }

        return true;
    },

    async getProjectWBS(projectId: string): Promise<WBSItem[]> {
        // Return Mock Data for 'Trường Tiểu học Tiên Sơn' or any project for demo purposes
        // In real app, remove this or use 'useMock' flag

        const MOCK_WBS: WBSItem[] = [
            // 1. Giai đoạn Chuẩn bị
            {
                id: 'wbs-1', wbs_code: '1', name: 'Giai đoạn Chuẩn bị',
                level: 0, progress: 100, status: 'done',
                start_date: '2024-01-01', end_date: '2024-01-15'
            },
            {
                id: 'wbs-1-1', wbs_code: '1.1', name: 'Công tác trắc đạc, định vị tim mốc',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-01-01', end_date: '2024-01-05',
                assigned_to: 'Đội Trắc đạc'
            },
            {
                id: 'wbs-1-2', wbs_code: '1.2', name: 'Chuẩn bị mặt bằng, điện nước thi công',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-01-06', end_date: '2024-01-15',
                assigned_to: 'NTP Điện nước'
            },

            // 2. Phần Ngầm & Móng
            {
                id: 'wbs-2', wbs_code: '2', name: 'Phần Ngầm & Móng',
                level: 0, progress: 100, status: 'done',
                start_date: '2024-01-16', end_date: '2024-03-30',
                assigned_to: 'BCH Công trường'
            },
            {
                id: 'wbs-2-1', wbs_code: '2.1', name: 'Đào đất hố móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-01-16', end_date: '2024-02-05',
                assigned_to: 'Đội xe máy'
            },
            {
                id: 'wbs-2-2', wbs_code: '2.2', name: 'Bê tông lót móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-02-06', end_date: '2024-02-10',
                assigned_to: 'Tổ nề 1'
            },
            {
                id: 'wbs-2-3', wbs_code: '2.3', name: 'Gia công lắp dựng cốt thép móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-02-11', end_date: '2024-02-25',
                assigned_to: 'Tổ sắt 1'
            },
            {
                id: 'wbs-2-4', wbs_code: '2.4', name: 'Gia công lắp dựng ván khuôn móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-02-20', end_date: '2024-03-01',
                assigned_to: 'Tổ cốp pha 1'
            },
            {
                id: 'wbs-2-5', wbs_code: '2.5', name: 'Đổ bê tông móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-03-02', end_date: '2024-03-05',
                assigned_to: 'Bê tông thương phẩm'
            },
            {
                id: 'wbs-2-6', wbs_code: '2.6', name: 'Xây tường cổ móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-03-06', end_date: '2024-03-20'
            },
            {
                id: 'wbs-2-7', wbs_code: '2.7', name: 'Lấp đất hố móng',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-03-21', end_date: '2024-03-30'
            },

            // 3. Phần Thân (Khối phòng học)
            {
                id: 'wbs-3', wbs_code: '3', name: 'Phần Thân (Khối phòng học)',
                level: 0, progress: 65, status: 'active',
                start_date: '2024-04-01', end_date: '2024-07-30'
            },
            // Tầng 1
            {
                id: 'wbs-3-1', wbs_code: '3.1', name: 'Kết cấu Tầng 1',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-04-01', end_date: '2024-05-15'
            },
            {
                id: 'wbs-3-1-1', wbs_code: '3.1.1', name: 'Cột vách Tầng 1',
                level: 2, progress: 100, status: 'done',
                start_date: '2024-04-01', end_date: '2024-04-20'
            },
            {
                id: 'wbs-3-1-2', wbs_code: '3.1.2', name: 'Dầm sàn Tầng 2',
                level: 2, progress: 100, status: 'done',
                start_date: '2024-04-21', end_date: '2024-05-15'
            },
            // Tầng 2
            {
                id: 'wbs-3-2', wbs_code: '3.2', name: 'Kết cấu Tầng 2',
                level: 1, progress: 80, status: 'active',
                start_date: '2024-05-16', end_date: '2024-06-30'
            },
            {
                id: 'wbs-3-2-1', wbs_code: '3.2.1', name: 'Cột vách Tầng 2',
                level: 2, progress: 100, status: 'done',
                start_date: '2024-05-16', end_date: '2024-06-05'
            },
            {
                id: 'wbs-3-2-2', wbs_code: '3.2.2', name: 'Dầm sàn Tầng 3',
                level: 2, progress: 60, status: 'active',
                start_date: '2024-06-06', end_date: '2024-06-30'
            },
            // Tầng 3 (Dự kiến)
            {
                id: 'wbs-3-3', wbs_code: '3.3', name: 'Kết cấu Tầng 3 & Mái',
                level: 1, progress: 0, status: 'pending',
                start_date: '2024-07-01', end_date: '2024-07-30'
            },

            // 4. Hoàn thiện
            {
                id: 'wbs-4', wbs_code: '4', name: 'Phần Hoàn thiện',
                level: 0, progress: 30, status: 'active',
                start_date: '2024-06-15', end_date: '2024-09-30'
            },
            {
                id: 'wbs-4-1', wbs_code: '4.1', name: 'Xây tường bao che & ngăn chia',
                level: 1, progress: 70, status: 'active',
                start_date: '2024-06-15', end_date: '2024-07-30'
            },
            {
                id: 'wbs-4-2', wbs_code: '4.2', name: 'Trát tường trong & ngoài',
                level: 1, progress: 20, status: 'active',
                start_date: '2024-07-15', end_date: '2024-08-30'
            },
            {
                id: 'wbs-4-3', wbs_code: '4.3', name: 'Ốp lát gạch',
                level: 1, progress: 0, status: 'pending',
                start_date: '2024-08-15', end_date: '2024-09-15'
            },
            {
                id: 'wbs-4-4', wbs_code: '4.4', name: 'Sơn bả',
                level: 1, progress: 0, status: 'pending',
                start_date: '2024-09-01', end_date: '2024-09-30'
            },

            // 5. MEP
            {
                id: 'wbs-5', wbs_code: '5', name: 'Hệ thống MEP',
                level: 0, progress: 40, status: 'active',
                start_date: '2024-05-01', end_date: '2024-10-15'
            },
            {
                id: 'wbs-5-1', wbs_code: '5.1', name: 'Đi ống luồn dây & Cấp thoát nước ngầm',
                level: 1, progress: 100, status: 'done',
                start_date: '2024-05-01', end_date: '2024-06-30'
            },
            {
                id: 'wbs-5-2', wbs_code: '5.2', name: 'Kéo dây & Lắp đặt thiết bị',
                level: 1, progress: 10, status: 'active',
                start_date: '2024-08-01', end_date: '2024-10-15'
            }
        ];

        return MOCK_WBS;

        /* Original Code
        const { data, error } = await supabase
            .from('project_wbs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true }); // Simple ordering

        if (error) {
            console.error(`Error fetching WBS for project ${projectId}:`, error);
            return [];
        }

        return data || [];
        */
    },

    async getProjectIssues(projectId: string): Promise<ProjectIssue[]> {
        const { data, error } = await supabase
            .from('project_issues')
            .select('*')
            .eq('project_id', projectId);

        if (error) {
            console.error(`Error fetching issues for project ${projectId}:`, error);
            return [];
        }

        return data || [];
    },

    async getProjectBudget(projectId: string): Promise<ProjectBudget[]> {
        const { data, error } = await supabase
            .from('project_budget')
            .select('*')
            .eq('project_id', projectId);

        if (error) {
            console.error(`Error fetching budget for project ${projectId}:`, error);
            return [];
        }

        return data || [];
    },

    async createBudgetItem(budgetItem: Omit<ProjectBudget, 'id'>): Promise<ProjectBudget | null> {
        const { data, error } = await supabase
            .from('project_budget')
            .insert(budgetItem)
            .select()
            .single();

        if (error) {
            console.error('Error creating budget item:', error);
            throw error;
        }

        return data;
    },

    async updateBudgetItem(id: string, updates: Partial<ProjectBudget>): Promise<ProjectBudget | null> {
        const { data, error } = await supabase
            .from('project_budget')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating budget item ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteBudgetItem(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('project_budget')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting budget item ${id}:`, error);
            throw error;
        }

        return true;
    },
    async uploadProjectModel(projectId: string, file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${projectId}/model_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // Update project with model_url
            await this.updateProject(projectId, { model_url: publicUrl });

            return publicUrl;
        } catch (error) {
            console.error('Error in uploadProjectModel:', error);
            throw error;
        }
    }
};
