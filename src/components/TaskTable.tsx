import React from 'react';
import { UserTask } from '../../types';

interface TaskTableProps {
    tasks: UserTask[];
    onStatusChange: (taskId: string, newStatus: UserTask['status']) => void;
    onTaskClick: (task: UserTask) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onStatusChange, onTaskClick }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-bold">
                        <th className="p-4 w-[40%]">Công việc</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Ưu tiên</th>
                        <th className="p-4">Hạn chót</th>
                        <th className="p-4 text-center">Tác vụ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {tasks.map(task => (
                        <tr
                            key={task.id}
                            className="hover:bg-slate-50/80 transition-premium cursor-pointer"
                            onClick={() => onTaskClick(task)}
                        >
                            <td className="p-4">
                                <div className="font-bold text-slate-800">{task.title}</div>
                                {task.description && (
                                    <div className="text-xs text-slate-500 truncate mt-0.5 max-w-[300px]">{task.description}</div>
                                )}
                            </td>
                            <td className="p-4">
                                <select
                                    value={task.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => onStatusChange(task.id, e.target.value as UserTask['status'])}
                                    className={`px-2 py-1 rounded-md text-xs font-bold border-0 cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    <option value="todo">Cần làm</option>
                                    <option value="in_progress">Đang làm</option>
                                    <option value="blocked">Vướng mắc</option>
                                    <option value="done">Hoàn thành</option>
                                </select>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                        task.priority === 'low' ? 'bg-slate-50 text-slate-500' :
                                            'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    <div className={`size-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'low' ? 'bg-slate-400' :
                                                'bg-indigo-500'
                                        }`} />
                                    {task.priority === 'high' ? 'Cao' : task.priority === 'low' ? 'Thấp' : 'Trung bình'}
                                </span>
                            </td>
                            <td className="p-4">
                                {task.due_date ? (
                                    <span className={`text-sm flex items-center gap-1.5 ${new Date(task.due_date) < new Date() && task.status !== 'done'
                                            ? 'text-red-600 font-bold'
                                            : 'text-slate-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                        {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-xs italic">--</span>
                                )}
                            </td>
                            <td className="p-4 text-center">
                                <button className="size-8 rounded-lg hover:bg-white hover:shadow-sm hover:text-primary transition-all flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {tasks.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                    Không có công việc nào để hiển thị
                </div>
            )}
        </div>
    );
};
