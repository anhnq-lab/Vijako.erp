import React from 'react';
import { UserTask } from '../../types';

interface TaskBoardProps {
    tasks: UserTask[];
    onStatusChange: (taskId: string, newStatus: UserTask['status']) => void;
    onTaskClick: (task: UserTask) => void;
}

const COLUMNS: { id: UserTask['status']; title: string; color: string }[] = [
    { id: 'todo', title: 'Cần làm', color: 'bg-slate-100 border-slate-200' },
    { id: 'in_progress', title: 'Đang thực hiện', color: 'bg-blue-50 border-blue-200' },
    { id: 'blocked', title: 'Đang vướng mắc', color: 'bg-red-50 border-red-200' },
    { id: 'done', title: 'Hoàn thành', color: 'bg-green-50 border-green-200' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onStatusChange, onTaskClick }) => {
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: UserTask['status']) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onStatusChange(taskId, status);
        }
    };

    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                    <div
                        key={col.id}
                        className={`flex-1 min-w-[300px] flex flex-col rounded-xl border ${col.color} p-4`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                {col.title}
                                <span className="bg-white px-2 py-0.5 rounded-md text-xs border border-slate-200 shadow-sm">
                                    {colTasks.length}
                                </span>
                            </h3>
                            <button className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            {colTasks.map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onClick={() => onTaskClick(task)}
                                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'low' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        {task.due_date && (
                                            <span className={`text-[10px] flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                                        <div className="flex items-center -space-x-1.5">
                                            {/* Avatar placeholder - ideal would be task.assigness */}
                                            <div className="size-5 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] text-indigo-700 font-bold">QA</div>
                                        </div>
                                        <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-primary transition-colors">edit</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
