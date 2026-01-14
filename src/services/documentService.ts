import { supabase } from '../lib/supabase';
import { ProjectDocument, CDEDocument, DocumentActivity } from '../../types';

export const documentService = {
    /**
     * Get all documents with optional filtering
     */
    async getAllDocuments(projectId?: string): Promise<ProjectDocument[]> {
        let query = supabase
            .from('project_documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
        return data || [];
    },

    /**
     * Get documents by status (WIP, SHARED, PUBLISHED, etc.)
     */
    async getDocumentsByStatus(status: string, projectId?: string): Promise<ProjectDocument[]> {
        let query = supabase
            .from('project_documents')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) {
            console.error(`Error fetching docs with status ${status}:`, error);
            throw error;
        }
        return data || [];
    },

    /**
     * Upload document with full CDE metadata
     */
    async uploadDocument(
        projectId: string,
        file: File,
        metadata: Partial<ProjectDocument>,
        userName: string
    ): Promise<ProjectDocument | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${projectId}/docs/${Date.now()}_${sanitizedName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);

            // 3. Save Metadata to DB
            const documentData = {
                project_id: projectId,
                name: file.name,
                type: fileExt || 'unknown',
                size: file.size,
                url: urlData.publicUrl,
                uploaded_by: userName,
                revision: metadata.revision || 'P01',
                status: metadata.status || 'WIP',
                discipline: metadata.discipline,
                category: metadata.category,
                folder_path: metadata.folder_path || '/'
            };

            const { data, error: dbError } = await supabase
                .from('project_documents')
                .insert(documentData)
                .select()
                .single();

            if (dbError) throw dbError;

            // 4. Log Activity
            await this.logActivity(data.id, 'upload', userName);

            return data;
        } catch (error) {
            console.error('Error in uploadDocument:', error);
            throw error;
        }
    },

    /**
     * Update document status/revision (ISO 19650 workflow)
     */
    async updateDocumentStatus(id: string, updates: Partial<ProjectDocument>, userName: string): Promise<ProjectDocument | null> {
        const { data, error } = await supabase
            .from('project_documents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating document ${id}:`, error);
            throw error;
        }

        if (updates.status) {
            await this.logActivity(id, `change_status_to_${updates.status.toLowerCase()}`, userName);
        } else if (updates.revision) {
            await this.logActivity(id, `new_revision_${updates.revision}`, userName);
        }

        return data;
    },

    /**
     * Approve a document
     */
    async approveDocument(id: string, userName: string): Promise<ProjectDocument | null> {
        const { data, error } = await supabase
            .from('project_documents')
            .update({
                status: 'PUBLISHED',
                approver: userName,
                approved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error approving document ${id}:`, error);
            throw error;
        }

        await this.logActivity(id, 'approve', userName);
        return data;
    },

    /**
     * Get activity log
     */
    async getDocumentActivities(documentId?: string): Promise<DocumentActivity[]> {
        let query = supabase
            .from('document_activities')
            .select('*')
            .order('created_at', { ascending: false });

        if (documentId) {
            query = query.eq('document_id', documentId);
        } else {
            query = query.limit(20); // Last 20 activities for generic log
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Log activity
     */
    async logActivity(documentId: string, action: string, userName: string, details?: any): Promise<void> {
        const { error } = await supabase
            .from('document_activities')
            .insert({
                document_id: documentId,
                user_name: userName,
                action,
                details
            });

        if (error) {
            console.error('Error logging activity:', error);
        }
    }
};

export default documentService;
