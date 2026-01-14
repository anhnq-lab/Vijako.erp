import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { WBSItem } from '../types';

interface ProjectGanttProps {
    items: WBSItem[];
}

const ProjectGantt: React.FC<ProjectGanttProps> = ({ items }) => {
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Month);

    // Transform WBS items to Gantt tasks
    const tasks: Task[] = items.map(item => {
        const startDate = item.start_date ? new Date(item.start_date) : new Date();
        const endDate = item.end_date ? new Date(item.end_date) : new Date();

        return {
            start: startDate,
            end: endDate,
            name: item.name,
            id: item.id || Math.random().toString(), // Ensure ID
            type: 'task',
            progress: item.progress,
            isDisabled: true, // Disable editing for now
            styles: { progressColor: '#3b82f6', progressSelectedColor: '#2563eb' }
        };
    });

    if (tasks.length === 0) {
        return <div className="p-8 text-center text-slate-500">Chưa có dữ liệu tiến độ để hiển thị Gantt chart.</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">Biểu đồ Gantt</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode(ViewMode.Day)}
                        className={`px-3 py-1 text-xs font-bold rounded ${viewMode === ViewMode.Day ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Ngày
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Week)}
                        className={`px-3 py-1 text-xs font-bold rounded ${viewMode === ViewMode.Week ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Tuần
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Month)}
                        className={`px-3 py-1 text-xs font-bold rounded ${viewMode === ViewMode.Month ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Tháng
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    locale="vi"
                    columnWidth={viewMode === ViewMode.Month ? 300 : 65}
                    listCellWidth="155px"
                    barFill={80}
                    projectBackgroundColor="#f8fafc"
                    projectProgressColor="#3b82f6"
                    projectProgressSelectedColor="#2563eb"
                />
            </div>
        </div>
    );
};

export default ProjectGantt;
