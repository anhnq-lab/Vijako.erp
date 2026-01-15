import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { paymentClaimService, PaymentContract, Variation, BOQItem, VariationType } from '../services/paymentClaimService';
import { showToast as toast } from './ui/Toast';

interface VariationModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentContract: PaymentContract;
    variation?: Variation;
    onSuccess?: () => void;
}

export const VariationModal: React.FC<VariationModalProps> = ({
    isOpen,
    onClose,
    paymentContract,
    variation,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        variation_code: '',
        type: 'quantity_change' as VariationType,
        description: '',
        proposed_amount: 0,
        boq_item_id: ''
    });

    const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (variation) {
                setFormData({
                    variation_code: variation.variation_code,
                    type: variation.type,
                    description: variation.description,
                    proposed_amount: variation.proposed_amount,
                    boq_item_id: variation.boq_item_id || ''
                });
            } else {
                setFormData({
                    variation_code: 'VO-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                    type: 'quantity_change',
                    description: '',
                    proposed_amount: 0,
                    boq_item_id: ''
                });
            }
            fetchBOQ();
        }
    }, [isOpen, variation]);

    const fetchBOQ = async () => {
        try {
            // Lấy flat list cho dropdown
            const items = await paymentClaimService.getBOQTree(paymentContract.id);
            setBoqItems(items);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (variation) {
                // Update... (To be added to service)
            } else {
                await paymentClaimService.createVariation({
                    payment_contract_id: paymentContract.id,
                    ...formData,
                    status: 'pending'
                });
                toast.success('Đã tạo đề xuất phát sinh thành công');
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi lưu phát sinh');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {variation ? 'Chi tiết phát sinh' : 'Đề xuất phát sinh mới'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Hợp đồng: {paymentContract.contract_code}</p>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-premium">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mã hiệu phát sinh</label>
                            <input
                                type="text"
                                value={formData.variation_code}
                                onChange={e => setFormData({ ...formData, variation_code: e.target.value })}
                                className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-premium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Loại phát sinh</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full h-12 bg-slate-50 rounded-xl border border-slate-100 px-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-premium"
                            >
                                <option value="quantity_change">Thay đổi khối lượng</option>
                                <option value="material_change">Thay đổi chủng loại vật liệu</option>
                                <option value="new_item">Hạng mục mới hoàn toàn</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mô tả nội dung phát sinh</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Nhập chi tiết lý do và nội dung thay đổi..."
                            className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 font-medium text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-premium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Giá trị dự kiến (VND)</label>
                        <input
                            type="number"
                            value={formData.proposed_amount}
                            onChange={e => setFormData({ ...formData, proposed_amount: parseFloat(e.target.value) || 0 })}
                            className="w-full h-14 bg-slate-50 rounded-xl border border-slate-100 px-6 font-black text-xl text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-premium"
                        />
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 text-amber-700 border border-amber-100">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="text-[11px] font-bold leading-relaxed">
                            Mọi đề xuất phát sinh cần được đính kèm bản tính chi tiết và ảnh chụp hiện trạng. Vui lòng phê duyệt nội bộ trước khi trình khách hàng.
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-premium">
                        Đóng
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] h-14 mesh-gradient text-white rounded-2xl font-black text-sm shadow-premium hover:opacity-90 transition-premium flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {variation ? 'Cập nhật thay đổi' : 'Gửi đề xuất'}
                    </button>
                </div>
            </div>
        </div>
    );
};
