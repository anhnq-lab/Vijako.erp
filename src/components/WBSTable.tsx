import React, { useMemo } from 'react';
import { WBSItem } from '../../types';

interface WBSTableProps {
    items: WBSItem[];
    loading?: boolean;
}

export const WBSTable: React.FC<WBSTableProps> = ({ items, loading }) => {
    // Helper to flatten the tree if items are nested, or just return items if they are already flat but sorted
    // Assuming items are flat but might need sorting by wbs_code if available
    const displayItems = useMemo(() => {
        // Simple sort by WBS code if possible
        const sorted = [...items].sort((a, b) => {
            if (a.wbs_code && b.wbs_code) {
                return a.wbs_code.localeCompare(b.wbs_code, undefined, { numeric: true, sensitivity: 'base' });
            }
            return 0;
        });
        return sorted;
    }, [items]);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                <p>Đang tải dữ liệu WBS...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="p-12 text-center text-slate-300 flex flex-col items-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">account_tree</span>
                <p>Chưa có dữ liệu WBS cho dự án này</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-bold">
                        <th className="p-4 w-[40px]">#</th>
                        <th className="p-4 w-[350px]">Tên công việc</th>
                        <th className="p-4 w-[120px]">Bắt đầu</th>
                        <th className="p-4 w-[120px]">Kết thúc</th>
                        <th className="p-4 w-[150px]">Tiến độ</th>
                        <th className="p-4 w-[120px]">Trạng thái</th>
                        <th className="p-4">Giao cho</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {displayItems.map((item) => {
                        // Calculate indent based on level (assuming level 1 is top)
                        const indent = (item.level - 1) * 24;

                        return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-premium group">
                                <td className="p-4 text-xs font-mono text-slate-500 font-bold sticky left-0 bg-white group-hover:bg-slate-50/80 z-10">
                                    {item.wbs_code}
                                </td>
                                <td className="p-4">
                                    <div style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-2">
                                        {item.level > 1 && (
                                            <span className="material-symbols-outlined text-slate-300 text-[18px]">subdirectory_arrow_right</span>
                                        )}
                                        <div className={`font-medium ${item.level === 1 ? 'text-slate-800 font-bold uppercase text-xs' : 'text-slate-700 text-sm'}`}>
                                            {item.name}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {item.start_date ? new Date(item.start_date).toLocaleDateString('vi-VN') : '--'}
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : '--'}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.progress === 100 ? 'bg-green-500' :
                                                        item.progress > 0 ? 'bg-primary' : 'bg-slate-300'
                                                    }`}
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 w-8">{item.progress}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${item.status === 'done' ? 'bg-green-50 text-green-700 border-green-100' :
                                            item.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                item.status === 'delayed' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                        {item.status === 'done' ? 'Hoàn thành' :
                                            item.status === 'active' ? 'Đang làm' :
                                                item.status === 'delayed' ? 'Chậm' : 'Chờ'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {item.assigned_to ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {item.assigned_to.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{item.assigned_to}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">--</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
