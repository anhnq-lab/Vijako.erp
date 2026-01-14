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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden h-16 glass border-b border-slate-200/50 flex items-center px-6 z-10">
          <button
            onClick={toggleSidebar}
            className="size-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-premium"
          >
            <span className="material-symbols-outlined text-slate-700">menu</span>
          </button>

          <div className="flex items-center gap-3 ml-4">
            <div className="size-8 mesh-gradient text-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[18px]">apartment</span>
            </div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900">
              VIJAKO
            </h1>
          </div>

          {/* Search Button on Mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto size-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-premium"
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