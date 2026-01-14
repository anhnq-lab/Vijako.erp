
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
        description: 'Tạo công việc mới cho dự án. Project Identifier có thể là Mã dự án (P-001) hoặc Tên dự án.',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án (VD: P-001) hoặc Tên dự án' },
                task_name: { type: 'string', description: 'Tên công việc cần tạo' },
                due_date: { type: 'string', description: 'Hạn hoàn thành (YYYY-MM-DD)' },
                assignee: { type: 'string', description: 'Người được giao việc' }
            },
            required: ['project_identifier', 'task_name'],
        },
        execute: async (args) => {
            const projectId = await resolveProjectId(args.project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${args.project_identifier}"` };

            console.log("Mock creating task:", args);
            return {
                success: true,
                message: `Đã tạo công việc '${args.task_name}' cho dự án (ID: ${projectId})`,
                task_id: "mock-task-id-" + Date.now()
            };
        }
    },

    get_financial_summary: {
        name: 'get_financial_summary',
        description: 'Xem tổng quan tài chính, ngân sách của dự án',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án (VD: P-001) hoặc Tên dự án' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_identifier}"` };

            const { data, error } = await supabase
                .from('project_budget')
                .select('*')
                .eq('project_id', projectId);

            if (error || !data || data.length === 0) {
                return {
                    project_identifier,
                    total_budget: 0,
                    spent: 0,
                    remaining: 0,
                    status: "Chưa có dữ liệu ngân sách"
                };
            }

            const totalBudget = data.reduce((sum, item) => sum + (item.budget_amount || 0), 0);
            const totalSpent = data.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
            return {
                project_identifier,
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
                project_identifier: { type: 'string', description: 'Mã dự án (VD: P-001) hoặc Tên dự án' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_identifier}"` };

            const { data, error } = await supabase
                .from('project_wbs')
                .select('*')
                .eq('project_id', projectId)
                .order('wbs_code', { ascending: true });

            if (error) return { error: error.message };
            return {
                project_identifier,
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
                project_identifier: { type: 'string', description: 'Mã dự án (VD: P-001) hoặc Tên dự án' },
                type: { type: 'string', description: 'Loại vấn đề: NCR, RFI, hoặc General' },
                title: { type: 'string', description: 'Tiêu đề vấn đề' },
                priority: { type: 'string', description: 'Độ ưu tiên: High, Medium, Low' },
                description: { type: 'string', description: 'Mô tả chi tiết vấn đề' }
            },
            required: ['project_identifier', 'type', 'title'],
        },
        execute: async (args) => {
            const projectId = await resolveProjectId(args.project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${args.project_identifier}"` };

            const { data, error } = await supabase
                .from('project_issues')
                .insert({
                    project_id: projectId,
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
                project_identifier: { type: 'string', description: 'Mã dự án (VD: P-001) hoặc Tên dự án' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_identifier}"` };

            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('project_id', projectId);

            if (error) return { error: error.message };

            const totalValue = data?.reduce((sum, c) => sum + (c.value || 0), 0) || 0;
            const totalPaid = data?.reduce((sum, c) => sum + (c.paid_amount || 0), 0) || 0;

            return {
                project_identifier,
                count: data?.length || 0,
                contracts: data || [],
                total_value: totalValue,
                total_paid: totalPaid,
                message: data?.length ? `Dự án có ${data.length} hợp đồng, tổng giá trị ${(totalValue / 1000000000).toFixed(1)} tỷ` : "Chưa có hợp đồng"
            };
        }
    }
};

// Helper to resolve project ID
async function resolveProjectId(identifier: string): Promise<string | null> {
    // If it looks like a UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) return identifier;

    // Otherwise search by code or name
    const { data } = await supabase
        .from('projects')
        .select('id')
        .or(`code.eq.${identifier},name.ilike.%${identifier}%`)
        .single();

    return data?.id || null;
}
