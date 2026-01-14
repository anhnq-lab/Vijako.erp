import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: string;
}

export const Breadcrumbs: React.FC<{ items?: BreadcrumbItem[] }> = ({ items }) => {
    const location = useLocation();

    // Auto-generate breadcrumbs from path if items not provided
    const getBreadcrumbs = (): BreadcrumbItem[] => {
        if (items) return items;

        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [
            { label: 'Trang chủ', path: '/', icon: 'home' }
        ];

        const pathMap: Record<string, string> = {
            projects: 'Dự án',
            finance: 'Tài chính & Hợp đồng',
            supply: 'Chuỗi Cung ứng',
            hrm: 'Nhân sự & Đào tạo',
            recruitment: 'Tuyển dụng',
            documents: 'Tài liệu',
            alerts: 'Cảnh báo',
            workspace: 'Dashboard Cá nhân',
        };

        paths.forEach((path, index) => {
            const label = pathMap[path] || path;
            const fullPath = '/' + paths.slice(0, index + 1).join('/');
            breadcrumbs.push({
                label,
                path: index === paths.length - 1 ? undefined : fullPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="material-symbols-outlined text-[16px] text-slate-300">
                            chevron_right
                        </span>
                    )}
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-primary font-medium transition-colors"
                        >
                            {item.icon && (
                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            )}
                            <span>{item.label}</span>
                        </Link>
                    ) : (
                        <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                            {item.icon && (
                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            )}
                            <span>{item.label}</span>
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

// Page Header with Breadcrumbs
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon,
    breadcrumbs,
    actions
}) => {
    return (
        <div className="bg-white border-b border-slate-100 px-6 py-4">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbs} />

            {/* Title & Actions */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <span className="material-symbols-outlined text-[28px] text-primary">{icon}</span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
