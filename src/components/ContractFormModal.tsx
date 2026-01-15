import React, { useState, useEffect } from 'react';
import { Contract } from '../../types';
import { projectService } from '../services/projectService';

interface ContractFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contract: Partial<Contract>) => Promise<void>;
    contract?: Contract | null; // If editing
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    contract,
}) => {
    const [formData, setFormData] = useState<Partial<Contract>>({
        contract_code: '',
        contract_type: 'revenue',
        partner_name: '',
        project_id: '',
        value: 0,
        signing_date: '',
        start_date: '',
        end_date: '',
        description: '',
        status: 'active',
    });
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadProjects();
            if (contract) {
                setFormData(contract);
            } else {
                // Reset form
                setFormData({
                    contract_code: '',
                    contract_type: 'revenue',
                    partner_name: '',
                    project_id: '',
                    value: 0,
                    signing_date: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                    status: 'active',
                });
            }
        }
    }, [isOpen, contract]);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAllProjects();
            setProjects(data);
        } catch (err) {
            console.error('Error loading projects:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.contract_code || !formData.partner_name) {
            setError('Vui lòng điền đủ thông tin bắt buộc');
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Lỗi khi lưu hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-premium w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                {contract ? 'Sửa Hợp Đồng' : 'Thêm Hợp Đồng Mới'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Điền thông tin chi tiết hợp đồng
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-premium"
                        >
                            <span className="material-symbols-outlined text-slate-400">close</span>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Mã hợp đồng */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mã hợp đồng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.contract_code}
                            onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            placeholder="HD-2024/001"
                            required
                        />
                    </div>

                    {/* Loại hợp đồng */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Loại hợp đồng
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="contract_type"
                                    value="revenue"
                                    checked={formData.contract_type === 'revenue'}
                                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as 'revenue' })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm font-medium">Doanh thu (A-B)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="contract_type"
                                    value="expense"
                                    checked={formData.contract_type === 'expense'}
                                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as 'expense' })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm font-medium">Chi phí (B-C)</span>
                            </label>
                        </div>
                    </div>

                    {/* Đối tác */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Đối tác <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.partner_name}
                            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            placeholder="Tên công ty đối tác"
                            required
                        />
                    </div>

                    {/* Dự án */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Dự án
                        </label>
                        <select
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                        >
                            <option value="">Chọn dự án</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.code} - {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Giá trị */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Giá trị hợp đồng (₫)
                        </label>
                        <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Ngày ký
                            </label>
                            <input
                                type="date"
                                value={formData.signing_date}
                                onChange={(e) => setFormData({ ...formData, signing_date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium"
                            />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-premium resize-none"
                            rows={3}
                            placeholder="Mô tả chi tiết hợp đồng..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-premium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light shadow-premium transition-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        {contract ? 'Cập nhật' : 'Lưu lại'}
                    </button>
                </div>
            </div>
        </div>
    );
};
