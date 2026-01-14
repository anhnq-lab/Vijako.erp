import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';

// --- Thẻ Thống kê Cao cấp ---
const LuxuryStatCard = ({ title, value, icon, color, gradient }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-glass hover:shadow-premium transition-premium group relative overflow-hidden flex items-center gap-4">
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
        name: '', code: '', location: '', manager: '', type: 'Dân dụng', status: 'active', members: []
    });
    const [newMember, setNewMember] = useState('');

    useEffect(() => {
        if (project) {
            setFormData({ ...project, members: project.members || [] });
        } else {
            setFormData({ name: '', code: '', location: '', manager: 'Nguyễn Văn An', type: 'Dân dụng', status: 'active', members: [] });
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại hình thi công</label>
                        <select
                            className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-premium"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option>Dân dụng</option>
                            <option>Công nghiệp</option>
                            <option>Hạ tầng</option>
                            <option>Đô thị</option>
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

                    {/* Thành viên tham dự */}
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
            {/* Ảnh nền tiêu đề */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={project.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

                {/* Nhãn trạng thái */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        {project.type || 'Công trình'}
                    </span>
                </div>

                <div className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${project.status === 'active' ? 'bg-emerald/20 text-emerald-400 border-emerald-400/30' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' :
                        'bg-red-500/20 text-red-400 border-red-400/30'
                    }`}>
                    {project.status === 'active' ? 'Đang thi công' : 'Đã hoàn thành'}
                </div>

                {/* Thông tin nổi lên */}
                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1 font-mono">{project.code}</p>
                    <Link to={`/projects/${project.id}`} className="text-xl font-black text-white tracking-tight leading-tight hover:underline line-clamp-2 drop-shadow-lg">
                        {project.name}
                    </Link>
                </div>
            </div>

            {/* Nội dung chính */}
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

                {/* Thanh Tiến độ và Sản lượng */}
                <div className="space-y-4 mt-auto">
                    {/* Thanh Tiến độ Kế hoạch */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ kế hoạch</span>
                            <span className="text-xs font-black text-emerald">{project.plan_progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald rounded-full transition-all duration-1000" style={{ width: `${project.plan_progress || 0}%` }}></div>
                        </div>
                    </div>

                    {/* Thanh Sản lượng Thực tế */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản lượng thực hiện</span>
                            <span className="text-xs font-black text-primary">{project.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${project.progress || 0}%` }}></div>
                        </div>
                    </div>

                    {/* Meta Action */}
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
    const [filter, setFilter] = useState('all');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getAllProjects();

            // Mock data fallback if DB returns empty
            const mockProjects: Project[] = [
                {
                    id: '1', code: 'PRJ-2024-001', name: 'Trường Tiểu học Tiên Sơn', location: 'Sóc Sơn, Hà Nội',
                    manager: 'Nguyễn Văn An', progress: 65, plan_progress: 75, status: 'active', type: 'Dân dụng',
                    avatar: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee3f?q=80&w=800',
                    members: ['Trần Anh', 'Lê Bình', 'Phạm Cẩn']
                },
                {
                    id: '2', code: 'PRJ-2024-002', name: 'Nhà máy Foxconn Bắc Giang', location: 'KCN Quang Châu, Bắc Giang',
                    manager: 'Trần Đức Bình', progress: 40, plan_progress: 50, status: 'active', type: 'Công nghiệp',
                    avatar: 'https://images.unsplash.com/photo-1565008480292-22621ec41da7?q=80&w=800',
                    members: ['Vũ Đạt', 'Hoàng Em']
                },
                {
                    id: '3', code: 'PRJ-2024-003', name: 'Sun Urban City Hà Nam', location: 'Phủ Lý, Hà Nam',
                    manager: 'Lê Thị Mai', progress: 15, plan_progress: 20, status: 'active', type: 'Đô thị',
                    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
                    members: ['Ngô Giang', 'Lý Hà']
                },
                {
                    id: '4', code: 'PRJ-2023-010', name: 'Aeon Mall Hải Phòng', location: 'Lê Chân, Hải Phòng',
                    manager: 'Phạm Hồng Quân', progress: 100, plan_progress: 100, status: 'completed', type: 'Thương mại',
                    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d3fd0d?q=80&w=800',
                    members: ['Đỗ Hùng', 'Bùi Kương']
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
            console.error('Error saving project:', error);
            // Fallback for demo if no backend
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
                console.error('Error deleting project:', error);
                setProjectList(prev => prev.filter(p => p.id !== id));
            }
        }
    };

    const filteredProjects = projectList.filter(p => {
        const matchesStatus = filter === 'all' || p.status === filter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header Sang trọng */}
            <div className="px-10 py-8 bg-white border-b border-slate-200/50 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-[10px] font-black text-primary-accent uppercase tracking-[0.4em] mb-1">Cơ sở hạ tầng & Tài sản</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Danh mục Dự án</h1>
                    </div>
                    <div className="flex gap-4">
                        <LuxuryStatCard title="Công trường hoạt động" value={projectList.length} icon="apartment" color="bg-primary" gradient="bg-primary" />
                        <LuxuryStatCard title="Tỷ lệ tăng trưởng" value="+12.5%" icon="trending_up" color="bg-emerald" gradient="bg-emerald" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-96">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-premium">search</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-premium"
                                placeholder="Tìm kiếm đơn vị thi công, mã dự án hoặc địa điểm..."
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-primary cursor-pointer hover:bg-slate-50 transition-premium shadow-sm"
                        >
                            <option value="all">Trạng thái: Tất cả</option>
                            <option value="active">Đang thực hiện</option>
                            <option value="completed">Đã bàn giao</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-premium ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">format_list_bulleted</span></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-premium ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">grid_view</span></button>
                        </div>
                        <button
                            onClick={() => { setCurrentProject(null); setIsEditModalOpen(true); }}
                            className="px-8 py-3 mesh-gradient text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium hover:opacity-90 transition-premium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Tạo dự án mới</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-[1700px] mx-auto min-h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-lg"></div>
                            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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

            <ProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveProject}
                project={currentProject}
            />
        </div>
    );
}