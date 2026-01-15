import React, { useMemo } from 'react';
import { BOQItem, IPCWorkDetail } from '../../types';

interface BOQGridProps {
    items: BOQItem[];
    workDetails: Record<string, Partial<IPCWorkDetail>>; // Map boq_item_id -> work detail
    onQuantityChange?: (boqItemId: string, qty: number) => void;
    readOnly?: boolean;
}

const BOQRow = ({
    item,
    level = 0,
    workDetails,
    onQuantityChange,
    readOnly
}: {
    item: BOQItem;
    level: number;
    workDetails: Record<string, Partial<IPCWorkDetail>>;
    onQuantityChange?: (boqItemId: string, qty: number) => void;
    readOnly?: boolean;
}) => {
    const detail = workDetails[item.id] || {};
    const currentQty = detail.current_qty || 0;
    const cumulativeQty = detail.cumulative_qty || 0;
    const prevCumulativeQty = cumulativeQty - currentQty;

    // Tỷ lệ hoàn thành
    const completionRate = item.contract_qty > 0 ? (cumulativeQty / item.contract_qty) * 100 : 0;

    // Kiểm tra vượt khối lượng
    const isOverQty = cumulativeQty > item.contract_qty;

    const hasChildren = item.children && item.children.length > 0;

    return (
        <>
            <tr className={`
                hover:bg-slate-50 transition-colors 
                ${hasChildren ? 'bg-slate-50/50 font-bold' : ''}
                ${isOverQty ? 'bg-red-50/50' : ''}
            `}>
                <td className="px-4 py-3 border-b border-slate-100 sticky left-0 bg-white z-10" style={{ paddingLeft: `${level * 20 + 16}px` }}>
                    <div className="flex items-center gap-2">
                        {hasChildren && <span className="material-symbols-outlined text-[18px] text-slate-400">folder_open</span>}
                        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{item.item_code}</span>
                    </div>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 min-w-[300px]">
                    <span className="text-sm text-slate-900">{item.description}</span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-center">
                    <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right font-mono bg-blue-50/30">
                    <span className="text-sm font-bold text-blue-700">{item.contract_qty.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right font-mono text-slate-500">
                    <span className="text-sm">{(item.unit_rate).toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right font-mono text-slate-400">
                    <span className="text-sm font-medium">{prevCumulativeQty.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right bg-primary/5 min-w-[120px]">
                    {!hasChildren && !readOnly ? (
                        <input
                            type="number"
                            value={currentQty === 0 ? '' : currentQty}
                            onChange={(e) => onQuantityChange?.(item.id, parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-right font-black text-primary border-none focus:ring-2 focus:ring-primary/20 rounded h-8 px-2"
                            placeholder="0"
                        />
                    ) : (
                        <span className="text-sm font-black text-primary">{!hasChildren ? currentQty.toLocaleString() : '-'}</span>
                    )}
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right font-mono bg-emerald-50/30">
                    <span className={`text-sm font-black ${isOverQty ? 'text-red-600' : 'text-emerald-700'}`}>
                        {cumulativeQty.toLocaleString()}
                    </span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-right font-mono">
                    <span className="text-sm font-black text-slate-900">
                        {(currentQty * item.unit_rate).toLocaleString()}
                    </span>
                </td>
                <td className="px-4 py-3 border-b border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${isOverQty ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                            />
                        </div>
                        <span className={`text-[10px] font-black ${isOverQty ? 'text-red-600' : 'text-slate-500'}`}>
                            {completionRate.toFixed(1)}%
                        </span>
                    </div>
                </td>
            </tr>
            {item.children?.map(child => (
                <BOQRow
                    key={child.id}
                    item={child}
                    level={level + 1}
                    workDetails={workDetails}
                    onQuantityChange={onQuantityChange}
                    readOnly={readOnly}
                />
            ))}
        </>
    );
};

export const BOQGrid: React.FC<BOQGridProps> = ({ items, workDetails, onQuantityChange, readOnly }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-glass">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50/80 z-20">Mã hiệu</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">Mô tả công việc</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đơn vị</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Khối lượng HĐ</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đơn giá HĐ</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lũy kế trước</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-primary/5">Thực hiện kỳ này</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lũy kế đến nay</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Thành tiền kỳ này</th>
                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">% Hoàn thành</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map(item => (
                            <BOQRow
                                key={item.id}
                                item={item}
                                level={0}
                                workDetails={workDetails}
                                onQuantityChange={onQuantityChange}
                                readOnly={readOnly}
                            />
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="material-symbols-outlined text-slate-200 text-6xl mb-4">analytics</span>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chưa có dữ liệu BOQ cho hợp đồng này</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
