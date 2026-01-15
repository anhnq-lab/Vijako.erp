import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';
import { financeService, PaymentRequest, CashFlowData } from '../src/services/financeService';
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
    { name: 'Th1', inflow: 4500, outflow: 3500 },
    { name: 'Th2', inflow: 5200, outflow: 4800 },
    { name: 'Th3', inflow: 4800, outflow: 5500 },
    { name: 'Th4', inflow: 6100, outflow: 4200 },
    { name: 'Th5', inflow: 5500, outflow: 5000 },
    { name: 'Th6', inflow: 6700, outflow: 5800 },
    { name: 'Th7', inflow: 7200, outflow: 6100 },
    { name: 'Th8', inflow: 6800, outflow: 6500 },
    { name: 'Th9', inflow: 8100, outflow: 6900 },
    { name: 'Th10', inflow: 7900, outflow: 7200 },
    { name: 'Th11', inflow: 9200, outflow: 7500 },
    { name: 'Th12', inflow: 10500, outflow: 8200 },
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

// ... (AIFinancialInsight remains unchanged) ...
// ... (Finance component logic remains unchanged) ...

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Overview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Tài sản ròng (Area Chart) */}
                            <PremiumStatCard
                                title="Tài sản ròng"
                                value="42.8B ₫"
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

                            {/* Card 2: Doanh thu tháng (Bar Chart) */}
                            <PremiumStatCard
                                title="Doanh thu tháng"
                                value="12.5B ₫"
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
                                            cursor={{fill: 'transparent'}}
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
                                    <div className="h-[400px] w-full relative">
                                        <div className="absolute top-0 left-0">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Quỹ đạo Tài chính</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">So sánh: Dòng thu vs Dòng chi</p>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={costStructureData} margin={{ top: 60, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="inflow" name="Dòng thu" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={4} />
                                                <Area type="monotone" dataKey="outflow" name="Dòng chi" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={4} />
                                                <Legend verticalAlign="top" height={36} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguồn thu chính</h5>
                                            <div className="space-y-3">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-100 transition-premium cursor-pointer group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                                                                <span className="material-symbols-outlined text-[20px]">domain</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-premium">Dự án Tiên Sơn {i}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-emerald">+12.4B ₫</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng mục chi chính</h5>
                                            <div className="space-y-3">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl hover:bg-slate-100 transition-premium cursor-pointer group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                                                <span className="material-symbols-outlined text-[20px]">engineering</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-premium">Thi công móng {i}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-red-600">-2.8B ₫</span>
                                                    </div>
                                                ))}
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
                                                {paymentRequests.length > 0 ? paymentRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-premium group">
                                                        <td className="px-6 py-5">
                                                            <p className="font-black text-slate-900">{req.partner_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 italic">Mã: PAY_{req.id.slice(0, 8)}</p>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-2 rounded-full bg-primary-accent"></div>
                                                                <span className="text-sm font-bold text-slate-600">Dự án trọng điểm</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-black text-slate-900 tracking-tight">
                                                            {(req.amount || 0).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-center">
                                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${req.status === 'paid'
                                                                    ? 'bg-emerald/10 text-emerald border border-emerald/20'
                                                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                    }`}>
                                                                    {req.status === 'paid' ? 'Đã thanh toán' : 'Đang xử lý'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <button className="px-4 py-2 bg-white text-[10px] font-black text-primary border border-slate-200 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-premium shadow-sm">XEM</button>
                                                        </td>
                                                    </tr>
                                                )) : (
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
        </div >
    );
}