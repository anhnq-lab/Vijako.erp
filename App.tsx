import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './src/components/ui/Toast';
import { PageLoader } from './src/components/ui/LoadingComponents';
import { AuthProvider } from './src/context/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import { Layout } from './src/components/Layout';
import LoginPage from './src/pages/Login';

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
const TaskManagement = lazy(() => import('./pages/TaskManagement'));

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout><div className="h-full overflow-y-auto"><Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/tasks" element={<TaskManagement />} />
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
                </Routes></div></Layout>} path="*" />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}