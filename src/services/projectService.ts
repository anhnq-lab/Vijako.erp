import { supabase } from '../lib/supabase';
import { Project, WBSItem, ProjectIssue, ProjectBudget, ProjectDocument } from '../../types';

export const projectService = {
    async getAllProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('code', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
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
    },

    // --- User Tasks Management ---
    async getUserTasks(): Promise<import('../../types').UserTask[]> {
        const { data, error } = await supabase
            .from('user_tasks')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching user tasks:', error);
            return [];
        }
        return data || [];
    },

    async createUserTask(task: Omit<import('../../types').UserTask, 'id' | 'created_at' | 'user_id'>): Promise<import('../../types').UserTask | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_tasks')
            .insert({ ...task, user_id: user.id })
            .select()
            .single();

        if (error) {
            console.error('Error creating user task:', error);
            return null;
        }
        return data;
    },

    async updateUserTask(id: string, updates: Partial<import('../../types').UserTask>): Promise<import('../../types').UserTask | null> {
        const { data, error } = await supabase
            .from('user_tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user task:', error);
            return null;
        }
        return data;
    },

    async deleteUserTask(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('user_tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting user task:', error);
            return false;
        }
        return true;
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
    },

    async uploadProjectAvatar(projectId: string, file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${projectId}/avatar_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // Update project with avatar URL
            await this.updateProject(projectId, { avatar: publicUrl });

            return publicUrl;
        } catch (error) {
            console.error('Error in uploadProjectAvatar:', error);
            throw error;
        }
    },

    // --- Issues Management ---

    async createProjectIssue(issue: Omit<ProjectIssue, 'id' | 'created_at'>): Promise<ProjectIssue | null> {
        const { data, error } = await supabase
            .from('project_issues')
            .insert(issue)
            .select()
            .single();

        if (error) {
            console.error('Error creating issue:', error);
            throw error;
        }

        return data;
    },

    async updateProjectIssue(id: string, updates: Partial<ProjectIssue>): Promise<ProjectIssue | null> {
        const { data, error } = await supabase
            .from('project_issues')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating issue ${id}:`, error);
            throw error;
        }

        return data;
    },

    async deleteProjectIssue(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('project_issues')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting issue ${id}:`, error);
            throw error;
        }

        return true;
    },

    // --- Documents Management ---

    async getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
        const { data, error } = await supabase
            .from('project_documents')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(`Error fetching documents for project ${projectId}:`, error);
            return [];
        }

        return data || [];
    },

    async uploadProjectDocument(projectId: string, file: File, uploadedBy?: string): Promise<ProjectDocument | null> {
        try {
            const fileExt = file.name.split('.').pop();
            // Sanitize filename to avoid issues
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${projectId}/docs/${Date.now()}_${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading document:', uploadError);
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            const documentData: Omit<ProjectDocument, 'id' | 'created_at'> = {
                project_id: projectId,
                name: file.name,
                type: fileExt || 'unknown',
                size: file.size,
                url: urlData.publicUrl,
                uploaded_by: uploadedBy || 'User'
            };

            const { data, error: dbError } = await supabase
                .from('project_documents')
                .insert(documentData)
                .select()
                .single();

            if (dbError) {
                console.error('Error saving document metadata:', dbError);
                throw dbError;
            }

            return data;
        } catch (error) {
            console.error('Error in uploadProjectDocument:', error);
            throw error;
        }
    },

    async deleteProjectDocument(id: string, url: string): Promise<boolean> {
        try {
            // 1. Delete from Storage (Extract path from URL if needed, but for now just delete DB record is safer if path parsing is complex)
            // Ideally we should delete from storage too.
            // formatting: .../project-files/projectId/docs/...

            // Extract relative path from URL
            const pathObj = url.split('/project-files/')[1];
            if (pathObj) {
                const { error: storageError } = await supabase.storage
                    .from('project-files')
                    .remove([pathObj]);

                if (storageError) {
                    console.warn('Error deleting file from storage:', storageError);
                    // Continue to delete from DB anyway
                }
            }

            // 2. Delete from DB
            const { error } = await supabase
                .from('project_documents')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`Error deleting document ${id}:`, error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteProjectDocument:', error);
            throw error;
        }
    }
};
