import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Line, ComposedChart,
  ReferenceLine, Legend, Bar, ScatterChart, Scatter, YAxis, CartesianGrid, ZAxis, Cell
} from 'recharts';
import ProjectMap from '../src/components/Dashboard/ProjectMap';
import ErrorBoundary from '../components/ErrorBoundary';
import { projectService } from '../src/services/projectService';
import { Project } from '../types';

// --- Data Simulation ---

// Finance & EVM Data
const financeData = [
  { name: 'T1', plan: 10, cost: 8, ev: 9 },
  { name: 'T2', plan: 25, cost: 20, ev: 22 },
  { name: 'T3', plan: 45, cost: 35, ev: 40 },
  { name: 'T4', plan: 60, cost: 45, ev: 55 },
  { name: 'T5', plan: 75, cost: 55, ev: 65 },
  { name: 'T6', plan: 85, cost: 65, ev: 72 }, // Current
  { name: 'T7', plan: 90, cost: 75, ev: 80 },
  { name: 'T8', plan: 95, cost: 82, ev: 88 },
  { name: 'T9', plan: 100, cost: 90, ev: 95 },
];

// Manpower & Machinery Data
const resourceData = [
  { name: 'T1', workers: 120, machines: 10 },
  { name: 'T2', workers: 350, machines: 25 },
  { name: 'T3', workers: 500, machines: 40 },
  { name: 'T4', workers: 800, machines: 65 },
  { name: 'T5', workers: 950, machines: 70 },
  { name: 'T6', workers: 1100, machines: 85 }, // Peak
  { name: 'T7', workers: 800, machines: 60 },
  { name: 'T8', workers: 400, machines: 30 },
];

// Risk Matrix Data (X: Probability, Y: Impact, Z: Severity Score)
const riskData = [
  { x: 15, y: 20, z: 100, name: 'The Nine', status: 'Low', color: '#07883d' },
  { x: 30, y: 50, z: 250, name: 'Foxconn BG', status: 'Medium', color: '#FACC15' },
  { x: 85, y: 90, z: 600, name: 'Sun Urban', status: 'Critical', color: '#EF4444' },
  { x: 60, y: 40, z: 300, name: 'Aeon Mall', status: 'High', color: '#F97316' },
  { x: 20, y: 80, z: 200, name: 'Mỹ Thuận 2', status: 'Watch', color: '#3b82f6' },
];

// --- Components ---

const StatCard = ({ title, value, unit, change, type, icon, subValue, note }: any) => {
  const colors: any = {
    primary: "text-primary bg-primary/10",
    warning: "text-yellow-700 bg-yellow-50",
    alert: "text-red-700 bg-red-50",
    success: "text-green-700 bg-green-50",
  };
  const iconColors: any = {
    primary: "text-primary",
    warning: "text-yellow-600",
    alert: "text-red-600",
    success: "text-green-600"
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <span className={`material-symbols-outlined text-[80px] ${iconColors[type]}`}>{icon}</span>
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${colors[type]}`}>
              {change}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-3">
            <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        <div>
          {subValue && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className={`h-full rounded-full ${type === 'alert' ? 'bg-red-500' : (type === 'warning' ? 'bg-yellow-500' : 'bg-primary')}`} style={{ width: subValue }}></div>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-medium">
            {note}
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialTicker = () => (
  <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap text-xs">
    <div className="flex items-center gap-1">
      <span className="text-slate-500 font-bold">Thép CB300:</span>
      <span className="font-bold text-slate-900">14,200</span>
      <span className="text-red-500 flex items-center bg-red-50 px-1 rounded"><span className="material-symbols-outlined text-[12px]">arrow_upward</span> 1.2%</span>
    </div>
    <div className="w-px h-3 bg-slate-300"></div>
    <div className="flex items-center gap-1">
      <span className="text-slate-500 font-bold">Xi măng PCB40:</span>
      <span className="font-bold text-slate-900">1,450</span>
      <span className="text-green-500 flex items-center bg-green-50 px-1 rounded"><span className="material-symbols-outlined text-[12px]">arrow_downward</span> 0.5%</span>
    </div>
    <div className="w-px h-3 bg-slate-300"></div>
    <div className="flex items-center gap-1">
      <span className="text-slate-500 font-bold">Dầu DO:</span>
      <span className="font-bold text-slate-900">21,500</span>
      <span className="text-slate-400 font-bold">-</span>
    </div>
  </div>
)

const AIInsight = () => (
  <div className="bg-gradient-to-r from-indigo-900 to-primary text-white p-5 rounded-xl shadow-lg mb-6 flex items-start gap-4 relative overflow-hidden ring-1 ring-white/20">
    <div className="absolute -top-10 -right-10 p-4 opacity-10">
      <span className="material-symbols-outlined text-[200px]">psychology</span>
    </div>
    <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm shrink-0 border border-white/20 shadow-inner">
      <span className="material-symbols-outlined text-[28px] animate-pulse text-yellow-300">auto_awesome</span>
    </div>
    <div className="relative z-10 flex-1">
      <h4 className="text-sm font-bold text-indigo-100 mb-1 flex items-center gap-2">
        Trợ lý ảo phân tích (AI Executive Summary)
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white border border-white/10">Vừa cập nhật 5p trước</span>
      </h4>
      <p className="text-sm font-medium leading-relaxed opacity-90">
        <strong className="text-white">Cảnh báo Ưu tiên:</strong> Dự án <span className="underline decoration-yellow-400 decoration-2 underline-offset-2 font-bold text-white">Sun Urban City</span> đang có dấu hiệu trượt tiến độ (SPI = 0.85) kết hợp với sự cố An toàn cấp 1 hôm qua. Rủi ro pháp lý tại The Nine đã giảm.
      </p>
      <p className="text-xs text-indigo-200 mt-1">
        Khuyến nghị: Điều chuyển 2 tổ đội từ The Nine sang hỗ trợ Sun Urban trong 3 ngày tới để bù tiến độ.
      </p>

      <div className="mt-4 flex gap-3">
        <button className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-indigo-50 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">visibility</span> Xem chi tiết
        </button>
        <button className="bg-indigo-950/30 text-indigo-100 border border-white/20 text-xs font-bold px-3 py-1.5 rounded hover:bg-indigo-900/50 transition-colors">
          Bỏ qua
        </button>
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RiskTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs w-48 z-50">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
          <span className="size-3 rounded-full" style={{ backgroundColor: data.color }}></span>
          <p className="font-bold text-slate-900 text-sm">{data.name}</p>
        </div>
        <p className="text-slate-500 mb-1">Khả năng: <span className="font-bold text-slate-700">{data.x}%</span></p>
        <p className="text-slate-500 mb-1">Ảnh hưởng: <span className="font-bold text-slate-700">{data.y}%</span></p>
        <p className="text-slate-500">Trạng thái: <span className={`font-bold ${data.status === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>{data.status}</span></p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [activeChart, setActiveChart] = useState<'finance' | 'manpower'>('finance');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects for dashboard:", error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Trung tâm Chỉ huy
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-bold uppercase">Executive View</span>
          </h2>
        </div>

        {/* Material Price Ticker - Top Bar */}
        <div className="hidden xl:flex items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          <MaterialTicker />
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            <span className="material-symbols-outlined text-[18px] text-slate-500">filter_list</span>
            <span>Khu vực: Toàn quốc</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất Báo cáo</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-[#f7f7f8]">
        <div className="max-w-[1800px] mx-auto space-y-6">

          {/* 1. AI Insight Section */}
          <AIInsight />

          {/* 2. Key Stats Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Doanh Thu Ghi Nhận"
              value="120.5" unit="Tỷ"
              change="+12%" type="primary" icon="payments"
              subValue="78%"
              note="Đạt 78% kế hoạch năm (YTD)"
            />
            <StatCard
              title="Rủi ro & Sự cố"
              value="3" unit="Vụ"
              change="Critical" type="alert" icon="warning"
              subValue="85%"
              note="1 Sự cố ATLĐ nghiêm trọng tuần này"
            />
            <StatCard
              title="Dòng tiền khả dụng"
              value="45.8" unit="Tỷ"
              change="-2%" type="warning" icon="account_balance_wallet"
              subValue="40%"
              note="Đủ khả năng thanh toán 1.5 tháng tới"
            />
            <StatCard
              title="Tổng nhân lực (Site)"
              value="1,245" unit="Người"
              change="Peak" type="success" icon="groups"
              subValue="92%"
              note="Huy động tối đa cho giai đoạn hoàn thiện"
            />
          </div>

          {/* 3. Main Chart Section (Multi-view) & Risk Matrix */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* LEFT: Multi-view Chart */}
            <div className="xl:col-span-8 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
              <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Biểu đồ Tổng hợp Đa dự án</h3>
                  <p className="text-sm text-slate-500">Theo dõi chỉ số hiệu quả dự án theo thời gian thực.</p>
                </div>
                {/* Chart Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveChart('finance')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeChart === 'finance' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">monitoring</span> Tài chính & EVM
                  </button>
                  <button
                    onClick={() => setActiveChart('manpower')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeChart === 'manpower' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">engineering</span> Nhân lực & Máy móc
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 relative text-xs">
                <ErrorBoundary fallback={<div className="p-10 text-center text-slate-400">Không thể hiển thị biểu đồ.</div>}>
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'finance' ? (
                      <ComposedChart data={financeData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <defs>
                          <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1f3f89" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#1f3f89" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area name="Kế hoạch (PV)" type="monotone" dataKey="plan" stroke="#1f3f89" strokeWidth={3} fillOpacity={1} fill="url(#colorPlan)" />
                        <Bar name="Chi phí thực (AC)" dataKey="cost" fill="#EF4444" barSize={20} radius={[4, 4, 0, 0]} opacity={0.8} />
                        <Line name="Giá trị đạt được (EV)" type="monotone" dataKey="ev" stroke="#FACC15" strokeWidth={3} dot={{ r: 4, fill: '#FACC15', strokeWidth: 2, stroke: '#fff' }} />
                        <ReferenceLine x="T6" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Hiện tại', fill: '#94a3b8', fontSize: 10 }} />
                      </ComposedChart>
                    ) : (
                      <ComposedChart data={resourceData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis yAxisId="left" orientation="left" stroke="#07883d" axisLine={false} tickLine={false} label={{ value: 'Công nhân', angle: -90, position: 'insideLeft', fill: '#07883d', opacity: 0.5 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#1f3f89" axisLine={false} tickLine={false} label={{ value: 'Máy móc', angle: 90, position: 'insideRight', fill: '#1f3f89', opacity: 0.5 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar yAxisId="left" name="Công nhân (Người)" dataKey="workers" fill="#07883d" barSize={30} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" name="Máy móc (Thiết bị)" type="monotone" dataKey="machines" stroke="#1f3f89" strokeWidth={3} dot={{ r: 4, fill: '#1f3f89', strokeWidth: 2, stroke: '#fff' }} />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
            </div>

            {/* RIGHT: Risk Matrix */}
            <div className="xl:col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600">crisis_alert</span> Ma trận Rủi ro
                </h3>
                <p className="text-sm text-slate-500">Phân vùng rủi ro theo Xác suất & Ảnh hưởng</p>
              </div>
              <div className="flex-1 p-4 relative">
                {/* Matrix Background Zones */}
                <div className="absolute inset-4 left-10 bottom-8 border-l border-b border-slate-200 z-0">
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-50/50 rounded-tr-xl"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-50/50 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-full h-full bg-transparent flex items-center justify-center pointer-events-none">
                    <span className="text-[100px] text-slate-500/5 font-black -rotate-12 transform">RISK</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="x" name="Khả năng xảy ra" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Xác suất (Probability)', position: 'bottom', fontSize: 10, fill: '#64748b' }} />
                    <YAxis type="number" dataKey="y" name="Mức độ ảnh hưởng" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Ảnh hưởng (Impact)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Mức độ nghiêm trọng" />
                    <Tooltip content={<RiskTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Projects" data={riskData} fill="#8884d8">
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-6 pt-2 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Thấp</span>
                <span>Cao</span>
              </div>
            </div>
          </div>

          {/* 4. Project Map Section */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[450px]">
            <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400 gap-2 font-bold"><span className="material-symbols-outlined text-[48px]">map</span> Bản đồ hiện không khả dụng.</div>}>
              <ProjectMap projects={projects} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
}