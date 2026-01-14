import React, { useState, useEffect } from 'react';
import { ProjectIssue } from '../types';
import { projectService } from '../src/services/projectService';

interface IssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    projectId: string;
    existingIssue?: ProjectIssue | null;
}

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, onSaved, projectId, existingIssue }) => {
    const [formData, setFormData] = useState<Partial<ProjectIssue>>({
        code: '',
        type: 'General',
        title: '',
        priority: 'Medium',
        status: 'Open',
        due_date: '',
        pic: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (existingIssue) {
                setFormData(existingIssue);
            } else {
                setFormData({
                    code: `ISSUE-${Math.floor(Math.random() * 1000)}`, // Simple auto-gen
                    type: 'General',
                    title: '',
                    priority: 'Medium',
                    status: 'Open',
                    due_date: new Date().toISOString().split('T')[0],
                    pic: ''
                });
            }
        }
    }, [isOpen, existingIssue]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (existingIssue) {
                await projectService.updateProjectIssue(existingIssue.id, formData);
            } else {
                await projectService.createProjectIssue({
                    ...formData,
                    project_id: projectId
                } as any);
            }
            onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving issue:', error);
            alert('Lỗi khi lưu sự cố');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {existingIssue ? 'Cập nhật Sự cố / Rủi ro' : 'Thêm mới Sự cố / Rủi ro'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mã (Code)</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loại</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="General">General</option>
                                        <option value="NCR">NCR</option>
                                        <option value="RFI">RFI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mức độ ưu tiên</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    >
                                        <option value="Low">Thấp (Low)</option>
                                        <option value="Medium">Trung bình (Medium)</option>
                                        <option value="High">Cao (High)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Người phụ trách (PIC)</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.pic}
                                        onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hạn xử lý</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="Open">Đang mở (Open)</option>
                                    <option value="Resolved">Đã xử lý (Resolved)</option>
                                    <option value="Closed">Đóng (Closed)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IssueModal;
