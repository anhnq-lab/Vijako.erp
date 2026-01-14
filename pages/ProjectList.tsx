import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';

// --- Helper Components ---

const KPICard = ({ title, value, icon, color }: { title: string, value: number | string, icon: string, color: string }) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm min-w-[180px]">
        <div className={`size-10 rounded-full flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
            <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const ProjectGridCard = ({ project, onEdit, onDelete }: { project: Project, onEdit: (p: Project) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden relative">
            <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                    src={project.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                    {project.type || 'Dự án'}
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="p-1.5 bg-white/90 rounded-full hover:bg-white text-slate-600 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-1.5 bg-white/90 rounded-full hover:bg-white text-slate-600 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-[10px] opacity-80 font-mono mb-0.5">{project.code}</p>
                    <Link to={`/projects/${project.id}`} className="font-bold text-lg leading-tight hover:underline line-clamp-2 shadow-black drop-shadow-md">
                        {project.name}
                    </Link>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4">
                {/* Info Text */}
                <div className="text-xs text-slate-500 flex flex-col gap-1.5">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">location_on</span>
                        <span className="line-clamp-1">{project.location || 'Chưa cập nhật địa điểm'}</span>
                    </div>
                    {project.package && (
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">assignment</span>
                            <span className="font-bold text-slate-700 line-clamp-2" title={project.package}>{project.package}</span>
                        </div>
                    )}
                    {project.description && (
                        <div className="mt-1 pl-6 text-[11px] italic text-slate-400 line-clamp-2 border-l-2 border-slate-100">
                            {project.description}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${project.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                            project.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                project.status === 'delayed' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        {project.status === 'active' ? 'ĐANG THI CÔNG' :
                            project.status === 'completed' ? 'HOÀN THÀNH' :
                                project.status === 'delayed' ? 'CHẬM TIẾN ĐỘ' : 'TẠM DỪNG'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 text-right">
                        End: {project.end_date || 'TBD'}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-auto pt-3 border-t border-slate-50">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>Sản lượng</span>
                        <span className="text-slate-900">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>

                    {/* Fake KPI Status */}
                    <div className="flex justify-between mt-3 px-2 py-2 bg-yellow-50/50 rounded-lg border border-yellow-100">
                        <div className="flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-yellow-600">flag</span>
                            <span className="text-[8px] font-bold text-yellow-700 uppercase">Nghiệm thu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-green-500 filled" title="Tiến độ: Tốt">check_circle</span>
                            <span className="material-symbols-outlined text-[16px] text-green-500 filled" title="Ngân sách: Tốt">check_circle</span>
                            <span className="material-symbols-outlined text-[16px] text-green-500 filled" title="An toàn: Tốt">check_circle</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectListView = ({ project, onEdit, onDelete }: { project: Project, onEdit: (p: Project) => void, onDelete: (id: string) => void }) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <img src={project.avatar || 'https://via.placeholder.com/40'} alt="" className="size-10 rounded-lg object-cover bg-slate-200" />
                <div>
                    <Link to={`/projects/${project.id}`} className="font-bold text-slate-900 hover:text-primary">{project.name}</Link>
                    <p className="text-xs text-slate-500 font-mono">{project.code}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex gap-1">
                <span className="size-2 rounded-full bg-green-500" title="Schedule: Good"></span>
                <span className="size-2 rounded-full bg-green-500" title="Budget: Good"></span>
                <span className="size-2 rounded-full bg-green-500" title="Safety: Good"></span>
            </div>
        </td>
        <td className="px-6 py-4 w-48">
            <div className="text-xs space-y-2">
                <div>
                    <div className="flex justify-between mb-1"><span className="text-slate-500">Tiến độ</span> <span className="font-bold">{project.progress}%</span></div>
                    <div className="h-1 w-full bg-slate-100 rounded-full"><div className="h-full bg-primary" style={{ width: `${project.progress}%` }}></div></div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-xs text-slate-600">
            Nghiệm thu: <strong className="text-slate-900">TBD</strong>
        </td>
        <td className="px-6 py-4 text-right">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                {project.status}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <button onClick={() => onEdit(project)} className="text-slate-400 hover:text-primary mx-1"><span className="material-symbols-outlined text-[18px]">edit</span></button>
            <button onClick={() => onDelete(project.id)} className="text-slate-400 hover:text-red-600 mx-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
        </td>
    </tr>
);

const ProjectModal = ({ isOpen, onClose, project, onSave }: { isOpen: boolean, onClose: () => void, project: Project | null, onSave: (data: any) => void }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState<Partial<Project>>({
        code: '', name: '', location: '', manager: '', status: 'active',
        owner: '', package: '', type: 'Cao ốc', area: '', description: '',
        start_date: '', end_date: ''
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            setFormData({
                code: '', name: '', location: '', manager: '', status: 'active',
                owner: '', package: '', type: 'Cao ốc', area: '', description: '',
                start_date: '', end_date: ''
            });
        }
    }, [project]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-900">{project ? 'Cập nhật dự án' : 'Thêm dự án mới'}</h3>
                    <button onClick={onClose} className="size-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Mã dự án</label>
                        <input name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:border-primary outline-none" placeholder="VD: P-001" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tên dự án</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:border-primary outline-none" placeholder="Tên dự án..." />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Gói thầu</label>
                        <input name="package" value={formData.package} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:border-primary outline-none" placeholder="VD: Thi công kết cấu..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chủ đầu tư</label>
                        <input name="owner" value={formData.owner} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Loại hình</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none">
                            <option value="Cao ốc">Cao ốc</option>
                            <option value="Nhà xưởng">Nhà xưởng</option>
                            <option value="Hạ tầng">Hạ tầng</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Địa điểm</label>
                        <input name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Giám đốc DA</label>
                        <input name="manager" value={formData.manager} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Ngày bắt đầu</label>
                        <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Ngày kết thúc</label>
                        <input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Diện tích (m2)</label>
                        <input name="area" value={formData.area} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none">
                            <option value="active">Đang thi công</option>
                            <option value="pending">Tạm dừng</option>
                            <option value="delayed">Chậm tiến độ</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Mô tả / Quy mô</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded text-sm outline-none h-20" />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20">Lưu dự án</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function ProjectList() {
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getAllProjects();
            const mappedData: Project[] = data.map((p: any) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                type: p.type || 'Cao ốc',
                package: p.package || 'Gói thầu xây lắp',
                location: p.location || '',
                manager: p.manager || '',
                progress: p.progress || 0,
                planProgress: p.plan_progress || 0,
                status: p.status === 'finished' ? 'completed' : (p.status as any),
                owner: p.owner,
                start_date: p.start_date,
                end_date: p.end_date,
                description: p.description,
                area: p.area,
                avatar: p.avatar,
                budget: p.budget || 0,
                health: { schedule: 'good', budget: 'good', safety: 'good' }, // Mock
            }));
            setProjectList(mappedData);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

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
            const payload = {
                code: formData.code,
                name: formData.name,
                location: formData.location,
                manager: formData.manager,
                status: formData.status,
                type: formData.type,
                package: formData.package,
                owner: formData.owner,
                description: formData.description,
                area: formData.area,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };

            if (editingProject) {
                await projectService.updateProject(editingProject.id, payload);
            } else {
                await projectService.createProject({
                    ...payload,
                    progress: 0,
                    planProgress: 0,
                });
            }
            fetchProjects();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Lỗi khi lưu dự án.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
            try {
                await projectService.deleteProject(id);
                fetchProjects();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const filteredProjects = projectList
        .filter(p => {
            const matchesStatus = filter === 'all' || p.status === filter;
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
            return (a.end_date || '').localeCompare(b.end_date || '');
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
                        <div className="hidden xl:flex gap-4">
                            <KPICard title="Tổng dự án" value={projectList.length} icon="domain" color="bg-blue-50 text-blue-600" />
                            <KPICard title="Đang thi công" value={projectList.filter(p => p.status === 'active').length} icon="engineering" color="bg-green-50 text-green-600" />
                            <KPICard title="Rủi ro cao" value={0} icon="warning" color="bg-red-50 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Tìm kiếm dự án..."
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:border-primary cursor-pointer hover:bg-slate-50"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang thi công</option>
                            <option value="completed">Hoàn thành</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">list_alt</span></button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">grid_view</span></button>
                        </div>
                        <button onClick={handleAddProject} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">add</span> Dự án mới
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
                            <p>Không tìm thấy dự án nào.</p>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
                                {filteredProjects.map(project => (
                                    <ProjectGridCard key={project.id} project={project} onEdit={handleEditProject} onDelete={handleDeleteProject} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Dự án</th>
                                            <th className="px-6 py-4">KPIs</th>
                                            <th className="px-6 py-4">Tiến độ</th>
                                            <th className="px-6 py-4">Nghiệm thu</th>
                                            <th className="px-6 py-4 text-right">Trạng thái</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.map(project => (
                                            <ProjectListView key={project.id} project={project} onEdit={handleEditProject} onDelete={handleDeleteProject} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={editingProject} onSave={handleSaveProject} />
        </div>
    );
}