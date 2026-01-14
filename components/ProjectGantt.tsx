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

        let color = '#f1f5f9'; // Default slate-100
        let progressColor = '#64748b'; // Default slate-500

        if (item.status === 'done') {
            color = '#d1fae5'; // emerald-100
            progressColor = '#10b981'; // emerald-500
        } else if (item.status === 'active') {
            color = '#fef9c3'; // yellow-100
            progressColor = '#eab308'; // yellow-500
        } else if (item.status === 'delayed') {
            color = '#fee2e2'; // red-100
            progressColor = '#ef4444'; // red-500
        }

        // Special styling for Level 0 (Phases)
        if (item.level === 0) {
            color = '#e2e8f0'; // slate-200
            progressColor = '#334155'; // slate-700
        }

        return {
            start: startDate,
            end: endDate,
            name: item.name,
            id: item.id || Math.random().toString(),
            type: item.level === 0 ? 'project' : 'task',
            progress: item.progress,
            isDisabled: true,
            styles: {
                backgroundColor: color,
                progressColor: progressColor,
                progressSelectedColor: progressColor,
                backgroundSelectedColor: color
            }
        };
    });

    if (tasks.length === 0) {
        return <div className="p-8 text-center text-slate-500">Chưa có dữ liệu tiến độ để hiển thị Gantt chart.</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
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
            <div className="overflow-x-auto -mx-6 px-6">
                <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    locale="vi"
                    columnWidth={viewMode === ViewMode.Month ? 350 : 100} // Wider columns
                    listCellWidth="300px" // Wider list column
                    barFill={60}
                    barCornerRadius={4}
                    rowHeight={55} // More breathy rows
                    projectBackgroundColor="#f8fafc"
                    projectProgressColor="#475569"
                    projectProgressSelectedColor="#334155"
                    fontFamily="Inter, sans-serif"
                    fontSize="12px"
                    todayColor="rgba(252, 211, 77, 0.1)"
                />
            </div>
        </div>
    );
};

export default ProjectGantt;
