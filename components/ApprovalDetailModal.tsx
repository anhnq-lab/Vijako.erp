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

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({ isOpen, onClose, approval: initialApproval, onUpdate }) => {
    const [approval, setApproval] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchDetails = async () => {
            if (initialApproval?.id && isOpen) {
                setLoading(true);
                try {
                    const data = await approvalService.getApprovalRequestById(initialApproval.id);
                    setApproval(data);
                } catch (error) {
                    console.error('Failed to load approval details', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setApproval(null);
            }
        };

        fetchDetails();
    }, [initialApproval, isOpen]);

    if (!isOpen || !initialApproval) return null;

    const handleStatusUpdate = async (status: ApprovalStatus, stepId?: string) => {
        try {
            if (stepId) {
                // Determine specific approver for the step - ideally from current user context
                // For demo, we just use a placeholder ID or the current user's ID if available
                const currentUserId = '00000000-0000-0000-0000-000000000001'; // Mock ID
                await approvalService.updateStepStatus(stepId, status, currentUserId);
            } else {
                // Legacy fallback
                await approvalService.updateApprovalStatus(initialApproval.id, status);
            }

            showToast.success(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} bước này`);
            onUpdate();
            onClose();
        } catch (error) {
            showToast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const statusColors: any = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-700',
        skipped: 'bg-gray-100 text-gray-500',
    };

    const priorityColors: any = {
        low: 'bg-slate-100 text-slate-600',
        normal: 'bg-blue-100 text-blue-600',
        high: 'bg-orange-100 text-orange-600',
        urgent: 'bg-red-100 text-red-600',
    };

    // Find current pending step
    const currentStep = approval?.steps?.find((s: any) => s.status === 'pending');
    const isWorkflow = approval?.steps && approval.steps.length > 0;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-1 inline-block ${priorityColors[initialApproval.priority]}`}>
                            {initialApproval.priority}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{initialApproval.title}</h3>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại đề xuất</p>
                                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-primary">category</span>
                                        {initialApproval.type.charAt(0).toUpperCase() + initialApproval.type.slice(1)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái tổng thể</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColors[approval?.status || initialApproval.status]}`}>
                                        {(approval?.status || initialApproval.status).toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dự án</p>
                                    <p className="text-sm font-medium text-slate-700">{approval?.project_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</p>
                                    <p className="text-sm font-medium text-slate-700">{new Date(initialApproval.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</p>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                                    {approval?.description || 'Không có mô tả.'}
                                </div>
                            </div>

                            {/* Workflow Stepper */}
                            {approval?.steps && approval.steps.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiến trình phê duyệt</p>
                                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                                        {approval.steps.map((step: any, index: number) => (
                                            <div key={step.id} className="relative pl-6">
                                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${step.status === 'approved' ? 'bg-green-500 border-green-500' :
                                                    step.status === 'rejected' ? 'bg-red-500 border-red-500' :
                                                        step.status === 'pending' && index === 0 ? 'bg-blue-500 border-blue-500' : // Highlighting logic needs check
                                                            step.status === 'pending' && step.id === currentStep?.id ? 'bg-blue-500 border-blue-500' :
                                                                'bg-white border-slate-300'
                                                    }`}
                                                ></div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{step.step_name}</p>
                                                        <p className="text-xs text-slate-500">{step.approver_role}</p>
                                                        {step.approved_at && (
                                                            <p className="text-[10px] text-green-600 mt-1">
                                                                Đã duyệt: {new Date(step.approved_at).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        )}
                                                        {step.status === 'rejected' && (
                                                            <p className="text-[10px] text-red-600 mt-1 font-bold">Đã từ chối</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${step.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            step.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                step.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-slate-50 text-slate-500 border-slate-200'
                                                            }`}>
                                                            {step.status === 'pending' ? 'Đang chờ' : step.status === 'approved' ? 'Đã duyệt' : step.status === 'rejected' ? 'Từ chối' : 'Chưa đến'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {approval?.payload && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dữ liệu đi kèm</p>
                                    <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs overflow-x-auto ring-1 ring-white/10">
                                        {JSON.stringify(approval.payload, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!loading && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        {/* Only show Approve/Reject if there is a current pending step OR (no steps and status is pending) */}
                        {((isWorkflow && currentStep) || (!isWorkflow && approval?.status === 'pending')) && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate('rejected', currentStep?.id)}
                                    className="px-6 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('approved', currentStep?.id)}
                                    className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light shadow-premium transition-premium"
                                >
                                    {isWorkflow ? `Phê duyệt (${currentStep.step_name})` : 'Phê duyệt'}
                                </button>
                            </>
                        )}
                        {/* Always show Close/Cancel style button if no action needed */}
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
