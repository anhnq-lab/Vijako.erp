import React from 'react';

export const PageLoader: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-slate-600 font-medium">Đang tải...</p>
            </div>
        </div>
    );
};

export const ComponentLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
    );
};

export const ButtonLoader: React.FC = () => {
    return (
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    );
};

// Skeleton Loaders
export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
    );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-200 p-4">
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="border-b border-slate-100 p-4">
                    <div className="flex gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-3 bg-slate-100 rounded flex-1 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SkeletonChart: React.FC = () => {
    return (
        <div className="bg-white rounded-xl p-6">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-64 bg-slate-100 rounded animate-pulse"></div>
        </div>
    );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Đang xử lý...' }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-slate-700 font-medium">{message}</p>
            </div>
        </div>
    );
};

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'inbox',
    title,
    description,
    action
}) => {
    return (
        <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <span className="material-symbols-outlined text-slate-400 text-4xl">{icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            {description && (
                <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
