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
            case 'revenue':
                return revenueContracts;
            case 'expense':
                return expenseContracts;
            case 'bidding':
                return mockBiddingPackages;
            case 'guarantees':
                return mockBankGuarantees;
            default:
                return [];
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light">
            {/* Page Header */}
            <PageHeader
                title="Quản lý Tài chính & Hợp đồng"
                subtitle="Kiểm soát dòng tiền hợp đồng A-B-B và thanh quyết toán"
                icon="account_balance_wallet"
                actions={
                    <>
                        <ExportButton
                            data={getCurrentData()}
                            filename={`contracts-${activeTab}`}
                            title="Danh sách Hợp đồng"
                            variant="secondary"
                        />
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            <span>Báo cáo</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Tạo hợp đồng mới</span>
                        </button>
                    </>
                }
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-green-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-green-600 text-[24px]">trending_up</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">HĐ Đầu Ra (A-B)</p>
                                    <p className="text-2xl font-black text-green-600">
                                        {(stats.totalRevenue / 1000000000).toFixed(1)} Tỷ
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Đã thu: {(stats.paidRevenue / 1000000000).toFixed(1)} Tỷ ({Math.round((stats.paidRevenue / stats.totalRevenue) * 100)}%)
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-red-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-red-600 text-[24px]">trending_down</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">HĐ Đầu Vào (B-C)</p>
                                    <p className="text-2xl font-black text-red-600">
                                        {(stats.totalExpense / 1000000000).toFixed(1)} Tỷ
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Đã chi: {(stats.paidExpense / 1000000000).toFixed(1)} Tỷ ({Math.round((stats.paidExpense / stats.totalExpense) * 100)}%)
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-blue-600 text-[24px]">gavel</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Đấu Thầu</p>
                                    <p className="text-2xl font-black text-blue-600">{stats.activeBidding}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Gói thầu đang mời thầu</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-[24px]">security</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Bảo Lãnh</p>
                                    <p className="text-2xl font-black text-primary">{stats.activeGuarantees}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Bảo lãnh đang hiệu lực</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('revenue')}
                            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'revenue'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">trending_up</span>
                            Hợp Đồng Đầu Ra (A-B) ({revenueContracts.length})
                        </button>
                        <button
                            onClick={() => setActive Tab('expense')}
                        className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'expense'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
            >
                        <span className="material-symbols-outlined text-[18px]">trending_down</span>
                        Hợp Đồng Đầu Vào (B-B / Thầu Phụ) ({expenseContracts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bidding')}
                        className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bidding'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        Quản Lý Đấu Thầu (Bidding) ({mockBiddingPackages.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('guarantees')}
                        className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'guarantees'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">security</span>
                        Bảo Lãnh (Bank Guarantees) ({mockBankGuarantees.length})
                    </button>
                </div>

                {/* Content based on active tab */}
                <div className="bg-white rounded-xl border border-slate-100">
                    {(activeTab === 'revenue' || activeTab === 'expense') && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Mã HĐ</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Đối tác</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Dự án</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase">Giá trị</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase">Đã TT</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Tiến độ</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {getCurrentData().map((contract: any) => {
                                        const percent = Math.round((contract.paid_amount / contract.value) * 100);
                                        return (
                                            <tr
                                                key={contract.id}
                                                onClick={() => setSelectedItem(contract)}
                                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-mono text-sm font-bold text-primary">{contract.contract_code}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900">{contract.partner_name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600">{contract.project_name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-bold text-slate-900">
                                                        {(contract.value / 1000000).toFixed(0)} Tr
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-bold text-green-600">
                                                        {(contract.paid_amount / 1000000).toFixed(0)} Tr
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-green-500 h-full rounded-full transition-all"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 w-10 text-right">{percent}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Badge
                                                            label={contract.status === 'active' ? 'Hiệu lực' : 'Thanh lý'}
                                                            variant={contract.status === 'active' ? 'success' : 'default'}
                                                        />
                                                        {contract.is_risk && (
                                                            <Badge label="Rủi ro" variant="danger" size="sm" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'bidding' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Gói thầu</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Dự án</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase">Ngân sách</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Hạn nộp</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Nhà thầu</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mockBiddingPackages.map((pkg) => (
                                        <tr
                                            key={pkg.id}
                                            onClick={() => setSelectedItem(pkg)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{pkg.title}</p>
                                                <p className="text-xs text-slate-500 font-mono">{pkg.package_code}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{pkg.project_name}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-bold text-primary">
                                                    {pkg.budget ? `${(pkg.budget / 1000000000).toFixed(1)} Tỷ` : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-sm">{pkg.deadline}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="font-bold text-blue-600">{pkg.bidders_count}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Badge
                                                        label={pkg.status === 'draft' ? 'Bản nháp' : pkg.status === 'published' ? 'Đang mời thầu' : 'Đã chọn thầu'}
                                                        variant={pkg.status === 'draft' ? 'default' : pkg.status === 'published' ? 'info' : 'success'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'guarantees' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Mã BL</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Loại</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Ngân hàng</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase">Giá trị</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Ngày hết hạn</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mockBankGuarantees.map((guarantee) => (
                                        <tr
                                            key={guarantee.id}
                                            onClick={() => setSelectedItem(guarantee)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-sm font-bold text-primary">{guarantee.guarantee_code}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{guarantee.type}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{guarantee.bank_name}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-bold text-slate-900">
                                                    {(guarantee.value / 1000000).toFixed(0)} Tr
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <p className="text-sm">{guarantee.expiry_date}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Badge
                                                        label={guarantee.status === 'active' ? 'Hiệu lực' : 'Hết hạn'}
                                                        variant={guarantee.status === 'active' ? 'success' : 'default'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty state */}
                    {getCurrentData().length === 0 && (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-[64px] text-slate-300">inbox</span>
                            <p className="mt-4 text-slate-500 font-bold">Chưa có dữ liệu hợp đồng</p>
                            <p className="text-sm text-slate-400">Bắt đầu bằng cách tạo hợp đồng mới</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div >
  );
}
