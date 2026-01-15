import React from 'react';
import { ApprovalRequest, ApprovalStatus } from '../types';
import { approvalService } from '../src/services/approvalService';
import { showToast } from '../src/components/ui/Toast';

// --- Reusable Modal Component ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm?: () => void;
    confirmLabel?: string;
    isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onConfirm, confirmLabel = 'Lưu', isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Hủy</button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light shadow-premium transition-premium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ApprovalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    approval: ApprovalRequest | null;
    onUpdate: () => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({ isOpen, onClose, approval, onUpdate }) => {
    if (!approval) return null;

    const handleStatusUpdate = async (status: ApprovalStatus) => {
        try {
            await approvalService.updateApprovalStatus(approval.id, status);
            showToast.success(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} đề xuất`);
            onUpdate();
            onClose();
        } catch (error) {
            showToast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-700',
    };

    const priorityColors = {
        low: 'bg-slate-100 text-slate-600',
        normal: 'bg-blue-100 text-blue-600',
        high: 'bg-orange-100 text-orange-600',
        urgent: 'bg-red-100 text-red-600',
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-1 inline-block ${priorityColors[approval.priority]}`}>
                            {approval.priority}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{approval.title}</h3>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại đề xuất</p>
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-primary">category</span>
                                {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColors[approval.status]}`}>
                                {approval.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dự án</p>
                            <p className="text-sm font-medium text-slate-700">{approval.project_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</p>
                            <p className="text-sm font-medium text-slate-700">{new Date(approval.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</p>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                            {approval.description || 'Không có mô tả.'}
                        </div>
                    </div>

                    {approval.payload && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dữ liệu đi kèm</p>
                            <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs overflow-x-auto ring-1 ring-white/10">
                                {JSON.stringify(approval.payload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {approval.status === 'pending' && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={() => handleStatusUpdate('rejected')}
                            className="px-6 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
                        >
                            Từ chối
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('approved')}
                            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light shadow-premium transition-premium"
                        >
                            Phê duyệt
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
