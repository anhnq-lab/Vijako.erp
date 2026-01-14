import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
    to: string;
    icon: string;
    label: string;
    active: boolean;
    count?: number;
    onClick?: () => void;
}

const SidebarItem = ({ to, icon, label, active, count, onClick }: SidebarItemProps) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active
            ? 'bg-primary/10 text-primary font-bold'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

interface ResponsiveSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const path = location.pathname;

    return (
        <>
            {/* Backdrop - chỉ hiện trên mobile khi sidebar mở */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static
          top-0 left-0 bottom-0
          w-64 bg-white border-r border-slate-100
          flex flex-col h-full z-40
          shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-slate-50 justify-between">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="size-8 bg-primary text-white rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">apartment</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                            Vijako<span className="text-primary font-normal">ERP</span>
                        </h1>
                    </div>

                    {/* Close button - chỉ hiện trên mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-600">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Dashboard
                    </div>
                    <SidebarItem
                        to="/"
                        icon="dashboard"
                        label="Tổng quan Lãnh đạo"
                        active={path === '/'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/workspace"
                        icon="person"
                        label="Dashboard Cá nhân"
                        active={path === '/workspace'}
                        onClick={onClose}
                    />

                    <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Quản lý
                    </div>
                    <SidebarItem
                        to="/projects"
                        icon="domain"
                        label="Dự án"
                        active={path === '/projects' || path.startsWith('/projects/')}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/contracts"
                        icon="description"
                        label="Hợp đồng & Đấu thầu"
                        active={path === '/contracts'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/finance"
                        icon="account_balance_wallet"
                        label="Tài chính & Thanh toán"
                        active={path === '/finance'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/supply"
                        icon="inventory_2"
                        label="Chuỗi Cung ứng"
                        active={path === '/supply'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/hrm"
                        icon="groups"
                        label="Nhân sự & Đào tạo"
                        active={path === '/hrm'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/recruitment"
                        icon="person_search"
                        label="Tuyển dụng"
                        active={path === '/recruitment'}
                        onClick={onClose}
                    />

                    <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Công cụ
                    </div>
                    <SidebarItem
                        to="/documents"
                        icon="folder_open"
                        label="Hồ sơ Tài liệu (CDE)"
                        active={path === '/documents'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/alerts"
                        icon="notifications_active"
                        label="Trung tâm Cảnh báo"
                        active={path === '/alerts'}
                        count={3}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/system"
                        icon="settings"
                        label="Hệ thống"
                        active={path === '/system'}
                        onClick={onClose}
                    />
                </nav>

                {/* User Profile */}
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
        </>
    );
};
