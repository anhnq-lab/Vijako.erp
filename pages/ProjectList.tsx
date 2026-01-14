import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';

// --- Premium Stat Card ---
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

const ProjectGridCard = ({ project, onEdit, onDelete }: { project: Project; onEdit: (p: Project) => void; onDelete: (id: string) => void }) => {
    return (
        <div className="group bg-white rounded-[40px] border border-slate-200 shadow-glass hover:shadow-premium transition-premium flex flex-col overflow-hidden relative">
            {/* Image Header */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={project.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        {project.type || 'Construction'}
                    </span>
                </div>

                <div className={`absolute top-4 right-4 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${project.status === 'active' ? 'bg-emerald/20 text-emerald-400 border-emerald-400/30' :
                        project.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' :
                            'bg-red-500/20 text-red-400 border-red-400/30'
                    }`}>
                    {project.status === 'active' ? 'Construction' : 'Finished'}
                </div>

                {/* Floating Content */}
                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1 font-mono">{project.code}</p>
                    <Link to={`/projects/${project.id}`} className="text-xl font-black text-white tracking-tight leading-tight hover:underline line-clamp-2 drop-shadow-lg">
                        {project.name}
                    </Link>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate">{project.location || 'Vietnam Coast'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">PM: {project.manager || 'Admin'}</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-4 mt-auto">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                            <span className="text-xs font-black text-primary">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
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

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getAllProjects();
            setProjectList(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, []);

    const filteredProjects = projectList.filter(p => {
        const matchesStatus = filter === 'all' || p.status === filter;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Luxury Header */}
            <div className="px-10 py-8 bg-white border-b border-slate-200/50 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-[10px] font-black text-primary-accent uppercase tracking-[0.4em] mb-1">Infrastructure Assets</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portfolio</h1>
                    </div>
                    <div className="flex gap-4">
                        <LuxuryStatCard title="Active Sites" value={projectList.length} icon="apartment" color="bg-primary" gradient="bg-primary" />
                        <LuxuryStatCard title="Growth Rate" value="+12.5%" icon="trending_up" color="bg-emerald" gradient="bg-emerald" />
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
                                placeholder="Find construction units, codes or locations..."
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-primary cursor-pointer hover:bg-slate-50 transition-premium shadow-sm"
                        >
                            <option value="all">Status: Global</option>
                            <option value="active">Contracted</option>
                            <option value="completed">Operational</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-premium ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">format_list_bulleted</span></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-premium ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}><span className="material-symbols-outlined">grid_view</span></button>
                        </div>
                        <button className="px-8 py-3 mesh-gradient text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium hover:opacity-90 transition-premium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Add New Unit</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-[1700px] mx-auto min-h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin shadow-lg"></div>
                            <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing Portfolio...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {filteredProjects.map(project => (
                                <ProjectGridCard key={project.id} project={project} onEdit={() => { }} onDelete={() => { }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}