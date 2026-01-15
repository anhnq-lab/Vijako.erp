import React, { useState, useEffect } from 'react';
import { Project, Contract, Invoice } from '../types';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentData: any) => Promise<void>;
    projects: Project[];
    contracts: Contract[];
    invoices: Invoice[];
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    projects,
    contracts,
    invoices
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        payment_code: `PAY-${Date.now()}`,
        payment_type: 'disbursement', // or 'receipt'
        project_id: '',
        contract_id: '',
        invoice_id: '',
        partner_name: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: 0,
        payment_method: 'bank_transfer',
        description: '',
        notes: ''
    });

    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({
                payment_code: `PAY-${Date.now()}`,
                payment_type: 'disbursement',
                project_id: '',
                contract_id: '',
                invoice_id: '',
                partner_name: '',
                payment_date: new Date().toISOString().split('T')[0],
                amount: 0,
                payment_method: 'bank_transfer',
                description: '',
                notes: ''
            });
        }
    }, [isOpen]);

    // Filter contracts and invoices when project changes
    useEffect(() => {
        if (formData.project_id) {
            setFilteredContracts(contracts.filter(c => c.project_id === formData.project_id));
            setFilteredInvoices(invoices.filter(i => i.project_id === formData.project_id));

            // Auto-fill partner name if possible (not easy without specific logic, skip for now)
        } else {
            setFilteredContracts([]);
            setFilteredInvoices([]);
        }
    }, [formData.project_id, contracts, invoices]);

    // Auto-fill amount/partner when invoice is selected
    useEffect(() => {
        if (formData.invoice_id) {
            const invoice = invoices.find(i => i.id === formData.invoice_id);
            if (invoice) {
                setFormData(prev => ({
                    ...prev,
                    project_id: invoice.project_id || prev.project_id,
                    contract_id: invoice.contract_id || prev.contract_id,
                    amount: invoice.outstanding_amount, // defaulting to outstanding
                    partner_name: invoice.vendor_name,
                    description: `Thanh toán cho hóa đơn ${invoice.invoice_code}`
                }));
            }
        }
    }, [formData.invoice_id, invoices]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi tạo thanh toán');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl">Tạo Thanh toán mới</h3>
                            <p className="text-sm text-slate-500">Ghi nhận thu/chi cho dự án</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Type & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loại thanh toán</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 font-bold text-slate-700 focus:ring-emerald-500"
                                    value={formData.payment_type}
                                    onChange={e => setFormData({ ...formData, payment_type: e.target.value })}
                                >
                                    <option value="receipt">Thu tiền (Receipt)</option>
                                    <option value="disbursement">Chi tiền (Disbursement)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày giao dịch</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-xl border-slate-200 font-bold text-slate-700 focus:ring-emerald-500"
                                    value={formData.payment_date}
                                    onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Project & Related */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dự án</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 font-medium text-slate-700 focus:ring-emerald-500 text-sm"
                                    value={formData.project_id}
                                    onChange={e => setFormData({ ...formData, project_id: e.target.value, contract_id: '', invoice_id: '' })}
                                >
                                    <option value="">-- Chọn dự án --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hợp đồng (Optional)</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 font-medium text-slate-700 focus:ring-emerald-500 text-sm"
                                    value={formData.contract_id}
                                    onChange={e => setFormData({ ...formData, contract_id: e.target.value })}
                                    disabled={!formData.project_id}
                                >
                                    <option value="">-- Không --</option>
                                    {filteredContracts.map(c => (
                                        <option key={c.id} value={c.id}>{c.contract_code} - {c.partner_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hóa đơn (Optional)</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 font-medium text-slate-700 focus:ring-emerald-500 text-sm"
                                    value={formData.invoice_id}
                                    onChange={e => setFormData({ ...formData, invoice_id: e.target.value })}
                                    disabled={!formData.project_id}
                                >
                                    <option value="">-- Không --</option>
                                    {filteredInvoices.map(i => (
                                        <option key={i.id} value={i.id}>{i.invoice_code} ({i.total_amount.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Partner & Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đối tác / Người nộp/nhận</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-slate-200 font-bold text-slate-700 focus:ring-emerald-500"
                                    value={formData.partner_name}
                                    onChange={e => setFormData({ ...formData, partner_name: e.target.value })}
                                    placeholder="Nhập tên đối tác..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số tiền (VNĐ)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full rounded-xl border-slate-200 font-black text-emerald-600 focus:ring-emerald-500 text-lg"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Method & Desc */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hình thức</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 font-bold text-slate-700 focus:ring-emerald-500"
                                    value={formData.payment_method}
                                    onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="bank_transfer">Chuyển khoản</option>
                                    <option value="cash">Tiền mặt</option>
                                    <option value="credit">Tín dụng</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã tham chiếu (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border-slate-200 font-medium text-slate-700 focus:ring-emerald-500"
                                    placeholder="Số lệnh chi / Ref No."
                                    value={formData.payment_code}
                                    onChange={e => setFormData({ ...formData, payment_code: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung / Diễn giải</label>
                            <textarea
                                className="w-full rounded-xl border-slate-200 font-medium text-slate-700 focus:ring-emerald-500"
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2"
                            >
                                {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                Xác nhận Thanh toán
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
