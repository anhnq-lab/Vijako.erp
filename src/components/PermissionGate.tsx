import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, ROLES } from '../utils/permissions';

interface PermissionGateProps {
    children: React.ReactNode;
    /**
     * Array of roles allowed to view the content.
     * Can be imported from PERMISSIONS constant or passed directly.
     */
    allowedRoles: string[];
    /**
     * Optional fallback content to show if permission is denied.
     * If not provided, renders nothing (null).
     */
    fallback?: React.ReactNode;
    /**
     * If true, shows a "Access Denied" message instead of null (when fallback is undefined).
     */
    showError?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    allowedRoles,
    fallback = null,
    showError = false,
}) => {
    const { user } = useAuth();

    const isAllowed = hasPermission(user?.role, allowedRoles);

    if (isAllowed) {
        return <>{children}</>;
    }

    if (showError && !fallback) {
        return (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Bạn không có quyền thực hiện chức năng này.</span>
            </div>
        );
    }

    return <>{fallback}</>;
};

/**
 * Higher-order component for protecting entire pages
 */
export const withPermission = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    allowedRoles: string[],
    fallbackUrl: string = '/'
) => {
    return (props: P) => {
        const { user, loading } = useAuth();

        // While loading auth state, show nothing or a spinner
        if (loading) return null; // Or <PageLoader />

        const isAllowed = hasPermission(user?.role, allowedRoles);

        if (!isAllowed) {
            // Redirect logic could go here if we were inside a generic router wrapper
            // But for simple HOC, we render a Denied message page
            return (
                <div className="h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center p-8 max-w-md">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h1>
                        <p className="text-slate-600 mb-6">Tài khoản của bạn ({user?.role}) không có quyền truy cập trang này.</p>
                        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                            Về trang chủ
                        </a>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
};
