import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, YAxis } from 'recharts';
import { projectService } from '../src/services/projectService';
import { financeService } from '../src/services/financeService';
import { diaryService } from '../src/services/diaryService';
import { importService } from '../src/services/importService'; // New Import
import { Project, WBSItem, ProjectIssue, ProjectBudget, Contract, ProjectDocument } from '../types';
import ProjectGantt from '../components/ProjectGantt';
import ContractModal from '../components/ContractModal';
import BudgetModal from '../components/BudgetModal';
import DiaryFeed from '../components/DiaryFeed';
import DiaryFormModal from '../components/DiaryFormModal'; // New Import
import ErrorBoundary from '../components/ErrorBoundary';
import IssueModal from '../components/IssueModal'; // New Import
import { InvoiceScanModal } from '../components/InvoiceScanModal';
import { ExtractedInvoice } from '../src/services/invoiceService';
import { ComponentLoader } from '../src/components/ui/LoadingComponents';

// Lazy load heavy components
const BimViewer = lazy(() => import('../components/BimViewer'));

// Mock Chart Data (Keep for visual until backend supports time-series)
// Mock Chart Data - Progress Payment vs Plan
const costData = [
    { name: 'T1', planned: 3000, paid: 2800 },
    { name: 'T2', planned: 5000, paid: 4500 },
    { name: 'T3', planned: 8000, paid: 7200 },
    { name: 'T4', planned: 12000, paid: 11500 },
    { name: 'T5', planned: 15000, paid: 14800 },
    { name: 'T6', planned: 18000, paid: 17500 },
    { name: 'T7', planned: 22000, paid: 21000 },
    { name: 'T8', planned: 25000, paid: 25000 },
];

const WBSItemRow: React.FC<{ item: WBSItem }> = ({ item }) => {
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

const IssueRow: React.FC<{ issue: ProjectIssue }> = ({ issue }) => (
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

const BudgetRow: React.FC<{
    item: ProjectBudget;
    onEdit?: (item: ProjectBudget) => void;
    onDelete?: (item: ProjectBudget) => void;
}> = ({ item, onEdit, onDelete }) => {
    const percent = item.budget_amount > 0 ? Math.round((item.actual_amount / item.budget_amount) * 100) : 0;
    const isOver = item.actual_amount > item.budget_amount;
    const remain = item.budget_amount - item.actual_amount;

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50 group">
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
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                    <span className={`text-sm font-mono font-bold ${remain < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {remain?.toLocaleString() || 0}
                    </span>
                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit?.(item)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Sửa"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                            onClick={() => onDelete?.(item)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    );
};

const ContractRow: React.FC<{
    contract: Contract;
    onEdit?: (contract: Contract) => void;
    onDelete?: (contract: Contract) => void;
}> = ({ contract, onEdit, onDelete }) => {
    const paidPercent = contract.value > 0 ? Math.round((contract.paid_amount / contract.value) * 100) : 0;
    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50 group">
            <td className="px-4 py-3 text-sm font-bold text-slate-700">{contract.contract_code}</td>
            <td className="px-4 py-3 text-sm text-slate-900">{contract.partner_name}</td>
            <td className="px-4 py-3 text-sm font-mono text-right font-bold text-slate-900">{contract.value?.toLocaleString() || 0}</td>
            <td className="px-4 py-3 text-sm font-mono text-right text-green-600 font-bold">{contract.paid_amount?.toLocaleString() || 0}</td>
            <td className="px-4 py-3 text-sm font-mono text-right text-slate-500">{contract.retention_amount?.toLocaleString() || 0}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold text-slate-700">{paidPercent}%</span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(paidPercent, 100)}%` }}></div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${contract.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {contract.status === 'active' ? 'Hiệu lực' : 'Hoàn thành'}
                    </span>
                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit?.(contract)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Sửa"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                            onClick={() => onDelete?.(contract)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>
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
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [documents, setDocuments] = useState<ProjectDocument[]>([]); // New State
    const [wbsView, setWbsView] = useState<'list' | 'gantt'>('list');
    const [loading, setLoading] = useState(true);
    const [diaryRefreshKey, setDiaryRefreshKey] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const modelInputRef = React.useRef<HTMLInputElement>(null);
    const docInputRef = React.useRef<HTMLInputElement>(null); // New Ref

    // Issue Modal State
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<ProjectIssue | null>(null);

    // AI Scan Modal State
    const [isInvoiceScanModalOpen, setIsInvoiceScanModalOpen] = useState(false);

    const openAddIssueModal = () => {
        setEditingIssue(null);
        setIsIssueModalOpen(true);
    };

    const openEditIssueModal = (issue: ProjectIssue) => {
        setEditingIssue(issue);
        setIsIssueModalOpen(true);
    };

    const handleDeleteIssue = async (issue: ProjectIssue) => {
        if (confirm(`Bạn có chắc muốn xóa sự cố "${issue.title}"?`)) {
            try {
                await projectService.deleteProjectIssue(issue.id);
                if (id) {
                    const issuesData = await projectService.getProjectIssues(id);
                    setIssues(issuesData);
                }
            } catch (error) {
                alert('Lỗi khi xóa sự cố');
            }
        }
    };

    const handleIssueSaved = async () => {
        if (id) {
            const issuesData = await projectService.getProjectIssues(id);
            setIssues(issuesData);
        }
    };

    // Document Handlers
    const handleDocUploadClick = () => {
        docInputRef.current?.click();
    };

    const handleDocFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        try {
            // setLoading(true); // Optional
            await projectService.uploadProjectDocument(id, file);
            alert('Upload tài liệu thành công!');
            // Refresh
            const docs = await projectService.getProjectDocuments(id);
            setDocuments(docs);
        } catch (error: any) {
            console.error(error);
            alert('Lỗi khi upload tài liệu: ' + (error.message || 'Unknown error'));
        } finally {
            if (docInputRef.current) docInputRef.current.value = '';
        }
    };

    const handleDeleteDocument = async (doc: ProjectDocument) => {
        if (confirm(`Bạn có chắc muốn xóa tài liệu "${doc.name}"?`)) {
            try {
                await projectService.deleteProjectDocument(doc.id, doc.url);
                if (id) {
                    const docs = await projectService.getProjectDocuments(id);
                    setDocuments(docs);
                }
            } catch (error) {
                alert('Lỗi khi xóa tài liệu');
            }
        }
    };


    // Contract Modal State
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [contractModalType, setContractModalType] = useState<'revenue' | 'expense'>('revenue');

    const openAddContractModal = (type: 'revenue' | 'expense') => {
        setEditingContract(null);
        setContractModalType(type);
        setIsContractModalOpen(true);
    };

    const openEditContractModal = (contract: Contract) => {
        setEditingContract(contract);
        setContractModalType(contract.contract_type === 'revenue' ? 'revenue' : 'expense');
        setIsContractModalOpen(true);
    };

    const handleDeleteContract = async (contract: Contract) => {
        if (confirm(`Bạn có chắc muốn xóa hợp đồng "${contract.contract_code}"?`)) {
            try {
                await financeService.deleteContract(contract.id);
                // Refresh contracts
                if (id) {
                    const contractsData = await financeService.getContractsByProjectId(id);
                    setContracts(contractsData);
                }
            } catch (error) {
                alert('Lỗi khi xóa hợp đồng');
            }
        }
    };

    const handleContractSaved = async () => {
        // Refresh contracts list
        if (id) {
            const contractsData = await financeService.getContractsByProjectId(id);
            setContracts(contractsData);
        }
    };

    // Diary Modal State
    const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);

    // Budget Modal State
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudgetItem, setEditingBudgetItem] = useState<ProjectBudget | null>(null);

    const openAddBudgetModal = () => {
        setEditingBudgetItem(null);
        setIsBudgetModalOpen(true);
    };

    const openEditBudgetModal = (item: ProjectBudget) => {
        setEditingBudgetItem(item);
        setIsBudgetModalOpen(true);
    };

    const handleDeleteBudgetItem = async (item: ProjectBudget) => {
        if (confirm(`Bạn có chắc muốn xóa khoản mục "${item.category}"?`)) {
            try {
                await projectService.deleteBudgetItem(item.id);
                // Refresh budget
                if (id) {
                    const budgetData = await projectService.getProjectBudget(id);
                    setBudget(budgetData);
                }
            } catch (error) {
                alert('Lỗi khi xóa khoản mục');
            }
        }
    };

    const handleBudgetSaved = async () => {
        if (id) {
            const budgetData = await projectService.getProjectBudget(id);
            setBudget(budgetData);
        }
    };

    const handleSaveScannedInvoice = async (data: ExtractedInvoice & { project_id: string }) => {
        try {
            await financeService.createContract({
                contract_code: data.invoice_code || `INV-${Date.now().toString().slice(-6)}`,
                partner_name: data.vendor_name,
                project_id: data.project_id,
                value: data.amount,
                paid_amount: data.amount,
                retention_amount: 0,
                status: 'completed',
                contract_type: data.type,
                budget_category: data.suggested_budget_category
            });

            // Refresh data
            if (id) {
                const [c, b] = await Promise.all([
                    financeService.getContractsByProjectId(id),
                    projectService.getProjectBudget(id)
                ]);
                setContracts(c);
                setBudget(b);
            }
            alert('Đã lưu hóa đơn vào hệ thống!');
        } catch (error) {
            console.error('Error saving scanned invoice:', error);
            alert('Lỗi khi lưu hóa đơn');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (confirm('Import sẽ thay thế dữ liệu hiện tại. Bạn có chắc không?')) {
            try {
                // setLoading(true); // Optional: show loading overlay
                const items = await importService.parseExcelSchedule(file);
                // Assign new IDs if needed or keep from service
                setWbs(items);
                alert(`Đã import thành công ${items.length} đầu việc!`);
            } catch (error: any) {
                console.error(error);
                alert('Lỗi khi đọc file: ' + (error.message || 'Unknown error'));
            } finally {
                // setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } else {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleModelUploadClick = () => {
        modelInputRef.current?.click();
    };

    const handleExportDiary = async () => {
        if (!id) return;
        try {
            // Fetch last 30 days for report
            const logs = await diaryService.getRecentLogs(id, 30);

            const reportWindow = window.open('', '_blank');
            if (reportWindow) {
                const htmlContent = `
                    <html>
                    <head>
                        <title>Báo cáo Nhật ký Thi công - ${project?.name}</title>
                        <style>
                            body { font-family: 'Times New Roman', serif; padding: 40px; }
                            h1, h2, h3 { text-align: center; }
                            .header { margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                            .log-entry { margin-bottom: 30px; border: 1px solid #ccc; padding: 15px; page-break-inside: avoid; }
                            .log-header { font-weight: bold; background: #eee; padding: 5px; margin-bottom: 10px; }
                            .row { display: flex; margin-bottom: 5px; }
                            .label { font-weight: bold; min-width: 150px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #333; padding: 5px; text-align: left; }
                            th { background: #f0f0f0; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>NHẬT KÝ THI CÔNG</h1>
                            <h3>Dự án: ${project?.name}</h3>
                            <p>Địa điểm: ${project?.location}</p>
                            <p>Thời gian xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
                        </div>

                        ${logs.map(log => `
                            <div class="log-entry">
                                <div class="log-header">Ngày: ${new Date(log.date).toLocaleDateString('vi-VN')} | Thời tiết: ${log.weather?.temp}°C - ${log.weather?.condition}</div>
                                <div class="row">
                                    <span class="label">Tổng nhân lực:</span> <span>${log.manpower_total} người</span>
                                </div>
                                <div class="row">
                                    <span class="label">Nội dung công việc:</span>
                                    <p style="white-space: pre-line; margin: 0;">${log.work_content}</p>
                                </div>
                                ${log.issues ? `
                                <div class="row" style="color: red;">
                                    <span class="label">Sự cố/Vướng mắc:</span> <span>${log.issues}</span>
                                </div>` : ''}
                                
                                ${log.manpower_details && log.manpower_details.length > 0 ? `
                                <h4>Chi tiết nhân lực:</h4>
                                <table>
                                    <tr><th>Vị trí</th><th>Số lượng</th><th>Ghi chú</th></tr>
                                    ${log.manpower_details.map((m: any) => `<tr><td>${m.role}</td><td>${m.count}</td><td>${m.notes || ''}</td></tr>`).join('')}
                                </table>` : ''}

                                ${log.equipment_details && log.equipment_details.length > 0 ? `
                                <h4>Chi tiết thiết bị:</h4>
                                <table>
                                    <tr><th>Tên thiết bị</th><th>Số lượng</th><th>Trạng thái</th></tr>
                                    ${log.equipment_details.map((e: any) => `<tr><td>${e.name}</td><td>${e.count}</td><td>${e.status}</td></tr>`).join('')}
                                </table>` : ''}
                            </div>
                        `).join('')}

                        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                            <div style="text-align: center;">
                                <p><strong>Đại diện TVGS</strong></p>
                                <br><br><br>
                                <p>(Ký, họ tên)</p>
                            </div>
                            <div style="text-align: center;">
                                <p><strong>Chỉ huy trưởng</strong></p>
                                <br><br><br>
                                <p>(Ký, họ tên)</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                reportWindow.document.write(htmlContent);
                reportWindow.document.close();
                // reportWindow.print(); // Optional: Auto print
            }
        } catch (error) {
            console.error('Error exporting diary:', error);
            alert('Lỗi xuất báo cáo nhật ký');
        }
    };

    const handleModelFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        if (confirm(`Bạn có chắc muốn upload mô hình "${file.name}"?`)) {
            try {
                // setLoading(true); // Optional
                const publicUrl = await projectService.uploadProjectModel(id, file);
                if (publicUrl) {
                    setProject(prev => prev ? { ...prev, model_url: publicUrl } : null);
                    alert('Upload mô hình thành công!');
                }
            } catch (error: any) {
                console.error(error);
                alert('Lỗi khi upload mô hình: ' + (error.message || 'Unknown error'));
            } finally {
                if (modelInputRef.current) modelInputRef.current.value = '';
            }
        } else {
            if (modelInputRef.current) modelInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (id) {
            fetchProjectData(id);
        }
    }, [id]);

    const fetchProjectData = async (projectId: string) => {
        setLoading(true);
        try {
            const [p, w, i, b, c, d] = await Promise.all([
                projectService.getProjectById(projectId),
                projectService.getProjectWBS(projectId),
                projectService.getProjectIssues(projectId),
                projectService.getProjectBudget(projectId),
                financeService.getContractsByProjectId(projectId),
                projectService.getProjectDocuments(projectId)
            ]);

            if (!p) {
                navigate('/projects');
                return;
            }

            setProject(p);
            setWbs(w);
            setIssues(i);
            setBudget(b);
            setContracts(c);
            setDocuments(d);
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
        <>
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
                                <p className="text-lg font-black text-slate-800">{project.progress}% <span className="text-xs font-medium text-green-600">(Plan: {project.plan_progress || 0}%)</span></p>
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
                                {tab === 'budget' && 'Tài chính & Hợp đồng'}
                                {tab === 'diary' && 'Nhật ký thi công'}
                                {tab === 'issues' && 'Sự cố & Rủi ro'}
                                {tab === 'documents' && 'Hồ sơ tài liệu'}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="w-full mx-auto space-y-6">

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
                                        Biểu đồ Tiến độ Chi tiêu theo Hợp đồng
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={costData}>
                                                <defs>
                                                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="paid" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" name="Đã thanh toán" />
                                                <Area type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" name="Kế hoạch" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Right Column: Members & Activities */}
                                <div className="flex flex-col gap-6">
                                    {/* Team Members */}
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">group</span>
                                            Thành viên Dự án
                                        </h3>
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                            {project.members && project.members.length > 0 ? (
                                                project.members.map((member, index) => (
                                                    <div key={index} className="flex gap-3 items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                        <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${index === 0 ? 'bg-primary' : 'bg-slate-400'}`}>
                                                            {member.split(' ').pop()?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{member}</p>
                                                            <p className="text-xs text-slate-500">{index === 0 ? 'Giám đốc dự án' : 'Thành viên'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Chưa có thành viên nào.</p>
                                            )}
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
                            </div>
                        )}

                        {activeTab === 'wbs' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">Cấu trúc phân chia công việc (WBS)</h3>
                                    <div className="flex gap-2">
                                        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                                            <button
                                                onClick={() => setWbsView('list')}
                                                className={`px-3 py-1 flex items-center gap-1 text-xs font-bold rounded ${wbsView === 'list' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">list</span> List
                                            </button>
                                            <button
                                                onClick={() => setWbsView('gantt')}
                                                className={`px-3 py-1 flex items-center gap-1 text-xs font-bold rounded ${wbsView === 'gantt' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">calendar_month</span> Gantt
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleImportClick}
                                            className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">upload_file</span> Import Excel
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".xlsx, .xls"
                                        />
                                        <button className="text-xs font-bold text-primary bg-white border border-primary/20 px-3 py-1.5 rounded hover:bg-primary/5 transition-colors">
                                            + Thêm công việc
                                        </button>
                                    </div>
                                </div>

                                {wbsView === 'list' ? (
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
                                ) : (
                                    <div className="p-4">
                                        <ProjectGantt items={wbs} />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'issues' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">Danh sách Sự cố & Rủi ro</h3>
                                    <button
                                        onClick={openAddIssueModal}
                                        className="text-xs font-bold text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                                    >
                                        + Thêm Sự cố
                                    </button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-white text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3">Mã</th>
                                            <th className="px-4 py-3">Loại</th>
                                            <th className="px-4 py-3 w-1/3">Tiêu đề</th>
                                            <th className="px-4 py-3">Mức độ</th>
                                            <th className="px-4 py-3">Hạn xử lý</th>
                                            <th className="px-4 py-3">PIC</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.length > 0 ? issues.map(issue => (
                                            <tr key={issue.id} className="border-b border-slate-50 hover:bg-slate-50 group">
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
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditIssueModal(issue)}
                                                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteIssue(issue)}
                                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
                                                    <p>Không có sự cố nào cần xử lý</p>
                                                </div>
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'budget' && (() => {
                            // Calculate Financial KPIs
                            const revenueContracts = contracts.filter(c => c.contract_type === 'revenue' || c.contract_code.includes('TS-001'));
                            const expenseContracts = contracts.filter(c => c.contract_type === 'expense' || (c.contract_type !== 'revenue' && !c.contract_code.includes('TS-001')));

                            const totalRevenue = revenueContracts.reduce((sum, c) => sum + (c.value || 0), 0);
                            const totalRevenuePaid = revenueContracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
                            const totalExpense = expenseContracts.reduce((sum, c) => sum + (c.value || 0), 0);
                            const totalExpensePaid = expenseContracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
                            const grossMargin = totalRevenue - totalExpense;
                            const marginPercent = totalRevenue > 0 ? ((grossMargin / totalRevenue) * 100).toFixed(1) : 0;

                            const totalBudget = budget.reduce((sum, b) => sum + (b.budget_amount || 0), 0);
                            const totalActual = budget.reduce((sum, b) => sum + (b.actual_amount || 0), 0);
                            const budgetUsedPercent = totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0;
                            const isBudgetOverrun = totalActual > totalBudget;

                            return (
                                <div className="space-y-8">
                                    {/* Financial KPI Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Total Revenue */}
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg shadow-blue-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-blue-200">payments</span>
                                                <span className="text-xs font-medium bg-blue-400/30 px-2 py-0.5 rounded-full">Doanh thu</span>
                                            </div>
                                            <p className="text-2xl font-black">{totalRevenue.toLocaleString()}</p>
                                            <p className="text-xs text-blue-100 mt-1">Đã thu: {totalRevenuePaid.toLocaleString()} ({totalRevenue > 0 ? ((totalRevenuePaid / totalRevenue) * 100).toFixed(0) : 0}%)</p>
                                        </div>

                                        {/* Total Expense */}
                                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow-lg shadow-orange-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-orange-200">account_balance_wallet</span>
                                                <span className="text-xs font-medium bg-orange-400/30 px-2 py-0.5 rounded-full">Chi phí</span>
                                            </div>
                                            <p className="text-2xl font-black">{totalExpense.toLocaleString()}</p>
                                            <p className="text-xs text-orange-100 mt-1">Đã chi: {totalExpensePaid.toLocaleString()} ({totalExpense > 0 ? ((totalExpensePaid / totalExpense) * 100).toFixed(0) : 0}%)</p>
                                        </div>

                                        {/* Gross Margin */}
                                        <div className={`bg-gradient-to-br ${grossMargin >= 0 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/20' : 'from-red-500 to-red-600 shadow-red-500/20'} text-white p-5 rounded-xl shadow-lg`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-white/70">trending_up</span>
                                                <span className={`text-xs font-medium ${grossMargin >= 0 ? 'bg-emerald-400/30' : 'bg-red-400/30'} px-2 py-0.5 rounded-full`}>Lợi nhuận gộp</span>
                                            </div>
                                            <p className="text-2xl font-black">{grossMargin.toLocaleString()}</p>
                                            <p className="text-xs text-white/80 mt-1">Tỷ suất: {marginPercent}%</p>
                                        </div>

                                        {/* Budget Usage */}
                                        <div className={`bg-gradient-to-br ${isBudgetOverrun ? 'from-red-500 to-red-600 shadow-red-500/20' : 'from-slate-600 to-slate-700 shadow-slate-500/20'} text-white p-5 rounded-xl shadow-lg`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="material-symbols-outlined text-white/70">pie_chart</span>
                                                <span className={`text-xs font-medium ${isBudgetOverrun ? 'bg-red-400/30' : 'bg-slate-500/30'} px-2 py-0.5 rounded-full`}>{isBudgetOverrun ? '⚠️ Vượt NS' : 'Ngân sách'}</span>
                                            </div>
                                            <p className="text-2xl font-black">{budgetUsedPercent}%</p>
                                            <p className="text-xs text-white/80 mt-1">Đã dùng {totalActual.toLocaleString()} / {totalBudget.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Budget Breakdown Chart (Simple Bar Representation) */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-indigo-600">bar_chart</span>
                                            Phân bổ Ngân sách theo Hạng mục
                                        </h3>
                                        <div className="space-y-3">
                                            {budget.map(item => {
                                                const percent = item.budget_amount > 0 ? Math.round((item.actual_amount / item.budget_amount) * 100) : 0;
                                                const isOver = item.actual_amount > item.budget_amount;
                                                return (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="w-32 text-sm font-medium text-slate-700 truncate">{item.category}</div>
                                                        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                                            ></div>
                                                            {isOver && (
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 rounded">
                                                                    +{(percent - 100).toFixed(0)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="w-20 text-right text-xs font-bold text-slate-600">{percent}%</div>
                                                    </div>
                                                );
                                            })}
                                            {budget.length === 0 && <p className="text-sm text-slate-400 italic">Chưa có dữ liệu ngân sách.</p>}
                                        </div>
                                    </div>

                                    {/* Revenue Contracts (A-B) */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-600">domain_add</span>
                                                <h3 className="font-bold text-slate-800">Hợp đồng với Chủ Đầu Tư (Đầu ra)</h3>
                                            </div>
                                            <button
                                                onClick={() => openAddContractModal('revenue')}
                                                className="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                                            >
                                                + Thêm HĐ Chủ đầu tư
                                            </button>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-white text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3">Mã HĐ</th>
                                                    <th className="px-4 py-3">Chủ đầu tư</th>
                                                    <th className="px-4 py-3 text-right">Giá trị HĐ</th>
                                                    <th className="px-4 py-3 text-right">Đã thanh toán</th>
                                                    <th className="px-4 py-3 text-right">Giữ lại</th>
                                                    <th className="px-4 py-3 text-right">Tiến độ TT</th>
                                                    <th className="px-4 py-3 text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contracts.filter(c => c.contract_type === 'revenue' || c.contract_code.includes('TS-001')).length > 0 ?
                                                    contracts.filter(c => c.contract_type === 'revenue' || c.contract_code.includes('TS-001')).map(contract => (
                                                        <ContractRow
                                                            key={contract.id}
                                                            contract={contract}
                                                            onEdit={openEditContractModal}
                                                            onDelete={handleDeleteContract}
                                                        />
                                                    )) : (
                                                        contracts.some(c => !c.contract_type && c.contract_code.includes('TS-001')) ?
                                                            contracts.filter(c => c.contract_code.includes('TS-001')).map(contract => (
                                                                <ContractRow
                                                                    key={contract.id}
                                                                    contract={contract}
                                                                    onEdit={openEditContractModal}
                                                                    onDelete={handleDeleteContract}
                                                                />
                                                            )) :
                                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chưa có hợp đồng chủ đầu tư.</td></tr>
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Expense Contracts (B-B) */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                        <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-orange-600">engineering</span>
                                                <h3 className="font-bold text-slate-800">Hợp đồng Thầu phụ & Nhà cung cấp (Đầu vào)</h3>
                                            </div>
                                            <button
                                                onClick={() => openAddContractModal('expense')}
                                                className="text-xs font-bold text-orange-600 bg-white border border-orange-200 px-3 py-1.5 rounded hover:bg-orange-50 transition-colors"
                                            >
                                                + Thêm HĐ Thầu phụ
                                            </button>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-white text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3">Mã HĐ</th>
                                                    <th className="px-4 py-3">Đối tác</th>
                                                    <th className="px-4 py-3 text-right">Giá trị HĐ</th>
                                                    <th className="px-4 py-3 text-right">Đã thanh toán</th>
                                                    <th className="px-4 py-3 text-right">Giữ lại</th>
                                                    <th className="px-4 py-3 text-right">Tiến độ TT</th>
                                                    <th className="px-4 py-3 text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contracts.filter(c => c.contract_type === 'expense' || (c.contract_type !== 'revenue' && !c.contract_code.includes('TS-001'))).length > 0 ?
                                                    contracts.filter(c => c.contract_type === 'expense' || (c.contract_type !== 'revenue' && !c.contract_code.includes('TS-001'))).map(contract => (
                                                        <ContractRow
                                                            key={contract.id}
                                                            contract={contract}
                                                            onEdit={openEditContractModal}
                                                            onDelete={handleDeleteContract}
                                                        />
                                                    )) : (
                                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chưa có hợp đồng thầu phụ.</td></tr>
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Budget Section (Existing) */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-700">Ngân sách & Chi phí Dự án</h3>
                                            <button
                                                onClick={() => setIsInvoiceScanModalOpen(true)}
                                                className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                                                Quét hóa đơn AI
                                            </button>
                                            <button
                                                onClick={openAddBudgetModal}
                                                className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors"
                                            >
                                                + Thêm Khoản mục
                                            </button>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-white text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
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
                                                {budget.length > 0 ? budget.map(item => {
                                                    // Auto-calculate Committed and Actual from expense contracts
                                                    const linkedContracts = expenseContracts.filter(
                                                        c => c.budget_category === item.category
                                                    );
                                                    const calculatedCommitted = linkedContracts.reduce(
                                                        (sum, c) => sum + (c.value || 0), 0
                                                    );
                                                    const calculatedActual = linkedContracts.reduce(
                                                        (sum, c) => sum + (c.paid_amount || 0), 0
                                                    );

                                                    // Use calculated values if contracts exist, otherwise use manual values
                                                    const displayItem = {
                                                        ...item,
                                                        committed_amount: calculatedCommitted > 0 ? calculatedCommitted : item.committed_amount,
                                                        actual_amount: calculatedActual > 0 ? calculatedActual : item.actual_amount
                                                    };

                                                    return (
                                                        <BudgetRow
                                                            key={item.id}
                                                            item={displayItem}
                                                            onEdit={openEditBudgetModal}
                                                            onDelete={handleDeleteBudgetItem}
                                                        />
                                                    );
                                                }) : (
                                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu ngân sách.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Other tabs can be placeholders for now */}
                        {/* Construction Diary Tab */}
                        {activeTab === 'diary' && (
                            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Left Panel: Diary Feed (40%) */}
                                <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-indigo-600">history_edu</span>
                                            Nhật Ký Thi Công
                                        </h3>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => setIsDiaryModalOpen(true)}
                                                className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded hover:bg-primary/90 flex items-center gap-1 transition-colors shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                                Viết nhật ký
                                            </button>
                                            <button
                                                onClick={handleExportDiary}
                                                className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">print</span>
                                                Xuất báo cáo
                                            </button>
                                            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                                7 ngày gần nhất
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                        <DiaryFeed key={diaryRefreshKey} projectId={id || ''} />
                                    </div>
                                </div>

                                {/* Right Panel: BIM Twin (60%) */}
                                <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-indigo-600">view_in_ar</span>
                                            Mô Hình BIM (Digital Twin)
                                        </h3>
                                        <div className="flex gap-2 text-xs items-center">
                                            <button
                                                onClick={handleModelUploadClick}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-semibold"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                                                Upload IFC/GLB
                                            </button>
                                            <input
                                                type="file"
                                                ref={modelInputRef}
                                                onChange={handleModelFileChange}
                                                className="hidden"
                                                accept=".ifc,.glb,.gltf"
                                            />
                                            <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                Hoàn thành
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                Đang thực hiện
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-900 relative">
                                        <ErrorBoundary>
                                            <Suspense fallback={
                                                <div className="flex items-center justify-center h-full text-white">
                                                    Đang tải mô hình...
                                                </div>
                                            }>
                                                <BimViewer
                                                    // Use project.model_url if available, else fallback to demo
                                                    modelUrl={project.model_url || "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb"}
                                                    autoRotate={true}
                                                    progressUpdate={{
                                                        "Mesh": "completed" // Box model usually has a node named Mesh or similar
                                                    }}
                                                />
                                            </Suspense>
                                        </ErrorBoundary>

                                        {/* Overlay Controls */}
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button className="p-2 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20 transition-colors" title="Toàn màn hình">
                                                <span className="material-symbols-outlined">fullscreen</span>
                                            </button>
                                            <button className="p-2 bg-white/10 backdrop-blur text-white rounded hover:bg-white/20 transition-colors" title="Cài đặt mô hình">
                                                <span className="material-symbols-outlined">settings</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500">folder_shared</span>
                                        Hồ sơ & Tài liệu Dự án
                                    </h3>
                                    <div>
                                        <button
                                            onClick={handleDocUploadClick}
                                            className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                                            Upload Tài liệu
                                        </button>
                                        <input
                                            type="file"
                                            ref={docInputRef}
                                            onChange={handleDocFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                                    {documents.length > 0 ? documents.map(doc => (
                                        <div key={doc.id} className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                    title="Xóa file"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 truncate mb-1" title={doc.name}>{doc.name}</p>
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>{(doc.size / 1024).toFixed(0)} KB</span>
                                                <span>{doc.type}</span>
                                            </div>

                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 z-0"
                                            />
                                        </div>
                                    )) : (
                                        <div className="col-span-full border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-5xl mb-2 opacity-50">cloud_off</span>
                                            <p>Chưa có tài liệu nào.</p>
                                            <button onClick={handleDocUploadClick} className="text-indigo-600 font-bold hover:underline mt-2">Upload ngay</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contract Modal */}
            <ContractModal
                isOpen={isContractModalOpen}
                onClose={() => setIsContractModalOpen(false)}
                onSaved={handleContractSaved}
                projectId={id || ''}
                existingContract={editingContract}
                contractType={contractModalType}
            />

            {/* Budget Modal */}
            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSaved={handleBudgetSaved}
                projectId={id || ''}
                existingItem={editingBudgetItem}
            />

            {/* Diary Modal */}
            <DiaryFormModal
                isOpen={isDiaryModalOpen}
                onClose={() => setIsDiaryModalOpen(false)}
                onSaved={() => {
                    // Force refresh of diary feed by effectively effectively re-fetching in DiaryFeed component
                    // For now, simple page state update or just trust live reload if feasible.
                    // Ideally, DiaryFeed should expose a refresh capability or depend on a shared context/state.
                    // Since DiaryFeed fetches on mount/projectId change, we can trigger a re-fetch if we had a trigger.
                    // For simplicity, we can reload window or setup a trigger. 
                    // Let's assume user accepts a manual refresh or we improve DiaryFeed later.
                    // Actually, let's just let it be, user will see it after refresh or we pass a key to DiaryFeed.
                    // OPTIMIZATION: We can pass a refreshTrigger prop to DiaryFeed
                    // For now, create a key based on timestamp to force re-render of DiaryFeed
                    setDiaryRefreshKey(prev => prev + 1);
                }}
                projectId={id || ''}
            />


            {/* Issue Modal */}
            <IssueModal
                isOpen={isIssueModalOpen}
                onClose={() => setIsIssueModalOpen(false)}
                onSaved={handleIssueSaved}
                projectId={id || ''}
                existingIssue={editingIssue}
            />

            {project && (
                <InvoiceScanModal
                    isOpen={isInvoiceScanModalOpen}
                    onClose={() => setIsInvoiceScanModalOpen(false)}
                    onSave={handleSaveScannedInvoice}
                    projects={[project]}
                    defaultProjectId={project.id}
                />
            )}
        </>
    )
}


