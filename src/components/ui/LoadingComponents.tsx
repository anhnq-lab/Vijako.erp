import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'size-4',
        md: 'size-8',
        lg: 'size-12',
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <div className="animate-spin rounded-full border-2 border-slate-200 border-t-primary size-full" />
        </div>
    );
};

export const PageLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background-light">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm font-medium text-slate-500">Đang tải...</p>
            </div>
        </div>
    );
};

export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-3 bg-slate-100 rounded w-full mb-2" />
            ))}
        </div>
    );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="border-b border-slate-50 p-4 flex gap-4">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <div key={colIndex} className="h-3 bg-slate-100 rounded flex-1 animate-pulse" />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const StatCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="h-2 bg-slate-100 rounded w-full mb-2" />
            <div className="h-2 bg-slate-100 rounded w-3/4" />
        </div>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-6 space-y-6 bg-background-light">
            {/* Header Skeleton */}
            <div className="h-16 bg-white rounded-xl animate-pulse" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 bg-white rounded-xl p-6 h-[400px] animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                    <div className="h-full bg-slate-100 rounded" />
                </div>
                <div className="xl:col-span-4 bg-white rounded-xl p-6 h-[400px] animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                    <div className="h-full bg-slate-100 rounded" />
                </div>
            </div>
        </div>
    );
};
