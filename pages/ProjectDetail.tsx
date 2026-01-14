import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, YAxis } from 'recharts';
import { projectService } from '../src/services/projectService';
import { Project, WBSItem, ProjectIssue, ProjectBudget } from '../types';

// Mock Chart Data (Keep for visual until backend supports time-series)
const costData = [
    { name: 'T1', budget: 4000, actual: 2400 },
    { name: 'T2', budget: 3000, actual: 1398 },
    { name: 'T3', budget: 2000, actual: 3800 },
    { name: 'T4', budget: 2780, actual: 3908 },
    { name: 'T5', budget: 1890, actual: 4800 },
    { name: 'T6', budget: 2390, actual: 3800 },
    { name: 'T7', budget: 3490, actual: 4300 },
];

const WBSItemRow = ({ item }: { item: WBSItem }) => {
    return (
        <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${item.level === 0 ? 'bg-slate-50/80' : ''}`}>
            <td className={`px-4 py-3 text-sm ${item.level === 0 ? 'font-bold text-slate-900' : 'text-slate-700 pl-8 border-l-2 border-transparent hover:border-primary'}`}>
                {item.name}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold ${item.progress === 100 ? 'text-success' : 'text-primary'}`}>{item.progress}%</span>
                </div>
            </td>
            <td className="px-4 py-3 text-xs font-mono text-slate-600">{item.start_date || '--'}</td>
            <td className="px-4 py-3 text-xs font-mono text-slate-600">{item.end_date || '--'}</td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'done' ? 'bg-green-100 text-green-700' :
                    item.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {item.status || 'pending'}
                </span>
            </td>
            <td className="px-4 py-3 text-xs text-slate-500">{item.assigned_to || 'Unassigned'}</td>
        </tr>
    )
}

const IssueRow = ({ issue }: { issue: ProjectIssue }) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50">
        <td className="px-4 py-3 font-mono text-xs text-slate-500">{issue.code}</td>
        <td className="px-4 py-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${issue.type === 'NCR' ? 'bg-red-100 text-red-700' : issue.type === 'RFI' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {issue.type}
            </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-slate-900">{issue.title}</td>
        <td className="px-4 py-3">
            <span className={`flex items-center gap-1 text-[10px] font-bold ${issue.priority === 'High' ? 'text-red-600' : 'text-slate-500'}`}>
                {issue.priority === 'High' && <span className="material-symbols-outlined text-[12px]">priority_high</span>}
                {issue.priority}
            </span>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{issue.due_date}</td>
        <td className="px-4 py-3 text-xs font-bold text-slate-700">{issue.pic}</td>
        <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${issue.status === 'Open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{issue.status}</span>
        </td>
    </tr>
)

const BudgetRow = ({ item }: { item: ProjectBudget }) => {
    const percent = item.budget_amount > 0 ? Math.round((item.actual_amount / item.budget_amount) * 100) : 0;
    const isOver = item.actual_amount > item.budget_amount;
    const remain = item.budget_amount - item.actual_amount;

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-bold text-slate-700">{item.category}</td>
            <td className="px-4 py-3 text-sm font-mono text-right">{item.budget_amount?.toLocaleString() || 0}</td>
            <td className="px-4 py-3 text-sm font-mono text-right font-bold text-slate-900">{item.actual_amount?.toLocaleString() || 0}</td>
            <td className="px-4 py-3 text-sm font-mono text-right text-slate-500">{item.committed_amount?.toLocaleString() || 0}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                    <span className={`text-xs font-bold ${isOver ? 'text-red-600' : 'text-green-600'}`}>{percent}%</span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                </div>
            </td>
            <td className={`px-4 py-3 text-sm font-mono text-right font-bold ${remain < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remain?.toLocaleString() || 0}
            </td>
        </tr>
    )
}

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [project, setProject] = useState<Project | null>(null);
    const [wbs, setWbs] = useState<WBSItem[]>([]);
    const [issues, setIssues] = useState<ProjectIssue[]>([]);
    const [budget, setBudget] = useState<ProjectBudget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProjectData(id);
        }
    }, [id]);

    const fetchProjectData = async (projectId: string) => {
        setLoading(true);
        try {
            const [p, w, i, b] = await Promise.all([
                projectService.getProjectById(projectId),
                projectService.getProjectWBS(projectId),
                projectService.getProjectIssues(projectId),
                projectService.getProjectBudget(projectId)
            ]);

            if (!p) {
                navigate('/projects');
                return;
            }

            setProject(p);
            setWbs(w);
            setIssues(i);
            setBudget(b);
        } catch (err) {
            console.error('Failed to fetch project details', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải dữ liệu dự án...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="bg-white border-b border-slate-100 px-6 py-4 shrink-0 shadow-sm z-10">
                <div className="flex text-xs text-slate-500 mb-2 gap-2">
                    <Link to="/" className="hover:text-primary">Trang chủ</Link> /
                    <Link to="/projects" className="hover:text-primary">Quản lý dự án</Link> /
                    <span className="font-bold text-slate-800">{project.name}</span>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap justify-between items-start mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${project.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                project.status === 'delayed' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {project.status === 'active' ? 'ĐANG THI CÔNG' : project.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> {project.location} • GĐ Dự án: {project.manager}
                        </p>
                    </div>

                    {/* Top Stats */}
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Tiến độ</p>
                            <p className="text-lg font-black text-slate-800">{project.progress}% <span className="text-xs font-medium text-green-600">(Plan: {project.planProgress}%)</span></p>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Ngân sách (EAC)</p>
                            <p className="text-lg font-black text-slate-800">--% <span className="text-xs font-medium text-slate-400">(TBD)</span></p>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Cảnh báo (Issues)</p>
                            <p className="text-lg font-black text-red-600">{issues.filter(i => i.status === 'Open').length}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">add</span> Tạo Báo cáo
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-6 border-b border-slate-100 -mb-4 overflow-x-auto">
                    {['overview', 'wbs', 'budget', 'diary', 'issues', 'documents'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 border-b-2 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            {tab === 'overview' && 'Tổng quan Dashboard'}
                            {tab === 'wbs' && 'Tiến độ (WBS)'}
                            {tab === 'budget' && 'Ngân sách & Chi phí'}
                            {tab === 'diary' && 'Nhật ký thi công'}
                            {tab === 'issues' && 'Sự cố & Rủi ro'}
                            {tab === 'documents' && 'Hồ sơ tài liệu'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Render Content Based on Active Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Project General Information Card */}
                            <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    Thông tin dự án
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Chủ đầu tư:</span>
                                            <span className="font-bold text-slate-900 uppercase">{project.owner || 'Đang cập nhật'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Lĩnh vực:</span>
                                            <span className="font-bold text-slate-900">{project.type || 'Công trình dân dụng'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Gói thầu:</span>
                                            <span className="font-bold text-slate-900">{project.package || 'Đang cập nhật'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Địa chỉ:</span>
                                            <span className="font-bold text-slate-900">{project.location}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Quy mô:</span>
                                            <span className="font-bold text-slate-900">{project.description || 'Đang cập nhật'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Tổng diện tích:</span>
                                            <span className="font-bold text-slate-900">{project.area || '--'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Tiến độ thi công:</span>
                                            <span className="font-bold text-slate-900">{project.start_date || 'TBD'} - {project.end_date || 'TBD'}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-slate-500 min-w-[140px]">Tổng thầu:</span>
                                            <span className="font-bold text-primary">VIJAKO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Health Chart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">monitoring</span>
                                    Biểu đồ Sức khỏe Tài chính (Cost Performance)
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={costData}>
                                            <defs>
                                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Thực tế" />
                                            <Area type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" name="Ngân sách" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Issues / Activities */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="font-bold text-slate-900 mb-4">Hoạt động gần đây</h3>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                    {issues.slice(0, 5).map((issue) => (
                                        <div key={issue.id} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className={`mt-1 size-2 rounded-full flex-shrink-0 ${issue.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{issue.title}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{issue.code} • {issue.pic}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {issues.length === 0 && <p className="text-sm text-slate-400 italic">Không có hoạt động nào.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wbs' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Cấu trúc phân chia công việc (WBS)</h3>
                                <button className="text-xs font-bold text-primary bg-white border border-primary/20 px-3 py-1.5 rounded hover:bg-primary/5 transition-colors">
                                    + Thêm công việc
                                </button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 w-1/3">Hạng mục công việc</th>
                                        <th className="px-4 py-3 w-32">Tiến độ (%)</th>
                                        <th className="px-4 py-3">Bắt đầu</th>
                                        <th className="px-4 py-3">Kết thúc</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                        <th className="px-4 py-3">Phụ trách</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wbs.length > 0 ? wbs.map((item) => (
                                        <WBSItemRow key={item.id} item={item} />
                                    )) : (
                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu WBS.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Mã</th>
                                        <th className="px-4 py-3">Loại</th>
                                        <th className="px-4 py-3 w-1/3">Tiêu đề</th>
                                        <th className="px-4 py-3">Mức độ</th>
                                        <th className="px-4 py-3">Hạn xử lý</th>
                                        <th className="px-4 py-3">PIC</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issues.length > 0 ? issues.map(issue => (
                                        <IssueRow key={issue.id} issue={issue} />
                                    )) : (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Không có sự cố nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Khoản mục chi phí</th>
                                        <th className="px-4 py-3 text-right">Ngân sách (Budget)</th>
                                        <th className="px-4 py-3 text-right">Thực tế (Actual)</th>
                                        <th className="px-4 py-3 text-right">Đã cam kết (Committed)</th>
                                        <th className="px-4 py-3 text-right">Tỷ lệ (%)</th>
                                        <th className="px-4 py-3 text-right">Còn lại (Remaining)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budget.length > 0 ? budget.map(item => (
                                        <BudgetRow key={item.id} item={item} />
                                    )) : (
                                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu ngân sách.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Other tabs can be placeholders for now */}
                    {(activeTab === 'diary' || activeTab === 'documents') && (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400">
                            <span className="material-symbols-outlined text-[48px] mb-2">construction</span>
                            <p>Chức năng đang được phát triển...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

