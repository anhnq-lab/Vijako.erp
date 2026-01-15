import React, { useState } from 'react';
import { X, Save, Settings, Info, Percent, Banknote, ShieldCheck } from 'lucide-react';
import { paymentClaimService } from '../services/paymentClaimService';
import { showToast as toast } from './ui/Toast';
import { Contract } from '../../types';

interface PaymentContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: Contract;
    onSuccess?: () => void;
}

export const PaymentContractModal: React.FC<PaymentContractModalProps> = ({
    isOpen,
    onClose,
    contract,
    onSuccess
}) => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        retention_percent: 5,
        retention_limit: 0,
        advance_payment_amount: 0,
        advance_repayment_rule: 'progressive',
        vat_percent: 10
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await paymentClaimService.createPaymentContract({
                contract_id: contract.id,
                retention_percent: formData.retention_percent,
                retention_limit: formData.retention_limit,
                advance_payment_amount: formData.advance_payment_amount,
                advance_repayment_rule: formData.advance_repayment_rule,
                vat_percent: formData.vat_percent
            });

            toast.success('Đã cấu hình điều khoản thanh toán thành công');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error saving payment contract:', error);
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="size-2 rounded-full bg-primary-accent animate-pulse"></span>
                            <span className="text-[10px] font-black text-primary-accent uppercase tracking-widest">Thiết lập Hợp đồng</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cấu hình Thanh toán</h2>
                        <p className="text-sm text-slate-500 font-medium">HĐ: {contract.contract_code} - {contract.partner_name}</p>
                    </div>
                    <button onClick={onClose} className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-premium shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Retention Percent */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                                <Percent size={14} className="text-primary-accent" />
                                % Giữ lại bảo hành
                            </label>
                            <input
                                type="number"
                                value={formData.retention_percent}
                                onChange={e => setFormData({ ...formData, retention_percent: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-accent/10 transition-premium outline-none"
                            />
                        </div>

                        {/* VAT Percent */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                                <Info size={14} className="text-primary-accent" />
                                % Thuế VAT
                            </label>
                            <input
                                type="number"
                                value={formData.vat_percent}
                                onChange={e => setFormData({ ...formData, vat_percent: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-accent/10 transition-premium outline-none"
                            />
                        </div>

                        {/* Retention Limit */}
                        <div className="col-span-2 space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                                <ShieldCheck size={14} className="text-primary-accent" />
                                Hạn mức giữ lại tối đa (VND)
                            </label>
                            <input
                                type="number"
                                value={formData.retention_limit}
                                onChange={e => setFormData({ ...formData, retention_limit: parseFloat(e.target.value) || 0 })}
                                placeholder="Để 0 nếu không có hạn mức"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-accent/10 transition-premium outline-none"
                            />
                        </div>

                        {/* Advance Amount */}
                        <div className="col-span-2 space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                                <Banknote size={14} className="text-primary-accent" />
                                Số tiền tạm ứng (VND)
                            </label>
                            <input
                                type="number"
                                value={formData.advance_payment_amount}
                                onChange={e => setFormData({ ...formData, advance_payment_amount: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 font-black text-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-premium outline-none text-xl"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                        <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                            <Info size={14} /> Quy tắc hoàn ứng mặc định
                        </h4>
                        <p className="text-sm text-blue-700 font-medium leading-relaxed">
                            Bắt đầu hoàn ứng từ <span className="font-bold">20%</span> tiến độ và hoàn tất tại <span className="font-bold">80%</span> tiến độ theo công thức lũy tiến ISO QT-CL-20.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-50 transition-premium shadow-sm"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-10 py-4 mesh-gradient text-white rounded-2xl text-sm font-black hover:opacity-90 shadow-premium transition-premium disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        <span>Lưu cấu hình</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
