import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';

// Các lĩnh vực thi công theo yêu cầu
const CONSTRUCTION_TYPES = [
    "Công trình thấp tầng",
    "Công trình cao tầng",
    "Hạ tầng kỹ thuật cảnh quan",
    "Hệ thống cơ điện",
    "Hoàn thiện và lắp đặt nội thất",
    "Công trình công nghiệp"
];

// --- Thẻ Thống kê Cao cấp ---
const LuxuryStatCard = ({ title, value, icon, color, gradient }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-glass hover:shadow-premium transition-premium group relative overflow-hidden flex items-center gap-4 flex-1">
        <div className={`absolute -right-4 -top-4 size-24 opacity-5 blur-2xl rounded-full ${gradient}`}></div>
        <div className={`size-12 rounded-2xl flex items-center justify-center ${color} shadow-lg transition-premium group-hover:scale-110 shrink-0`}>
            <span className="material-symbols-outlined text-[24px] text-white">{icon}</span>
        </div>
        <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">{title}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

// --- Modal tạo dự án mới ---
const ProjectModal = ({ isOpen, onClose, onSave, project }: { isOpen: boolean, onClose: () => void, onSave: (p: any) => void, project?: Project | null }) => {
    const [formData, setFormData] = useState<Partial<Project>>({
        name: '', code: '', location: '', manager: '', type: CONSTRUCTION_TYPES[0], status: 'active', members: []
    });
    const [newMember, setNewMember] = useState('');

    useEffect(() => {
        if (project) {
            setFormData({ ...project, members: project.members || [] });
        } else {
            setFormData({ name: '', code: '', location: '', manager: 'Nguyễn Văn An', type: CONSTRUCTION_TYPES[0], status: 'active', members: [] });
        }
    }, [project, isOpen]);

    const addMember = () => {
        if (newMember.trim() && !formData.members?.includes(newMember.trim())) {
            setFormData({ ...formData, members: [...(formData.members || []), newMember.trim()] });
            setNewMember('');
        }
    };

    const removeMember = (m: string) => {
        setFormData({ ...formData, members: formData.members?.filter(item => item !== m) });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-premium animate-in fade-in zoom-in duration-300">
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{project ? 'Cập nhật Dự án' : 'Khởi tạo Dự án mới'}</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Dành cho Giám đốc Dự án (Director Mode)</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-premium">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-10 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Dự án (Pháp lý)</label>
                        <input
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            placeholder="Nhập tên đầy đủ của dự án..."
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã hiệu Dự án</label>
                        <input
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            placeholder="VD: VIJAKO-HN-01"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lĩnh vực thi công</label>
                        <select
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            {CONSTRUCTION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa điểm thực hiện</label>
                        <input
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            placeholder="Nhập địa chỉ công trường..."
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chỉ huy trưởng được chỉ định</label>
                        <input
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            value={formData.manager}
                            onChange={e => setFormData({ ...formData, manager: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2 mt-4 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhân sự tham gia dự án</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                                placeholder="Nhập tên nhân sự..."
                                value={newMember}
                                onChange={e => setNewMember(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && addMember()}
                            />
                            <button
                                onClick={addMember}
                                className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-premium"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.members?.map((m, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-left duration-300">
                                    <span className="text-xs font-bold text-slate-700">{m}</span>
                                    <button onClick={() => removeMember(m)} className="text-slate-400 hover:text-red-500">
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-2 pt-6">
                        <div className="bg-emerald/5 border border-emerald/20 p-4 rounded-2xl flex items-center gap-4">
                            <span className="material-symbols-outlined text-emerald">auto_mode</span>
                            <p className="text-[11px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tighter">
                                Các chỉ số Tiến độ (Schedule), Sản lượng (Output) và Tài chính (Revenue) sẽ được hệ thống BI tự động cập nhật từ nhật ký và quyết toán công trường.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-3 rounded-2xl text-xs font-black uppercase text-slate-500 hover:bg-slate-200 transition-premium">Đóng</button>
                    <button onClick={() => onSave(formData)} className="px-8 py-3 mesh-gradient text-white rounded-2xl text-xs font-black uppercase shadow-premium hover:opacity-90 transition-premium">Lưu dự án</button>
                </div>
            </div>
        </div>
    );
};

const ProjectGridCard = ({ project, onEdit, onDelete }: { project: Project; onEdit: (p: Project) => void; onDelete: (id: string) => void }) => {
    return (
        <div className="group bg-white rounded-[40px] border border-slate-200 shadow-glass hover:shadow-premium transition-premium flex flex-col overflow-hidden relative">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={project.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        {project.type || 'Hạng mục khác'}
                    </span>
                </div>

                <div className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${project.status === 'active' ? 'bg-emerald/20 text-emerald-400 border-emerald-400/30' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' :
                        'bg-red-500/20 text-red-400 border-red-400/30'
                    }`}>
                    {project.status === 'active' ? 'Đang thi công' : 'Đã hoàn thành'}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1 font-mono">{project.code}</p>
                    <Link to={`/projects/${project.id}`} className="text-xl font-black text-white tracking-tight leading-tight hover:underline line-clamp-2 drop-shadow-lg">
                        {project.name}
                    </Link>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate">{project.location || 'Việt Nam'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">PM: {project.manager || 'Quản trị viên'}</span>
                    </div>
                </div>

                <div className="space-y-4 mt-auto">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ kế hoạch</span>
                            <span className="text-xs font-black text-emerald">{project.plan_progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald rounded-full transition-all duration-1000" style={{ width: `${project.plan_progress || 0}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản lượng thực hiện</span>
                            <span className="text-xs font-black text-primary">{project.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${project.progress || 0}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="size-6 rounded-full border-2 border-white ring-1 ring-slate-100" />
                            ))}
                            <div className="size-6 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">+5</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(project)} className="size-8 rounded-xl bg-slate-50 hover:bg-primary text-slate-400 hover:text-white transition-premium flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => onDelete(project.id)} className="size-8 rounded-xl bg-slate-50 hover:bg-red-500 text-slate-400 hover:text-white transition-premium flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProjectList() {
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getAllProjects();

            const mockProjects: Project[] = [
                {
                    id: '1', code: 'PRJ-S1', name: 'Trường Tiểu học Tiên Sơn', location: 'Sóc Sơn, Hà Nội',
                    manager: 'Nguyễn Văn An', progress: 65, plan_progress: 75, status: 'active', type: 'Công trình thấp tầng',
                    avatar: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee3f?q=80&w=800',
                    members: ['Trần Anh', 'Lê Bình']
                },
                {
                    id: '2', code: 'PRJ-C1', name: 'The Manor Central Park', location: 'Thanh Trì, Hà Nội',
                    manager: 'Trần Đức Bình', progress: 40, plan_progress: 55, status: 'active', type: 'Công trình cao tầng',
                    avatar: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800',
                    members: ['Vũ Đạt']
                },
                {
                    id: '3', code: 'PRJ-U1', name: 'Sun Urban City Hà Nam', location: 'Phủ Lý, Hà Nam',
                    manager: 'Lê Thị Mai', progress: 15, plan_progress: 20, status: 'active', type: 'Hạ tầng kỹ thuật cảnh quan',
                    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800'
                },
                {
                    id: '4', code: 'PRJ-I1', name: 'Nhà máy Foxconn Bắc Giang', location: 'Bắc Giang',
                    manager: 'Phạm Hồng Quân', progress: 90, plan_progress: 90, status: 'active', type: 'Công trình công nghiệp',
                    avatar: 'https://images.unsplash.com/photo-1565008480292-22621ec41da7?q=80&w=800'
                },
                {
                    id: '5', code: 'PRJ-M1', name: 'Hệ thống cơ điện - Aeon Mall', location: 'Hải Phòng',
                    manager: 'Hoàng Văn Thái', progress: 100, plan_progress: 100, status: 'completed', type: 'Hệ thống cơ điện',
                    avatar: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=800'
                }
            ];

            if (data && data.length > 0) {
                setProjectList(data);
            } else {
                setProjectList(mockProjects);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleTypeToggle = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleSaveProject = async (projectData: any) => {
        try {
            if (projectData.id) {
                await projectService.updateProject(projectData.id, projectData);
            } else {
                await projectService.createProject(projectData);
            }
            setIsEditModalOpen(false);
            fetchProjects();
        } catch (error) {
            if (projectData.id) {
                setProjectList(prev => prev.map(p => p.id === projectData.id ? projectData : p));
            } else {
                setProjectList(prev => [...prev, { ...projectData, id: Math.random().toString(36).substr(2, 9) }]);
            }
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
            try {
                await projectService.deleteProject(id);
                fetchProjects();
            } catch (error) {
                setProjectList(prev => prev.filter(p => p.id !== id));
            }
        }
    };

    const filteredProjects = projectList.filter(p => {
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(p.type || '');
        return matchesStatus && matchesSearch && matchesType;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Top Navigation Links (Tabs) */}
            <div className="px-10 pt-6 flex items-center border-b border-slate-100">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'completed', label: 'Đã hoàn thành' },
                    { id: 'active', label: 'Đang thi công' },
                    { id: 'master', label: 'Tổng thầu' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-12 py-4 text-sm font-bold transition-premium relative ${statusFilter === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        {tab.label}
                        {statusFilter === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Header Area */}
            <div className="px-10 py-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">Cơ sở hạ tầng & Tài sản</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Danh mục Dự án</h1>

                    <div className="relative w-full max-w-md group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-premium">search</span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            placeholder="Nhập tên dự án..."
                        />
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <LuxuryStatCard title="Công trường hoạt động" value={projectList.filter(p => p.status === 'active').length} icon="apartment" color="bg-primary" gradient="bg-primary" />
                    <LuxuryStatCard title="Tỷ lệ tăng trưởng" value="+12.5%" icon="trending_up" color="bg-emerald" gradient="bg-emerald" />
                    <button
                        onClick={() => { setCurrentProject(null); setIsEditModalOpen(true); }}
                        className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium hover:shadow-lg transition-premium flex items-center gap-2 shrink-0 h-[72px]"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Tạo dự án mới</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Filter Area */}
                <div className="w-80 border-r border-slate-100 p-10 overflow-y-auto hidden lg:block">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Lĩnh vực thi công</h3>
                    <div className="space-y-6">
                        {CONSTRUCTION_TYPES.map(type => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleTypeToggle(type)}
                                    className="size-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary transition-premium cursor-pointer"
                                />
                                <span className={`text-sm font-bold transition-premium ${selectedTypes.includes(type) ? 'text-primary' : 'text-slate-600 group-hover:text-slate-900'
                                    }`}>
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-12 pt-12 border-t border-slate-100">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bộ lọc đang chọn</h4>
                            <p className="text-xl font-black text-slate-900">{filteredProjects.length} <span className="text-xs text-slate-500 font-bold uppercase ml-1">Dự án</span></p>
                            {selectedTypes.length > 0 && (
                                <button
                                    onClick={() => setSelectedTypes([])}
                                    className="mt-4 text-[10px] font-black text-primary uppercase border-b-2 border-primary/20 hover:border-primary transition-premium"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 custom-scrollbar">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Danh sách dự án</h2>
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-premium ${viewMode === 'list' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><span className="material-symbols-outlined">format_list_bulleted</span></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-premium ${viewMode === 'grid' ? 'bg-slate-100 text-primary shadow-inner' : 'text-slate-400'}`}><span className="material-symbols-outlined">grid_view</span></button>
                        </div>
                    </div>

                    <div className="max-w-[1500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                                <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest">Đang tải danh mục...</p>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-10 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy dự án</h3>
                                <p className="text-sm text-slate-500 font-medium">Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {filteredProjects.map(project => (
                                    <ProjectGridCard
                                        key={project.id}
                                        project={project}
                                        onEdit={(p) => { setCurrentProject(p); setIsEditModalOpen(true); }}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProject}
                project={currentProject}
            />
        </div>
    );
}