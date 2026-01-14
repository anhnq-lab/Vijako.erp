import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../src/services/projectService';

// --- Types & Mock Data ---

interface ProjectHealth {
    schedule: 'good' | 'warning' | 'critical';
    budget: 'good' | 'warning' | 'critical';
    safety: 'good' | 'warning' | 'critical';
}

interface Project {
    id: string;
    code: string;
    name: string;
    type: string;
    sub: string;
    loc: string;
    manager: string;
    progress: number;
    revenue: number;
    status: 'active' | 'pending' | 'finished' | 'delayed' | 'init';
    health: ProjectHealth;
    budget: string;
    deadline: string;
    startDate: string;
    image: string;
    members: number;
    nextMilestone: {
        date: string;
        name: string;
    };
}

const initialProjects: Project[] = [
    {
        id: "1", code: "VJK-24-001", name: "The Nine Tower", type: "Cao ốc", sub: "Gói thầu Hoàn thiện & MEP", loc: "Hà Nội",
        manager: "Nguyễn Văn A", progress: 75, revenue: 70, status: "active", budget: "450",
        startDate: "2023-01-01", deadline: "2024-12-30",
        health: { schedule: 'good', budget: 'good', safety: 'warning' },
        nextMilestone: { date: "15/06", name: "Nghiệm thu PCCC" },
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop", members: 120
    },
    {
        id: "2", code: "VJK-24-005", name: "Nhà máy Foxconn GĐ2", type: "Công nghiệp", sub: "Xây dựng Nhà xưởng B", loc: "Bắc Giang",
        manager: "Trần Bình", progress: 15, revenue: 25, status: "pending", budget: "120",
        startDate: "2024-02-15", deadline: "2025-08-15",
        health: { schedule: 'critical', budget: 'warning', safety: 'good' },
        nextMilestone: { date: "20/06", name: "Lắp dựng kết cấu thép" },
        image: "https://images.unsplash.com/photo-1581094794329-cd1361ddee2d?q=80&w=800&auto=format&fit=crop", members: 45
    },
    {
        id: "3", code: "VJK-23-089", name: "Vinhomes Ocean Park 3", type: "Khu đô thị", sub: "Phân khu Thời Đại", loc: "Hưng Yên",
        manager: "Lê Văn Cường", progress: 92, revenue: 95, status: "finished", budget: "850",
        startDate: "2023-06-01", deadline: "2024-06-01",
        health: { schedule: 'good', budget: 'good', safety: 'good' },
        nextMilestone: { date: "Hoàn thành", name: "Bàn giao chủ đầu tư" },
        image: "https://images.unsplash.com/photo-1542621334-a254cf47733d?q=80&w=800&auto=format&fit=crop", members: 210
    },
    {
        id: "4", code: "VJK-24-012", name: "Cầu Mỹ Thuận 2", type: "Hạ tầng", sub: "Thi công Trụ T15 & T16", loc: "Vĩnh Long",
        manager: "Phạm Dũng", progress: 45, revenue: 30, status: "delayed", budget: "1200",
        startDate: "2024-01-01", deadline: "2025-11-20",
        health: { schedule: 'critical', budget: 'critical', safety: 'warning' },
        nextMilestone: { date: "30/06", name: "Hợp long nhịp chính" },
        image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800&auto=format&fit=crop", members: 350
    },
    {
        id: "5", code: "VJK-24-022", name: "Aeon Mall Huế", type: "Thương mại", sub: "Thi công Móng cọc", loc: "Huế",
        manager: "Hoàng Hải", progress: 5, revenue: 10, status: "init", budget: "65",
        startDate: "2024-05-01", deadline: "2025-02-10",
        health: { schedule: 'good', budget: 'good', safety: 'good' },
        nextMilestone: { date: "01/07", name: "Ép cọc đại trà" },
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop", members: 25
    },
];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    let styles = "";
    let label = "";

    switch (status) {
        case 'active': styles = "bg-green-500 text-white border-green-600 shadow-green-200 shadow-sm"; label = "Đang thi công"; break;
        case 'delayed': styles = "bg-red-500 text-white border-red-600 shadow-red-200 shadow-sm"; label = "Chậm tiến độ"; break;
        case 'pending': styles = "bg-yellow-500 text-white border-yellow-600 shadow-yellow-200 shadow-sm"; label = "Tạm dừng"; break;
        case 'finished': styles = "bg-blue-500 text-white border-blue-600 shadow-blue-200 shadow-sm"; label = "Hoàn thành"; break;
        default: styles = "bg-slate-500 text-white border-slate-600 shadow-slate-200 shadow-sm"; label = "Khởi tạo"; break;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border ${styles} uppercase tracking-wide`}>
            {label}
        </span>
    );
};

const HealthIndicator = ({ type, status }: { type: string, status: 'good' | 'warning' | 'critical' }) => {
    let color = "bg-slate-200";
    let icon = "";

    if (status === 'good') { color = "bg-green-500"; icon = "check"; }
    else if (status === 'warning') { color = "bg-yellow-500"; icon = "priority_high"; }
    else if (status === 'critical') { color = "bg-red-500"; icon = "close"; }

    let tooltip = "";
    switch (type) {
        case 'schedule': tooltip = "Tiến độ (Schedule)"; break;
        case 'budget': tooltip = "Ngân sách (Budget)"; break;
        case 'safety': tooltip = "An toàn (Safety)"; break;
    }

    return (
        <div className="flex flex-col items-center gap-1 group/health relative">
            <div className={`size-6 rounded-full ${color} flex items-center justify-center text-white border-2 border-white shadow-sm transition-transform hover:scale-110`}>
                <span className="material-symbols-outlined text-[14px]">{icon}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{type === 'schedule' ? 'T.Độ' : (type === 'budget' ? 'Ngân sách' : 'An toàn')}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/health:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {tooltip}: {status.toUpperCase()}
            </div>
        </div>
    )
}

const KPICard = ({ title, value, icon, color }: any) => (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`size-12 rounded-lg flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
            <h3 className="text-xl font-black text-slate-900">{value}</h3>
        </div>
    </div>
);

// --- Form Modal Component ---

const ProjectModal = ({ isOpen, onClose, project, onSave }: { isOpen: boolean, onClose: () => void, project: Project | null, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<any>({
        code: '', name: '', type: 'Cao ốc', sub: '', loc: '', manager: '',
        status: 'init', budget: '', startDate: '', deadline: ''
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            setFormData({
                code: '', name: '', type: 'Cao ốc', sub: '', loc: '', manager: '',
                status: 'init', budget: '', startDate: '', deadline: ''
            });
        }
    }, [project, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">
                        {project ? 'Chỉnh sửa Dự án' : 'Khởi tạo Dự án Mới'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Mã Dự án</label>
                            <input
                                required
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="VD: VJK-24-001"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Loại công trình</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="Cao ốc">Cao ốc Văn phòng / Chung cư</option>
                                <option value="Công nghiệp">Nhà xưởng Công nghiệp</option>
                                <option value="Hạ tầng">Cầu đường / Hạ tầng</option>
                                <option value="Khu đô thị">Khu đô thị / Resort</option>
                                <option value="Thương mại">Trung tâm Thương mại</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dự án</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="VD: The Nine Tower"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Hạng mục / Mô tả ngắn</label>
                            <input
                                type="text"
                                value={formData.sub}
                                onChange={e => setFormData({ ...formData, sub: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="VD: Gói thầu Hoàn thiện & MEP"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Địa điểm</label>
                            <input
                                type="text"
                                value={formData.loc}
                                onChange={e => setFormData({ ...formData, loc: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="VD: Hà Nội"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Giám đốc Dự án</label>
                            <input
                                type="text"
                                value={formData.manager}
                                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ngày khởi công</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-500"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ngày hoàn thành (Dự kiến)</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-500"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ngân sách (Tỷ VNĐ)</label>
                            <input
                                type="number"
                                value={formData.budget}
                                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                                placeholder="0"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="init">Khởi tạo</option>
                                <option value="active">Đang thi công</option>
                                <option value="pending">Tạm dừng</option>
                                <option value="delayed">Chậm tiến độ</option>
                                <option value="finished">Hoàn thành</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {project ? 'Lưu thay đổi' : 'Tạo Dự án'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// --- View Modes ---

const ProjectGridCard: React.FC<{ project: Project, onEdit: (p: Project) => void, onDelete: (id: string) => void }> = ({ project, onEdit, onDelete }) => {
    return (
        <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">

            {/* Header Image with Overlay Actions */}
            <div className="h-44 relative overflow-hidden bg-slate-100">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                {/* Actions Top Right */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={(e) => { e.preventDefault(); onEdit(project); }}
                        className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white text-white hover:text-primary transition-colors shadow-sm"
                        title="Chỉnh sửa"
                    >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); onDelete(project.id); }}
                        className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white text-white hover:text-red-600 transition-colors shadow-sm"
                        title="Xóa dự án"
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                </div>

                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-white/50">
                        {project.type}
                    </span>
                </div>

                <Link to={`/projects/${project.id}`} className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[10px] font-mono opacity-80 mb-0.5">{project.code}</p>
                    <h3 className="text-lg font-bold leading-tight shadow-black drop-shadow-md truncate" title={project.name}>{project.name}</h3>
                </Link>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-xs text-slate-500 flex flex-col gap-1">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {project.loc}</span>
                        <span className="font-bold text-slate-700 line-clamp-1">{project.sub}</span>
                    </div>
                    <div className="text-right">
                        <StatusBadge status={project.status} />
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mt-1">End: {project.deadline}</span>
                    </div>
                </div>

                {/* Bars */}
                <Link to={`/projects/${project.id}`} className="mb-4 space-y-3 block">
                    {/* Physical Progress */}
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-bold text-slate-600">Sản lượng</span>
                            <span className={`font-bold ${project.status === 'delayed' ? 'text-red-600' : 'text-primary'}`}>{project.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${project.status === 'delayed' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                    {/* Revenue */}
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-bold text-slate-600">Doanh thu</span>
                            <span className="font-bold text-green-600">{project.revenue}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${project.revenue}%` }}></div>
                        </div>
                    </div>
                </Link>

                {/* Milestone & Health */}
                <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between gap-4">
                        {/* Milestone */}
                        <div className="flex-1 min-w-0 bg-yellow-50 border border-yellow-100 rounded-lg p-2 flex items-center gap-2">
                            <div className="bg-white p-1 rounded border border-yellow-100 shrink-0 text-yellow-600">
                                <span className="material-symbols-outlined text-[16px]">flag</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] text-yellow-700 font-bold uppercase">Mục tiêu {project.nextMilestone.date}</p>
                                <p className="text-[10px] font-bold text-slate-800 truncate" title={project.nextMilestone.name}>{project.nextMilestone.name}</p>
                            </div>
                        </div>

                        {/* Health Matrix */}
                        <div className="flex gap-2 shrink-0">
                            <HealthIndicator type="schedule" status={project.health.schedule} />
                            <HealthIndicator type="budget" status={project.health.budget} />
                            <HealthIndicator type="safety" status={project.health.safety} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProjectListView: React.FC<{ project: Project, onEdit: (p: Project) => void, onDelete: (id: string) => void }> = ({ project, onEdit, onDelete }) => {
    return (
        <tr className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
            <td className="px-6 py-4">
                <Link to={`/projects/${project.id}`} className="flex items-center gap-4">
                    <img src={project.image} className="size-12 rounded-lg object-cover border border-slate-200 shadow-sm" alt="" />
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{project.code}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">• {project.type}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{project.name}</p>
                    </div>
                </Link>
            </td>

            <td className="px-6 py-4">
                <div className="flex gap-2">
                    <HealthIndicator type="schedule" status={project.health.schedule} />
                    <HealthIndicator type="budget" status={project.health.budget} />
                    <HealthIndicator type="safety" status={project.health.safety} />
                </div>
            </td>

            <td className="px-6 py-4 w-48">
                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-medium">Sản lượng</span>
                            <span className={`font-bold ${project.status === 'delayed' ? 'text-red-600' : 'text-primary'}`}>{project.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${project.status === 'delayed' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-medium">Doanh thu</span>
                            <span className="font-bold text-green-600">{project.revenue}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${project.revenue}%` }}></div>
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 p-2 rounded-lg w-fit">
                    <span className="material-symbols-outlined text-[16px] text-yellow-600">flag</span>
                    <div className="text-xs">
                        <span className="block font-bold text-slate-900">{project.nextMilestone.name}</span>
                        <span className="block text-[10px] text-slate-500">Đích: {project.nextMilestone.date}</span>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-col items-end">
                    <StatusBadge status={project.status} />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">End: {project.deadline}</span>
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(project)} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-primary transition-colors" title="Sửa">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => onDelete(project.id)} className="p-2 hover:bg-red-100 rounded text-slate-500 hover:text-red-600 transition-colors" title="Xóa">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default function ProjectList() {
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getAllProjects();
            // Map database fields to UI fields if necessary
            const mappedData: Project[] = data.map((p: any) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                type: 'Cao ốc', // Default or from DB if added
                sub: 'Gói thầu xây lắp', // Default
                loc: p.location || '',
                manager: p.manager || '',
                progress: p.progress || 0,
                revenue: p.progress || 0, // Mock revenue as progress for now
                status: p.status === 'completed' ? 'finished' : p.status,
                health: { schedule: 'good', budget: 'good', safety: 'good' },
                budget: '0',
                deadline: '2024-12-31',
                startDate: '2024-01-01',
                image: p.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
                members: 10,
                nextMilestone: { date: 'TBD', name: 'Nghiệm thu' }
            }));
            setProjectList(mappedData);
        } catch (error) {
            console.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleSaveProject = async (formData: any) => {
        try {
            if (editingProject) {
                await projectService.updateProject(editingProject.id, {
                    code: formData.code,
                    name: formData.name,
                    location: formData.loc,
                    manager: formData.manager,
                    status: formData.status === 'finished' ? 'completed' : (formData.status as any),
                });
            } else {
                await projectService.createProject({
                    code: formData.code,
                    name: formData.name,
                    location: formData.loc,
                    manager: formData.manager,
                    status: formData.status === 'finished' ? 'completed' : (formData.status as any),
                    progress: 0,
                    planProgress: 0,
                });
            }
            fetchProjects(); // Refresh list to get latest data
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Không thể lưu dự án. Vui lòng thử lại.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
            try {
                await projectService.deleteProject(id);
                fetchProjects();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Không thể xóa dự án. Vui lòng thử lại.');
            }
        }
    };

    // Filter & Sort Logic
    const filteredProjects = projectList
        .filter(p => {
            const matchesStatus = filter === 'all' || p.status === filter;
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'revenue') return b.revenue - a.revenue;
            return a.deadline.localeCompare(b.deadline);
        });

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="flex-shrink-0 bg-white border-b border-slate-100 z-10 sticky top-0 shadow-sm">
                <div className="px-8 pt-6 pb-2">
                    <div className="mb-4 text-xs flex gap-2 text-slate-500">
                        <span>Trang chủ</span> / <span className="font-bold text-primary">Quản lý dự án</span>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap justify-between items-end pb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Danh sách Dự án</h2>
                            <p className="text-sm text-slate-500 mt-1">Quản lý tiến độ, ngân sách và nguồn lực toàn bộ công trình.</p>
                        </div>

                        {/* Top Stats - Quick View */}
                        <div className="hidden xl:flex gap-4">
                            <KPICard title="Tổng dự án" value={projectList.length} icon="domain" color="bg-blue-50 text-blue-600" />
                            <KPICard title="Đang thi công" value={projectList.filter(p => p.status === 'active').length} icon="engineering" color="bg-green-50 text-green-600" />
                            <KPICard title="Rủi ro cao" value={projectList.filter(p => p.health.schedule === 'critical').length} icon="warning" color="bg-red-50 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Tìm kiếm dự án (Tên, Mã)..."
                            />
                        </div>

                        {/* Filter Status */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:border-primary cursor-pointer hover:bg-slate-50"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang thi công</option>
                            <option value="pending">Tạm dừng</option>
                            <option value="delayed">Chậm tiến độ</option>
                            <option value="finished">Hoàn thành</option>
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:border-primary cursor-pointer hover:bg-slate-50"
                        >
                            <option value="deadline">Sắp xếp: Hạn chót</option>
                            <option value="progress">Sắp xếp: Tiến độ cao</option>
                            <option value="revenue">Sắp xếp: Doanh thu cao</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        {/* View Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Xem dạng danh sách"
                            >
                                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Xem dạng lưới (Deck View)"
                            >
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                            </button>
                        </div>

                        <button
                            onClick={handleAddProject}
                            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span> <span className="hidden sm:inline">Dự án mới</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="max-w-[1600px] mx-auto min-h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-500 font-medium tracking-tight">Đang tải dữ liệu dự án...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                            <span className="material-symbols-outlined text-[60px] mb-4 text-slate-300">search_off</span>
                            <p className="text-lg font-medium">Không tìm thấy dự án nào</p>
                            <button onClick={() => setSearch('')} className="mt-4 text-primary font-bold hover:underline">Xóa bộ lọc</button>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
                                    {filteredProjects.map(project => (
                                        <ProjectGridCard
                                            key={project.id}
                                            project={project}
                                            onEdit={handleEditProject}
                                            onDelete={handleDeleteProject}
                                        />
                                    ))}
                                    {/* Add New Card Placeholder */}
                                    <button
                                        onClick={handleAddProject}
                                        className="group border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50 transition-all min-h-[350px]"
                                    >
                                        <div className="size-16 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center mb-4 transition-colors">
                                            <span className="material-symbols-outlined text-[32px]">add</span>
                                        </div>
                                        <span className="font-bold">Khởi tạo dự án mới</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Dự án</th>
                                                <th className="px-6 py-4">Ma trận Sức khỏe</th>
                                                <th className="px-6 py-4">Tiến độ & Doanh thu</th>
                                                <th className="px-6 py-4">Mục tiêu tiếp theo</th>
                                                <th className="px-6 py-4 text-right">Trạng thái</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProjects.map(project => (
                                                <ProjectListView
                                                    key={project.id}
                                                    project={project}
                                                    onEdit={handleEditProject}
                                                    onDelete={handleDeleteProject}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Render Modal */}
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={editingProject}
                onSave={handleSaveProject}
            />
        </div>
    );
}