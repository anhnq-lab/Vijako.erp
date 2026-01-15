import React, { useState, useEffect } from 'react';
import { UserTask } from '../../types';
import { projectService } from '../services/projectService';
import { showToast } from './ui/Toast';

interface TaskDetailModalProps {
    task: UserTask | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: UserTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<Partial<UserTask>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({ ...task });
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await projectService.updateUserTask(task.id, formData);
            if (updated) {
                onUpdate(updated);
                showToast.success('Đã cập nhật công việc');
                onClose();
            }
        } catch (error) {
            console.error(error);
            showToast.error('Lỗi khi cập nhật công việc');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.status === 'done' ? 'bg-green-100 text-green-600' :
                                formData.status === 'blocked' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            <span className="material-symbols-outlined text-[24px]">
                                {formData.status === 'done' ? 'check_circle' :
                                    formData.status === 'blocked' ? 'report' : 'assignment'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Chi tiết công việc</h2>
                            <p className="text-xs text-slate-500 font-mono">ID: {task.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề công việc</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium text-slate-800 transition-all"
                            placeholder="Nhập tiêu đề công việc..."
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-medium text-slate-700 appearance-none bg-white"
                            >
                                <option value="todo">Cần làm</option>
                                <option value="in_progress">Đang thực hiện</option>
                                <option value="blocked">Đang vướng mắc</option>
                                <option value="done">Hoàn thành</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mức độ ưu tiên</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['low', 'normal', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setFormData({ ...formData, priority: p as any })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${formData.priority === p
                                                ? 'bg-white shadow-sm text-primary'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {p === 'normal' ? 'Normal' : p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
                        <textarea
                            rows={4}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm text-slate-600 resize-none transition-all"
                            placeholder="Mô tả chi tiết về công việc cần làm..."
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Thời hạn hoàn thành</label>
                        <input
                            type="datetime-local"
                            value={formData.due_date ? new Date(formData.due_date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setFormData({ ...formData, due_date: new Date(e.target.value).toISOString() })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-medium text-slate-800 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-premium hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};
