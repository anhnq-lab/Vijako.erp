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
    }
};
