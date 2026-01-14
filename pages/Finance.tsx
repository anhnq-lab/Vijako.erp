import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import { financeService, PaymentRequest, CashFlowData } from '../src/services/financeService';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';
import { InvoiceScanModal } from '../components/InvoiceScanModal';
import { PageHeader } from '../src/components/ui/Breadcrumbs';
import { Badge } from '../src/components/ui/CommonComponents';

// --- Mock Data for fallback ---
const costStructureData = [
    { name: 'T1', inflow: 45, outflow: 35 },
    { name: 'T2', inflow: 52, outflow: 48 },
    { name: 'T3', inflow: 48, outflow: 55 },
    { name: 'T4', inflow: 61, outflow: 42 },
    { name: 'T5', inflow: 55, outflow: 50 },
    { name: 'T6', inflow: 67, outflow: 58 },
];

// --- Sub-Components ---

const StatCard = ({ title, value, sub, icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className={`size-12 rounded-xl flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 my-1">{value}</h3>
            <p className="text-xs text-slate-500">{sub}</p>
        </div>
    </div>
);

const AIFinancialInsight = () => (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl p-6 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-5">
            <span className="material-symbols-outlined text-[150px]">psychology_alt</span>
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                    <span className="material-symbols-outlined text-[20px] text-yellow-300">auto_awesome</span>
                </span>
                <h3 className="font-bold text-lg">CFO AI Insight</h3>
            </div>
            <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Dự báo dòng tiền</p>
                    <p className="text-sm">Tháng tới dự kiến thu <span className="text-green-400 font-bold">12.5 Tỷ</span> từ 3 dự án trọng điểm. Tuy nhiên, cần lưu ý hạn thanh toán nợ NCC vào ngày 25.</p>
                </div>
            </div>
        </div>
        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
            <span>AI phân tích dựa trên dữ liệu thực tế</span>
            <button className="font-bold bg-white text-indigo-900 px-3 py-1.5 rounded-lg">Chi tiết</button>
        </div>
    </div>
);

export default function Finance() {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'payments'>('cashflow');
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [cashFlowRecords, setCashFlowRecords] = useState<CashFlowData[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInvoiceScanModalOpen, setIsInvoiceScanModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prData, cfData, pData] = await Promise.all([
                financeService.getAllPaymentRequests(),
                financeService.getCashFlowData(),
                projectService.getAllProjects()
            ]);

            if (prData) setPaymentRequests(prData);
            if (cfData) setCashFlowRecords(cfData);
            if (pData) setProjects(pData);
        } catch (err) {
            console.error('Failed to fetch finance data', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <PageHeader
                title="Quản lý Tài chính & Thanh toán"
                subtitle="Kiểm soát dòng tiền, hóa đơn và các khoản thanh toán dự án"
                icon="payments"
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsInvoiceScanModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200"
                        >
                            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                            Quét hóa đơn AI
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Tạo thanh toán
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Dòng tiền hiện tại"
                        value="42.8 Tỷ"
                        sub="+5.2% so với tháng trước"
                        icon="account_balance_wallet"
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Doanh thu tháng"
                        value="12.5 Tỷ"
                        sub="Đã thu 8.2 Tỷ"
                        icon="trending_up"
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="Chi phí tháng"
                        value="9.8 Tỷ"
                        sub="Phải trả NCC: 3.4 Tỷ"
                        icon="trending_down"
                        color="bg-red-50 text-red-600"
                    />
                    <div className="lg:col-span-1">
                        <AIFinancialInsight />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-100 px-6">
                        <button
                            onClick={() => setActiveTab('cashflow')}
                            className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'cashflow' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
                        >
                            Dòng tiền & Ngân sách
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
                        >
                            Thanh toán & Công nợ
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'cashflow' && (
                            <div className="space-y-6">
                                <div className="h-[350px] w-full">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">show_chart</span>
                                        Biểu đồ Dòng tiền (Vào - Ra)
                                    </h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={costStructureData}>
                                            <defs>
                                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#07883d" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#07883d" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="inflow" name="Dòng tiền vào" stroke="#07883d" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="outflow" name="Dòng tiền ra" stroke="#EF4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                    <div className="p-4 rounded-xl border border-slate-100">
                                        <h5 className="font-bold text-sm text-slate-900 mb-3">Dự án thu nhiều nhất</h5>
                                        <div className="space-y-3">
                                            {[1, 2].map(i => (
                                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                    <span className="text-sm font-medium">Trường Tiểu học Tiên Sơn</span>
                                                    <span className="text-sm font-bold text-green-600">+12.4 Tỷ</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100">
                                        <h5 className="font-bold text-sm text-slate-900 mb-3">Dự án chi nhiều nhất</h5>
                                        <div className="space-y-3">
                                            {[1, 2].map(i => (
                                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                    <span className="text-sm font-medium">Cầu Vượt Láng Hạ</span>
                                                    <span className="text-sm font-bold text-red-600">-8.2 Tỷ</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Yêu cầu thanh toán</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Dự án</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Số tiền</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Ngày yêu cầu</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">Trạng thái</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paymentRequests.length > 0 ? paymentRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">{req.partner_name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">Trường Tiểu học Tiên Sơn</td>
                                                <td className="px-6 py-4 text-sm font-bold text-primary">{(req.amount || 0).toLocaleString()} ₫</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{new Date().toLocaleDateString('vi-VN')}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge
                                                        label={req.status === 'paid' ? 'Đã trả' : 'Đang xử lý'}
                                                        variant={req.status === 'paid' ? 'success' : 'info'}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary hover:underline text-sm font-bold">Chi tiết</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Chưa có dữ liệu thanh toán</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InvoiceScanModal
                isOpen={isInvoiceScanModalOpen}
                onClose={() => setIsInvoiceScanModalOpen(false)}
                onScanComplete={(data) => {
                    console.log('Scanned:', data);
                    setIsInvoiceScanModalOpen(false);
                }}
            />
        </div>
    );
}