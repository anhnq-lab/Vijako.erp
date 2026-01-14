
import { supabase } from '../lib/supabase';

// Define the structure of a tool for RAG/Agent use
export interface Tool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    execute: (args: any) => Promise<any>;
}

export const tools: Record<string, Tool> = {
    get_project_details: {
        name: 'get_project_details',
        description: 'Get detailed information about a specific project by its code or name',
        parameters: {
            type: 'object',
            properties: {
                project_code: { type: 'string', description: 'The project code (e.g., P-001, P-002)' },
            },
            required: ['project_code'],
        },
        execute: async ({ project_code }) => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .or(`code.eq.${project_code},name.ilike.%${project_code}%`)
                .single();

            if (error) return { error: error.message };
            return data;
        },
    },

    create_task: {
        name: 'create_task',
        description: 'Create a new task for a project',
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'The ID of the project' },
                task_name: { type: 'string', description: 'Name of the task' },
                due_date: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
                assignee: { type: 'string', description: 'Name of the person assigned' }
            },
            required: ['project_id', 'task_name'],
        },
        execute: async (args) => {
            // In a real app, this would insert into a 'tasks' table
            // For demo, we'll return a success mock
            console.log("Mock creating task:", args);
            return {
                success: true,
                message: `Task '${args.task_name}' created for project ${args.project_id}`,
                task_id: "mock-task-id-" + Date.now()
            };
        }
    },

    get_financial_summary: {
        name: 'get_financial_summary',
        description: 'Get financial summary of a project including budget and expenses',
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'The UUID of the project' },
            },
            required: ['project_id'],
        },
        execute: async ({ project_id }) => {
            // Mock financial data since we might not have seeded it fully
            return {
                total_budget: 5000000000,
                spent: 1200000000,
                remaining: 3800000000,
                status: "On Track"
            };
        }
    }
};
