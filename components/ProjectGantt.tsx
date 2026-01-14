import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { WBSItem } from '../types';

interface ProjectGanttProps {
    items: WBSItem[];
}

const ProjectGantt: React.FC<ProjectGanttProps> = ({ items }) => {
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Month);
    const [tasks, setTasks] = React.useState<Task[]>([]);

    React.useEffect(() => {
        const mappedTasks: Task[] = items.map((item, index) => {
            const startDate = item.start_date ? new Date(item.start_date) : new Date();
            const endDate = item.end_date ? new Date(item.end_date) : new Date();

            // Fix invalid dates
            if (isNaN(startDate.getTime())) {
                const now = new Date();
                startDate.setTime(now.getTime());
            }
            if (isNaN(endDate.getTime())) {
                const now = new Date();
                endDate.setTime(now.getTime());
            }
            if (endDate < startDate) {
                endDate.setTime(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 day
            }

            let styles = {
                backgroundColor: '#94a3b8', // Slate-400 (Default/Pending)
                progressColor: '#475569', // Slate-600
                backgroundSelectedColor: '#94a3b8',
                progressSelectedColor: '#475569',
            };

            if (item.status === 'done') {
                styles = {
                    backgroundColor: '#d1fae5', // Emerald-100
                    progressColor: '#10b981', // Emerald-500
                    backgroundSelectedColor: '#d1fae5',
                    progressSelectedColor: '#10b981',
                };
            } else if (item.status === 'active') {
                styles = {
                    backgroundColor: '#e0e7ff', // Indigo-100
                    progressColor: '#6366f1', // Indigo-500
                    backgroundSelectedColor: '#e0e7ff',
                    progressSelectedColor: '#6366f1',
                };
            } else if (item.status === 'delayed') {
                styles = {
                    backgroundColor: '#ffe4e6', // Rose-100
                    progressColor: '#f43f5e', // Rose-500
                    backgroundSelectedColor: '#ffe4e6',
                    progressSelectedColor: '#f43f5e',
                };
            }

            // Special styling for Level 0 (Phases)
            if (item.level === 0) {
                styles = {
                    backgroundColor: '#1e293b', // Slate-800
                    progressColor: '#0f172a', // Slate-900
                    backgroundSelectedColor: '#1e293b',
                    progressSelectedColor: '#0f172a',
                };
            }

            // Generate WBS Code mock if missing (just for display if not provided)
            // Assuming simplified flat list mapping for now, ideally backend provides it
            const wbsCode = item.wbs_code || `${index + 1}`;

            return {
                start: startDate,
                end: endDate,
                name: item.name,
                id: item.id || `task-${index}`,
                type: item.level === 0 ? 'project' : 'task',
                progress: item.progress,
                isDisabled: true, // Disable editing for now
                styles: styles,
                // Custom field for WBS to use in custom list
                // We'll access this by finding the original item or attaching it if possible.
                // But Task interface is strict. We can prepend to name in worst case or look up by ID.
            };
        });
        setTasks(mappedTasks);
    }, [items]);

    // Custom List Header
    const TaskListHeader: React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string; }> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
        return (
            <div
                style={{
                    height: headerHeight,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    width: rowWidth,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #e2e8f0', // Slate-200
                    backgroundColor: '#f8fafc', // Slate-50
                    fontWeight: 'bold',
                    color: '#475569', // Slate-600
                }}
            >
                <div style={{ width: '60px', minWidth: '60px', paddingLeft: '16px', borderRight: '1px solid #f1f5f9' }}>WBS</div>
                <div style={{ flex: 1, paddingLeft: '16px' }}>Hạng mục công việc</div>
            </div>
        );
    };

    // Custom List Table
    const TaskListTable: React.FC<{
        rowHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
        tasks: Task[];
        selectedTaskId: string;
        setSelectedTask: (taskId: string) => void;
        onExpanderClick: (task: Task) => void;
    }> = ({ rowHeight, rowWidth, tasks, fontFamily, fontSize }) => {
        return (
            <div style={{ fontFamily: fontFamily, fontSize: fontSize, width: rowWidth }}>
                {tasks.map((task, i) => {
                    // Find original item to get WBS code or use index
                    const originalItem = items.find(item => (item.id || `task-${i}`) === task.id);
                    const wbsCode = originalItem?.wbs_code || `${i + 1}`;

                    return (
                        <div
                            key={task.id}
                            style={{
                                height: rowHeight,
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #f1f5f9', // Slate-100
                                backgroundColor: i % 2 === 0 ? '#ffffff' : '#fcfcfc',
                                cursor: 'default',
                                transition: 'background-color 0.2s',
                            }}
                            className="hover:bg-slate-50"
                        >
                            <div style={{
                                width: '60px',
                                minWidth: '60px',
                                paddingLeft: '16px',
                                fontWeight: '600',
                                color: '#64748b',
                                borderRight: '1px solid #f1f5f9'
                            }}>
                                {wbsCode}
                            </div>
                            <div style={{
                                flex: 1,
                                paddingLeft: '16px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: task.type === 'project' ? 'bold' : 'normal',
                                color: task.type === 'project' ? '#0f172a' : '#334155'
                            }}>
                                {task.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const CustomTooltip = ({ task, fontSize, fontFamily }: { task: Task; fontSize: string; fontFamily: string }) => {
        const startDate = task.start.toLocaleDateString('vi-VN');
        const endDate = task.end.toLocaleDateString('vi-VN');

        return (
            <div className="bg-white p-4 rounded-lg shadow-xl border border-slate-100 min-w-[240px]" style={{ fontFamily }}>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight flex-1 mr-4">{task.name}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${task.progress === 100 ? 'bg-emerald-100 text-emerald-700' :
                        task.progress > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {task.progress}%
                    </span>
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                        <span>Bắt đầu:</span>
                        <span className="font-medium text-slate-700">{startDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kết thúc:</span>
                        <span className="font-medium text-slate-700">{endDate}</span>
                    </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${task.progress}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    if (tasks.length === 0) {
        return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu Gantt chart...</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden min-h-[800px] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">calendar_month</span>
                    Biểu đồ Gantt
                </h3>

                {/* Modern Segmented Control */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode(ViewMode.Day)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Day
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Ngày
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Week)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Week
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Tuần
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Month)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.Month
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Tháng
                    </button>
                </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-lg flex-1">
                <Gantt
                    tasks={tasks}
                    viewMode={viewMode}
                    locale="vi"
                    columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 150 : 60}
                    listCellWidth="300px" // Reduced from typical wide width, handled by custom renderer
                    barFill={70}
                    barCornerRadius={6}
                    rowHeight={50}
                    fontFamily="Inter, sans-serif"
                    fontSize="13px"

                    projectBackgroundColor="#f1f5f9" // Slate-100
                    projectProgressColor="#cbd5e1" // Slate-300
                    projectProgressSelectedColor="#94a3b8" // Slate-400

                    todayColor="rgba(99, 102, 241, 0.1)" // Indigo-500 transparent

                    TooltipContent={CustomTooltip}
                    TaskListHeader={TaskListHeader}
                    TaskListTable={TaskListTable}
                />
            </div>
        </div>
    );
};

export default ProjectGantt;
