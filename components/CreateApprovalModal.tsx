import React, { useState } from 'react';
import { ApprovalType, ApprovalPriority } from '../types';
import { approvalService } from '../src/services/approvalService';
import { projectService } from '../src/services/projectService';
import { showToast } from '../src/components/ui/Toast';

interface CreateApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    projects: any[];
}

export const CreateApprovalModal: React.FC<CreateApprovalModalProps> = ({ isOpen, onClose, onCreated, projects }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'payment' as ApprovalType,
        priority: 'normal' as ApprovalPriority,
        project_id: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.project_id) {
            showToast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        try {
            await approvalService.createApprovalRequest(form);
            showToast.success('Đã tạo đề xuất trình lãnh đạo thành công');
            onCreated();
            onClose();
            setForm({
                title: '',
                description: '',
                type: 'payment',
                priority: 'normal',
                project_id: '',
            });
        } catch (error) {
            showToast.error('Có lỗi xảy ra khi tạo đề xuất');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Tạo đề xuất mới</h3>
                    <button type="button" onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tiêu đề đề xuất *</label>
                        <input
                            required
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="VD: Đề xuất thanh toán đợt 2 gói thầu CP1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Loại đề xuất</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value as ApprovalType })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1"
                            >
                                <option value="payment">Thanh toán</option>
                                <option value="contract">Hợp đồng</option>
                                <option value="leave">Nghỉ phép</option>
                                <option value="purchase">Mua sắm</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Độ ưu tiên</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value as ApprovalPriority })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1"
                            >
                                <option value="low">Thấp</option>
                                <option value="normal">Bình thường</option>
                                <option value="high">Cao</option>
                                <option value="urgent">Gấp</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Dự án liên quan *</label>
                        <select
                            required
                            value={form.project_id}
                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1"
                        >
                            <option value="">Chọn dự án...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nội dung chi tiết</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm mt-1 h-32 resize-none"
                            placeholder="Nhập mô tả chi tiết yêu cầu..."
                        ></textarea>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Hủy</button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light shadow-premium transition-premium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                        Gửi trình duyệt
                    </button>
                </div>
            </form>
        </div>
    );
};
