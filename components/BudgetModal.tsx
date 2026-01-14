import React, { useState, useEffect } from 'react';
import { ProjectBudget } from '../types';
import { projectService } from '../src/services/projectService';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    projectId: string;
    existingItem?: ProjectBudget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
    isOpen,
    onClose,
    onSaved,
    projectId,
    existingItem
}) => {
    const [formData, setFormData] = useState({
        category: '',
        budget_amount: 0,
        actual_amount: 0,
        committed_amount: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!existingItem;

    useEffect(() => {
        if (existingItem) {
            setFormData({
                category: existingItem.category || '',
                budget_amount: existingItem.budget_amount || 0,
                actual_amount: existingItem.actual_amount || 0,
                committed_amount: existingItem.committed_amount || 0
            });
        } else {
            setFormData({
                category: '',
                budget_amount: 0,
                actual_amount: 0,
                committed_amount: 0
            });
        }
    }, [existingItem, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode && existingItem) {
                await projectService.updateBudgetItem(existingItem.id, formData);
            } else {
                await projectService.createBudgetItem({
                    ...formData,
                    project_id: projectId
                });
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b bg-slate-50 border-slate-100 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-600">account_balance</span>
                        {isEditMode ? 'Sửa Khoản mục Chi phí' : 'Thêm Khoản mục Chi phí'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Khoản mục</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        >
                            <option value="">-- Chọn khoản mục --</option>
                            <option value="Vật tư (Materials)">Vật tư (Materials)</option>
                            <option value="Nhân công (Labor)">Nhân công (Labor)</option>
                            <option value="Máy thi công (Equipment)">Máy thi công (Equipment)</option>
                            <option value="Chi phí quản lý (Overhead)">Chi phí quản lý (Overhead)</option>
                            <option value="Chi phí khác (Other)">Chi phí khác (Other)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Ngân sách (Budget)</label>
                            <input
                                type="number"
                                name="budget_amount"
                                value={formData.budget_amount}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Thực tế (Actual)</label>
                            <input
                                type="number"
                                name="actual_amount"
                                value={formData.actual_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Cam kết (Committed)</label>
                            <input
                                type="number"
                                name="committed_amount"
                                value={formData.committed_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Remaining Calculation */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Còn lại (Remaining):</span>
                            <span className={`font-bold ${(formData.budget_amount - formData.actual_amount) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {(formData.budget_amount - formData.actual_amount).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetModal;
