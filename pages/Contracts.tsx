import React, { useState, useEffect } from 'react';
import { PageHeader } from '../src/components/ui/Breadcrumbs';
import { projectService } from '../src/services/projectService';
import { ContractScanModal } from '../components/ContractScanModal';
import { ContractFormModal } from '../src/components/ContractFormModal';
import { ContractDetailModal } from '../src/components/ContractDetailModal';
import { ExportButton } from '../src/components/ui/ExportComponents';
import { Badge } from '../src/components/ui/CommonComponents';
import { financeService } from '../src/services/financeService';
import { Contract } from '../types';
import { PermissionGate } from '../src/components/PermissionGate';
import { PERMISSIONS } from '../src/utils/permissions';

const PremiumStatCard = ({ title, value, sub, progress, icon, color, gradient }: any) => (
    <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium">
        <div className={`absolute -right-4 -top-4 size-32 opacity-10 blur-2xl rounded-full ${gradient}`}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${color} shadow-lg`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            {progress && (
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tăng trưởng</span>
                    <p className="text-emerald font-black text-sm">+{progress}%</p>
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">{sub}</p>
        </div>
    </div>
);

export default function Contracts() {
    const [activeTab, setActiveTab] = useState<'revenue' | 'expense' | 'bidding' | 'guarantees'>('revenue');
    const [contracts, setContracts] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [guarantees, setGuarantees] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    // New modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                console.log("Starting to load contracts data...");

                // Fetch data individually to identify hanging queries
                const fetchContracts = async () => {
                    try {
                        const data = await financeService.getAllContracts();
                        console.log("Contracts loaded:", data?.length || 0);
                        return data;
                    } catch (e) {
                        console.error("Error loading contracts:", e);
                        return [];
                    }
                };

                const fetchPackages = async () => {
                    try {
                        const data = await financeService.getAllBiddingPackages();
                        console.log("Packages loaded:", data?.length || 0);
                        return data;
                    } catch (e) {
                        console.error("Error loading packages:", e);
                        return [];
                    }
                };

                const fetchGuarantees = async () => {
                    try {
                        const data = await financeService.getAllBankGuarantees();
                        console.log("Guarantees loaded:", data?.length || 0);
                        return data;
                    } catch (e) {
                        console.error("Error loading guarantees:", e);
                        return [];
                    }
                };

                const fetchProjects = async () => {
                    try {
                        const data = await projectService.getAllProjects();
                        console.log("Projects loaded:", data?.length || 0);
                        return data;
                    } catch (e) {
                        console.error("Error loading projects:", e);
                        return [];
                    }
                };

                const [cData, pData, gData, projectData] = await Promise.all([
                    fetchContracts(),
                    fetchPackages(),
                    fetchGuarantees(),
                    fetchProjects()
                ]);

                // Map project names to contracts if needed
                if (cData && projectData) {
                    const mappedContracts = cData.map(contract => {
                        const project = projectData.find(p => p.id === contract.project_id);
                        return {
                            ...contract,
                            project_name: project?.name || 'Chưa phân bổ'
                        };
                    });
                    setContracts(mappedContracts);
                } else {
                    setContracts(cData || []);
                }

                setPackages(pData || []);
                setGuarantees(gData || []);
                setProjects(projectData || []);

                console.log("All data loading complete.");
            } catch (error) {
                console.error("Critical error in loadData:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Calculate stats
    const revenueContracts = contracts.filter(c => c.contract_type === 'revenue' || c.contract_type === 'revenue');
    const expenseContracts = contracts.filter(c => c.contract_type === 'expense' || c.contract_type === 'expense');

    const stats = {
        totalRevenue: revenueContracts.reduce((sum, c) => sum + Number(c.contract_value || c.value || 0), 0),
        paidRevenue: revenueContracts.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0),
        totalExpense: expenseContracts.reduce((sum, c) => sum + Number(c.contract_value || c.value || 0), 0),
        paidExpense: expenseContracts.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0),
        activeBidding: packages.filter(b => b.status === 'published' || b.status === 'Đang mời thầu').length,
        activeGuarantees: guarantees.filter(g => g.status === 'active' || g.status === 'Còn hiệu lực').length
    };

    // Get current data based on active tab
    // Get current data based on active tab and project filter
    const getCurrentData = () => {
        let data = [];
        switch (activeTab) {
            case 'revenue': data = revenueContracts; break;
            case 'expense': data = expenseContracts; break;
            case 'bidding': data = packages; break;
            case 'guarantees': data = guarantees; break;
            default: data = [];
        }

        if (selectedProject) {
            return data.filter(item => item.project_id === selectedProject);
        }
        return data;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Page Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald uppercase tracking-[0.3em]">Hợp đồng & Pháp lý</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Hợp đồng & Đấu thầu
                        <span className="size-2 rounded-full bg-emerald animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Theo dõi hiệu suất tài chính và pháp lý của toàn bộ các gói thầu</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton
                        data={getCurrentData()}
                        filename={`contracts-${activeTab}`}
                        title="Xuất báo cáo"
                        variant="secondary"
                    />
                    <button
                        onClick={() => setIsScanModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black hover:bg-slate-50 transition-premium shadow-sm hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-[20px] text-purple-600">document_scanner</span>
                        <span>Quét Hợp đồng AI</span>
                    </button>
                    <PermissionGate allowedRoles={PERMISSIONS.CREATE_CONTRACT} showError>
                        <button
                            onClick={() => {
                                setEditingContract(null);
                                setIsFormModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-light shadow-premium transition-premium group"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-premium">add</span>
                            <span>Hợp đồng mới</span>
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PremiumStatCard
                            title="Doanh thu (A-B)"
                            value={`${(stats.totalRevenue / 1000000000).toFixed(1)} Tỷ ₫`}
                            sub={`Đã thu ${(stats.paidRevenue / 1000000000).toFixed(1)} Tỷ ₫`}
                            progress="12"
                            icon="trending_up"
                            color="bg-emerald text-white"
                            gradient="bg-emerald"
                        />
                        <PremiumStatCard
                            title="Chi phí (B-C)"
                            value={`${(stats.totalExpense / 1000000000).toFixed(1)} Tỷ ₫`}
                            sub={`Đã chi ${(stats.paidExpense / 1000000000).toFixed(1)} Tỷ ₫`}
                            progress="8"
                            icon="payments"
                            color="bg-slate-800 text-white"
                            gradient="bg-blue-600"
                        />
                        <PremiumStatCard
                            title="Đang đấu thầu"
                            value={stats.activeBidding}
                            sub={`${packages.length} gói thầu tổng số`}
                            icon="gavel"
                            color="bg-blue-500 text-white"
                            gradient="bg-blue-400"
                        />
                        <PremiumStatCard
                            title="Bảo lãnh Ngân hàng"
                            value={stats.activeGuarantees}
                            sub={`${guarantees.length} bảo lãnh hiện hành`}
                            icon="verified_user"
                            color="bg-amber-500 text-white"
                            gradient="bg-amber-400"
                        />
                    </div>

                    {/* Filters & Tabs Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Tabs */}
                        <div className="flex items-center p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                            {[
                                { id: 'revenue', label: 'Hợp đồng Đầu ra', icon: 'output' },
                                { id: 'expense', label: 'Hợp đồng Đầu vào', icon: 'input' },
                                { id: 'bidding', label: 'Gói thầu', icon: 'campaign' },
                                { id: 'guarantees', label: 'Bảo lãnh', icon: 'security' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-premium ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-primary'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Project Filter */}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <span className="material-symbols-outlined text-slate-400">filter_alt</span>
                            <select
                                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer min-w-[200px]"
                                value={selectedProject || ''}
                                onChange={(e) => setSelectedProject(e.target.value || null)}
                            >
                                <option value="">Tất cả Dự án</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-500 font-bold">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã & Hợp đồng</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tácc / Dự án</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời hạn</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị (₫)</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiến độ TT</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {getCurrentData().map((item: any) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => {
                                                    // Only for contracts (revenue/expense tabs)
                                                    if (activeTab === 'revenue' || activeTab === 'expense') {
                                                        setSelectedContract(item);
                                                        setIsDetailModalOpen(true);
                                                    }
                                                }}
                                                className={`hover:bg-slate-50/80 transition-premium group ${(activeTab === 'revenue' || activeTab === 'expense') ? 'cursor-pointer' : ''}`}
                                            >                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary transition-premium">
                                                            <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-white transition-premium">
                                                                {activeTab === 'bidding' ? 'gavel' : activeTab === 'guarantees' ? 'verified_user' : 'description'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-mono text-sm font-black text-primary uppercase">
                                                                {item.contract_code || item.package_code || item.guarantee_code || item.code}
                                                            </p>
                                                            <p className="text-xs text-slate-500 font-bold mt-0.5 truncate max-w-[200px]" title={item.name}>
                                                                {item.name || 'Hợp đồng'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-slate-900 leading-tight">
                                                        {item.partner_name || item.title || item.bank_name}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[10px] text-slate-400">apartment</span>
                                                        <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                                                            {item.project_name || 'Chưa phân bổ'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-slate-900 font-bold">
                                                            Ký: {item.signing_date || item.issue_date || 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            KT: {item.end_date || item.expiry_date || item.deadline || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <p className="font-black text-slate-900 tracking-tight">
                                                        {Math.round(item.contract_value || item.value || item.budget || item.guarantee_value || 0).toLocaleString()}
                                                    </p>
                                                    {item.paid_amount > 0 && (
                                                        <p className="text-[10px] font-black text-emerald uppercase mt-1">
                                                            Đã thu: {Number(item.paid_amount).toLocaleString()}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {(item.contract_value || item.value || item.budget) ? (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-emerald rounded-full"
                                                                    style={{ width: `${Math.min(100, Math.round((item.paid_amount || 0) / (item.contract_value || item.value || item.budget) * 100))}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-500">
                                                                {Math.min(100, Math.round((item.paid_amount || 0) / (item.contract_value || item.value || item.budget) * 100))}%
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-slate-300">N/A</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.status === 'active' || item.status === 'published' || item.status === 'Đang thực hiện' || item.status === 'Đã trúng thầu' || item.status === 'Còn hiệu lực'
                                                            ? 'bg-emerald/10 text-emerald border border-emerald/20'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                            }`}>
                                                            {item.status === 'active' ? 'Đang thực hiện' :
                                                                item.status === 'published' ? 'Đang mời thầu' :
                                                                    item.status === 'completed' ? 'Đã hoàn thành' : item.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="size-10 rounded-xl hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-premium">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ContractScanModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSave={async (data) => {
                    try {
                        console.log('Saving contract:', data);
                        await financeService.createContract({
                            contract_code: data.contract_code,
                            partner_name: data.partner_name,
                            signing_date: data.signing_date,
                            value: data.contract_value,
                            contract_type: data.contract_type,
                            status: 'active',
                            project_id: data.project_id,
                        } as any);

                        // Refresh data
                        const newContracts = await financeService.getAllContracts();
                        setContracts(newContracts);
                        setIsScanModalOpen(false);
                    } catch (error) {
                        console.error('Error saving scanned contract:', error);
                        alert('Lỗi khi lưu hợp đồng');
                    }
                }}
                projects={projects}
            />

            {/* Contract Form Modal */}
            <ContractFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingContract(null);
                }}
                contract={editingContract}
                onSave={async (contractData) => {
                    try {
                        if (editingContract) {
                            // Update existing
                            await financeService.updateContract(editingContract.id, contractData);
                        } else {
                            // Create new
                            await financeService.createContract(contractData as any);
                        }
                        // Refresh
                        const newContracts = await financeService.getAllContracts();
                        setContracts(newContracts);
                        setIsFormModalOpen(false);
                        setEditingContract(null);
                    } catch (error) {
                        console.error('Error saving contract:', error);
                        throw error;
                    }
                }}
            />

            {/* Contract Detail Modal */}
            <ContractDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedContract(null);
                }}
                contract={selectedContract}
                onEdit={(contract) => {
                    setEditingContract(contract);
                    setIsDetailModalOpen(false);
                    setIsFormModalOpen(true);
                }}
                onDelete={async (id) => {
                    try {
                        await financeService.deleteContract(id);
                        const newContracts = await financeService.getAllContracts();
                        setContracts(newContracts);
                    } catch (error) {
                        console.error('Error deleting contract:', error);
                        alert('Lỗi khi xóa hợp đồng');
                    }
                }}
            />
        </div>
    );
}
