import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { paymentClaimService, PaymentContract, InterimPaymentClaim, BOQItem, IPCWorkDetail, IPCFinancialSummary } from '../services/paymentClaimService';
import { BOQGrid } from './BOQGrid';
import { showToast as toast } from './ui/Toast';

interface IPCFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentContract: PaymentContract;
    ipc?: InterimPaymentClaim; // Nếu có thì là edit, không có là tạo mới
    onSuccess?: () => void;
}

export const IPCFormModal: React.FC<IPCFormModalProps> = ({
    isOpen,
    onClose,
    paymentContract,
    ipc,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        ipc_number: '',
        period_start: '',
        period_end: '',
        mos_amount: 0
    });

    const [boqTree, setBoqTree] = useState<BOQItem[]>([]);
    const [workDetails, setWorkDetails] = useState<Record<string, Partial<IPCWorkDetail>>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Financial Summary
    const [summary, setSummary] = useState<IPCFinancialSummary | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (ipc) {
                setFormData({
                    ipc_number: ipc.ipc_number,
                    period_start: ipc.period_start,
                    period_end: ipc.period_end,
                    mos_amount: ipc.mos_amount || 0
                });
                setSummary({
                    works_executed_amount: ipc.works_executed_amount || 0,
                    variations_amount: ipc.variations_amount || 0,
                    mos_amount: ipc.mos_amount || 0,
                    gross_total: ipc.gross_total || 0,
                    retention_amount: ipc.retention_amount || 0,
                    advance_repayment: ipc.advance_repayment || 0,
                    net_payment: ipc.net_payment || 0,
                    vat_amount: ipc.vat_amount || 0,
                    total_with_vat: ipc.total_with_vat || 0
                });
                fetchWorkDetails(ipc.id);
            } else {
                // Mặc định cho IPC mới
                setFormData({
                    ipc_number: 'Đợt 0' + (Math.floor(Math.random() * 9) + 1), // Tạm thời
                    period_start: new Date().toISOString().split('T')[0],
                    period_end: new Date().toISOString().split('T')[0],
                    mos_amount: 0
                });
            }
            fetchBOQ();
        }
    }, [isOpen, ipc]);

    const fetchBOQ = async () => {
        setLoading(true);
        try {
            const tree = await paymentClaimService.getBOQTree(paymentContract.id);
            setBoqTree(tree);
        } catch (error) {
            console.error('Lỗi lấy BOQ:', error);
            toast.error('Không tải được danh sách hạng mục công việc');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkDetails = async (ipcId: string) => {
        try {
            const details = await paymentClaimService.getIPCWorkDetails(ipcId);
            const detailMap: Record<string, Partial<IPCWorkDetail>> = {};
            details.forEach(d => {
                detailMap[d.boq_item_id] = d;
            });
            setWorkDetails(detailMap);
        } catch (error) {
            console.error('Lỗi lấy chi tiết khối lượng:', error);
        }
    };

    const handleQuantityChange = (boqItemId: string, qty: number) => {
        setWorkDetails(prev => ({
            ...prev,
            [boqItemId]: {
                ...prev[boqItemId],
                boq_item_id: boqItemId,
                current_qty: qty,
                // Lũy kế tạm thời trên UI (Cần logic lấy lũy kế đợt trước từ API)
                cumulative_qty: qty
            }
        }));
    };

    const handleSave = async (action: 'draft' | 'review' | 'submit') => {
        setSaving(true);
        try {
            let currentIpcId = ipc?.id;

            if (!currentIpcId) {
                // Tạo IPC mới
                const newIpc = await paymentClaimService.createIPC({
                    payment_contract_id: paymentContract.id,
                    ipc_number: formData.ipc_number,
                    period_start: formData.period_start,
                    period_end: formData.period_end,
                    status: 'draft',
                    created_by: 'current-user-id', // Tạm thời
                    mos_amount: formData.mos_amount
                });
                if (!newIpc) throw new Error('Không tạo được IPC');
                currentIpcId = newIpc.id;
            }

            // Lưu Work Details
            const detailsArray = Object.values(workDetails).map(d => ({
                boq_item_id: d.boq_item_id!,
                current_qty: d.current_qty || 0,
                cumulative_qty: d.cumulative_qty || 0
            }));

            await paymentClaimService.updateIPCWorkDetails(currentIpcId, detailsArray);

            // Tính toán tài chính
            await paymentClaimService.calculateIPCFinancials(currentIpcId);

            if (action === 'review') {
                await paymentClaimService.reviewIPC(currentIpcId, 'Kỹ sư QS');
                toast.success('Đã gửi IPC để duyệt nội bộ');
            } else if (action === 'submit') {
                await paymentClaimService.submitIPC(currentIpcId);
                toast.success('Đã trình duyệt IPC tới khách hàng');
            } else {
                toast.success('Đã lưu bản nháp thành công');
            }

            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Lỗi khi lưu IPC:', error);
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-[1400px] h-full flex flex-col rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-widest italic">ISO QT-CL-20</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phiên bản 1.2</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            {ipc ? 'Cập Nhật Hồ Sơ Thanh Toán' : 'Lập Hồ Sơ Thanh Toán Mới'}
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-black uppercase">Đợt {formData.ipc_number || '...'}</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Hợp đồng: <span className="font-bold text-slate-700">{paymentContract.contract_code}</span> | Dự án: <span className="font-bold text-slate-700">{paymentContract.project_name}</span></p>
                    </div>
                    <button onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-premium shadow-sm">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                    {/* Part 1: General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Số đợt thanh toán</label>
                            <input
                                type="text"
                                value={formData.ipc_number}
                                onChange={e => setFormData({ ...formData, ipc_number: e.target.value })}
                                className="w-full h-14 bg-white rounded-2xl border border-slate-200 px-6 font-black text-lg text-slate-900 focus:ring-4 focus:ring-primary/10 transition-premium outline-none"
                                placeholder="VD: Đợt 01"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ngày bắt đầu kỳ</label>
                            <input
                                type="date"
                                value={formData.period_start}
                                onChange={e => setFormData({ ...formData, period_start: e.target.value })}
                                className="w-full h-14 bg-white rounded-2xl border border-slate-200 px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-premium outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ngày kết thúc kỳ</label>
                            <input
                                type="date"
                                value={formData.period_end}
                                onChange={e => setFormData({ ...formData, period_end: e.target.value })}
                                className="w-full h-14 bg-white rounded-2xl border border-slate-200 px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-premium outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Vật tư tại hiện trường (VND)</label>
                            <input
                                type="number"
                                value={formData.mos_amount}
                                onChange={e => setFormData({ ...formData, mos_amount: parseFloat(e.target.value) || 0 })}
                                className="w-full h-14 bg-white rounded-2xl border border-slate-200 px-6 font-black text-lg text-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-premium outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Part 2: BOQ Grid */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết khối lượng thi công</h3>
                                <p className="text-xs text-slate-500 font-medium">Cập nhật khối lượng thực hiện trong kỳ cho từng hạng mục</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">
                                    <span className="material-symbols-outlined text-[16px]">info</span>
                                    CHỈ NHẬP CỘT TRỰC TIẾP TRONG KỲ
                                </span>
                            </div>
                        </div>

                        <BOQGrid
                            items={boqTree}
                            workDetails={workDetails}
                            onQuantityChange={handleQuantityChange}
                        />
                    </div>
                </div>

                {/* Footer / Summary Info */}
                <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center border-t border-white/5">
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Giá trị hoàn thành</p>
                            <p className="text-xl font-black">{(summary?.works_executed_amount || 0).toLocaleString()} <span className="text-[10px] text-white/40">VND</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Giữ lại ({paymentContract.retention_percent}%)</p>
                            <p className="text-xl font-black text-amber-400">{(summary?.retention_amount || 0).toLocaleString()} <span className="text-[10px] text-white/40">VND</span></p>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">THANH TOÁN RÒNG (Sau VAT)</p>
                            <p className="text-3xl font-black text-emerald-400">{(summary?.total_with_vat || 0).toLocaleString()} <span className="text-xs text-emerald-400/50">VND</span></p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                            className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-black transition-premium flex items-center gap-2 border border-white/10"
                        >
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            {saving ? '...' : 'Lưu nháp'}
                        </button>
                        <button
                            onClick={() => handleSave('review')}
                            disabled={saving}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-premium flex items-center gap-2 shadow-lg group"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-premium text-blue-200">shield_person</span>
                            {saving ? '...' : 'Trình duyệt nội bộ'}
                        </button>
                        <button
                            onClick={() => handleSave('submit')}
                            disabled={saving}
                            className="px-6 py-4 mesh-gradient text-white rounded-2xl text-sm font-black transition-premium shadow-premium flex items-center gap-2 group"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-premium">send</span>
                            {saving ? '...' : 'Trình khách hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
