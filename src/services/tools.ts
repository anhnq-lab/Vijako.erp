
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
            const { data, error } = await supabase
                .from('project_budget')
                .select('*')
                .eq('project_id', project_id);

            if (error || !data || data.length === 0) {
                return {
                    total_budget: 0,
                    spent: 0,
                    remaining: 0,
                    status: "Chưa có dữ liệu ngân sách"
                };
            }

            const totalBudget = data.reduce((sum, item) => sum + (item.budget_amount || 0), 0);
            const totalSpent = data.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
            return {
                total_budget: totalBudget,
                spent: totalSpent,
                remaining: totalBudget - totalSpent,
                categories: data,
                status: totalSpent > totalBudget ? "Vượt ngân sách" : "Trong ngân sách"
            };
        }
    },

    update_task_status: {
        name: 'update_task_status',
        description: 'Cập nhật trạng thái công việc (active, done, pending, delayed)',
        parameters: {
            type: 'object',
            properties: {
                task_id: { type: 'string', description: 'ID của công việc cần cập nhật' },
                new_status: { type: 'string', description: 'Trạng thái mới: active, done, pending, delayed' },
                progress: { type: 'number', description: 'Tiến độ phần trăm (0-100)' }
            },
            required: ['task_id', 'new_status'],
        },
        execute: async ({ task_id, new_status, progress }) => {
            // TODO: Implement actual update when tasks table exists
            console.log("Updating task:", task_id, "to status:", new_status);
            return {
                success: true,
                message: `Đã cập nhật công việc ${task_id} sang trạng thái "${new_status}"${progress ? `, tiến độ ${progress}%` : ''}`
            };
        }
    },

    get_project_schedule: {
        name: 'get_project_schedule',
        description: 'Lấy lịch trình và danh sách công việc (WBS) của dự án',
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'ID của dự án' },
            },
            required: ['project_id'],
        },
        execute: async ({ project_id }) => {
            const { data, error } = await supabase
                .from('project_wbs')
                .select('*')
                .eq('project_id', project_id)
                .order('wbs_code', { ascending: true });

            if (error) return { error: error.message };
            return {
                total_tasks: data?.length || 0,
                tasks: data || [],
                message: data?.length ? `Dự án có ${data.length} công việc` : "Chưa có lịch trình"
            };
        }
    },

    search_employees: {
        name: 'search_employees',
        description: 'Tìm kiếm nhân viên theo tên, chức vụ hoặc kỹ năng',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Từ khóa tìm kiếm (tên, chức vụ, kỹ năng)' },
            },
            required: ['query'],
        },
        execute: async ({ query }) => {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .or(`name.ilike.%${query}%,position.ilike.%${query}%,skills.ilike.%${query}%`)
                .limit(10);

            if (error) return { error: error.message };
            return {
                count: data?.length || 0,
                employees: data || [],
                message: data?.length ? `Tìm thấy ${data.length} nhân viên` : "Không tìm thấy nhân viên phù hợp"
            };
        }
    },

    create_issue: {
        name: 'create_issue',
        description: 'Tạo vấn đề mới (NCR, RFI, hoặc General issue) cho dự án',
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'ID của dự án' },
                type: { type: 'string', description: 'Loại vấn đề: NCR, RFI, hoặc General' },
                title: { type: 'string', description: 'Tiêu đề vấn đề' },
                priority: { type: 'string', description: 'Độ ưu tiên: High, Medium, Low' },
                description: { type: 'string', description: 'Mô tả chi tiết vấn đề' }
            },
            required: ['project_id', 'type', 'title'],
        },
        execute: async (args) => {
            const { data, error } = await supabase
                .from('project_issues')
                .insert({
                    project_id: args.project_id,
                    type: args.type,
                    title: args.title,
                    priority: args.priority || 'Medium',
                    status: 'Open',
                    code: `${args.type}-${Date.now()}`,
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    pic: 'Chưa phân công'
                })
                .select()
                .single();

            if (error) return { error: error.message };
            return {
                success: true,
                issue: data,
                message: `Đã tạo ${args.type} mới: "${args.title}"`
            };
        }
    },

    get_contracts: {
        name: 'get_contracts',
        description: 'Lấy danh sách hợp đồng của dự án',
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'ID của dự án' },
            },
            required: ['project_id'],
        },
        execute: async ({ project_id }) => {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('project_id', project_id);

            if (error) return { error: error.message };

            const totalValue = data?.reduce((sum, c) => sum + (c.value || 0), 0) || 0;
            const totalPaid = data?.reduce((sum, c) => sum + (c.paid_amount || 0), 0) || 0;

            return {
                count: data?.length || 0,
                contracts: data || [],
                total_value: totalValue,
                total_paid: totalPaid,
                message: data?.length ? `Dự án có ${data.length} hợp đồng, tổng giá trị ${(totalValue / 1000000000).toFixed(1)} tỷ` : "Chưa có hợp đồng"
            };
        }
    }
};
