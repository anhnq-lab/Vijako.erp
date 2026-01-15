import React, { useState, useEffect } from 'react';
import { TaskBoard } from '../src/components/TaskBoard';
import { TaskTable } from '../src/components/TaskTable';
import { WBSTable } from '../src/components/WBSTable';
import { TaskDetailModal } from '../src/components/TaskDetailModal';
import { projectService } from '../src/services/projectService';
import { UserTask, Project, WBSItem } from '../types';
import { showToast } from '../src/components/ui/Toast';

const TaskManagement = () => {
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my_tasks' | 'project_tasks'>('my_tasks');
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Project WBS States
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [wbsItems, setWbsItems] = useState<WBSItem[]>([]);
    const [loadingWBS, setLoadingWBS] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // For now, only fetching user tasks. WBS integration can be added later or mixed here.
            const userTasks = await projectService.getUserTasks();
            setTasks(userTasks);

            // Also fetch projects list
            const projectList = await projectService.getAllProjects();
            setProjects(projectList);
        } catch (error) {
            console.error(error);
            showToast.error('Không thể tải danh sách công việc');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = async (projectId: string) => {
        setSelectedProjectId(projectId);
        if (!projectId) {
            setWbsItems([]);
            return;
        }

        setLoadingWBS(true);
        try {
            const items = await projectService.getProjectWBS(projectId);
            setWbsItems(items);
        } catch (error) {
            console.error(error);
            showToast.error('Lỗi khi tải WBS dự án');
        } finally {
            setLoadingWBS(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: UserTask['status']) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await projectService.updateUserTask(taskId, { status: newStatus });
            showToast.success('Cập nhật trạng thái thành công');
        } catch (error) {
            showToast.error('Lỗi khi cập nhật trạng thái');
            fetchTasks(); // Revert on error
        }
    };

    const handleTaskClick = (task: UserTask) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleTaskUpdate = (updatedTask: UserTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleQuickCreate = async () => {
        // Demo quick create
        try {
            const newTask = await projectService.createUserTask({
                title: 'Công việc mới (Demo)',
                description: 'Được tạo nhanh từ dashboard',
                status: 'todo',
                priority: 'normal',
                due_date: new Date().toISOString()
            });
            if (newTask) {
                setTasks(prev => [...prev, newTask]);
                showToast.success('Đã tạo công việc mới');
            }
        } catch (error) {
            showToast.error('Lỗi khi tạo công việc');
        }
    };

    const handleGenerateSampleData = async () => {
        setLoading(true);
        try {
            const sampleTasks: Omit<UserTask, 'id' | 'created_at' | 'user_id'>[] = [
                { title: 'Họp giao ban tuần', description: 'Chuẩn bị tài liệu báo cáo tiến độ tuần 42', status: 'todo', priority: 'high', due_date: new Date(Date.now() + 86400000).toISOString() },
                { title: 'Kiểm tra hiện trường dự án A', description: 'Nghiệm thu công tác cốt thép sàn tầng 5', status: 'in_progress', priority: 'high', due_date: new Date().toISOString() },
                { title: 'Phê duyệt đề xuất vật tư', description: 'Xem xét và phê duyệt đề xuất mua sắm vật tư điện nước', status: 'todo', priority: 'normal', due_date: new Date(Date.now() + 172800000).toISOString() },
                { title: 'Làm báo cáo tháng', description: 'Tổng hợp số liệu tài chính và nhân sự tháng 1', status: 'blocked', priority: 'normal', due_date: new Date(Date.now() - 86400000).toISOString() },
                { title: 'Gặp gỡ chủ đầu tư', description: 'Thảo luận về phương án thay đổi thiết kế mặt tiền', status: 'done', priority: 'high', due_date: new Date(Date.now() - 259200000).toISOString() }
            ];

            const createdTasks = [];
            for (const task of sampleTasks) {
                const newTask = await projectService.createUserTask(task);
                if (newTask) createdTasks.push(newTask);
            }

            setTasks(prev => [...prev, ...createdTasks]);
            showToast.success(`Đã tạo ${createdTasks.length} công việc mẫu`);
        } catch (error) {
            console.error(error);
            showToast.error('Lỗi khi tạo dữ liệu mẫu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#f8fafc]">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-slate-800">Quản lý Công việc</h1>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('my_tasks')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'my_tasks' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Của tôi
                        </button>
                        <button
                            onClick={() => setActiveTab('project_tasks')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'project_tasks' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Dự án
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Dạng bảng (Kanban)"
                        >
                            <span className="material-symbols-outlined text-[20px]">view_kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Dạng danh sách"
                        >
                            <span className="material-symbols-outlined text-[20px]">table_rows</span>
                        </button>
                    </div>
                    <button
                        onClick={handleQuickCreate}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-light shadow-premium transition-premium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm công việc
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Đang tải dữ liệu...
                    </div>
                ) : (tasks.length === 0 && activeTab === 'my_tasks') ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-slate-300">task</span>
                        <h3 className="text-lg font-bold text-slate-600 mb-2">Chưa có công việc nào</h3>
                        <p className="mb-6 max-w-sm text-center">Bạn chưa có công việc nào trong danh sách. Hãy tạo mới hoặc tạo dữ liệu mẫu để thử nghiệm.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleQuickCreate}
                                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition-premium"
                            >
                                Tạo một việc
                            </button>
                            <button
                                onClick={handleGenerateSampleData}
                                className="px-4 py-2 rounded-xl bg-primary text-white font-bold shadow-premium hover:shadow-lg hover:-translate-y-0.5 transition-premium"
                            >
                                Tạo dữ liệu mẫu
                            </button>
                        </div>
                    </div>
                ) : (
                    activeTab === 'my_tasks' ? (
                        viewMode === 'board' ? (
                            <TaskBoard
                                tasks={tasks}
                                onStatusChange={handleStatusChange}
                                onTaskClick={handleTaskClick}
                            />
                        ) : (
                            <TaskTable
                                tasks={tasks}
                                onStatusChange={handleStatusChange}
                                onTaskClick={handleTaskClick}
                            />
                        )
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Project Selector Toolbar */}
                            <div className="mb-4 flex items-center gap-4">
                                <div className="relative min-w-[300px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">apartment</span>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => handleProjectChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
                                    >
                                        <option value="">-- Chọn dự án --</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                                {selectedProjectId && (
                                    <div className="text-sm text-slate-500 font-semibold animate-in fade-in slide-in-from-left-2">
                                        {wbsItems.length} hạng mục công việc
                                    </div>
                                )}
                            </div>

                            {/* WBS Table */}
                            {selectedProjectId ? (
                                <WBSTable items={wbsItems} loading={loadingWBS} />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-1">
                                    <span className="material-symbols-outlined text-[64px] mb-4 text-slate-300">engineering</span>
                                    <h3 className="text-lg font-bold text-slate-600 mb-2">Chọn dự án để xem WBS</h3>
                                    <p className="text-center max-w-sm text-slate-500">Vui lòng chọn một dự án từ danh sách trên để xem cấu trúc phân chia công việc (WBS).</p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            <TaskDetailModal
                task={selectedTask}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onUpdate={handleTaskUpdate}
            />
        </div>
    );
};

export default TaskManagement;
