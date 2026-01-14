import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChatWidget } from './src/components/AIChat/ChatWidget';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import Finance from './pages/Finance';
import SupplyChain from './pages/SupplyChain';
import HRM from './pages/HRM';
import Documents from './pages/Documents';

const SidebarItem = ({ to, icon, label, active, count }: { to: string; icon: string; label: string; active: boolean; count?: number }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <span className={`material-symbols-outlined ${active ? 'filled' : ''} group-hover:text-primary transition-colors`}>
      {icon}
    </span>
    <span>{label}</span>
    {count && (
      <span className="ml-auto bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </Link>
);

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-slate-50">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-8 bg-primary text-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Vijako<span className="text-primary font-normal">ERP</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard</div>
          <SidebarItem to="/" icon="dashboard" label="Tổng quan Lãnh đạo" active={path === '/'} />
          <SidebarItem to="/workspace" icon="person" label="Dashboard Cá nhân" active={path === '/workspace'} />

          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quản lý</div>
          <SidebarItem to="/projects" icon="domain" label="Dự án" active={path === '/projects' || path.startsWith('/projects/')} />
          <SidebarItem to="/finance" icon="account_balance_wallet" label="Tài chính & Hợp đồng" active={path === '/finance'} />
          <SidebarItem to="/supply" icon="inventory_2" label="Chuỗi Cung ứng" active={path === '/supply'} />
          <SidebarItem to="/hrm" icon="groups" label="Nhân sự & Đào tạo" active={path === '/hrm'} />

          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Công cụ</div>
          <SidebarItem to="/documents" icon="folder_open" label="Hồ sơ Tài liệu (CDE)" active={path === '/documents'} />
          <SidebarItem to="/alerts" icon="notifications_active" label="Trung tâm Cảnh báo" active={path === '/alerts'} count={3} />
          <SidebarItem to="/system" icon="settings" label="Hệ thống" active={path === '/system'} />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <img
              src="https://picsum.photos/100/100"
              alt="User"
              className="size-9 rounded-full bg-cover bg-center object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Nguyễn Văn An</p>
              <p className="text-xs text-slate-500 truncate">CEO / Ban Giám Đốc</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f7f7f8]">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/supply" element={<SupplyChain />} />
          <Route path="/hrm" element={<HRM />} />
          <Route path="/documents" element={<Documents />} />
          {/* Placeholders for other routes */}
          <Route path="*" element={<div className="p-10 text-center text-slate-500">Đang phát triển...</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}