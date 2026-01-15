import React, { useState, useEffect } from 'react';
import { UserTask, Employee } from '../../types';
import { projectService } from '../services/projectService';
import { hrmService } from '../services/hrmService';
import { showToast } from './ui/Toast';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (task: UserTask) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<UserTask['status']>('todo');
    const [priority, setPriority] = useState<UserTask['priority']>('normal');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setTitle('');
            setDescription('');
            setStatus('todo');
            setPriority('normal');
            setDueDate(new Date().toISOString().split('T')[0]);
            setAssigneeIds([]);

            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        try {
            const data = await hrmService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            showToast.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast.error('Vui lòng nhập tên công việc');
            return;
        }

        setLoading(true);
        try {
            const newTask = await projectService.createUserTask({
                title,
                description,
                status,
                priority,
                due_date: new Date(dueDate).toISOString(),
                assignee_ids: assigneeIds
            });

            if (newTask) {
                showToast.success('Tạo công việc thành công');
                onSuccess(newTask);
                onClose();
            }
        } catch (error) {
            console.error('Error creating task:', error);
            showToast.error('Lỗi khi tạo công việc');
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignee = (employeeId: string) => {
        setAssigneeIds(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-slate-800">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Tạo công việc mới</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Tên công việc <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tên công việc..."
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Mô tả chi tiết</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Thêm mô tả..."
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Độ ưu tiên</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as UserTask['priority'])}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                            >
                                <option value="low">Thấp</option>
                                <option value="normal">Bình thường</option>
                                <option value="high">Cao</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700">Hạn chót</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Assignees */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Người thực hiện ({assigneeIds.length})</label>
                        <div className="border border-slate-200 rounded-xl p-3 max-h-[160px] overflow-y-auto bg-slate-50/50">
                            {loadingEmployees ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Đang tải nhân viên...</div>
                            ) : employees.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 text-sm">Không tìm thấy nhân viên nào</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {employees.map(emp => {
                                        const isSelected = assigneeIds.includes(emp.id); // Note: Assuming we assign by Employee ID. If we need User ID, we need mapping.
                                        // Wait, UserTask uses assignee_ids which are User IDs (UUID). Employee table has user_id column.
                                        // We should use emp.user_id if available, otherwise fallback or filter out.
                                        // Let's check employee structure. Employee has user_id?: string.

                                        if (!emp.user_id) return null; // Skip employees without user account

                                        const isChecked = assigneeIds.includes(emp.user_id);

                                        return (
                                            <div
                                                key={emp.id}
                                                onClick={() => emp.user_id && toggleAssignee(emp.user_id)}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isChecked
                                                        ? 'bg-indigo-50 border-indigo-200'
                                                        : 'bg-white border-transparent hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className={`size-5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <span className="material-symbols-outlined text-[16px]">check</span>}
                                                </div>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                        {emp.avatar_url ? (
                                                            <img src={emp.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            emp.full_name.charAt(0)
                                                        )}
                                                    </div>
                                                    <span className={`text-sm truncate ${isChecked ? 'font-bold text-indigo-900' : 'text-slate-700'}`}>
                                                        {emp.full_name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 px-1">Chỉ những nhân viên đã liên kết tài khoản hệ thống mới hiển thị ở đây.</p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-premium hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
                        {loading ? 'Đang tạo...' : 'Tạo công việc'}
                    </button>
                </div>
            </div>
        </div>
    );
};
