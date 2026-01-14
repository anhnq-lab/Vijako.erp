import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Line, ComposedChart,
  ReferenceLine, Legend, Bar, ScatterChart, Scatter, YAxis, CartesianGrid, ZAxis, Cell
} from 'recharts';
import ProjectMap from '../src/components/Dashboard/ProjectMap';
import ErrorBoundary from '../components/ErrorBoundary';
import { projectService } from '../src/services/projectService';
import { riskService } from '../src/services/riskService';
import { Project, RiskMatrixData } from '../types';

// Dữ liệu Tài chính & EVM
const financeData = [
  { name: 'T1', plan: 10, cost: 8, ev: 9 },
  { name: 'T2', plan: 25, cost: 20, ev: 22 },
  { name: 'T3', plan: 45, cost: 35, ev: 40 },
  { name: 'T4', plan: 60, cost: 45, ev: 55 },
  { name: 'T5', plan: 75, cost: 55, ev: 65 },
  { name: 'T6', plan: 85, cost: 65, ev: 72 },
  { name: 'T7', plan: 95, cost: 72, ev: 80 },
  { name: 'T8', plan: 110, cost: 85, ev: 95 },
  { name: 'T9', plan: 130, cost: 98, ev: 115 },
  { name: 'T10', plan: 155, cost: 115, ev: 140 },
  { name: 'T11', plan: 180, cost: 130, ev: 165 },
  { name: 'T12', plan: 210, cost: 155, ev: 190 },
];

const fallbackRiskData: RiskMatrixData[] = [
  { x: 20, y: 20, z: 40, name: 'The Nine', status: 'Low', color: '#10b981' },
  { x: 60, y: 60, z: 360, name: 'Foxconn BG', status: 'Medium', color: '#f59e0b' },
  { x: 100, y: 100, z: 1000, name: 'Sun Urban', status: 'Critical', color: '#ef4444' },
  { x: 80, y: 60, z: 480, name: 'Aeon Mall', status: 'High', color: '#f97316' },
  { x: 40, y: 80, z: 320, name: 'Mỹ Thuận 2', status: 'Medium', color: '#3b82f6' },
];

const PremiumStatCard = ({ title, value, unit, change, type, icon, subValue, note }: any) => {
  const gradients: any = {
    primary: "from-blue-500/10 to-transparent",
    warning: "from-amber-500/10 to-transparent",
    alert: "from-red-500/10 to-transparent",
    success: "from-emerald-500/10 to-transparent",
  };

  const iconColors: any = {
    primary: "text-blue-500 bg-blue-50",
    warning: "text-amber-500 bg-amber-50",
    alert: "text-red-500 bg-red-50",
    success: "text-emerald-500 bg-emerald-50"
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-glass hover:shadow-premium transition-premium group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[type]} opacity-0 group-hover:opacity-100 transition-premium`}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className={`size-12 rounded-2xl flex items-center justify-center ${iconColors[type]} shadow-sm group-hover:scale-110 transition-premium`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${change.includes('+') ? 'text-emerald bg-emerald/10' : 'text-slate-500 bg-slate-100'}`}>
            {change}
          </div>
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>

        <div className="mt-auto">
          {subValue && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${type === 'alert' ? 'bg-red-500' : 'bg-primary'}`} style={{ width: subValue }}></div>
            </div>
          )}
          <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">{note}</p>
        </div>
      </div>
    </div>
  );
};

const AICommandHeader = () => (
  <div className="mesh-gradient rounded-[40px] p-8 text-white relative overflow-hidden shadow-premium mb-8 group border border-white/10">
    <div className="absolute -right-20 -top-20 size-80 bg-blue-400/20 blur-[100px] rounded-full group-hover:bg-blue-400/30 transition-premium"></div>
    <div className="absolute -left-20 -bottom-20 size-64 bg-emerald-400/10 blur-[80px] rounded-full"></div>

    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="size-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] flex items-center justify-center shadow-2xl shrink-0 group-hover:rotate-6 transition-premium">
          <span className="material-symbols-outlined text-[48px] text-yellow-300 animate-pulse">auto_awesome</span>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2 justify-center md:justify-start">
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-black tracking-widest uppercase border border-white/10">VIJAKO AI Executive</span>
            <span className="px-2 py-0.5 bg-emerald/20 text-emerald-300 rounded-md text-[10px] font-black tracking-widest uppercase border border-emerald-400/20 flex items-center gap-1">
              <span className="size-1 bg-emerald-300 rounded-full animate-ping"></span> Live Intelligence
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Chào buổi tối, Anh An!</h2>
          <p className="text-indigo-100/80 text-lg font-medium leading-relaxed max-w-2xl">
            Hệ thống ghi nhận <span className="text-white font-black underline decoration-emerald-400 underline-offset-4">Sun Urban City</span> đang gặp khó khăn về tiến độ (SPI 0.82). Tuy nhiên, rủi ro tài chính tại dự án The Nine đã được khống chế thành công.
          </p>
        </div>
      </div>
      <div className="lg:col-span-4 flex justify-center lg:justify-end gap-3">
        <button className="px-8 py-3 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-premium text-sm uppercase tracking-widest">Chi tiết rủi ro</button>
        <button className="px-8 py-3 bg-white/5 border border-white/10 backdrop-blur-md text-white font-black rounded-2xl hover:bg-white/10 transition-premium text-sm uppercase tracking-widest">Bỏ qua</button>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [activeChart, setActiveChart] = useState<'finance' | 'manpower'>('finance');
  const [projects, setProjects] = useState<Project[]>([]);
  const [riskData, setRiskData] = useState<RiskMatrixData[]>(fallbackRiskData);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [proj, risks] = await Promise.all([
          projectService.getAllProjects(),
          riskService.getRiskMatrix()
        ]);
        setProjects(proj);
        if (risks && risks.length) setRiskData(risks);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background-light overflow-hidden">
      {/* Header Premium */}
      <header className="h-20 glass border-b border-slate-200/50 flex items-center justify-between px-10 z-20 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bảng điều hành Tổng hợp</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">Vijako Headquarters / Trung tâm Chỉ huy</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-6 bg-slate-200/50 px-6 py-2 rounded-2xl border border-white/50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Thép</span>
              <span className="text-sm font-black text-slate-900">14.2K</span>
              <span className="text-[10px] text-red-500 font-bold">↑ 1.2%</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Xi măng</span>
              <span className="text-sm font-black text-slate-900">1.4K</span>
              <span className="text-[10px] text-emerald font-bold">↓ 0.5%</span>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-premium hover:scale-105 transition-premium">Xuất báo cáo</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[1800px] mx-auto space-y-10">

          {/* AI Header */}
          <AICommandHeader />

          {/* Ma trận Chỉ số chính */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <PremiumStatCard
              title="Doanh thu YTD"
              value="120.5" unit="Tỷ"
              change="+12.4%" type="success" icon="payments"
              subValue="78%"
              note="Đạt 78% kế hoạch năm (Thặng dư 1.2 Tỷ)"
            />
            <PremiumStatCard
              title="An toàn & Rủi ro"
              value="03" unit="Cảnh báo"
              change="Ưu tiên" type="alert" icon="security"
              subValue="85%"
              note="1 Sự cố ATLĐ mức độ 1 tại Dự án ABC"
            />
            <PremiumStatCard
              title="Tài sản Khả dụng"
              value="45.8" unit="Tỷ"
              change="-2.5%" type="warning" icon="account_balance_wallet"
              subValue="40%"
              note="Phủ được 1.5 tháng chi phí vận hành"
            />
            <PremiumStatCard
              title="Tổng Nhân lực"
              value="1,245" unit="Người"
              change="Cao điểm" type="primary" icon="groups"
              subValue="95%"
              note="92% Công suất huy động tối đa"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-glass overflow-hidden h-[550px] flex flex-col">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Hiệu quả Tài chính (EVM)</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Kiểm toán dự án thời gian thực</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setActiveChart('finance')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium ${activeChart === 'finance' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >Tài chính</button>
                  <button
                    onClick={() => setActiveChart('manpower')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium ${activeChart === 'manpower' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >Nhân lực</button>
                </div>
              </div>
              <div className="flex-1 p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={financeData}>
                    <defs>
                      <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" name="Kế hoạch (PV)" dataKey="plan" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorPV)" strokeWidth={4} />
                    <Bar dataKey="cost" name="Chi phí (AC)" fill="#ef4444" barSize={12} radius={[6, 6, 0, 0]} />
                    <Line type="monotone" name="Giá trị đạt được (EV)" dataKey="ev" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 0 }} />
                    <Legend verticalAlign="top" height={36} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 bg-white rounded-[40px] border border-slate-200 shadow-glass overflow-hidden h-[550px] flex flex-col relative">
              <div className="p-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Ma trận Rủi ro</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ảnh hưởng vs Xác suất</p>
              </div>
              <div className="flex-1 p-4 relative">
                <div className="absolute inset-8 border-l border-b border-slate-100/50"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <XAxis type="number" dataKey="x" name="Xác suất" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" name="Ảnh hưởng" domain={[0, 100]} hide />
                    <ZAxis type="number" dataKey="z" range={[400, 2000]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Dự án" data={riskData}>
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="p-8 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
                <span>Rủi ro thấp</span>
                <span>Vùng nguy hiểm</span>
              </div>
            </div>
          </div>

          {/* Bản đồ Dự án */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-glass overflow-hidden h-[500px] group">
            <ProjectMap projects={projects} />
          </div>

        </div>
      </div>
    </div>
  );
}