import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, ShieldCheck, History } from 'lucide-react';
import { paymentClaimService, InterimPaymentClaim, IPCWorkflowHistory, IPCStatus } from '../services/paymentClaimService';
import { showToast as toast } from './ui/Toast';

interface IPCApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    ipc: InterimPaymentClaim;
    onSuccess?: () => void;
}

export const IPCApprovalModal: React.FC<IPCApprovalModalProps> = ({
    isOpen,
    onClose,
    ipc,
    onSuccess
}) => {
    const [comment, setComment] = useState('');
    const [certifiedAmount, setCertifiedAmount] = useState(ipc.net_payment);
    const [history, setHistory] = useState<IPCWorkflowHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, ipc]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await paymentClaimService.getIPCWorkflowHistory(ipc.id);
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        setSubmitting(true);
        try {
            toast.loading(action === 'approve' ? 'Đang phê duyệt...' : 'Đang từ chối...');

            if (action === 'approve') {
                await paymentClaimService.certifyIPC(ipc.id, certifiedAmount, 'Ban Giám đốc');
                toast.dismiss();
                toast.success('Đã phê duyệt hồ sơ thanh toán');
            } else {
                if (!comment) {
                    toast.dismiss();
                    toast.error('Vui lòng nhập lý do từ chối vào ô ý kiến');
                    setSubmitting(false);
                    return;
                }
                await paymentClaimService.rejectIPC(ipc.id, ipc.status, 'Ban Giám đốc', comment);
                toast.dismiss();
                toast.success('Đã từ chối hồ sơ thanh toán');
            }
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.dismiss();
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="size-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Quy trình Phê duyệt</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Phê duyệt IPC {ipc.ipc_number}</h2>
                        <p className="text-sm text-slate-500 font-medium">Kỳ thanh toán: {ipc.period_start} đến {ipc.period_end}</p>
                    </div>
                    <button onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-premium shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Details Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết giá trị duyệt (VND)</p>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase">Dual Tracking Active</span>
                        </div>

                        <div className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase">Hạng mục</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase">Đề xuất (QS)</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-black text-emerald-600 uppercase">Duyệt (CĐT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-slate-600">Giá trị công việc</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-400">{ipc.works_executed_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={certifiedDetails.works_executed_amount}
                                                onChange={e => updateCertifiedSummary({ works_executed_amount: parseFloat(e.target.value) || 0 })}
                                                className="w-32 text-right bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-slate-600">Giá trị phát sinh</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-400">{ipc.variations_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={certifiedDetails.variations_amount}
                                                onChange={e => updateCertifiedSummary({ variations_amount: parseFloat(e.target.value) || 0 })}
                                                className="w-32 text-right bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-slate-600">Vật tư tại trường</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-400">{ipc.mos_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={certifiedDetails.mos_amount}
                                                onChange={e => updateCertifiedSummary({ mos_amount: parseFloat(e.target.value) || 0 })}
                                                className="w-32 text-right bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="bg-slate-100/30">
                                        <td className="px-6 py-4 font-black text-slate-900">TỔNG GIÁ TRỊ GỘP</td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900">{ipc.gross_total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-700">{(certifiedDetails.gross_total || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-slate-600">Khấu trừ giữ lại</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-400">{ipc.retention_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={certifiedDetails.retention_amount}
                                                onChange={e => updateCertifiedSummary({ retention_amount: parseFloat(e.target.value) || 0 })}
                                                className="w-32 text-right bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-rose-600 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-slate-600">Hoàn trả tạm ứng</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-400">{ipc.advance_repayment.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                value={certifiedDetails.advance_repayment}
                                                onChange={e => updateCertifiedSummary({ advance_repayment: parseFloat(e.target.value) || 0 })}
                                                className="w-32 text-right bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-rose-600 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="bg-emerald-600 text-white">
                                        <td className="px-6 py-5 font-black uppercase tracking-wider">Thanh toán ròng</td>
                                        <td className="px-6 py-5 text-right font-black">{ipc.net_payment.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-right font-black text-xl">{(certifiedDetails.net_payment || 0).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> Ý kiến phê duyệt / Ghi chú
                        </label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Nhập nội dung phản hồi nếu cần..."
                            className="w-full bg-white border border-slate-200 rounded-3xl p-6 font-medium text-slate-900 outline-none focus:ring-4 focus:ring-primary/10 transition-premium"
                        />
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <History size={14} /> Lịch sử luân chuyển
                        </p>
                        <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-black text-slate-900">{h.approver_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 italic">{new Date(h.action_date).toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Chuyển {h.from_status} → {h.to_status}</p>
                                        {h.comments && <p className="text-xs text-slate-600 font-medium italic">"{h.comments}"</p>}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 font-medium italic">Chưa có lịch sử chuyển đổi</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={submitting}
                        className="flex-1 h-16 bg-white border border-slate-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 hover:border-red-200 transition-premium flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} />
                        Từ chối / Chỉnh sửa
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={submitting}
                        className="flex-1 h-16 mesh-gradient-emerald text-white rounded-2xl font-black text-sm shadow-premium hover:opacity-90 transition-premium flex items-center justify-center gap-2 group"
                    >
                        <ShieldCheck size={20} className="group-hover:scale-110 transition-premium text-white" />
                        Phê duyệt Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
};
