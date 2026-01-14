import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, YAxis } from 'recharts';

const costData = [
  { name: 'T1', budget: 4000, actual: 2400 },
  { name: 'T2', budget: 3000, actual: 1398 },
  { name: 'T3', budget: 2000, actual: 3800 }, // Over budget
  { name: 'T4', budget: 2780, actual: 3908 }, // Over budget
  { name: 'T5', budget: 1890, actual: 4800 },
  { name: 'T6', budget: 2390, actual: 3800 },
  { name: 'T7', budget: 3490, actual: 4300 },
];

const WBSItem = ({ level, name, progress, start, end, status, assignedTo }: any) => {
    return (
        <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${level === 0 ? 'bg-slate-50/80' : ''}`}>
            <td className={`px-4 py-3 text-sm ${level === 0 ? 'font-bold text-slate-900' : 'text-slate-700 pl-8 border-l-2 border-transparent hover:border-primary'}`}>
                {name}
            </td>
            <td className="px-4 py-3">
                 <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{width: `${progress}%`}}></div>
                    </div>
                    <span className={`text-xs font-bold ${progress === 100 ? 'text-success' : 'text-primary'}`}>{progress}%</span>
                 </div>
            </td>
            <td className="px-4 py-3 text-xs font-mono text-slate-600">{start}</td>
            <td className="px-4 py-3 text-xs font-mono text-slate-600">{end}</td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    status === 'done' ? 'bg-green-100 text-green-700' :
                    status === 'active' ? 'bg-blue-100 text-blue-700' : 
                    status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                }`}>
                    {status}
                </span>
            </td>
             <td className="px-4 py-3 text-xs text-slate-500">{assignedTo}</td>
        </tr>
    )
}

const IssueRow = ({ id, type, title, priority, status, due, pic }: any) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50">
        <td className="px-4 py-3 font-mono text-xs text-slate-500">{id}</td>
        <td className="px-4 py-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${type === 'NCR' ? 'bg-red-100 text-red-700' : type === 'RFI' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {type}
            </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-slate-900">{title}</td>
        <td className="px-4 py-3">
             <span className={`flex items-center gap-1 text-[10px] font-bold ${priority === 'High' ? 'text-red-600' : 'text-slate-500'}`}>
                {priority === 'High' && <span className="material-symbols-outlined text-[12px]">priority_high</span>}
                {priority}
             </span>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{due}</td>
        <td className="px-4 py-3 text-xs font-bold text-slate-700">{pic}</td>
        <td className="px-4 py-3">
             <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${status === 'Open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{status}</span>
        </td>
    </tr>
)

const BudgetRow = ({ category, budget, actual, commit, remain }: any) => {
    const percent = Math.round((actual / budget) * 100);
    const isOver = actual > budget;
    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-bold text-slate-700">{category}</td>
            <td className="px-4 py-3 text-sm font-mono text-right">{budget.toLocaleString()}</td>
            <td className="px-4 py-3 text-sm font-mono text-right font-bold text-slate-900">{actual.toLocaleString()}</td>
            <td className="px-4 py-3 text-sm font-mono text-right text-slate-500">{commit.toLocaleString()}</td>
            <td className="px-4 py-3">
                 <div className="flex items-center gap-2 justify-end">
                    <span className={`text-xs font-bold ${isOver ? 'text-red-600' : 'text-green-600'}`}>{percent}%</span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(percent, 100)}%`}}></div>
                    </div>
                 </div>
            </td>
             <td className={`px-4 py-3 text-sm font-mono text-right font-bold ${remain < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remain.toLocaleString()}
            </td>
        </tr>
    )
}

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col h-full bg-background-light">
        <header className="bg-white border-b border-slate-100 px-6 py-4 shrink-0 shadow-sm z-10">
             <div className="flex text-xs text-slate-500 mb-2 gap-2">
                <Link to="/" className="hover:text-primary">Trang chủ</Link> / 
                <Link to="/projects" className="hover:text-primary">Quản lý dự án</Link> / 
                <span className="font-bold text-slate-800">Vijako Tower - Giai đoạn 2</span>
             </div>
             
             <div className="flex flex-wrap lg:flex-nowrap justify-between items-start mb-6 gap-4">
                <div>
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">Vijako Tower - Giai đoạn 2</h1>
                        <span className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2 py-0.5 rounded-full">ĐANG THI CÔNG</span>
                     </div>
                     <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> KĐT Tây Hồ Tây, Hà Nội • GĐ Dự án: Nguyễn Văn An
                     </p>
                </div>
                
                {/* Top Stats */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Tiến độ</p>
                        <p className="text-lg font-black text-slate-800">45% <span className="text-xs font-medium text-green-600">(+2%)</span></p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Ngân sách (EAC)</p>
                        <p className="text-lg font-black text-slate-800">85% <span className="text-xs font-medium text-yellow-600">(Warning)</span></p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">An toàn (LTIFR)</p>
                        <p className="text-lg font-black text-green-600">0.0</p>
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
                        {tab === 'budget' && 'Ngân sách & Chi phí'}
                        {tab === 'diary' && 'Nhật ký thi công'}
                        {tab === 'issues' && 'Sự cố & Rủi ro'}
                        {tab === 'documents' && 'Hồ sơ CDE'}
                     </button>
                 ))}
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px]">
                
                {/* ==================== TAB: OVERVIEW ==================== */}
                {activeTab === 'overview' && (
                    <>
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Visual Progress */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">floor</span> Tiến độ hình ảnh (AI Floorplan)
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Hoàn thành</span>
                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Đang thi công</span>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-slate-900 overflow-hidden group">
                                <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-700 group-hover:scale-105" 
                                    style={{backgroundImage: "url('https://picsum.photos/seed/blueprint/1200/800')"}}>
                                    <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>    
                                </div>
                                <div className="absolute top-[30%] left-[45%] group/pin cursor-pointer">
                                    <div className="size-4 bg-primary border-2 border-white rounded-full shadow-lg relative z-10"></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-[10px] whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity">Cột C4 - AI: Đã hoàn thành</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Milestones */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">flag</span> Mốc quan trọng (Milestones)
                            </h3>
                            <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 size-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                                    <p className="text-sm font-bold text-slate-900">Hoàn thành phần ngầm</p>
                                    <p className="text-xs text-slate-500">15/04/2024 • Đạt yêu cầu</p>
                                </div>
                                 <div className="relative">
                                    <div className="absolute -left-[21px] top-1 size-3 bg-blue-500 rounded-full border-2 border-white shadow animate-pulse"></div>
                                    <p className="text-sm font-bold text-slate-900">Đổ bê tông sàn tầng 5</p>
                                    <p className="text-xs text-slate-500">25/05/2024 • Đang thực hiện</p>
                                </div>
                                 <div className="relative">
                                    <div className="absolute -left-[21px] top-1 size-3 bg-slate-300 rounded-full border-2 border-white shadow"></div>
                                    <p className="text-sm font-bold text-slate-400">Cất nóc (Topping out)</p>
                                    <p className="text-xs text-slate-500">20/08/2024 • Kế hoạch</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Financial Health Mini */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-warning">account_balance_wallet</span> Dòng tiền dự án
                            </h3>
                            <div className="h-48 w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={costData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Ngân sách" />
                                        <Bar dataKey="actual" fill="#1f3f89" radius={[4, 4, 0, 0]} name="Thực chi" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <div>
                                    <p className="text-xs text-slate-500">Lũy kế thực chi</p>
                                    <p className="text-lg font-bold text-slate-900">24.5 Tỷ</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Còn lại</p>
                                    <p className="text-lg font-bold text-green-600">12.2 Tỷ</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Issues Summary */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900">Vấn đề tồn đọng</h3>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">3 High Priority</span>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 rounded">RFI #042</span>
                                        <span className="text-[10px] text-red-600 font-bold">Hết hạn hôm nay</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-900 line-clamp-2">Xung đột hệ thống MEP và dầm sàn tầng 3 trục 4-5.</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 rounded">NCR #012</span>
                                        <span className="text-[10px] text-slate-500">Due: 26/05</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-900 line-clamp-2">Bê tông cột C3 tầng 4 bị rỗ mặt quá tiêu chuẩn.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                )}

                {/* ==================== TAB: WBS (Timeline) ==================== */}
                {activeTab === 'wbs' && (
                    <div className="lg:col-span-12">
                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span> Kế hoạch thi công (WBS)
                                </h3>
                                <div className="flex gap-2">
                                     <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50">Filter</button>
                                     <button className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold">Xuất Excel</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[30%]">Hạng mục công việc</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[15%]">Tiến độ</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[12%]">Bắt đầu</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[12%]">Kết thúc</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[10%]">Trạng thái</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase w-[15%]">Phụ trách</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <WBSItem level={0} name="1. Phần ngầm" progress={100} status="done" />
                                        <WBSItem level={1} name="1.1 Đào đất hố móng" progress={100} start="01/03/2024" end="15/03/2024" status="done" assignedTo="Đội thi công 1" />
                                        <WBSItem level={1} name="1.2 Bê tông lót" progress={100} start="16/03/2024" end="20/03/2024" status="done" assignedTo="Đội thi công 1" />
                                        
                                        <WBSItem level={0} name="2. Phần thân" progress={45} status="active" />
                                        <WBSItem level={1} name="2.1 Cột vách tầng 1" progress={100} start="25/03/2024" end="05/04/2024" status="done" assignedTo="Đội thi công 2" />
                                        <WBSItem level={1} name="2.2 Dầm sàn tầng 2" progress={80} start="06/04/2024" end="15/04/2024" status="active" assignedTo="Đội thi công 2" />
                                        <WBSItem level={1} name="2.3 Cột vách tầng 2" progress={10} start="16/04/2024" end="25/04/2024" status="active" assignedTo="Đội thi công 2" />
                                        <WBSItem level={1} name="2.4 Dầm sàn tầng 3" progress={0} start="26/04/2024" end="05/05/2024" status="slate" assignedTo="Đội thi công 3" />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== TAB: BUDGET ==================== */}
                {activeTab === 'budget' && (
                     <div className="lg:col-span-12">
                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Kiểm soát Chi phí (Budget Control)</h3>
                                    <p className="text-xs text-slate-500">So sánh Ngân sách vs Thực tế (Đơn vị: VNĐ)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Tổng ngân sách</p>
                                    <p className="text-xl font-black text-primary">120.000.000.000</p>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Khoản mục chi phí</th>
                                        <th className="px-4 py-3 text-right">Ngân sách (Budget)</th>
                                        <th className="px-4 py-3 text-right">Thực chi (Actual)</th>
                                        <th className="px-4 py-3 text-right">Đã cam kết (Committed)</th>
                                        <th className="px-4 py-3 text-right w-32">% Sử dụng</th>
                                        <th className="px-4 py-3 text-right">Còn lại</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <BudgetRow category="1. Vật liệu xây dựng" budget={45000000000} actual={22000000000} commit={5000000000} remain={18000000000} />
                                    <BudgetRow category="2. Nhân công trực tiếp" budget={30000000000} actual={12000000000} commit={1000000000} remain={17000000000} />
                                    <BudgetRow category="3. Máy thi công" budget={15000000000} actual={16000000000} commit={500000000} remain={-1500000000} />
                                    <BudgetRow category="4. Chi phí quản lý" budget={5000000000} actual={2000000000} commit={100000000} remain={2900000000} />
                                </tbody>
                            </table>
                         </div>
                     </div>
                )}

                {/* ==================== TAB: ISSUES ==================== */}
                {activeTab === 'issues' && (
                     <div className="lg:col-span-12">
                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-alert">warning</span> Quản lý Sự cố & Rủi ro
                                </h3>
                                <div className="flex gap-2">
                                     <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">+ Tạo RFI</button>
                                     <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-bold border border-red-100">+ Báo cáo NCR</button>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Loại</th>
                                        <th className="px-4 py-3">Tiêu đề</th>
                                        <th className="px-4 py-3">Mức độ</th>
                                        <th className="px-4 py-3">Hạn xử lý</th>
                                        <th className="px-4 py-3">Người phụ trách</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <IssueRow id="#RFI-042" type="RFI" title="Xung đột hệ thống MEP và dầm sàn tầng 3" priority="High" due="24/05/2024" pic="Nguyễn Văn A" status="Open" />
                                    <IssueRow id="#NCR-012" type="NCR" title="Bê tông cột C3 tầng 4 bị rỗ mặt" priority="Medium" due="26/05/2024" pic="Trần Văn B" status="Open" />
                                    <IssueRow id="#SAF-005" type="Safety" title="Công nhân không thắt dây an toàn khu vực biên" priority="High" due="24/05/2024" pic="Lê An Toàn" status="Resolved" />
                                </tbody>
                            </table>
                         </div>
                     </div>
                )}
                
                {/* ==================== TAB: DIARY (Simplified for view) ==================== */}
                 {activeTab === 'diary' && (
                     <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {/* Diary Entry */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                         <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold text-center min-w-[60px]">
                                            <span className="block text-xs uppercase">Tháng 5</span>
                                            <span className="block text-2xl">24</span>
                                         </div>
                                         <div>
                                            <h4 className="font-bold text-slate-900">Báo cáo thi công ngày 24/05</h4>
                                            <p className="text-xs text-slate-500">Người lập: Nguyễn Văn An • 17:30 PM</p>
                                         </div>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold">Đã duyệt</span>
                                </div>
                                <div className="prose prose-sm text-slate-600 mb-4">
                                    <p><strong>1. Thời tiết:</strong> Nắng, nhiệt độ 32-35 độ C. Thuận lợi cho công tác bê tông.</p>
                                    <p><strong>2. Công việc thực hiện:</strong></p>
                                    <ul className="list-disc pl-4 text-xs space-y-1">
                                        <li>Đội 1: Gia công lắp dựng cốt thép cột vách tầng 5 (Trục 1-4).</li>
                                        <li>Đội 2: Tháo dỡ cốp pha sàn tầng 4.</li>
                                        <li>Thầu phụ MEP: Đi ống chờ điện sàn tầng 5.</li>
                                    </ul>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <img src="https://picsum.photos/150/100?1" className="rounded-lg border border-slate-200" />
                                    <img src="https://picsum.photos/150/100?2" className="rounded-lg border border-slate-200" />
                                    <img src="https://picsum.photos/150/100?3" className="rounded-lg border border-slate-200" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-3">Nhân lực & Máy móc (Hôm nay)</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                        <span className="text-slate-600">Ban chỉ huy</span>
                                        <span className="font-bold">12</span>
                                    </div>
                                     <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                        <span className="text-slate-600">Công nhân trực tiếp</span>
                                        <span className="font-bold">145</span>
                                    </div>
                                     <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                        <span className="text-slate-600">Máy đào/xúc</span>
                                        <span className="font-bold">3</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                        <span className="text-slate-600">Cần trục tháp</span>
                                        <span className="font-bold">2</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                     </div>
                 )}
                 
                 {activeTab === 'documents' && (
                     <div className="lg:col-span-12">
                        <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl text-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Môi trường Dữ liệu Chung (CDE)</h3>
                            <p className="text-slate-600 mb-4">Quản lý phiên bản bản vẽ, RFI và hồ sơ trình duyệt. <br/>Vui lòng truy cập module Tài liệu.</p>
                            <Link to="/documents" className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50">
                                Đi tới CDE <span className="material-symbols-outlined">folder_open</span>
                            </Link>
                        </div>
                     </div>
                )}

            </div>
        </div>
    </div>
  )
}
