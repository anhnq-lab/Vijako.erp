import { supabase } from '../lib/supabase';
import { JobPosting, JobApplication } from '../../types';

export const recruitmentService = {
    async getAllJobs(): Promise<JobPosting[]> {
        const { data, error } = await supabase
            .from('job_postings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }

        return (data as JobPosting[]) || [];
    },

    async getJobById(id: string): Promise<JobPosting | null> {
        const { data, error } = await supabase
            .from('job_postings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching job by id:', error);
            return null;
        }

        return data as JobPosting;
    },

    async submitApplication(application: Omit<JobApplication, 'id' | 'applied_at' | 'status'>) {
        const { data, error } = await supabase
            .from('job_applications')
            .insert(application)
            .select()
            .single();

        if (error) {
            console.error('Error submitting application:', error);
            throw error;
        }

        return data;
    },

    async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
        const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }

        return (data as JobApplication[]) || [];
    }
};
