import React, { useState, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ResponsiveSidebar } from './src/components/layout/ResponsiveSidebar';
import { ToastProvider } from './src/components/ui/Toast';
import { PageLoader } from './src/components/ui/LoadingComponents';
import { GlobalSearch, useGlobalSearch } from './src/components/ui/GlobalSearch';
import { ChatWidget } from './src/components/AIChat/ChatWidget';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Finance = lazy(() => import('./pages/Finance'));
const SupplyChain = lazy(() => import('./pages/SupplyChain'));
const HRM = lazy(() => import('./pages/HRM'));
const Documents = lazy(() => import('./pages/Documents'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Recruitment = lazy(() => import('./pages/Recruitment'));

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isOpen: isSearchOpen, setIsOpen: setSearchOpen } = useGlobalSearch();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen w-full">
      {/* Global Search */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

      {/* Responsive Sidebar */}
      <ResponsiveSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f7f7f8]">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-100 flex items-center px-4 z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-700">menu</span>
          </button>
          <div className="flex items-center gap-2 ml-3 text-primary">
            <div className="size-7 bg-primary text-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">apartment</span>
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
              Vijako<span className="text-primary font-normal">ERP</span>
            </h1>
          </div>

          {/* Search Button on Mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-700">search</span>
          </button>
        </div>

        {children}
      </main>

      <ChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/supply" element={<SupplyChain />} />
              <Route path="/hrm" element={<HRM />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/alerts" element={<Alerts />} />
              {/* Placeholders for other routes */}
              <Route path="*" element={<div className="p-10 text-center text-slate-500">Đang phát triển...</div>} />
            </Routes>
          </Suspense>
        </Layout>
      </HashRouter>
    </ToastProvider>
  );
}