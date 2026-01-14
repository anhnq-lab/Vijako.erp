import React, { useState, useEffect } from 'react';
import { PageHeader } from '../src/components/ui/Breadcrumbs';
import { DataTable, Column } from '../src/components/ui/DataTable';
import { QuickFilters, FilterTags } from '../src/components/ui/FilterComponents';
import { ExportButton } from '../src/components/ui/ExportComponents';
import { Modal, ConfirmDialog } from '../src/components/ui/ModalComponents';
import { Input, Select, FormActions } from '../src/components/ui/FormComponents';
import { Badge, QuickActionButton } from '../src/components/ui/CommonComponents';
import { showToast } from '../src/components/ui/Toast';
import { financeService, Contract, BankGuarantee } from '../src/services/financeService';
import { biddingService } from '../src/services/biddingService';
import { projectService } from '../src/services/projectService';
import { Project, BiddingPackage } from '../types';

export default function Contracts() {
    const [activeTab, setActiveTab] = useState<'contracts' | 'bidding' | 'guarantees'>('contracts');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [biddingPackages, setBiddingPackages] = useState<BiddingPackage[]>([]);
    const [bankGuarantees, setBankGuarantees] = useState<BankGuarantee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showContractForm, setShowContractForm] = useState(false);
    const [showBiddingForm, setShowBiddingForm] = useState(false);
    const [showGuaranteeForm, setShowGuaranteeForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Filters
    const [quickFilter, setQuickFilter] = useState('all');
    const [contractType, setContractType] = useState<'all' | 'revenue' | 'expense'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contractsData, biddingData, guaranteesData, projectsData] = await Promise.all([
                financeService.getAllContracts(),
                biddingService.getAllPackages(),
                financeService.getAllBankGuarantees(),
                projectService.getAllProjects()
            ]);

            setContracts(contractsData);
            setBiddingPackages(biddingData);
            setBankGuarantees(guaranteesData);
            setProjects(projectsData);
        } catch (error) {
            showToast.error('Lỗi tải dữ liệu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredContracts = contracts.filter(c => {
        if (quickFilter === 'active' && c.status !== 'active') return false;
        if (quickFilter === 'risk' && !c.is_risk) return false;
        if (contractType !== 'all' && c.type !== contractType) return false;
        return true;
    });

    // Columns for contracts table
    const contractColumns: Column<Contract>[] = [
        { key: 'contract_code', label: 'Mã HĐ', sortable: true, width: '120px' },
        {
            key: 'partner_name',
            label: 'Đối tác',
            sortable: true,
            render: (c) => (
                <div>
                    <p className="font-bold text-slate-900">{c.partner_name}</p>
                    <p className="text-xs text-slate-500">
                        {c.type === 'revenue' ? '📄 Hợp đồng đầu ra' : '📦 Hợp đồng đầu vào'}
                    </p>
                </div>
            )
        },
        {
            key: 'value',
            label: 'Giá trị',
            sortable: true,
            width: '150px',
            render: (c) => (
                <span className="font-bold text-primary">
                    {(c.value || 0).toLocaleString('vi-VN')} ₫
                </span>
            )
        },
        {
            key: 'paid_amount',
            label: 'Đã thanh toán',
            width: '200px',
            render: (c) => {
                const percent = c.value ? Math.round((c.paid_amount / c.value) * 100) : 0;
                return (
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">{percent}%</span>
                            <span className="font-bold">{(c.paid_amount || 0).toLocaleString()} ₫</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '120px',
            render: (c) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        label={c.status === 'active' ? 'Hiệu lực' : 'Đã thanh lý'}
                        variant={c.status === 'active' ? 'success' : 'default'}
                    />
                    {c.is_risk && (
                        <Badge label="⚠️ Rủi ro" variant="danger" size="sm" />
                    )}
                </div>
            )
        }
    ];

    // Bidding columns
    const biddingColumns: Column<BiddingPackage>[] = [
        {
            key: 'title',
            label: 'Tên gói thầu',
            sortable: true,
            render: (pkg) => (
                <div>
                    <p className="font-bold text-slate-900">{pkg.title}</p>
                    <p className="text-xs text-slate-500 font-mono">ID: {pkg.id.split('-')[0]}</p>
                </div>
            )
        },
        {
            key: 'budget',
            label: 'Ngân sách',
            sortable: true,
            width: '150px',
            render: (pkg) => (
                <span className="font-bold text-primary">
                    {pkg.budget ? `${(pkg.budget / 1000000000).toFixed(1)} Tỷ` : 'N/A'}
                </span>
            )
        },
        { key: 'deadline', label: 'Hạn nộp', sortable: true, width: '120px' },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '150px',
            render: (pkg) => {
                const statusMap = {
                    draft: { label: 'Bản nháp', variant: 'default' },
                    published: { label: 'Đang mời thầu', variant: 'info' },
                    awarded: { label: 'Đã chọn thầu', variant: 'success' }
                };
                const status = statusMap[pkg.status as keyof typeof statusMap];
                return <Badge label={status.label} variant={status.variant as any} />;
            }
        }
    ];

    // Statistics
    const stats = {
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => c.status === 'active').length,
        totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
        paidAmount: contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
        riskContracts: contracts.filter(c => c.is_risk).length
    };

    return (
        <div className="flex flex-col h-full bg-background-light">
            {/* Page Header */}
            <PageHeader
                title="Quản lý Hợp đồng"
                subtitle={`${stats.totalContracts} hợp đồng • ${stats.activeContracts} đang hiệu lực`}
                icon="description"
                actions={
                    <>
                        <ExportButton
                            data={filteredContracts.map(c => ({
                                'Mã HĐ': c.contract_code,
                                'Đối tác': c.partner_name,
                                'Loại': c.type === 'revenue' ? 'Đầu ra' : 'Đầu vào',
                                'Giá trị': c.value,
                                'Đã TT': c.paid_amount,
                                'Trạng thái': c.status
                            }))}
                            filename="danh-sach-hop-dong"
                            title="Danh sách Hợp đồng"
                            variant="secondary"
                        />
                        {activeTab === 'contracts' && (
                            <QuickActionButton
                                label="Tạo hợp đồng"
                                icon="add"
                                onClick={() => setShowContractForm(true)}
                            />
                        )}
                        {activeTab === 'bidding' && (
                            <QuickActionButton
                                label="Tạo gói thầu"
                                icon="add"
                                onClick={() => setShowBiddingForm(true)}
                            />
                        )}
                        {activeTab === 'guarantees' && (
                            <QuickActionButton
                                label="Thêm bảo lãnh"
                                icon="add"
                                onClick={() => setShowGuaranteeForm(true)}
                            />
                        )}
                    </>
                }
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-blue-600 text-[24px]">description</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Tổng HĐ</p>
                                    <p className="text-2xl font-black text-slate-900">{stats.totalContracts}</p>
                                    <p className="text-xs text-slate-500">{stats.activeContracts} hiệu lực</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-green-600 text-[24px]">payments</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Tổng giá trị</p>
                                    <p className="text-2xl font-black text-green-600">
                                        {(stats.totalValue / 1000000000).toFixed(1)} Tỷ
                                    </p>
                                    <p className="text-xs text-slate-500">Giá trị hợp đồng</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Đã thanh toán</p>
                                    <p className="text-2xl font-black text-primary">
                                        {(stats.paidAmount / 1000000000).toFixed(1)} Tỷ
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {stats.totalValue ? Math.round((stats.paidAmount / stats.totalValue) * 100) : 0}% tổng giá trị
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold">Cảnh báo</p>
                                    <p className="text-2xl font-black text-red-600">{stats.riskContracts}</p>
                                    <p className="text-xs text-slate-500">Hợp đồng có rủi ro</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'contracts'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            📄 Hợp đồng ({contracts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('bidding')}
                            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'bidding'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            📋 Gói thầu ({biddingPackages.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('guarantees')}
                            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'guarantees'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            🏦 Bảo lãnh ({bankGuarantees.length})
                        </button>
                    </div>

                    {/* Filters */}
                    {activeTab === 'contracts' && (
                        <div className="space-y-4">
                            <QuickFilters
                                filters={[
                                    { id: 'all', label: 'Tất cả', icon: 'apps' },
                                    { id: 'active', label: 'Đang hiệu lực', icon: 'check_circle' },
                                    { id: 'risk', label: 'Có rủi ro', icon: 'warning' }
                                ]}
                                activeId={quickFilter}
                                onChange={setQuickFilter}
                            />

                            <div className="flex items-center gap-3">
                                <Select
                                    options={[
                                        { value: 'all', label: 'Tất cả loại HĐ' },
                                        { value: 'revenue', label: 'Hợp đồng đầu ra (A-B)' },
                                        { value: 'expense', label: 'Hợp đồng đầu vào (B-C)' }
                                    ]}
                                    value={contractType}
                                    onChange={(e) => setContractType(e.target.value as any)}
                                    className="w-64"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tables */}
                    {activeTab === 'contracts' && (
                        <DataTable
                            data={filteredContracts}
                            columns={contractColumns}
                            loading={loading}
                            onRowClick={(contract) => setSelectedItem(contract)}
                            emptyMessage="Chưa có hợp đồng nào"
                            emptyIcon="description"
                        />
                    )}

                    {activeTab === 'bidding' && (
                        <DataTable
                            data={biddingPackages}
                            columns={biddingColumns}
                            loading={loading}
                            onRowClick={(pkg) => setSelectedItem(pkg)}
                            emptyMessage="Chưa có gói thầu nào"
                            emptyIcon="gavel"
                        />
                    )}

                    {activeTab === 'guarantees' && (
                        <div className="bg-white rounded-xl border border-slate-100 p-6">
                            <p className="text-slate-500">Bảng bảo lãnh ngân hàng đang được phát triển...</p>
                            {/* TODO: Add guarantees table */}
                        </div>
                    )}
                </div>
            </div>

            {/* Contract Form Modal - TODO: Implement with FormComponents */}
            {showContractForm && (
                <Modal
                    isOpen={showContractForm}
                    onClose={() => setShowContractForm(false)}
                    title="Tạo hợp đồng mới"
                    size="lg"
                >
                    <p className="text-slate-600">Form tạo hợp đồng sẽ được implement với FormComponents...</p>
                    {/* TODO: Add contract form */}
                </Modal>
            )}
        </div>
    );
}
