import React, { useState, useEffect } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { workspaceService, UserTask } from '../src/services/workspaceService';
import { alertService } from '../src/services/alertService';
import { projectService } from '../src/services/projectService';
import { diaryService } from '../src/services/diaryService';
import { supplyChainService } from '../src/services/supplyChainService';
import { documentService } from '../src/services/documentService';
import { Alert, Project, Vendor } from '../types';
import { showToast } from '../src/components/ui/Toast';

// --- Types & Mock Data ---
interface Approval {
    id: string;
    type: string;
    code: string;
    title: string;
    amount?: string;
    subtitle: string;
    isUrgent?: boolean;
}

const performanceData = [
    { subject: 'Tiến độ', A: 95, fullMark: 100 },
    { subject: 'Chất lượng', A: 85, fullMark: 100 },
    { subject: 'An toàn', A: 90, fullMark: 100 },
    { subject: 'Hồ sơ', A: 70, fullMark: 100 },
    { subject: 'Phối hợp', A: 80, fullMark: 100 },
];

const recentFiles = [
    { name: 'Bien_ban_nghiem_thu_T5.pdf', time: '10 phút trước', icon: 'picture_as_pdf', color: 'text-red-500' },
    { name: 'Ban_ve_shop_drawing_D2.dwg', time: '1 giờ trước', icon: 'image', color: 'text-blue-500' },
    { name: 'Ke_hoach_tuan_45.xlsx', time: '3 giờ trước', icon: 'table_view', color: 'text-green-500' },
];

// --- Sub-Components ---

interface ApprovalCardProps {
    data: Approval;
    selected: boolean;
    onToggle: () => void;
    onQuickApprove: () => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ data, selected, onToggle, onQuickApprove }) => (
    <div
        onClick={onToggle}
        className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group mb-3 relative overflow-hidden ${selected ? 'border-primary ring-1 ring-primary bg-blue-50/20' : 'border-slate-100'}`}
    >
        {data.isUrgent && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg z-10 animate-pulse"></div>}

        <div className="flex gap-3">
            {/* Checkbox */}
            <div className="pt-1">
                <div className={`size-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary' : 'border-slate-300 bg-white group-hover:border-primary'}`}>
                    {selected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-500 bg-slate-100 font-mono`}>{data.code}</span>
                        <span className="text-xs text-slate-500 font-medium">{data.type}</span>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight truncate">{data.title}</h4>

                <div className="flex items-center gap-2 mb-2">
                    {data.amount && <p className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{data.amount}</p>}
                    {data.isUrgent && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">priority_high</span> Gấp</span>}
                </div>

                <div className="flex justify-between items-end">
                    <p className="text-xs text-slate-500 line-clamp-1 flex-1">{data.subtitle}</p>
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickApprove(); }}
                        className="text-[10px] font-bold text-slate-400 hover:text-primary bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 px-2 py-1 rounded transition-colors"
                    >
                        Duyệt nhanh
                    </button>
                </div>
            </div>
        </div>
    </div>
);

interface TimelineTaskProps {
    task: UserTask;
    onComplete: (id: string) => void;
}

const TimelineTask: React.FC<TimelineTaskProps> = ({ task, onComplete }) => {
    const isActive = task.status === 'active';
    const isDone = task.status === 'done';

    return (
        <div className="relative pl-8 group mb-6 last:mb-0 animate-in slide-in-from-left-2 duration-300">
            <div className={`absolute left-0 top-1.5 size-4 rounded-full border-[3px] z-10 transition-all duration-300 ${isActive ? 'bg-white border-primary shadow-lg scale-110' : (isDone ? 'bg-success border-white' : 'bg-slate-300 border-white')}`}></div>
            {/* Connector Line */}
            <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-slate-200 last:hidden"></div>

            <div className={`flex flex-col gap-1 transition-all duration-300 ${isDone ? 'opacity-50 grayscale-[50%]' : 'opacity-100'}`}>
                <div className={`flex flex-col gap-2 ${isActive ? 'bg-white p-4 rounded-xl border border-primary/20 shadow-sm' : ''}`}>
                    <div className="w-full">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col">
                                {isActive && <span className="text-[10px] font-bold text-primary uppercase mb-1 tracking-wide flex items-center gap-1"><span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span> Đang thực hiện</span>}
                                <h4 className={`text-sm font-bold ${isDone ? 'line-through decoration-slate-400' : ''} text-slate-900 flex items-center gap-2`}>
                                    {task.type === 'meeting' && <span className="material-symbols-outlined text-[16px] text-purple-500">videocam</span>}
                                    {task.type === 'site' && <span className="material-symbols-outlined text-[16px] text-orange-500">engineering</span>}
                                    {task.type === 'doc' && <span className="material-symbols-outlined text-[16px] text-blue-500">description</span>}
                                    {task.title}
                                </h4>
                            </div>
                            <span className={`text-xs font-mono px-2 py-1 rounded ${isActive ? 'bg-primary text-white font-bold' : 'bg-slate-50 text-slate-500'}`}>{task.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{task.sub}</p>

                        {task.file && (
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-3 hover:bg-white hover:border-primary/30 transition-colors cursor-pointer group/file">
                                <div className="bg-white p-1.5 rounded border border-slate-200 text-red-500 shadow-sm"><span className="material-symbols-outlined text-[20px]">picture_as_pdf</span></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{task.file}</p>
                                    <p className="text-[10px] text-slate-500">Bản vẽ thi công • 24 MB</p>
                                </div>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover/file:text-primary">download</span>
                            </div>
                        )}

                        {isActive && !isDone && (
                            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3 animate-in slide-in-from-top-2">
                                <button
                                    onClick={() => onComplete(task.id)}
                                    className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Hoàn thành
                                </button>
                                <button className="px-3 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon, label, color, onClick }: any) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-md transition-all group active:scale-95"
    >
        <div className={`size-10 rounded-full flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 text-center">{label}</span>
    </button>
)

// --- Modal Components ---

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm?: () => void;
    confirmLabel?: string;
    isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onConfirm, confirmLabel = 'Lưu', isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Hủy</button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light shadow-premium transition-premium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const NoteWidget = () => {
    const [note, setNote] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchNote = async () => {
            const data = await workspaceService.getNote();
            if (data) setNote(data.content);
        };
        fetchNote();
    }, []);

    const handleSave = async () => {
        await workspaceService.saveNote(note);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm relative overflow-hidden group transition-all focus-within:ring-2 focus-within:ring-yellow-400/50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-yellow-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">edit_note</span> Ghi chú nhanh
                </h3>
                <button onClick={handleSave} className="text-yellow-600 hover:text-yellow-900 transition-colors flex items-center gap-1">
                    {saved ? <span className="text-xs font-bold">Đã lưu!</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
                </button>
            </div>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-slate-800 resize-none placeholder-yellow-800/50 h-24 z-10 relative"
                placeholder="Viết ghi chú..."
            ></textarea>
            <div className="absolute -bottom-6 -right-6 text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors pointer-events-none">
                <span className="material-symbols-outlined text-[100px]">sticky_note_2</span>
            </div>
        </div>
    );
};

const MiniCalendar = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const today = 24;
    const deadlines = [5, 12, 24, 28];

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Tháng 5/2024</h3>
                <div className="flex gap-1">
                    <span className="p-1 hover:bg-slate-100 rounded cursor-pointer text-slate-400"><span className="material-symbols-outlined text-[16px]">chevron_left</span></span>
                    <span className="p-1 hover:bg-slate-100 rounded cursor-pointer text-slate-400"><span className="material-symbols-outlined text-[16px]">chevron_right</span></span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="text-slate-400 font-bold mb-2">{d}</div>
                ))}
                {Array(2).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
                {days.map(d => (
                    <div key={d} className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors relative ${d === today ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {d}
                        {deadlines.includes(d) && <span className={`absolute bottom-1 size-1 rounded-full ${d === today ? 'bg-white' : 'bg-red-500'}`}></span>}
                    </div>
                ))}
            </div>
        </div>
    )
}

const RecentFilesWidget = () => (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Truy cập gần đây</h3>
        </div>
        <div>
            {recentFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group">
                    <div className={`p-2 rounded bg-slate-50 border border-slate-100 ${file.color}`}>
                        <span className="material-symbols-outlined text-[20px]">{file.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-primary">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{file.time}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const PerformanceView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs text-indigo-100 font-bold uppercase mb-1">Điểm hiệu suất</p>
                    <h3 className="text-4xl font-black">92<span className="text-lg opacity-70">/100</span></h3>
                    <p className="text-xs font-medium bg-white/20 w-fit px-2 py-0.5 rounded mt-2">Xuất sắc</p>
                </div>
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-white/10">verified</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center gap-2">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">KPI Tiến độ</span>
                        <span className="font-bold text-green-600">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div></div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">KPI Hồ sơ</span>
                        <span className="font-bold text-yellow-600">70%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div></div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-[300px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-2 text-center shrink-0">Biểu đồ Kỹ năng & KPI</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="My Performance"
                            dataKey="A"
                            stroke="#1f3f89"
                            strokeWidth={2}
                            fill="#1f3f89"
                            fillOpacity={0.4}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
)

export default function Workspace() {
    // --- State Management ---
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'site' | 'doc'>('all');
    const [activeView, setActiveView] = useState<'tasks' | 'performance'>('tasks');
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [projects, setProjects] = useState<Project[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);

    // AI Task States
    const [activeQuickAction, setActiveQuickAction] = useState<null | 'diary' | 'report' | 'item' | 'upload'>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [diaryForm, setDiaryForm] = useState({ temp: 32, condition: 'Sunny', work: '', issues: '' });
    const [issueForm, setIssueForm] = useState({ title: '', type: 'General' as const, priority: 'Medium' as const });
    const [supplyForm, setSupplyForm] = useState({ vendorId: '', items: '', amount: 0 });
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            const [taskList, alerts, checkIn, projectList, vendorList] = await Promise.all([
                workspaceService.getTasks(),
                alertService.getAllAlerts(),
                workspaceService.getCheckInStatus(),
                projectService.getAllProjects(),
                supplyChainService.getAllVendors()
            ]);

            setTasks(taskList);
            setProjects(projectList);
            setVendors(vendorList);

            // Find current project (Vijako Tower)
            const vijako = projectList.find(p => p.code === 'P-001');
            if (vijako) setActiveProject(vijako);

            // Map Alerts to Approvals if they are of type 'approval' or 'contract'
            const mappedApprovals = (alerts || [])
                .filter(a => a.type === 'approval' || a.type === 'contract')
                .map(a => ({
                    id: a.id,
                    type: a.type === 'approval' ? 'Phê duyệt' : 'Hợp đồng',
                    code: a.source_id?.substring(0, 8).toUpperCase() || '#ID',
                    title: a.title,
                    subtitle: a.description || '',
                    isUrgent: a.severity === 'high' || a.severity === 'critical',
                    amount: a.due_date ? `Hạn: ${new Date(a.due_date).toLocaleDateString('vi-VN')}` : undefined
                }));

            setApprovals(mappedApprovals);

            if (checkIn) {
                setIsCheckedIn(true);
                setCheckInTime(new Date(checkIn.check_in).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
            }
        };
        fetchData();

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- Derived State (AI Logic) ---
    const urgentCount = approvals.filter(a => a.isUrgent).length;
    const taskDoneCount = tasks.filter(t => t.status === 'done').length;
    const taskTotalCount = tasks.length;

    // Dynamic Greeting
    const hour = currentTime.getHours();
    let greeting = "Chào buổi sáng";
    if (hour >= 12 && hour < 18) greeting = "Chào buổi chiều";
    else if (hour >= 18) greeting = "Chào buổi tối";

    // --- Handlers ---
    const toggleApprovalSelect = (id: string) => {
        setSelectedApprovals(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBatchApprove = async () => {
        if (selectedApprovals.length === 0) return;
        await Promise.all(selectedApprovals.map(id => alertService.dismissAlert(id)));
        setApprovals(prev => prev.filter(a => !selectedApprovals.includes(a.id)));
        setSelectedApprovals([]);
    };

    const handleSingleApprove = async (id: string) => {
        await alertService.dismissAlert(id);
        setApprovals(prev => prev.filter(a => a.id !== id));
    };

    const handleTaskComplete = async (id: string) => {
        await workspaceService.updateTaskStatus(id, 'done');
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
    };

    const handleCheckInToggle = async () => {
        const success = await workspaceService.toggleCheckIn();
        if (success) {
            const status = await workspaceService.getCheckInStatus();
            if (status) {
                setIsCheckedIn(!!status.check_in && !status.check_out);
                if (status.check_in) {
                    setCheckInTime(new Date(status.check_in).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
                }
            } else {
                setIsCheckedIn(false);
            }
        }
    };

    const handleDiarySubmit = async () => {
        if (!activeProject) return;
        setIsSubmitting(true);
        try {
            await diaryService.createLog({
                project_id: activeProject.id,
                date: new Date().toISOString().split('T')[0],
                weather: { temp: diaryForm.temp, condition: diaryForm.condition, humidity: 60 },
                manpower_total: 120, // Example
                work_content: diaryForm.work,
                issues: diaryForm.issues,
                status: 'Draft',
                images: [],
                progress_update: {}
            });
            showToast.success("Đã lưu nhật ký thi công tạm tính");
            setActiveQuickAction(null);
            setDiaryForm({ temp: 32, condition: 'Sunny', work: '', issues: '' });
        } catch (e) {
            showToast.error("Lỗi khi lưu nhật ký");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIssueSubmit = async () => {
        if (!activeProject) return;
        setIsSubmitting(true);
        try {
            await projectService.createProjectIssue({
                project_id: activeProject.id,
                code: `ISSUE-${Date.now().toString().slice(-4)}`,
                title: issueForm.title,
                type: issueForm.type,
                priority: issueForm.priority,
                status: 'Open',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                pic: 'Nguyễn Văn An'
            });
            showToast.success("Đã báo cáo sự cố thành công");
            setActiveQuickAction(null);
            setIssueForm({ title: '', type: 'General', priority: 'Medium' });
        } catch (e) {
            showToast.error("Lỗi khi báo cáo sự cố");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSupplySubmit = async () => {
        if (!activeProject || !supplyForm.vendorId) return;
        setIsSubmitting(true);
        try {
            await supplyChainService.createOrder({
                po_number: `PO-${Date.now().toString().slice(-6)}`,
                vendor_id: supplyForm.vendorId,
                items_summary: supplyForm.items,
                total_amount: supplyForm.amount,
                delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Pending',
                location: activeProject.location || 'Công trường'
            });
            showToast.success("Đã gửi yêu cầu vật tư");
            setActiveQuickAction(null);
            setSupplyForm({ vendorId: '', items: '', amount: 0 });
        } catch (e) {
            showToast.error("Lỗi khi gửi yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadSubmit = async () => {
        if (!activeProject || !uploadFile) return;
        setIsSubmitting(true);
        try {
            await documentService.uploadDocument(
                activeProject.id,
                uploadFile,
                { status: 'WIP', category: 'General' },
                'Nguyễn Văn An'
            );
            showToast.success("Đã tải tài liệu lên CDE");
            setActiveQuickAction(null);
            setUploadFile(null);
        } catch (e) {
            showToast.error("Lỗi khi tải lên");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Tasks
    const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t =>
        activeTab === 'site' ? t.type === 'site' : t.type === t.type
    );

    return (
        <div className="h-full flex flex-col bg-[#f7f7f8]">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Không gian làm việc</h2>
                    <p className="text-xs text-slate-500 capitalize">
                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })} • {greeting}, An!
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    {/* Attendance Button */}
                    <button
                        onClick={handleCheckInToggle}
                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all group ${isCheckedIn ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <div className={`size-2 rounded-full ${isCheckedIn ? 'bg-green-600 animate-pulse' : 'bg-slate-400'}`}></div>
                        <span className="text-xs font-bold">{isCheckedIn ? `Đã Check-in (${checkInTime || 'Hôm nay'})` : 'Chưa Check-in'}</span>
                        <span className="material-symbols-outlined text-[16px] hidden group-hover:block ml-1">
                            {isCheckedIn ? 'logout' : 'login'}
                        </span>
                    </button>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">Nguyễn Văn An</p>
                            <p className="text-xs text-slate-500">Chỉ huy trưởng • Vijako Tower</p>
                        </div>
                        <div className="size-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all">
                            <img src="https://picsum.photos/100/100" alt="avatar" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Approvals & Recent Files */}
                    <section className="lg:col-span-3 flex flex-col gap-6 h-fit sticky top-6">
                        {/* Approvals Block */}
                        <div className="flex flex-col gap-4">
                            {/* Smart Suggestion Box - DYNAMIC */}
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.02]">
                                <div className="relative z-10">
                                    <h3 className="text-xs font-bold text-purple-100 uppercase mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Assistant
                                    </h3>
                                    <p className="text-sm font-medium leading-snug">
                                        {urgentCount > 0 ? (
                                            <>Bạn có <span className="font-bold text-yellow-300">{urgentCount} hạng mục GẤP</span> cần xử lý ngay để kịp tiến độ chiều nay.</>
                                        ) : (
                                            <>Mọi thứ đang ổn định. Hãy tập trung vào công tác nghiệm thu tầng 5.</>
                                        )}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[60px] text-white/10">psychology</span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    Cần phê duyệt
                                    {approvals.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-red-500/30">{approvals.length}</span>}
                                </h3>
                                <button className="text-xs text-primary font-bold hover:underline">Lịch sử</button>
                            </div>

                            {/* Batch Action Bar - Only shows if items selected */}
                            <div className={`bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between shadow-lg shadow-slate-900/10 transition-all duration-300 ${selectedApprovals.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="flex size-5 items-center justify-center bg-primary rounded text-xs font-bold">{selectedApprovals.length}</span>
                                    <span className="text-xs font-medium">Đã chọn</span>
                                </div>
                                <button
                                    onClick={handleBatchApprove}
                                    className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded hover:bg-slate-100 active:scale-95 transition-transform"
                                >
                                    Duyệt nhanh
                                </button>
                            </div>

                            <div className="flex flex-col">
                                {approvals.length === 0 ? (
                                    <div className="text-center py-8 bg-white rounded-xl border border-slate-100 border-dashed">
                                        <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">task_alt</span>
                                        <p className="text-xs text-slate-500">Đã sạch hồ sơ!</p>
                                    </div>
                                ) : (
                                    approvals.map(app => (
                                        <ApprovalCard
                                            key={app.id}
                                            data={app}
                                            selected={selectedApprovals.includes(app.id)}
                                            onToggle={() => toggleApprovalSelect(app.id)}
                                            onQuickApprove={() => handleSingleApprove(app.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Files Widget (New) */}
                        <RecentFilesWidget />
                    </section>

                    {/* Middle: Today's Work / Performance */}
                    <section className="lg:col-span-6 flex flex-col gap-6">
                        {/* Advanced Weather Widget */}
                        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden flex flex-col justify-between h-48 group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <span className="material-symbols-outlined text-[140px] animate-pulse">partly_cloudy_day</span>
                            </div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 opacity-90">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        <span className="text-sm font-medium">Vijako Tower, Hà Nội</span>
                                    </div>
                                    <h2 className="text-5xl font-bold mb-1 tracking-tight">32°C</h2>
                                    <p className="text-sm font-medium opacity-90">Nắng đẹp • Cảm giác như 36°C</p>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">air</span>
                                        <div className="text-left">
                                            <p className="text-[10px] opacity-70 uppercase font-bold">Gió (Cẩu tháp)</p>
                                            <p className="text-xs font-bold">12 km/h (An toàn)</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">water_drop</span>
                                        <div className="text-left">
                                            <p className="text-[10px] opacity-70 uppercase font-bold">Khả năng mưa</p>
                                            <p className="text-xs font-bold">10% (Chiều tối)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Forecast Bar */}
                            <div className="relative z-10 flex gap-4 mt-auto pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
                                {[
                                    { time: '10:00', icon: 'wb_sunny', temp: '33°' },
                                    { time: '13:00', icon: 'wb_sunny', temp: '35°' },
                                    { time: '16:00', icon: 'cloud', temp: '31°' },
                                    { time: '19:00', icon: 'rainy', temp: '28°' },
                                ].map((f, i) => (
                                    <div key={i} className="text-center min-w-[50px] hover:bg-white/10 rounded p-1 transition-colors">
                                        <p className="text-[10px] opacity-80 mb-1">{f.time}</p>
                                        <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                                        <p className="text-xs font-bold mt-1">{f.temp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {activeView === 'tasks' ? 'Việc hôm nay' : 'Báo cáo Hiệu suất'}
                                    </h3>
                                    {activeView === 'tasks' && <p className="text-sm text-slate-500">Bạn đã hoàn thành <span className="font-bold text-primary">{taskDoneCount}/{taskTotalCount}</span> đầu việc quan trọng</p>}
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                        <button
                                            onClick={() => setActiveView('tasks')}
                                            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${activeView === 'tasks' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Việc cần làm
                                        </button>
                                        <button
                                            onClick={() => setActiveView('performance')}
                                            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${activeView === 'performance' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">monitoring</span> Hiệu suất
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeView === 'tasks' ? (
                                <>
                                    {/* Task Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                        <div className="h-full bg-success transition-all duration-500" style={{ width: `${(taskDoneCount / taskTotalCount) * 100}%` }}></div>
                                    </div>

                                    {/* Tabs for tasks */}
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setActiveTab('all')}
                                            className={`px-3 py-1 text-xs font-bold rounded-full border ${activeTab === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                                        >Tất cả</button>
                                        <button
                                            onClick={() => setActiveTab('site')}
                                            className={`px-3 py-1 text-xs font-bold rounded-full border ${activeTab === 'site' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                                        >Hiện trường</button>
                                    </div>

                                    <div className="relative flex-1">
                                        <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-dashed bg-slate-200"></div>
                                        <div className="space-y-2">
                                            {filteredTasks.map(task => (
                                                <TimelineTask
                                                    key={task.id}
                                                    task={task}
                                                    onComplete={handleTaskComplete}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <PerformanceView />
                            )}
                        </div>
                    </section>

                    {/* Right: Quick Actions & Team Pulse */}
                    <section className="lg:col-span-3 flex flex-col gap-6">
                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Tác vụ nhanh</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <QuickAction icon="edit_note" label="Nhật ký" color="bg-blue-100 text-blue-600" onClick={() => setActiveQuickAction('diary')} />
                                <QuickAction icon="add_a_photo" label="Báo cáo" color="bg-red-100 text-red-600" onClick={() => setActiveQuickAction('report')} />
                                <QuickAction icon="inventory_2" label="Vật tư" color="bg-orange-100 text-orange-600" onClick={() => setActiveQuickAction('item')} />
                                <QuickAction icon="upload_file" label="Upload" color="bg-green-100 text-green-600" onClick={() => setActiveQuickAction('upload')} />
                            </div>
                        </div>

                        {/* Modals for Quick Actions */}
                        <Modal
                            isOpen={activeQuickAction === 'diary'}
                            onClose={() => setActiveQuickAction(null)}
                            title="Viết Nhật ký thi công"
                            onConfirm={handleDiarySubmit}
                            isLoading={isSubmitting}
                        >
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Nhiệt độ (°C)</label>
                                        <input type="number" value={diaryForm.temp} onChange={e => setDiaryForm({ ...diaryForm, temp: parseInt(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Thời tiết</label>
                                        <select value={diaryForm.condition} onChange={e => setDiaryForm({ ...diaryForm, condition: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1">
                                            <option value="Sunny">Nắng đẹp</option>
                                            <option value="Rainy">Mưa</option>
                                            <option value="Cloudy">Nhiều mây</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nội dung thi công</label>
                                    <textarea placeholder="Nhập tóm tắt công việc trong ngày..." value={diaryForm.work} onChange={e => setDiaryForm({ ...diaryForm, work: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1 h-32"></textarea>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Vấn đề & Phát sinh</label>
                                    <input placeholder="Nhập vấn đề (nếu có)..." value={diaryForm.issues} onChange={e => setDiaryForm({ ...diaryForm, issues: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1" />
                                </div>
                            </div>
                        </Modal>

                        <Modal
                            isOpen={activeQuickAction === 'report'}
                            onClose={() => setActiveQuickAction(null)}
                            title="Báo cáo sự cố / Vấn đề"
                            onConfirm={handleIssueSubmit}
                            isLoading={isSubmitting}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tiêu đề sự cố</label>
                                    <input placeholder="Tên ngắn gọn của vấn đề..." value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Loại</label>
                                        <select value={issueForm.type} onChange={e => setIssueForm({ ...issueForm, type: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1">
                                            <option value="General">Chung</option>
                                            <option value="NCR">Chất lượng (NCR)</option>
                                            <option value="RFI">Yêu cầu thông tin (RFI)</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mức độ</label>
                                        <select value={issueForm.priority} onChange={e => setIssueForm({ ...issueForm, priority: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1">
                                            <option value="Low">Thấp</option>
                                            <option value="Medium">Trung bình</option>
                                            <option value="High">Cao</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400">Sự cố sẽ được gửi tới Ban QLDA và lưu vào hồ sơ dự án.</p>
                            </div>
                        </Modal>

                        <Modal
                            isOpen={activeQuickAction === 'item'}
                            onClose={() => setActiveQuickAction(null)}
                            title="Yêu cầu vật tư / PO"
                            onConfirm={handleSupplySubmit}
                            isLoading={isSubmitting}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nhà cung cấp / Đội thi công</label>
                                    <select value={supplyForm.vendorId} onChange={e => setSupplyForm({ ...supplyForm, vendorId: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1">
                                        <option value="">Chọn nhà cung cấp...</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Hạng mục vật tư</label>
                                    <input placeholder="VD: Thép D20, Bê tông R7..." value={supplyForm.items} onChange={e => setSupplyForm({ ...supplyForm, items: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Giá trị dự kiến (VNĐ)</label>
                                    <input type="number" value={supplyForm.amount} onChange={e => setSupplyForm({ ...supplyForm, amount: parseInt(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1" />
                                </div>
                            </div>
                        </Modal>

                        <Modal
                            isOpen={activeQuickAction === 'upload'}
                            onClose={() => setActiveQuickAction(null)}
                            title="Tải lên CDE (Hồ sơ dự án)"
                            onConfirm={handleUploadSubmit}
                            isLoading={isSubmitting}
                            confirmLabel="Tải lên"
                        >
                            <div className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                                    onClick={() => document.getElementById('quick-upload')?.click()}
                                >
                                    <input
                                        id="quick-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <span className="material-symbols-outlined text-[48px] text-slate-300 group-hover:text-primary transition-colors mb-2">cloud_upload</span>
                                    <p className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                        {uploadFile ? uploadFile.name : 'Chọn file hoặc kéo thả vào đây'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">PDF, DWG, DOCX, XLSX (Max 50MB)</p>
                                </div>
                            </div>
                        </Modal>

                        {/* Mini Calendar (New) */}
                        <MiniCalendar />

                        {/* Notes Widget - Interactive */}
                        <NoteWidget />

                        {/* Team Pulse */}
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Nhân sự trực tiếp</h3>
                                <button className="text-primary text-xs font-bold">Chi tiết</button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <div className="relative">
                                        <img src="https://picsum.photos/100/100?3" className="size-9 rounded-full object-cover border border-slate-200" alt="Ba" />
                                        <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-orange-500"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">Trần Văn Ba</h4>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px] text-orange-500">engineering</span>
                                            Đang ở Zone B
                                        </p>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">call</span></button>
                                </div>

                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                                    <div className="relative">
                                        <img src="https://picsum.photos/100/100?4" className="size-9 rounded-full object-cover border border-slate-200" alt="Mai" />
                                        <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-green-500"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">Lê Thị Mai</h4>
                                        <p className="text-[10px] text-slate-500">Văn phòng</p>
                                    </div>
                                    <button className="text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">chat</span></button>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3 bg-yellow-50/50 p-2 rounded-lg border border-yellow-100">
                                <div className="size-8 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-900">Top 5 Kỹ sư xuất sắc</p>
                                    <p className="text-[10px] text-slate-500">Tuần 2 Tháng 10</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}