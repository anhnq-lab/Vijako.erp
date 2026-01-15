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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-premium group relative ${active
            ? 'bg-primary text-white shadow-premium font-bold'
            : 'text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm'
            }`}
    >
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald rounded-r-full shadow-[0_0_10px_#10b981]" />
        )}
        <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''} group-hover:scale-110 transition-premium`}>
            {icon}
        </span>
        <span className="text-sm font-medium tracking-tight">{label}</span>
        {count && (
            <span className="ml-auto bg-emerald text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
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
          w-72 glass border-r border-slate-200/50
          flex flex-col h-full z-40
          transform transition-premium duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 mesh-gradient text-white rounded-xl flex items-center justify-center shadow-premium">
                            <span className="material-symbols-outlined text-[24px]">apartment</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                                VIJAKO
                            </h1>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-emerald uppercase mt-1">Hệ Thống Quản Trị</p>
                        </div>
                    </div>

                    {/* Close button - chỉ hiện trên mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden size-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-premium"
                    >
                        <span className="material-symbols-outlined text-slate-600">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <div className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        ĐIỀU HÀNH TỔNG HỢP
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
                        label="Không gian cá nhân"
                        active={path === '/workspace'}
                        onClick={onClose}
                    />

                    <div className="px-4 mt-8 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        QUẢN LÝ VẬN HÀNH
                    </div>
                    <SidebarItem
                        to="/projects"
                        icon="domain"
                        label="Dự án & Công trình"
                        active={path === '/projects' || path.startsWith('/projects/')}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/contracts"
                        icon="receipt_long"
                        label="Hợp đồng & Đấu thầu"
                        active={path === '/contracts'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/finance"
                        icon="payments"
                        label="Tài chính & Thanh toán"
                        active={path === '/finance'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/supply"
                        icon="conveyor_belt"
                        label="Chuỗi Cung ứng"
                        active={path === '/supply'}
                        onClick={onClose}
                    />
                    <SidebarItem
                        to="/hrm"
                        icon="badge"
                        label="Nhân sự & Đào tạo"
                        active={path === '/hrm'}
                        onClick={onClose}
                    />

                    <div className="px-4 mt-8 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        NGUỒN LỰC HỆ THỐNG
                    </div>
                    <SidebarItem
                        to="/documents"
                        icon="cloud_done"
                        label="Kho Hồ sơ (CDE)"
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
                        label="Cài đặt hệ thống"
                        active={path === '/system'}
                        onClick={onClose}
                    />
                </nav>

                {/* User Profile */}
                <div className="p-6">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-slate-200/50 shadow-sm hover:shadow-md transition-premium cursor-pointer group">
                        <div className="relative">
                            <img
                                src="https://i.pravatar.cc/150?u=vijako"
                                alt="User"
                                className="size-10 rounded-xl bg-cover bg-center object-cover ring-2 ring-emerald/20 group-hover:ring-emerald/50 transition-premium"
                            />
                            <div className="absolute -bottom-1 -right-1 size-4 bg-emerald border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">Nguyễn Quốc Anh</p>
                            <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-wider">Giám đốc dự án</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-premium">logout</span>
                    </div>
                </div>
            </aside>
        </>
    );
};
