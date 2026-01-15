import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { paymentClaimService, PaymentContract, InterimPaymentClaim, Variation } from '../src/services/paymentClaimService';
import { financeService } from '../src/services/financeService';
import { Badge } from '../src/components/ui/CommonComponents';
import { IPCFormModal } from '../src/components/IPCFormModal';
import { ImportBOQModal } from '../src/components/ImportBOQModal';
import { VariationModal } from '../src/components/VariationModal';
import { IPCApprovalModal } from '../src/components/IPCApprovalModal';
import { showToast as toast } from '../src/components/ui/Toast';

// Status badge helper
const getIPCStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
        draft: { label: 'Nháp', color: 'bg-slate-100 text-slate-600' },
        internal_review: { label: 'Đang duyệt nội bộ', color: 'bg-blue-50 text-blue-600' },
        submitted: { label: 'Đã trình', color: 'bg-indigo-50 text-indigo-600' },
        certified: { label: 'Đã duyệt', color: 'bg-emerald/10 text-emerald border border-emerald/20' },
        invoiced: { label: 'Đã xuất HĐ', color: 'bg-green-50 text-green-600' },
        rejected: { label: 'Từ chối', color: 'bg-red-50 text-red-600' }
    };
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${config.color}`}>{config.label}</span>;
};

const getVariationStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-600' },
        approved: { label: 'Đã duyệt', color: 'bg-emerald/10 text-emerald' },
        rejected: { label: 'Từ chối', color: 'bg-red-50 text-red-600' }
    };
    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${config.color}`}>{config.label}</span>;
};

export default function PaymentClaims() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'ipcs' | 'variations'>('dashboard');
    const [paymentContracts, setPaymentContracts] = useState<PaymentContract[]>([]);
    const [ipcs, setIpcs] = useState<InterimPaymentClaim[]>([]);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isIPCModalOpen, setIsIPCModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

    // Selection states
    const [selectedContract, setSelectedContract] = useState<PaymentContract | null>(null);
    const [selectedIPC, setSelectedIPC] = useState<InterimPaymentClaim | null>(null);
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const contractsData = await paymentClaimService.getAllPaymentContracts();
            setPaymentContracts(contractsData || []);

            const allIpcs: InterimPaymentClaim[] = [];
            for (const contract of contractsData || []) {
                const contractIpcs = await paymentClaimService.getIPCsByContract(contract.id);
                allIpcs.push(...contractIpcs);
            }
            setIpcs(allIpcs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

            const allVariations: Variation[] = [];
            for (const contract of contractsData || []) {
                const contractVariations = await paymentClaimService.getVariationsByContract(contract.id);
                allVariations.push(...contractVariations);
            }
            setVariations(allVariations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

        } catch (err: any) {
            console.error('Failed to fetch payment claims data:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleCreateIPC = () => {
        if (paymentContracts.length === 0) {
            toast.error('Vui lòng tạo điều khoản thanh toán cho hợp đồng trước');
            return;
        }
        setSelectedContract(paymentContracts[0]); // Tạm thời lấy cái đầu tiên, thực tế chọn từ list
        setSelectedIPC(null);
        setIsIPCModalOpen(true);
    };

    const handleImportBOQ = (contract: PaymentContract) => {
        setSelectedContract(contract);
        setIsImportModalOpen(true);
    };

    const handleOpenIPC = (ipc: InterimPaymentClaim) => {
        const contract = paymentContracts.find(pc => pc.id === ipc.payment_contract_id);
        if (contract) {
            setSelectedContract(contract);
            setSelectedIPC(ipc);

            if (ipc.status === 'submitted' || ipc.status === 'internal_review') {
                setIsApprovalModalOpen(true);
            } else {
                setIsIPCModalOpen(true);
            }
        }
    };

    const handleCreateVariation = () => {
        if (paymentContracts.length === 0) return;
        setSelectedContract(paymentContracts[0]);
        setSelectedVariation(null);
        setIsVariationModalOpen(true);
    };

    const handleExportIPC = async (e: React.MouseEvent, ipcId: string) => {
        e.stopPropagation(); // Ngăn mở modal
        try {
            toast.loading('Đang tạo file Excel...');
            await paymentClaimService.exportIPCToExcel(ipcId);
            toast.dismiss();
            toast.success('Đã xuất file Excel thành công');
        } catch (err: any) {
            console.error(err);
            toast.dismiss();
            toast.error('Không thể xuất file Excel: ' + err.message);
        }
    };

    // Dashboard statistics
    const totalContracts = paymentContracts.length;
    const totalIPCs = ipcs.length;
    const submittedIPCs = ipcs.filter(ipc => ipc.status === 'submitted' || ipc.status === 'certified').length;
    const certifiedIPCs = ipcs.filter(ipc => ipc.status === 'certified').length;
    const totalVariations = variations.length;
    const approvedVariations = variations.filter(v => v.status === 'approved').length;

    const totalCertifiedValue = ipcs
        .filter(ipc => ipc.status === 'certified')
        .reduce((sum, ipc) => sum + (ipc.certified_net_payment || 0), 0);

    const totalSubmittedValue = ipcs
        .filter(ipc => ipc.status === 'submitted' || ipc.status === 'certified')
        .reduce((sum, ipc) => sum + ipc.net_payment, 0);

    // Chart data - IPCs per month
    const ipcsByMonth = ipcs.reduce((acc, ipc) => {
        const month = ipc.period_end.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { month, count: 0, value: 0 };
        acc[month].count++;
        acc[month].value += ipc.net_payment;
        return acc;
    }, {} as Record<string, { month: string; count: number; value: number }>);

    const ipcChartData = Object.values(ipcsByMonth).sort((a, b) => a.month.localeCompare(b.month));

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Page Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-primary-accent uppercase tracking-[0.3em]">QT-CL-20</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Thanh toán Khối lượng
                        <span className="size-2 rounded-full bg-primary-accent animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Quản lý IPC, BOQ và phát sinh theo ISO QT-CL-20</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => paymentContracts.length > 0 && handleImportBOQ(paymentContracts[0])}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black hover:bg-slate-50 transition-premium shadow-sm hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-[20px] text-primary-accent">upload_file</span>
                        <span>Import BOQ</span>
                    </button>

                    <button
                        onClick={handleCreateIPC}
                        className="flex items-center gap-2 px-6 py-3 mesh-gradient text-white rounded-2xl text-sm font-black hover:opacity-90 shadow-premium transition-premium group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-premium">add</span>
                        <span>Tạo IPC mới</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="mx-8 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined">error</span>
                    <div>
                        <p className="font-bold">Không tải được dữ liệu</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Stat Card 1 */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-premium">
                                            <span className="material-symbols-outlined text-[24px]">description</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tổng hợp đồng</p>
                                            <h3 className="text-3xl font-black text-slate-900">{totalContracts}</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Có BOQ & điều khoản thanh toán</div>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-premium">
                                            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">IPCs đã trình</p>
                                            <h3 className="text-3xl font-black text-slate-900">{submittedIPCs}</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Trong tổng <span className="font-bold">{totalIPCs}</span> IPCs</div>
                                </div>

                                {/* Stat Card 3 */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-premium">
                                            <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Đã được duyệt</p>
                                            <h3 className="text-3xl font-black text-slate-900">{certifiedIPCs}</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs text-emerald-600 font-bold">Giá trị: {(totalCertifiedValue / 1_000_000_000).toFixed(1)}B ₫</div>
                                </div>

                                {/* Stat Card 4 */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-glass hover:shadow-premium transition-premium group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-premium">
                                            <span className="material-symbols-outlined text-[24px]">change_circle</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Phát sinh</p>
                                            <h3 className="text-3xl font-black text-slate-900">{approvedVariations}/{totalVariations}</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Đã duyệt / Tổng số</div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* IPC Timeline Chart */}
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-glass">
                                    <h4 className="text-lg font-black text-slate-900 mb-4">Tiến độ trình thanh toán</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={ipcChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any) => [`${value} IPCs`, 'Số lượng']}
                                            />
                                            <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Value Chart */}
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-glass">
                                    <h4 className="text-lg font-black text-slate-900 mb-4">Giá trị thanh toán theo tháng</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={ipcChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any) => [`${(value / 1_000_000_000).toFixed(2)}B ₫`, 'Giá trị']}
                                            />
                                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent IPCs */}
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h4 className="text-lg font-black text-slate-900">IPCs gần đây</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50/50">
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">IPC</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Dự án</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Kỳ</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị (₫)</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tác vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {ipcs.slice(0, 10).map((ipc) => (
                                                <tr
                                                    key={ipc.id}
                                                    onClick={() => handleOpenIPC(ipc)}
                                                    className="hover:bg-slate-50/80 transition-premium cursor-pointer"
                                                >
                                                    <td className="px-6 py-5 font-black text-slate-900">{ipc.ipc_number}</td>
                                                    <td className="px-6 py-5 font-bold text-slate-600">{ipc.project_name || 'N/A'}</td>
                                                    <td className="px-6 py-5 text-sm text-slate-500">{ipc.period_start} ~ {ipc.period_end}</td>
                                                    <td className="px-6 py-5 text-right font-black text-slate-900">{ipc.net_payment.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-center">{getIPCStatusBadge(ipc.status)}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {(ipc.status === 'internal_review' || ipc.status === 'submitted') && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenIPC(ipc); }}
                                                                    className="size-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-premium flex items-center justify-center"
                                                                    title="Phê duyệt"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">shield_person</span>
                                                                </button>
                                                            )}
                                                            {ipc.status === 'certified' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toast.loading('Đang xử lý hóa đơn...');
                                                                        paymentClaimService.invoiceIPC(ipc.id, 'INV-' + Date.now(), 'Kế toán').then(() => {
                                                                            toast.dismiss();
                                                                            toast.success('Đã xác nhận xuất hóa đơn');
                                                                            fetchData();
                                                                        });
                                                                    }}
                                                                    className="size-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-premium flex items-center justify-center"
                                                                    title="Xuất hóa đơn"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">receipt</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => handleExportIPC(e, ipc.id)}
                                                                className="size-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-premium flex items-center justify-center"
                                                                title="Xuất Excel"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {ipcs.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-20 text-center">
                                                        <span className="material-symbols-outlined text-slate-200 text-[64px] mb-4">receipt_long</span>
                                                        <p className="text-slate-400 font-bold">Chưa có IPC nào</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Contracts Tab */}
                    {activeTab === 'contracts' && (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h4 className="text-lg font-black text-slate-900">Danh sách Hợp đồng</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50">
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mã HĐ</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Đối tác</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">% Giữ lại</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tạm ứng (₫)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">IPCs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {paymentContracts.map((pc) => {
                                            const contractIpcs = ipcs.filter(ipc => ipc.payment_contract_id === pc.id);
                                            return (
                                                <tr
                                                    key={pc.id}
                                                    onClick={() => handleImportBOQ(pc)}
                                                    className="hover:bg-slate-50/80 transition-premium cursor-pointer"
                                                >
                                                    <td className="px-6 py-5 font-black text-slate-900">{pc.contract_code}</td>
                                                    <td className="px-6 py-5 font-bold text-slate-600">{pc.partner_name}</td>
                                                    <td className="px-6 py-5 text-right font-bold text-amber-600">{pc.retention_percent}%</td>
                                                    <td className="px-6 py-5 text-right font-black text-slate-900">{pc.advance_payment_amount.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">{contractIpcs.length} đợt</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* IPCs Tab */}
                    {activeTab === 'ipcs' && (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="text-lg font-black text-slate-900">Tất cả IPCs</h4>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">Tất cả</button>
                                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">Đã trình</button>
                                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">Đã duyệt</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50">
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">IPC</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Hợp đồng</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Kỳ</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trình (₫)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Duyệt (₫)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tác vụ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {ipcs.map((ipc) => (
                                            <tr
                                                key={ipc.id}
                                                onClick={() => handleOpenIPC(ipc)}
                                                className="hover:bg-slate-50/80 transition-premium cursor-pointer"
                                            >
                                                <td className="px-6 py-5 font-black text-slate-900">{ipc.ipc_number}</td>
                                                <td className="px-6 py-5 font-bold text-slate-600">{ipc.contract_code}</td>
                                                <td className="px-6 py-5 text-sm text-slate-500">{ipc.period_start} ~ {ipc.period_end}</td>
                                                <td className="px-6 py-5 text-right font-black text-slate-900">{(ipc.submitted_net_payment || ipc.net_payment).toLocaleString()}</td>
                                                <td className="px-6 py-5 text-right font-black text-emerald-600">
                                                    {ipc.certified_net_payment ? ipc.certified_net_payment.toLocaleString() : '-'}
                                                </td>
                                                <td className="px-6 py-5 text-center">{getIPCStatusBadge(ipc.status)}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {(ipc.status === 'internal_review' || ipc.status === 'submitted') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOpenIPC(ipc); }}
                                                                className="size-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-premium flex items-center justify-center"
                                                                title="Phê duyệt"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleExportIPC(e, ipc.id)}
                                                            className="size-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-premium flex items-center justify-center"
                                                            title="Xuất Excel báo cáo"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">download</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Variations Tab */}
                    {activeTab === 'variations' && (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h4 className="text-lg font-black text-slate-900">Phát sinh Hợp đồng</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50">
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mã VO</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mô tả</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Loại</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đề xuất (₫)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Duyệt (₫)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {variations.map((variation) => (
                                            <tr
                                                key={variation.id}
                                                onClick={() => {
                                                    const contract = paymentContracts.find(pc => pc.id === variation.payment_contract_id);
                                                    if (contract) {
                                                        setSelectedContract(contract);
                                                        setSelectedVariation(variation);
                                                        setIsVariationModalOpen(true);
                                                    }
                                                }}
                                                className="hover:bg-slate-50/80 transition-premium cursor-pointer"
                                            >
                                                <td className="px-6 py-5 font-black text-slate-900">{variation.variation_code}</td>
                                                <td className="px-6 py-5 font-bold text-slate-600 max-w-md truncate">{variation.description}</td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                                                        {variation.type === 'material_change' && 'Vật liệu'}
                                                        {variation.type === 'quantity_change' && 'Khối lượng'}
                                                        {variation.type === 'new_item' && 'Hạng mục mới'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right font-black text-slate-900">{variation.proposed_amount.toLocaleString()}</td>
                                                <td className="px-6 py-5 text-right font-black text-emerald-600">
                                                    {variation.approved_amount ? variation.approved_amount.toLocaleString() : '-'}
                                                </td>
                                                <td className="px-6 py-5 text-center">{getVariationStatusBadge(variation.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation - Sticky at bottom */}
            <div className="bg-white border-t border-slate-200 px-8 py-4">
                <div className="flex gap-2 max-w-[1600px] mx-auto">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                        { id: 'contracts', label: 'Hợp đồng', icon: 'description' },
                        { id: 'ipcs', label: 'IPCs', icon: 'receipt_long' },
                        { id: 'variations', label: 'Phát sinh', icon: 'change_circle' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-premium ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-premium'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {selectedContract && (
                <>
                    <IPCFormModal
                        isOpen={isIPCModalOpen}
                        onClose={() => setIsIPCModalOpen(false)}
                        paymentContract={selectedContract}
                        ipc={selectedIPC || undefined}
                        onSuccess={fetchData}
                    />
                    <ImportBOQModal
                        isOpen={isImportModalOpen}
                        onClose={() => setIsImportModalOpen(false)}
                        paymentContractId={selectedContract.id}
                        onSuccess={fetchData}
                    />
                    <VariationModal
                        isOpen={isVariationModalOpen}
                        onClose={() => setIsVariationModalOpen(false)}
                        paymentContract={selectedContract}
                        variation={selectedVariation || undefined}
                        onSuccess={fetchData}
                    />
                </>
            )}

            {selectedIPC && (
                <IPCApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    ipc={selectedIPC}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
