
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
                project_code: { type: 'string', description: 'The EXACT project code OR name. Remove words like "dự án", "công trình". Example: "P-001" or "Dream Residence"' },
            },
            required: ['project_code'],
        },
        execute: async ({ project_code }) => {
            const projectId = await resolveProjectId(project_code);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_code}"` };

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
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
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
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
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
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
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
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
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
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
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
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
    },

    get_risk_matrix: {
        name: 'get_risk_matrix',
        description: 'Lấy dữ liệu ma trận rủi ro của tất cả dự án hoặc dự án cụ thể. Hiển thị các rủi ro theo xác suất và mức độ ảnh hưởng.',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
            },
            required: [],
        },
        execute: async ({ project_identifier }) => {
            // If project specified, get risks for that project
            if (project_identifier) {
                const projectId = await resolveProjectId(project_identifier);
                if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_identifier}"` };

                const { data, error } = await supabase
                    .from('project_risks')
                    .select(`
                        *,
                        projects:project_id (name, code)
                    `)
                    .eq('project_id', projectId)
                    .order('risk_score', { ascending: false });

                if (error) return { error: error.message };

                const risks = (data || []).map((r: any) => ({
                    title: r.title,
                    category: r.category,
                    probability: r.probability,
                    impact: r.impact,
                    risk_score: r.risk_score,
                    status: r.status,
                    severity: r.risk_score >= 17 ? 'Critical' : r.risk_score >= 10 ? 'High' : r.risk_score >= 5 ? 'Medium' : 'Low'
                }));

                return {
                    project_identifier,
                    count: risks.length,
                    risks,
                    message: risks.length
                        ? `Dự án có ${risks.length} rủi ro. Rủi ro cao nhất: ${risks[0]?.title} (điểm: ${risks[0]?.risk_score})`
                        : "Dự án chưa có rủi ro nào được ghi nhận"
                };
            }

            // Otherwise get all risks summary
            const { data, error } = await supabase
                .from('project_risks')
                .select(`
                    *,
                    projects:project_id (name, code)
                `)
                .order('risk_score', { ascending: false });

            if (error) return { error: error.message };

            const bySeverity = { Critical: 0, High: 0, Medium: 0, Low: 0 };
            for (const r of data || []) {
                const score = r.risk_score;
                if (score >= 17) bySeverity.Critical++;
                else if (score >= 10) bySeverity.High++;
                else if (score >= 5) bySeverity.Medium++;
                else bySeverity.Low++;
            }

            const criticalRisks = (data || [])
                .filter((r: any) => r.risk_score >= 17)
                .map((r: any) => ({ project: r.projects?.name, title: r.title, score: r.risk_score }));

            return {
                total: data?.length || 0,
                by_severity: bySeverity,
                critical_risks: criticalRisks,
                message: `Tổng ${data?.length || 0} rủi ro: ${bySeverity.Critical} Critical, ${bySeverity.High} High, ${bySeverity.Medium} Medium, ${bySeverity.Low} Low`
            };
        }
    },

    analyze_project_performance: {
        name: 'analyze_project_performance',
        description: 'Phân tích tổng quát sức khỏe dự án: kết hợp tiến độ, ngân sách, rủi ro và vấn đề tồn đọng.',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án nào khớp với "${project_identifier}"` };

            // Fetch data from multiple tables
            const [project, wbs, budget, risks, issues] = await Promise.all([
                supabase.from('projects').select('*').eq('id', projectId).single(),
                supabase.from('project_wbs').select('*').eq('project_id', projectId),
                supabase.from('project_budget').select('*').eq('project_id', projectId),
                supabase.from('project_risks').select('*').eq('project_id', projectId),
                supabase.from('project_issues').select('*').eq('project_id', projectId)
            ]);

            const tasks = wbs.data || [];
            const budgetItems = budget.data || [];
            const riskItems = risks.data || [];
            const issueItems = issues.data || [];

            const totalBudget = budgetItems.reduce((sum, i) => sum + (i.budget_amount || 0), 0);
            const actualSpent = budgetItems.reduce((sum, i) => sum + (i.actual_amount || 0), 0);
            const budgetUsage = totalBudget > 0 ? (actualSpent / totalBudget) * 100 : 0;

            const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
            const openIssues = issueItems.filter(i => i.status !== 'Closed').length;
            const highRisks = riskItems.filter(r => r.risk_score >= 10).length;

            return {
                project_name: project.data?.name,
                overall_status: project.data?.status,
                progress: {
                    actual: project.data?.progress || 0,
                    planned: project.data?.plan_progress || 0,
                    variance: (project.data?.progress || 0) - (project.data?.plan_progress || 0)
                },
                financials: {
                    total_budget: totalBudget,
                    actual_spent: actualSpent,
                    usage_percent: budgetUsage.toFixed(1) + "%",
                    status: actualSpent > totalBudget ? "Vượt ngân sách" : "Trong tầm kiểm soát"
                },
                alerts: {
                    delayed_tasks: delayedTasks,
                    open_issues: openIssues,
                    high_risks: highRisks
                },
                summary: `Dự án ${project.data?.name} đang ở trạng thái ${project.data?.status}. ` +
                    `Tiến độ đạt ${project.data?.progress}%, so với kế hoạch ${project.data?.plan_progress}%. ` +
                    `Đã chi tiêu ${budgetUsage.toFixed(1)}% ngân sách. ` +
                    `Cần lưu ý: ${delayedTasks} việc chậm, ${openIssues} vấn đề mở và ${highRisks} rủi ro cao.`
            };
        }
    },

    get_vendor_insights: {
        name: 'get_vendor_insights',
        description: 'Phân tích và đánh giá nhà cung cấp dựa trên dữ liệu lịch sử (PO, chất lượng, tiến độ).',
        parameters: {
            type: 'object',
            properties: {
                vendor_query: { type: 'string', description: 'Tên hoặc từ khóa nhà cung cấp' },
            },
            required: ['vendor_query'],
        },
        execute: async ({ vendor_query }) => {
            const { data: vendors } = await supabase
                .from('vendors')
                .select('*')
                .ilike('name', `%${vendor_query}%`);

            if (!vendors || vendors.length === 0) return { error: "Không tìm thấy nhà cung cấp" };

            const vendor = vendors[0];
            const { data: pos } = await supabase.from('purchase_orders').select('*').eq('vendor_id', vendor.id);

            const totalVolume = pos?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
            const averagePO = pos?.length ? totalVolume / pos.length : 0;
            const statusCount = {
                'Completed': pos?.filter(p => p.status === 'Completed').length || 0,
                'Pending': pos?.filter(p => p.status === 'Pending').length || 0,
                'Cancelled': pos?.filter(p => p.status === 'Cancelled').length || 0,
            };

            return {
                vendor_name: vendor.name,
                rating: vendor.rating,
                total_projects: vendor.total_projects,
                financial_stats: {
                    total_volume: totalVolume,
                    average_order: averagePO,
                    po_count: pos?.length || 0
                },
                delivery_performance: statusCount,
                recommendation: vendor.rating >= 4 ? "Ưu tiên lựa chọn" : vendor.rating >= 3 ? "Cân nhắc kỹ" : "Hạn chế sử dụng"
            };
        }
    },

    get_enterprise_highlights: {
        name: 'get_enterprise_highlights',
        description: 'Lấy tóm tắt các sự kiện nổi bật trên toàn hệ thống (Dành cho cấp quản lý).',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
        execute: async () => {
            const [projects, alerts, budget] = await Promise.all([
                supabase.from('projects').select('name, status, progress'),
                supabase.from('alerts').select('*').eq('is_read', false).eq('severity', 'high'),
                supabase.from('project_budget').select('budget_amount, actual_amount')
            ]);

            const activeProjects = projects.data?.length || 0;
            const highAlerts = alerts.data?.length || 0;

            const totalBudget = budget.data?.reduce((sum, b) => sum + (b.budget_amount || 0), 0) || 0;
            const totalActual = budget.data?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0;

            return {
                summary_stats: {
                    active_projects: activeProjects,
                    high_priority_alerts: highAlerts,
                    total_budget_usage: totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) + "%" : "0%"
                },
                top_alerts: alerts.data?.slice(0, 3).map(a => a.title),
                message: `Chào anh, hệ thống hiện có ${activeProjects} dự án đang chạy. Có ${highAlerts} cảnh báo quan trọng cần xử lý ngay. Tổng chi tiêu ngân sách toàn công ty hiện ở mức ${totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}%.`
            };
        }
    },

    predict_project_completion: {
        name: 'predict_project_completion',
        description: 'Dự báo ngày hoàn thành và xu hướng tiến độ dự án dựa trên dữ liệu thực tế.',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án (P-001) hoặc Tên dự án (Dream Residence). QUAN TRỌNG: Chỉ lấy tên riêng, bỏ từ "Dự án".' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: `Không tìm thấy dự án` };

            const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
            if (!project) return { error: "Không tìm thấy dữ liệu" };

            // Heuristic calculation: 
            // If project is 6 months in and at 30%, it gains 5% per month. 
            // Remaining 70% will take 14 months.
            const startDate = new Date(project.start_date || Date.now());
            const now = new Date();
            const elapsedMonths = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const progress = project.progress || 0;
            const velocity = progress / elapsedMonths; // % per month

            const remainingProgress = 100 - progress;
            const predictedMonthsRemaining = velocity > 0 ? remainingProgress / velocity : Infinity;
            const originalDuration = (new Date(project.end_date || '').getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

            const predictedEndDate = new Date(now.getTime() + predictedMonthsRemaining * 30 * 24 * 60 * 60 * 1000);
            const isDelayed = predictedEndDate > new Date(project.end_date || '');

            return {
                project_name: project.name,
                velocity: velocity.toFixed(2) + "% / tháng",
                original_end_date: project.end_date,
                predicted_end_date: predictedEndDate.toISOString().split('T')[0],
                status: isDelayed ? "CẢNH BÁO CHẬM TRỄ" : "ĐÚNG TIẾN ĐỘ",
                delay_days: isDelayed ? Math.floor((predictedEndDate.getTime() - new Date(project.end_date || '').getTime()) / (1000 * 24 * 60 * 60)) : 0,
                recommendation: isDelayed ? "Cần tăng cường nguồn lực ngay lập tức để bù đắp tiến độ." : "Duy trì tốc độ hiện tại."
            };
        }
    },

    analyze_material_supply_risk: {
        name: 'analyze_material_supply_risk',
        description: 'Phân tích rủi ro thiếu hụt vật tư dựa trên tồn kho và nhu cầu dự án.',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án hoặc tên dự án' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);

            // In a real system, we'd check project requirements. 
            // Here we check inventory items with status 'Low'
            const { data: lowStock } = await supabase
                .from('inventory')
                .select('*')
                .eq('status', 'Low');

            const { data: pendingPOs } = await supabase
                .from('purchase_orders')
                .select('*')
                .eq('status', 'Pending');

            return {
                critical_materials: lowStock?.map(i => ({
                    item: i.name,
                    warehouse: i.warehouse,
                    current_qty: i.quantity,
                    unit: i.unit,
                    risk_level: 'High'
                })) || [],
                supply_chain_mitigation: {
                    pending_pos: pendingPOs?.length || 0,
                    suggested_action: "Đẩy nhanh tiến độ phê duyệt các PO đang chờ hoặc tìm kiếm nhà cung cấp thay thế cho các mặt hàng tồn kho thấp."
                },
                message: lowStock?.length
                    ? `Phát hiện ${lowStock.length} mặt hàng vật tư đang ở mức báo động thấp. Rủi ro gián đoạn thi công cao.`
                    : "Tình hình cung ứng vật tư hiện tại đang ổn định."
            };
        }
    },

    get_budget_forecast: {
        name: 'get_budget_forecast',
        description: 'Dự báo chi phí khi hoàn thành dự án (EAC - Estimate At Completion).',
        parameters: {
            type: 'object',
            properties: {
                project_identifier: { type: 'string', description: 'Mã dự án hoặc tên dự án' },
            },
            required: ['project_identifier'],
        },
        execute: async ({ project_identifier }) => {
            const projectId = await resolveProjectId(project_identifier);
            if (!projectId) return { error: "Không tìm thấy dự án" };

            const { data: budget } = await supabase.from('project_budget').select('*').eq('project_id', projectId);
            const { data: project } = await supabase.from('projects').select('name, progress, budget').eq('id', projectId).single();

            const actualSpent = budget?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0;
            const progress = project?.progress || 1; // Avoid divide by zero

            // Simple EAC formula: EAC = Actual Spent / Progress
            const eac = (actualSpent / progress) * 100;
            const plannedBudget = project?.budget || 0;
            const variance = plannedBudget - eac;

            return {
                project_name: project?.name,
                current_metrics: {
                    spent_to_date: actualSpent,
                    current_progress: progress + "%"
                },
                forecast: {
                    estimate_at_completion: Math.round(eac),
                    planned_budget: plannedBudget,
                    projected_variance: Math.round(variance),
                    status: variance < 0 ? "VƯỢT NGÂN SÁCH DỰ KIẾN" : "DƯỚI NGÂN SÁCH DỰ KIẾN"
                },
                advisory: variance < 0
                    ? `Dự án có xu hướng vượt ngân sách khoảng ${Math.abs(Math.round(variance / 1000000))} triệu VNĐ khi hoàn thành. Cần rà soát lại các hạng mục chi phí biến đổi.`
                    : "Chi phí đang được kiểm soát tốt theo sát tiến độ."
            };
        }
    }
};

// Helper to resolve project ID
async function resolveProjectId(identifier: string): Promise<string | null> {
    // If it looks like a UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) return identifier;

    // Otherwise search by code or name (case-insensitive)
    // Otherwise search by code or name (case-insensitive)
    // 1. Try exact match on code
    const { data: exactCode } = await supabase
        .from('projects')
        .select('id')
        .ilike('code', identifier)
        .maybeSingle();

    if (exactCode) return exactCode.id;

    // 2. Try fuzzy match on name or partial code
    const { data } = await supabase
        .from('projects')
        .select('id')
        .or(`code.ilike.%${identifier}%,name.ilike.%${identifier}%`)
        .limit(1)
        .maybeSingle();

    return data?.id || null;
}
