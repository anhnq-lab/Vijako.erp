import { supabase } from '../lib/supabase';

export interface ContractAttachment {
    id: string;
    contract_id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
    uploaded_by?: string;
    uploaded_at: string;
}

export const contractFileService = {
    /**
     * Upload a file for a contract
     * @param contractId - Contract ID
     * @param file - File object to upload
     * @returns Attachment metadata
     */
    async uploadContractFile(
        contractId: string,
        file: File
    ): Promise<ContractAttachment | null> {
        try {
            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit');
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
            ];

            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG');
            }

            // Create unique file name
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedName}`;
            const filePath = `${contractId}/${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('contract-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('contract-files')
                .getPublicUrl(filePath);

            // Save metadata to database
            const { data: attachmentData, error: dbError } = await supabase
                .from('contract_attachments')
                .insert({
                    contract_id: contractId,
                    file_name: file.name,
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                    file_type: file.type,
                })
                .select()
                .single();

            if (dbError) {
                // Cleanup uploaded file if DB insert fails
                await supabase.storage.from('contract-files').remove([filePath]);
                throw dbError;
            }

            return attachmentData;
        } catch (error) {
            console.error('Error uploading contract file:', error);
            throw error;
        }
    },

    /**
     * Get all files for a contract
     * @param contractId - Contract ID
     * @returns List of attachments
     */
    async getContractFiles(contractId: string): Promise<ContractAttachment[]> {
        const { data, error } = await supabase
            .from('contract_attachments')
            .select('*')
            .eq('contract_id', contractId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching contract files:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Delete a contract file
     * @param fileId - Attachment ID
     * @param fileUrl - File URL to delete from storage
     * @returns Success boolean
     */
    async deleteContractFile(fileId: string, fileUrl: string): Promise<boolean> {
        try {
            // Extract path from URL
            const urlParts = fileUrl.split('/contract-files/');
            if (urlParts.length !== 2) {
                throw new Error('Invalid file URL');
            }
            const filePath = urlParts[1];

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('contract-files')
                .remove([filePath]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue to delete DB record even if storage fails
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('contract_attachments')
                .delete()
                .eq('id', fileId);

            if (dbError) {
                throw dbError;
            }

            return true;
        } catch (error) {
            console.error('Error deleting contract file:', error);
            throw error;
        }
    },

    /**
     * Download a contract file
     * @param fileUrl - Public URL of the file
     * @param fileName - Name to save the file as
     */
    downloadFile(fileUrl: string, fileName: string) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
};
