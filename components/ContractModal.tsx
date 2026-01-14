import React, { useState, useEffect } from 'react';
import { Contract } from '../types';
import { financeService } from '../src/services/financeService';

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void; // Callback to refresh list
    projectId: string;
    existingContract?: Contract | null; // If editing
    contractType: 'revenue' | 'expense';
}

const ContractModal: React.FC<ContractModalProps> = ({
    isOpen,
    onClose,
    onSaved,
    projectId,
    existingContract,
    contractType
}) => {
    const [formData, setFormData] = useState({
        contract_code: '',
        partner_name: '',
        value: 0,
        paid_amount: 0,
        retention_amount: 0,
        status: 'active',
        type: contractType,
        budget_category: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!existingContract;

    useEffect(() => {
        if (existingContract) {
            setFormData({
                contract_code: existingContract.contract_code || '',
                partner_name: existingContract.partner_name || '',
                value: existingContract.value || 0,
                paid_amount: existingContract.paid_amount || 0,
                retention_amount: existingContract.retention_amount || 0,
                status: existingContract.status || 'active',
                type: existingContract.type || contractType,
                budget_category: existingContract.budget_category || ''
            });
        } else {
            // Reset form for new contract
            setFormData({
                contract_code: '',
                partner_name: '',
                value: 0,
                paid_amount: 0,
                retention_amount: 0,
                status: 'active',
                type: contractType,
                budget_category: ''
            });
        }
    }, [existingContract, contractType, isOpen]);

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
            if (isEditMode && existingContract) {
                await financeService.updateContract(existingContract.id, formData);
            } else {
                await financeService.createContract({
                    ...formData,
                    project_id: projectId
                } as Omit<Contract, 'id'>);
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

    const typeLabel = contractType === 'revenue' ? 'Chủ đầu tư' : 'Thầu phụ';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-5 border-b ${contractType === 'revenue' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} rounded-t-2xl`}>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className={`material-symbols-outlined ${contractType === 'revenue' ? 'text-blue-600' : 'text-orange-600'}`}>
                            {contractType === 'revenue' ? 'domain_add' : 'engineering'}
                        </span>
                        {isEditMode ? `Sửa HĐ ${typeLabel}` : `Thêm HĐ ${typeLabel}`}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Mã HĐ</label>
                            <input
                                type="text"
                                name="contract_code"
                                value={formData.contract_code}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                placeholder="HD-TS-001"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            >
                                <option value="active">Đang thực hiện</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {contractType === 'revenue' ? 'Chủ đầu tư' : 'Đối tác / Thầu phụ'}
                        </label>
                        <input
                            type="text"
                            name="partner_name"
                            value={formData.partner_name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            placeholder="Công ty ABC"
                        />
                    </div>

                    {/* Budget Category - Only for expense contracts */}
                    {contractType === 'expense' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Khoản mục Ngân sách liên quan
                            </label>
                            <select
                                name="budget_category"
                                value={formData.budget_category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                            >
                                <option value="">-- Chọn khoản mục --</option>
                                <option value="Vật tư (Materials)">Vật tư (Materials)</option>
                                <option value="Nhân công (Labor)">Nhân công (Labor)</option>
                                <option value="Máy thi công (Equipment)">Máy thi công (Equipment)</option>
                                <option value="Chi phí quản lý (Overhead)">Chi phí quản lý (Overhead)</option>
                                <option value="Chi phí khác (Other)">Chi phí khác (Other)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">HĐ này sẽ tính vào "Đã cam kết" của khoản mục được chọn</p>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Giá trị HĐ</label>
                            <input
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Đã thanh toán</label>
                            <input
                                type="number"
                                name="paid_amount"
                                value={formData.paid_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Giữ lại</label>
                            <input
                                type="number"
                                name="retention_amount"
                                value={formData.retention_amount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
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
                            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${contractType === 'revenue'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-orange-600 hover:bg-orange-700'
                                } disabled:opacity-50`}
                        >
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContractModal;
