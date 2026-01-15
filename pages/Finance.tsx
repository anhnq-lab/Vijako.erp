import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import { financeService, PaymentRequest, CashFlowData, Invoice, PaymentRecord } from '../src/services/financeService';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';
import { InvoiceScanModal } from '../components/InvoiceScanModal';
import { Badge } from '../src/components/ui/CommonComponents';

// --- Dữ liệu mô phỏng cho Mini Charts ---
const assetData = [
    { name: 'T1', value: 38.5 }, { name: 'T2', value: 40.2 }, { name: 'T3', value: 39.8 },
    { name: 'T4', value: 41.5 }, { name: 'T5', value: 42.0 }, { name: 'T6', value: 42.8 }
];

const revenueData = [
    { name: 'T2', value: 1.2 }, { name: 'T3', value: 0.8 }, { name: 'T4', value: 2.1 },
    { name: 'T5', value: 1.5 }, { name: 'T6', value: 2.8 }, { name: 'T7', value: 1.9 },
    { name: 'CN', value: 2.2 }
];

const expenseBreakdown = [
    { name: 'Vật tư', value: 4.2, color: '#ef4444' }, // Red
    { name: 'Nhân công', value: 3.5, color: '#f59e0b' }, // Amber
    { name: 'Vận hành', value: 2.1, color: '#64748b' }  // Slate
];

const costStructureData = [
    { name: 'Th1', inflow: 4500, outflow: 3500, netFlow: 1000 },
    { name: 'Th2', inflow: 5200, outflow: 4800, netFlow: 400 },
    { name: 'Th3', inflow: 4800, outflow: 5500, netFlow: -700 },
    { name: 'Th4', inflow: 6100, outflow: 4200, netFlow: 1900 },
    { name: 'Th5', inflow: 5500, outflow: 5000, netFlow: 500 },
    { name: 'Th6', inflow: 6700, outflow: 5800, netFlow: 900 },
    { name: 'Th7', inflow: 7200, outflow: 6100, netFlow: 1100 },
    { name: 'Th8', inflow: 6800, outflow: 6500, netFlow: 300 },
    { name: 'Th9', inflow: 8100, outflow: 6900, netFlow: 1200 },
    { name: 'Th10', inflow: 7900, outflow: 7200, netFlow: 700 },
    { name: 'Th11', inflow: 9200, outflow: 7500, netFlow: 1700 },
    { name: 'Th12', inflow: 10500, outflow: 8200, netFlow: 2300 },
];

const summaryCardsData = [
    { title: 'Tiền mặt tại quỹ', value: '1,240,000,000', change: '+12%', icon: 'payments', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { title: 'Tiền gửi ngân hàng', value: '15,860,000,000', change: '+5%', icon: 'account_balance', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { title: 'Công nợ phải thu', value: '25,400,000,000', change: '-2%', icon: 'call_received', color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { title: 'Công nợ phải trả', value: '18,920,000,000', change: '+8%', icon: 'call_made', color: 'text-red-500', bgColor: 'bg-red-50' },
];

const PremiumStatCard = ({ title, value, sub, icon, color, trend, children }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-glass hover:shadow-premium transition-premium group flex flex-col justify-between h-56 relative overflow-hidden">
        {/* Background Decoration */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 ${color}`}></div>

        {/* Header */}
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className={`size-10 rounded-xl flex items-center justify-center ${color} shadow-lg transition-premium group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-[20px] text-white">{icon}</span>
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${trend > 0 ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{sub}</p>
            </div>
        </div>

        {/* Dynamic Content Area (Mini Chart) */}
        <div className="relative z-10 h-16 w-full mt-2">
            {children}
        </div>
    </div>
);

const AIFinancialInsight = () => (
    <div className="mesh-gradient rounded-[32px] p-8 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-premium border border-white/10 group">
        <div className="absolute -right-10 -top-10 size-64 bg-emerald/20 blur-[80px] rounded-full group-hover:bg-emerald/30 transition-premium"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-[20px] text-yellow-300 animate-pulse">auto_awesome</span>
                </div>
                <div>
                    <h3 className="font-black text-lg tracking-tight">AI CFO Intelligence</h3>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Phân tích bởi Trí tuệ nhân tạo</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/20 transition-premium cursor-pointer">
                    <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest mb-1 leading-none">Dự báo Dòng tiền</p>
                    <p className="text-sm font-medium leading-relaxed">Dự kiến thu <span className="text-emerald-400 font-bold">12.5 Tỷ</span> trong 30 ngày tới. Khả năng thanh khoản đạt <span className="text-emerald-400 font-bold">98%</span>.</p>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/20 transition-premium cursor-pointer">
                    <p className="text-[10px] text-yellow-300 font-black uppercase tracking-widest mb-1 leading-none">Cảnh báo Rủi ro</p>
                    <p className="text-sm font-medium leading-relaxed">Cần lưu ý 2 khoản thanh toán NCC quá hạn vào cuối tuần này.</p>
                </div>
            </div>
        </div>
        <div className="relative z-10 mt-6 flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Cập nhật 2 phút trước</span>
            <button className="px-5 py-2 bg-white text-primary text-[10px] font-black rounded-xl hover:scale-105 transition-premium shadow-lg shadow-white/10 uppercase tracking-widest">Phân tích chuyên sâu</button>
        </div>
    </div>
);

export default function Finance() {
    const [activeTab, setActiveTab] = useState<'cashflow' | 'payments'>('cashflow');
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
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
            const [prData, cfData, pData, invData, payData] = await Promise.all([
                financeService.getAllPaymentRequests(),
                financeService.getCashFlowData(),
                projectService.getAllProjects(),
                financeService.getAllInvoices(),
                financeService.getAllPayments()
            ]);

            setPaymentRequests(prData || []);
            setInvoices(invData || []);
            setPayments(payData || []);
            setCashFlowRecords(cfData || []);
            setProjects(pData || []);
        } catch (err) {
            console.error('Failed to fetch finance data', err);
        } finally {
            setLoading(false);
        }
    };

    // Derived data for charts and lists
    const revenueByProject = payments
        .filter(p => p.payment_type === 'receipt')
        .reduce((acc, p) => {
            const name = p.project_name || 'Khác';
            acc[name] = (acc[name] || 0) + p.amount;
            return acc;
        }, {} as Record<string, number>);

    const topRevenueSources = Object.entries(revenueByProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const expenseByProject = payments
        .filter(p => p.payment_type === 'disbursement')
        .reduce((acc, p) => {
            const name = p.project_name || 'Khác';
            acc[name] = (acc[name] || 0) + p.amount;
            return acc;
        }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(expenseByProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Page Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-primary-accent uppercase tracking-[0.3em]">Kho bạc & Thanh toán</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Tài chính & Thanh toán
                        <span className="size-2 rounded-full bg-primary-accent animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Quản lý dòng tiền vận hành và hồ sơ quyết toán tự động</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInvoiceScanModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-black hover:bg-slate-50 transition-premium shadow-sm hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-[20px] text-primary-accent">document_scanner</span>
                        <span>Quét Hóa đơn AI</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 mesh-gradient text-white rounded-2xl text-sm font-black hover:opacity-90 shadow-premium transition-premium group">
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-premium">add</span>
                        <span>Thanh toán mới</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Overview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1: Tài sản ròng (Dynamic) */}
                                <PremiumStatCard
                                    title="Tài sản ròng"
                                    value={`${((payments.reduce((acc, p) => acc + (p.payment_type === 'receipt' ? p.amount : -p.amount), 0) + 17100000000) / 1000000000).toFixed(1)}B ₫`}
                                    sub="+5.2% vs tháng trước"
                                    icon="account_balance_wallet"
                                    color="bg-primary"
                                    trend={5.2}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={assetData}>
                                            <defs>
                                                <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fill="url(#colorAsset)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </PremiumStatCard>

                                {/* Card 2: Doanh thu tháng (Dynamic from Sales Invoices) */}
                                <PremiumStatCard
                                    title="Doanh thu tháng"
                                    value={`${(invoices.filter(inv => inv.invoice_type === 'sales' && inv.invoice_date.startsWith('2024-12')).reduce((acc, inv) => acc + inv.total_amount, 0) / 1000000000).toFixed(1)}B ₫`}
                                    sub="Mục tiêu: 15.0B ₫"
                                    icon="show_chart"
                                    color="bg-emerald"
                                    trend={12.4}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <Bar
                                                dataKey="value"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                                barSize={6}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg">
                                                                {payload[0].value}B
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </PremiumStatCard>

                                {/* Card 3: Chi phí vận hành (Progress List) */}
                                <PremiumStatCard
                                    title="Chi phí vận hành"
                                    value="9.8B ₫"
                                    sub="Nợ nhà thầu: 3.4B ₫"
                                    icon="output"
                                    color="bg-red-500"
                                    trend={-2.1}
                                >
                                    <div className="flex flex-col justify-end h-full gap-2">
                                        {expenseBreakdown.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-16 text-[10px] font-bold text-slate-500 truncate">{item.name}</div>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${(item.value / 9.8) * 100}%`, backgroundColor: item.color }}
                                                    ></div>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-700">{item.value}B</div>
                                            </div>
                                        ))}
                                    </div>
                                </PremiumStatCard>
                            </div>

                            {/* Secondary Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        title: 'Tiền mặt tại quỹ',
                                        value: (payments.filter(p => p.payment_method === 'cash').reduce((acc, p) => acc + (p.payment_type === 'receipt' ? p.amount : -p.amount), 1240000000)).toLocaleString(),
                                        change: '+12%', icon: 'payments', color: 'text-emerald-500', bgColor: 'bg-emerald-50'
                                    },
                                    {
                                        title: 'Tiền gửi ngân hàng',
                                        value: (payments.filter(p => p.payment_method === 'bank_transfer').reduce((acc, p) => acc + (p.payment_type === 'receipt' ? p.amount : -p.amount), 15860000000)).toLocaleString(),
                                        change: '+5%', icon: 'account_balance', color: 'text-blue-500', bgColor: 'bg-blue-50'
                                    },
                                    {
                                        title: 'Công nợ phải thu',
                                        value: invoices.filter(inv => inv.invoice_type === 'sales').reduce((acc, inv) => acc + inv.outstanding_amount, 0).toLocaleString() || '25,400,000,000',
                                        change: '-2%', icon: 'call_received', color: 'text-amber-500', bgColor: 'bg-amber-50'
                                    },
                                    {
                                        title: 'Công nợ phải trả',
                                        value: invoices.filter(inv => inv.invoice_type === 'purchase').reduce((acc, inv) => acc + inv.outstanding_amount, 0).toLocaleString() || '18,920,000,000',
                                        change: '+8%', icon: 'call_made', color: 'text-red-500', bgColor: 'bg-red-50'
                                    },
                                ].map((card, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-premium group">
                                        <div className={`size-10 rounded-2xl flex items-center justify-center ${card.bgColor} ${card.color} group-hover:scale-110 transition-premium`}>
                                            <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{card.title}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-black text-slate-800 tracking-tight">{card.value}</span>
                                                <span className={`text-[9px] font-bold ${card.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{card.change}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <AIFinancialInsight />
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-glass overflow-hidden">
                        <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
                            {[
                                { id: 'cashflow', label: 'Dòng tiền & Ngân sách', icon: 'query_stats' },
                                { id: 'payments', label: 'Giao dịch & Công nợ', icon: 'history' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-premium ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-premium'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === 'cashflow' && (
                                <div className="space-y-8">
                                    <div className="h-[430px] w-full relative">
                                        <div className="absolute top-0 left-0">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Phân tích Dòng tiền & Cân đối Thu chi</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">So sánh: Dòng thu vs Dòng chi vs Dòng tiền thuần</p>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={cashFlowRecords.length > 0 ? cashFlowRecords : costStructureData} margin={{ top: 70, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                                    cursor={{ fill: '#f8fafc' }}
                                                />
                                                <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }} />
                                                <Bar dataKey="thu" name="Dòng thu" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                                <Bar dataKey="chi" name="Dòng chi" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                                <Line type="monotone" dataKey="net" name="Dòng tiền thuần" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguồn thu chính (Dự án)</h5>
                                            <div className="space-y-3">
                                                {topRevenueSources.map(([name, amount], i) => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-100 transition-premium cursor-pointer group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                                                                <span className="material-symbols-outlined text-[20px]">domain</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-premium">{name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-emerald">+{amount.toLocaleString()} ₫</span>
                                                    </div>
                                                ))}
                                                {topRevenueSources.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có dữ liệu doanh thu</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng mục chi chính (Dự án)</h5>
                                            <div className="space-y-3">
                                                {topExpenseCategories.map(([name, amount], i) => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-100 transition-premium cursor-pointer group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                                                <span className="material-symbols-outlined text-[20px]">engineering</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-premium">{name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-red-600">-{amount.toLocaleString()} ₫</span>
                                                    </div>
                                                ))}
                                                {topExpenseCategories.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có dữ liệu chi phí</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết Giao dịch</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dự án liên quan</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số tiền (₫)</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {/* Invoices */}
                                                {invoices.map((inv) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-premium group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-8 rounded-lg flex items-center justify-center ${inv.invoice_type === 'sales' ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-600'}`}>
                                                                    <span className="material-symbols-outlined text-[18px]">{inv.invoice_type === 'sales' ? 'file_download' : 'file_upload'}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900">{inv.vendor_name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Hóa đơn: {inv.invoice_code}</p>
                                                                        {inv.contract_code && (
                                                                            <>
                                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">HĐ: {inv.contract_code}</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-2 rounded-full bg-blue-400"></div>
                                                                <span className="text-sm font-bold text-slate-600">{inv.project_name || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">
                                                            {inv.total_amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-center">
                                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${inv.status === 'paid'
                                                                    ? 'bg-emerald/10 text-emerald border border-emerald/20'
                                                                    : inv.status === 'overdue' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                    }`}>
                                                                    {inv.status === 'paid' ? 'Đã thu/trả' : inv.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Badge label="CÔNG NỢ" variant="default" size="sm" />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Payments */}
                                                {payments.map((pay) => (
                                                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-premium group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-8 rounded-lg flex items-center justify-center ${pay.payment_type === 'receipt' ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-600'}`}>
                                                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900">{pay.partner_name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Giao dịch: {pay.payment_code}</p>
                                                                        {pay.contract_code && (
                                                                            <>
                                                                                <span className="text-[10px] text-slate-300">•</span>
                                                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">HĐ: {pay.contract_code}</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-2 rounded-full bg-emerald-400"></div>
                                                                <span className="text-sm font-bold text-slate-600">{pay.project_name || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight text-emerald-600">
                                                            {pay.payment_type === 'receipt' ? '+' : '-'}{pay.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-center">
                                                                <span className="px-4 py-1.5 bg-emerald/10 text-emerald border border-emerald/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                                    THÀNH CÔNG
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Badge label="GIAO DỊCH" variant="success" size="sm" />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Payment Requests */}
                                                {(paymentRequests.length > 0) && paymentRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-premium group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900">{req.partner_name}</p>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 italic">Hồ sơ: {req.request_code}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-2 rounded-full bg-primary-accent"></div>
                                                                <span className="text-sm font-bold text-slate-600">{req.project_name || 'Dự án'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">
                                                            {(req.amount || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-center">
                                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${req.status === 'paid'
                                                                    ? 'bg-emerald/10 text-emerald border border-emerald/20'
                                                                    : req.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                    }`}>
                                                                    {req.status === 'paid' ? 'Đã thanh toán' : req.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Badge label="YÊU CẦU" variant="info" size="sm" />
                                                        </td>
                                                    </tr>
                                                ))}

                                                {invoices.length === 0 && payments.length === 0 && paymentRequests.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center">
                                                            <div className="inline-flex flex-col items-center">
                                                                <span className="material-symbols-outlined text-slate-200 text-[64px] mb-4">payments</span>
                                                                <p className="text-slate-400 font-bold">Không tìm thấy giao dịch nào</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contracts' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Contracts Section */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Danh sách Hợp đồng</h4>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-100">Doanh thu: {contracts.filter(c => c.contract_type === 'revenue' || !c.contract_type).length}</div>
                                                <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-100">Chi phí: {contracts.filter(c => c.contract_type === 'expense').length}</div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50">
                                                    <tr className="border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Hợp đồng</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tác</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị (₫)</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đã thanh toán (₫)</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {contracts.map((c) => (
                                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-premium group">
                                                            <td className="px-6 py-5 font-bold text-slate-700">{c.contract_code}</td>
                                                            <td className="px-6 py-5 font-bold text-slate-900">{c.partner_name}</td>
                                                            <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">{(c.value || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-5 text-right font-bold text-emerald-600">{(c.paid_amount || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {c.status === 'active' ? 'Hiệu lực' : c.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {contracts.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">Chưa có hợp đồng nào.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Bank Guarantees Section */}
                                    <div className="space-y-4 pt-6 border-t border-slate-100">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Bảo lãnh Ngân hàng</h4>
                                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50">
                                                    <tr className="border-b border-slate-100">
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Bảo lãnh</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngân hàng</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị (₫)</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hết hạn</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {bankGuarantees.map((bg) => (
                                                        <tr key={bg.id} className="hover:bg-slate-50/80 transition-premium group">
                                                            <td className="px-6 py-5 font-bold text-slate-700">{bg.guarantee_code}</td>
                                                            <td className="px-6 py-5 font-bold text-slate-600">{bg.guarantee_type}</td>
                                                            <td className="px-6 py-5 font-bold text-slate-900">{bg.bank_name}</td>
                                                            <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">{(bg.guarantee_value || 0).toLocaleString()}</td>
                                                            <td className="px-6 py-5 font-mono text-xs text-slate-500">{new Date(bg.expiry_date).toLocaleDateString('vi-VN')}</td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${bg.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                                    bg.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                                                                        bg.status === 'expired' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {bg.status === 'active' ? 'Hiệu lực' : bg.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {bankGuarantees.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">Chưa có bảo lãnh nào.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <InvoiceScanModal
                isOpen={isInvoiceScanModalOpen}
                onClose={() => setIsInvoiceScanModalOpen(false)}
                onSave={(data) => {
                    console.log('Đã lưu hóa đơn quét được:', data);
                    setIsInvoiceScanModalOpen(false);
                }}
                projects={projects}
            />
        </div>
    );
}