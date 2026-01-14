import React, { useState, useMemo } from 'react';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    emptyIcon?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading = false,
    onRowClick,
    emptyMessage = 'Không có dữ liệu',
    emptyIcon = 'inbox'
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];

            if (aVal === bVal) return 0;

            const comparison = aVal > bVal ? 1 : -1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortKey, sortDirection]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="flex gap-4">
                        {columns.map((col, i) => (
                            <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: col.width || 'auto', flex: col.width ? undefined : 1 }} />
                        ))}
                    </div>
                </div>
                {/* Rows Skeleton */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-slate-50 px-6 py-4">
                        <div className="flex gap-4">
                            {columns.map((col, j) => (
                                <div key={j} className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: col.width || 'auto', flex: col.width ? undefined : 1 }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <span className="material-symbols-outlined text-[48px] text-slate-400">{emptyIcon}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={`px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                                        }`}
                                    style={{ width: column.width }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {column.sortable && (
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                                                {sortKey === column.key
                                                    ? sortDirection === 'asc'
                                                        ? 'arrow_upward'
                                                        : 'arrow_downward'
                                                    : 'unfold_more'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sortedData.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
                                    }`}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 text-sm text-slate-700">
                                        {column.render ? column.render(item) : (item as any)[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Pagination Component
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 10,
    onPageSizeChange
}) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(
        page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
    );

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Hiển thị</span>
                {onPageSizeChange ? (
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                ) : (
                    <span className="font-bold">{pageSize}</span>
                )}
                <span>mục</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {visiblePages.map((page, index) => {
                    const prevPage = visiblePages[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                        <React.Fragment key={page}>
                            {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                            <button
                                onClick={() => onPageChange(page)}
                                className={`min-w-[40px] h-10 px-3 rounded-lg font-bold text-sm transition-all ${currentPage === page
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {page}
                            </button>
                        </React.Fragment>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
            </div>
        </div>
    );
};
