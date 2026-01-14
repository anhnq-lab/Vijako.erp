import React, { useState } from 'react';
import { PageHeader } from '../src/components/ui/Breadcrumbs';
import { ExportButton } from '../src/components/ui/ExportComponents';
import { Badge } from '../src/components/ui/CommonComponents';

// Mock Data
const mockContracts = [
    {
        id: '1',
        contract_code: 'HĐ-AB-2024-001',
        type: 'revenue', // A-B (Đầu ra)
        partner_name: 'UBND Huyện Sóc Sơn',
        project_name: 'Trường Tiểu học Tiên Sơn',
        value: 15000000000,
        paid_amount: 12000000000,
        retention_amount: 750000000,
        status: 'active',
        is_risk: false,
        signing_date: '2024-01-15',
        start_date: '2024-02-01',
        end_date: '2024-12-31'
    },
    {
        id: '2',
        contract_code: 'HĐ-BC-2024-001',
        type: 'expense', // B-C (Đầu vào - Thầu phụ)
        partner_name: 'Công ty TNHH Thảm Hà Nội',
        project_name: 'Trường Tiểu học Tiên Sơn',
        value: 2500000000,
        paid_amount: 2000000000,
        retention_amount: 125000000,
        status: 'active',
        is_risk: false,
        signing_date: '2024-02-01'
    },
    {
        id: '3',
        contract_code: 'HĐ-BC-2024-002',
        type: 'expense',
        partner_name: 'Công ty CP Xây dựng ABC',
        project_name: 'Trường Tiểu học Tiên Sơn',
        value: 3200000000,
        paid_amount: 1800000000,
        retention_amount: 160000000,
        status: 'active',
        is_risk: true,
        signing_date: '2024-03-01'
    },
    {
        id: '4',
        contract_code: 'HĐ-AB-2024-002',
        type: 'revenue',
        partner_name: 'Ban QLDA Khu kinh tế',
        project_name: 'Cầu Vượt Láng Hạ',
        value: 25000000000,
        paid_amount: 15000000000,
        retention_amount: 1250000000,
        status: 'active',
        is_risk: false
    }
];

const mockBiddingPackages = [
    {
        id: '1',
        package_code: 'GT-2024-001',
        title: 'Gói thầu Thi công móng và kết cấu',
        project_name: 'Trường Tiểu học Tiên Sơn',
        budget: 5000000000,
        publish_date: '2024-01-05',
        deadline: '2024-01-20',
        status: 'awarded',
        bidders_count: 8,
        winner: 'Công ty CP Xây dựng ABC'
    },
    {
        id: '2',
        package_code: 'GT-2024-002',
        title: 'Gói thầu Hoàn thiện nội ngoại thất',
        project_name: 'Trường Tiểu học Tiên Sơn',
        budget: 3500000000,
        publish_date: '2024-02-01',
        deadline: '2024-02-15',
        status: 'published',
        bidders_count: 0
    },
    {
        id: '3',
        package_code: 'GT-2024-003',
        title: 'Gói thầu Hệ thống M&E',
        project_name: 'Trường Tiểu học Tiên Sơn',
        budget: 2800000000,
        deadline: '2024-03-15',
        status: 'draft',
        bidders_count: 0
    }
];

const mockBankGuarantees = [
    {
        id: '1',
        guarantee_code: 'BL-2024-001',
        type: 'Bảo lãnh thực hiện HĐ',
        contract_code: 'HĐ-BC-2024-001',
        bank_name: 'Ngân hàng BIDV',
        value: 750000000,
        issue_date: '2024-01-15',
        expiry_date: '2025-01-15',
        status: 'active'
    },
    {
        id: '2',
        guarantee_code: 'BL-2024-002',
        type: 'Bảo lãnh bảo hành',
        contract_code: 'HĐ-AB-2024-001',
        bank_name: 'Vietcombank',
        value: 375000000,
        issue_date: '2024-02-01',
        expiry_date: '2026-02-01',
        status: 'active'
    },
    {
        id: '3',
        guarantee_code: 'BL-2024-003',
        type: 'Bảo lãnh dự thầu',
        package_code: 'GT-2024-001',
        bank_name: 'ACB',
        value: 250000000,
        issue_date: '2024-01-05',
        expiry_date: '2024-06-30',
        status: 'expired'
    }
];

const PremiumStatCard = ({ title, value, sub, progress, icon, color, gradient }: any) => (
    <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium">
        <div className={`absolute -right-4 -top-4 size-32 opacity-10 blur-2xl rounded-full ${gradient}`}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`size-12 rounded-2xl flex items-center justify-center ${color} shadow-lg`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            {progress && (
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth</span>
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
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Calculate stats
    const revenueContracts = mockContracts.filter(c => c.type === 'revenue');
    const expenseContracts = mockContracts.filter(c => c.type === 'expense');

    const stats = {
        totalRevenue: revenueContracts.reduce((sum, c) => sum + c.value, 0),
        paidRevenue: revenueContracts.reduce((sum, c) => sum + c.paid_amount, 0),
        totalExpense: expenseContracts.reduce((sum, c) => sum + c.value, 0),
        paidExpense: expenseContracts.reduce((sum, c) => sum + c.paid_amount, 0),
        activeBidding: mockBiddingPackages.filter(b => b.status === 'published').length,
        activeGuarantees: mockBankGuarantees.filter(g => g.status === 'active').length
    };

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'revenue': return revenueContracts;
            case 'expense': return expenseContracts;
            case 'bidding': return mockBiddingPackages;
            case 'guarantees': return mockBankGuarantees;
            default: return [];
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Page Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald uppercase tracking-[0.3em]">Contractual Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Hợp đồng & Đấu thầu
                        <span className="size-2 rounded-full bg-emerald animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Theo dõi hiệu suất tài chính và pháp lý của toàn bộ dự án</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton
                        data={getCurrentData()}
                        filename={`contracts-${activeTab}`}
                        title="Export Report"
                        variant="secondary"
                    />
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-light shadow-premium transition-premium group">
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-premium">add</span>
                        <span>New Contract</span>
                    </button>
                </div>
            </div>

            {/* Content Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PremiumStatCard
                            title="Total Revenue (A-B)"
                            value={`${(stats.totalRevenue / 1000000000).toFixed(1)}B ₫`}
                            sub={`Đã thu ${(stats.paidRevenue / 1000000000).toFixed(1)}B ₫`}
                            progress="12"
                            icon="trending_up"
                            color="bg-emerald text-white"
                            gradient="bg-emerald"
                        />
                        <PremiumStatCard
                            title="Total Expense (B-C)"
                            value={`${(stats.totalExpense / 1000000000).toFixed(1)}B ₫`}
                            sub={`Đã chi ${(stats.paidExpense / 1000000000).toFixed(1)}B ₫`}
                            progress="8"
                            icon="payments"
                            color="bg-slate-800 text-white"
                            gradient="bg-blue-600"
                        />
                        <PremiumStatCard
                            title="Active Bidding"
                            value={stats.activeBidding}
                            sub={`${mockBiddingPackages.length} gói thầu tổng cộng`}
                            icon="gavel"
                            color="bg-blue-500 text-white"
                            gradient="bg-blue-400"
                        />
                        <PremiumStatCard
                            title="Bank Guarantees"
                            value={stats.activeGuarantees}
                            sub={`${mockBankGuarantees.length} bảo lãnh hiện tại`}
                            icon="verified_user"
                            color="bg-amber-500 text-white"
                            gradient="bg-amber-400"
                        />
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                        {[
                            { id: 'revenue', label: 'Revenue (A-B)', icon: 'north_east' },
                            { id: 'expense', label: 'Expense (B-C)', icon: 'south_west' },
                            { id: 'bidding', label: 'Bidding', icon: 'campaign' },
                            { id: 'guarantees', label: 'Guarantees', icon: 'security' },
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

                    {/* Table Section */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Information</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner/Project</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (₫)</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {getCurrentData().map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-premium group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary transition-premium">
                                                        <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-white transition-premium">
                                                            {activeTab === 'bidding' ? 'gavel' : 'description'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm font-black text-primary uppercase">
                                                            {item.contract_code || item.package_code || item.guarantee_code}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                                                            {item.signing_date || item.issue_date || item.publish_date || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-slate-900 leading-tight">
                                                    {item.partner_name || item.title || item.bank_name}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[200px]">
                                                    {item.project_name || item.contract_code || 'Chưa phân bổ'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="font-black text-slate-900 tracking-tight">
                                                    {(item.value || item.budget).toLocaleString()}
                                                </p>
                                                {item.paid_amount && (
                                                    <p className="text-[10px] font-black text-emerald uppercase mt-1">
                                                        Paid: {item.paid_amount.toLocaleString()}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                {item.value ? (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald rounded-full"
                                                                style={{ width: `${Math.round((item.paid_amount || 0) / item.value * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">
                                                            {Math.round((item.paid_amount || 0) / item.value * 100)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-slate-300">N/A</div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.status === 'active' || item.status === 'awarded'
                                                            ? 'bg-emerald/10 text-emerald border border-emerald/20'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
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
                </div>
            </div>
        </div>
    );
}
