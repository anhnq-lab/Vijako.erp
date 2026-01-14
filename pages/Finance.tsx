import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, Area
} from 'recharts';
import { financeService, Contract } from '../src/services/financeService';

// --- Enhanced Data ---

const cashFlowData = [
    { name: 'T1', thu: 45, chi: 30, net: 15 },
    { name: 'T2', thu: 52, chi: 48, net: 19 },
    { name: 'T3', thu: 38, chi: 45, net: 12 },
    { name: 'T4', thu: 65, chi: 50, net: 27 },
    { name: 'T5', thu: 80, chi: 60, net: 47 },
    { name: 'T6', thu: 95, chi: 85, net: 57 },
    { name: 'T7', thu: 110, chi: 90, net: 77 },
    { name: 'T8', thu: 105, chi: 88, net: 94 },
    { name: 'T9', thu: 125, chi: 95, net: 124 },
    { name: 'T10', thu: 90, chi: 80, net: 134 },
    { name: 'T11', thu: 140, chi: 110, net: 164 },
    { name: 'T12', thu: 160, chi: 120, net: 204 },
];

const costStructureData = [
    { name: 'Vật tư (Materials)', value: 45, color: '#1f3f89' },
    { name: 'Nhân công (Labor)', value: 25, color: '#07883d' },
    { name: 'Máy (Equipment)', value: 15, color: '#FACC15' },
    { name: 'Thầu phụ (Sub-con)', value: 10, color: '#F97316' },
    { name: 'Khác (Overhead)', value: 5, color: '#94a3b8' },
];

const debtAgingData = [
    { name: 'Trong hạn', value: 25.5, color: '#07883d' },
    { name: '1-30 ngày', value: 8.2, color: '#FACC15' },
    { name: '31-60 ngày', value: 4.5, color: '#F97316' },
    { name: '> 60 ngày', value: 2.1, color: '#EF4444' },
];

// --- Sub-Components ---

const ContractCard = ({ code, partner, value, paid, retention, warning, status }: any) => {
    const paidPercent = Math.round((paid / value) * 100);
    return (
        <div className={`bg-white rounded-xl p-5 border ${warning ? 'border-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.15)] ring-1 ring-orange-100' : 'border-slate-100 shadow-sm'} flex flex-col hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">{code}</span>
                        {warning && <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse"><span className="material-symbols-outlined text-[10px]">warning</span> Risk</span>}
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1 text-sm" title={partner}>{partner}</h4>
                    <p className="text-xs text-slate-500">Dự án: The Manor Central Park</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {status === 'active' ? 'Hiệu lực' : 'Thanh lý'}
                </span>
            </div>

            <div className="space-y-4 flex-1">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Giá trị HĐ</span>
                        <span className="font-bold text-slate-900 text-sm">{value.toLocaleString()} ₫</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${paidPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                        <span>Đã TT: {paidPercent}%</span>
                        <span className="font-bold text-primary">{paid.toLocaleString()} ₫</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-auto">
                    <div className="text-xs">
                        <p className="text-slate-400">Giữ lại (Retention)</p>
                        <p className="font-bold text-slate-700">{retention.toLocaleString()} ₫</p>
                    </div>
                    <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded transition-colors shadow-sm">
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}

const PaymentRequestRow = ({ id, sub, project, amount, date, status, blocked }: any) => (
    <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${blocked ? 'bg-red-50/30' : ''}`}>
        <td className="px-4 py-3 font-mono text-xs text-slate-500 font-bold">{id}</td>
        <td className="px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{sub}</p>
            {blocked && <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[12px]">block</span> Hồ sơ chất lượng thiếu</p>}
        </td>
        <td className="px-4 py-3 text-xs text-slate-600">{project}</td>
        <td className="px-4 py-3 text-sm font-bold text-slate-900">{amount}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{date}</td>
        <td className="px-4 py-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                {status === 'approved' ? 'Đã duyệt' : status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
            </span>
        </td>
        <td className="px-4 py-3 text-right">
            <button className={`size-8 rounded flex items-center justify-center transition-colors ${blocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-primary hover:bg-blue-50'}`}>
                <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
        </td>
    </tr>
)

const GuaranteeRow = ({ code, type, project, bank, value, expiry, status }: any) => {
    // Calculate progress for visual bar (mock logic)
    const progress = status === 'warning' ? 90 : 40;

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-slate-500 font-bold">{code}</td>
            <td className="px-4 py-3 text-sm font-bold text-slate-900">{type}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{project}</td>
            <td className="px-4 py-3 text-sm text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">account_balance</span>
                {bank}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-primary">{value}</td>
            <td className="px-4 py-3 w-48">
                <div className="flex justify-between text-[10px] mb-1">
                    <span className={status === 'warning' ? 'text-red-600 font-bold' : 'text-slate-500'}>{expiry}</span>
                    {status === 'warning' && <span className="text-red-600 font-bold">Sắp hết hạn</span>}
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${status === 'warning' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
            </td>
        </tr>
    )
}

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
)

const AIFinancialInsight = () => (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl p-6 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-5">
            <span className="material-symbols-outlined text-[150px]">psychology_alt</span>
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="material-symbols-outlined text-[20px] text-yellow-300">auto_awesome</span>
                </span>
                <h3 className="font-bold text-lg">CFO Assistant Insight</h3>
            </div>

            <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Rủi ro thanh khoản</p>
                    <p className="text-sm font-medium">Dòng tiền ròng tháng 6 dự báo dương <span className="text-green-400 font-bold">+57 Tỷ</span>, nhưng áp lực chi trả cho nhà cung cấp Vật tư sẽ tăng mạnh vào tuần 3 (khoảng 22 Tỷ).</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Khuyến nghị tối ưu</p>
                    <p className="text-sm font-medium">Cân nhắc giải ngân sớm gói vay lưu động tại BIDV để hưởng lãi suất ưu đãi 6.2% trước ngày 15/06.</p>
                </div>
            </div>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400">Cập nhật: 5 phút trước</span>
            <button className="text-xs font-bold bg-white text-indigo-900 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors">Chi tiết</button>
        </div>
    </div>
)

export default function Finance() {
    const [activeTab, setActiveTab] = useState('contracts');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const data = await financeService.getAllContracts();
            setContracts(data);
        } catch (error) {
            console.error('Failed to fetch contracts', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0 shadow-sm z-10">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Quản lý Tài chính & Hợp đồng</h2>
                    <p className="text-sm text-slate-500 mt-1">Kiểm soát dòng tiền, hợp đồng A-B, B-B và thanh quyết toán.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span> Báo cáo
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">add</span> Tạo hợp đồng mới
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard title="Tổng Doanh thu (YTD)" value="450.5 Tỷ" sub="Đạt 82% kế hoạch năm" icon="payments" color="bg-blue-50 text-blue-600" />
                        <StatCard title="Dư nợ Phải thu (AR)" value="85.2 Tỷ" sub="Quá hạn > 30 ngày: 12.5 Tỷ" icon="account_balance_wallet" color="bg-orange-50 text-orange-600" />
                        <StatCard title="Dư nợ Phải trả (AP)" value="42.8 Tỷ" sub="Đến hạn thanh toán tuần này: 5.2 Tỷ" icon="outbound" color="bg-red-50 text-red-600" />
                        <StatCard title="Dòng tiền mặt (Cash)" value="125.4 Tỷ" sub="Khả dụng: 85.4 Tỷ" icon="savings" color="bg-green-50 text-green-600" />
                    </div>

                    {/* Advanced Analysis Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Cash Flow - Composed Chart */}
                        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        Biểu đồ Dòng tiền & Thanh khoản
                                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Đơn vị: Tỷ VNĐ</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-primary rounded-sm"></span> Dòng tiền vào
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-red-400 rounded-sm"></span> Dòng tiền ra
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-yellow-400 rounded-full border border-slate-200"></span> Dòng tiền ròng (Net)
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="thu" name="Tiền vào" fill="#1f3f89" radius={[4, 4, 0, 0]} barSize={16} />
                                        <Bar dataKey="chi" name="Tiền ra" fill="#f87171" radius={[4, 4, 0, 0]} barSize={16} />
                                        <Line type="monotone" dataKey="net" name="Dòng tiền ròng (Net)" stroke="#FACC15" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Insight & Cost Structure */}
                        <div className="xl:col-span-4 flex flex-col gap-6 h-[400px]">
                            {/* AI Card */}
                            <div className="flex-1">
                                <AIFinancialInsight />
                            </div>

                            {/* Mini Cost Structure */}
                            <div className="h-40 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                                <div className="size-32 relative flex-shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costStructureData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={55}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {costStructureData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Cấu trúc<br />Chi phí</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    {costStructureData.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                                            </div>
                                            <span className="font-bold">{item.value}%</span>
                                        </div>
                                    ))}
                                    <button className="text-[10px] text-primary font-bold mt-1 hover:underline">Xem chi tiết</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area with Tabs */}
                    <div>
                        <div className="flex items-center gap-8 border-b border-slate-200 mb-6">
                            {['contracts', 'guarantees', 'payables'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                        }`}
                                >
                                    {tab === 'contracts' && 'Hợp đồng Đầu ra (A-B)'}
                                    {tab === 'guarantees' && 'Quản lý Bảo lãnh (Bank Guarantees)'}
                                    {tab === 'payables' && 'Thanh toán & Công nợ (Payables)'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'contracts' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {loading ? (
                                    <div className="col-span-full p-8 text-center text-slate-500">Đang tải hợp đồng...</div>
                                ) : contracts.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-slate-500">Chưa có hợp đồng nào.</div>
                                ) : (
                                    contracts.map(contract => (
                                        <ContractCard
                                            key={contract.id}
                                            code={contract.contract_code}
                                            partner={contract.partner_name}
                                            value={contract.value}
                                            paid={contract.paid_amount}
                                            retention={contract.retention_amount}
                                            status={contract.status}
                                            warning={contract.is_risk}
                                        />
                                    ))
                                )}

                                <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-6 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-slate-50/50 group min-h-[200px]">
                                    <span className="material-symbols-outlined text-[40px] mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                                    <span className="text-sm font-bold">Thêm Hợp đồng mới</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'guarantees' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">Mã BL</th>
                                            <th className="px-4 py-3">Loại Bảo lãnh</th>
                                            <th className="px-4 py-3">Dự án</th>
                                            <th className="px-4 py-3">Ngân hàng</th>
                                            <th className="px-4 py-3">Giá trị</th>
                                            <th className="px-4 py-3">Thời hạn còn lại</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <GuaranteeRow code="BL-PER-001" type="Bảo lãnh thực hiện HĐ" project="The Nine Tower" bank="BIDV Cầu Giấy" value="12.5 Tỷ" expiry="30/12/2024" />
                                        <GuaranteeRow code="BL-ADV-005" type="Bảo lãnh tạm ứng" project="Sun Urban City" bank="Vietinbank" value="45.0 Tỷ" expiry="15/11/2023" status="warning" />
                                        <GuaranteeRow code="BL-WAR-002" type="Bảo lãnh bảo hành" project="Aeon Mall Huế" bank="Techcombank" value="5.2 Tỷ" expiry="01/06/2025" />
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'payables' && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="xl:col-span-2 space-y-6">
                                    {/* Debt Aging Visualization */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                        <h4 className="font-bold text-slate-900 text-sm mb-3">Phân tích Tuổi nợ (Debt Aging)</h4>
                                        <div className="flex gap-1 h-8 w-full rounded-lg overflow-hidden">
                                            {debtAgingData.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="h-full flex items-center justify-center text-[10px] font-bold text-white relative group"
                                                    style={{ width: `${(item.value / 40.3) * 100}%`, backgroundColor: item.color }}
                                                    title={`${item.name}: ${item.value} Tỷ`}
                                                >
                                                    <span className="truncate px-1">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span>Tổng nợ: <strong>40.3 Tỷ</strong></span>
                                            <span className="text-red-600 font-bold">Nợ quá hạn: 6.6 Tỷ</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-900">Yêu cầu Thanh toán (Thầu phụ)</h3>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 border rounded text-xs font-medium bg-slate-50 hover:bg-slate-100">Tất cả</button>
                                                <button className="px-3 py-1.5 border rounded text-xs font-medium text-red-700 border-red-200 bg-red-50 hover:bg-red-100">Đang bị chặn (1)</button>
                                            </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Mã YC</th>
                                                    <th className="px-4 py-3">Nhà thầu phụ</th>
                                                    <th className="px-4 py-3">Dự án</th>
                                                    <th className="px-4 py-3">Số tiền</th>
                                                    <th className="px-4 py-3">Ngày gửi</th>
                                                    <th className="px-4 py-3">Trạng thái</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <PaymentRequestRow id="PAY-882" sub="Bê tông Việt Úc" project="Vijako Tower" amount="120.000.000 ₫" date="14/10/2023" status="pending" />
                                                <PaymentRequestRow id="PAY-881" sub="Cốp pha An Phát" project="The Nine" amount="45.000.000 ₫" date="13/10/2023" status="pending" blocked />
                                                <PaymentRequestRow id="PAY-880" sub="Thép Hòa Phát" project="Vijako Tower" amount="850.000.000 ₫" date="10/10/2023" status="approved" />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6">
                                    <h3 className="font-bold text-slate-900 mb-4">Tự động hóa & Cảnh báo</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-[60px] text-blue-600">auto_awesome</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                                <h4 className="font-bold text-slate-900 text-sm">Work Acceptance Generator</h4>
                                            </div>
                                            <p className="text-xs text-slate-600 mb-3 leading-relaxed relative z-10">
                                                Hệ thống tự động tạo Biên bản nghiệm thu dựa trên Nhật ký thi công tuần này.
                                            </p>
                                            <button className="w-full py-2 bg-primary text-white rounded text-xs font-bold shadow-sm hover:bg-primary/90 relative z-10">
                                                Tạo 12 Biên bản (Draft)
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <h4 className="font-bold text-slate-900 text-sm mb-2">Sự kiện Tài chính Sắp tới</h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-red-600 mt-0.5">error</span>
                                                    <span>Thầu phụ <strong>"Điện lạnh REE"</strong> hết hạn bảo lãnh THHĐ vào ngày 15/11.</span>
                                                </li>
                                                <li className="flex items-start gap-2 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-orange-500 mt-0.5">warning</span>
                                                    <span>Dự án <strong>Sun Urban</strong> chưa thanh toán tạm ứng đợt 2 theo điều khoản HĐ.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}