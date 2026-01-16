import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/Breadcrumbs';
import { projectService } from '../services/projectService';
import { siteDiaryService } from '../services/siteDiaryService';
import { Project, DailyLog } from '../../types';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DailyLogModal } from '../components/SiteDiary/DailyLogModal';

export default function SiteDiary() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedLog, setSelectedLog] = useState<DailyLog | undefined>(undefined);

    // Load projects on mount
    useEffect(() => {
        const loadProjects = async () => {
            const data = await projectService.getAllProjects();
            setProjects(data);
            if (data.length > 0) {
                setSelectedProject(data[0].id);
            }
        };
        loadProjects();
    }, []);

    // Load logs when project or month changes
    useEffect(() => {
        if (!selectedProject) return;

        const loadLogs = async () => {
            setLoading(true);
            try {
                // In a real app, we would filter by month API-side
                const data = await siteDiaryService.getProjectLogs(selectedProject);
                setLogs(data);
            } catch (error) {
                console.error('Error loading logs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLogs();
    }, [selectedProject, currentMonth]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const getLogForDate = (date: Date) => {
        return logs.find(log => isSameDay(new Date(log.date), date));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Nhật ký Thi công
                        <span className="size-2 rounded-full bg-orange-500 animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Ghi nhận hoạt động công trường hàng ngày</p>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1400px] mx-auto">
                    {/* Calendar Grid */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-slate-800 capitalize">
                                Tháng {format(currentMonth, 'MM/yyyy', { locale: vi })}
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="p-2 hover:bg-slate-100 rounded-lg">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                                <div key={day} className="text-center text-sm font-bold text-slate-400 py-2">
                                    {day}
                                </div>
                            ))}

                            {daysInMonth.map(date => {
                                const log = getLogForDate(date);
                                const isToday = isSameDay(date, new Date());

                                return (
                                    <div
                                        key={date.toString()}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setSelectedLog(log);
                                            setIsModalOpen(true);
                                        }}
                                        className={`min-h-[120px] p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-md
                                            ${isToday ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-slate-100 bg-white'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}`}>
                                                {format(date, 'd')}
                                            </span>
                                            {log && (
                                                <span className={`size-2 rounded-full 
                                                    ${log.status === 'Approved' ? 'bg-emerald' :
                                                        log.status === 'Submitted' ? 'bg-amber-400' : 'bg-slate-300'}
                                                `} />
                                            )}
                                        </div>

                                        {log ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <span className="material-symbols-outlined text-[14px]">groups</span>
                                                    <span>{log.manpower_total || 0}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {log.weather?.condition || 'Chưa cập nhật'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-200">add</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedProject && (
                <DailyLogModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    date={selectedDate}
                    projectId={selectedProject}
                    existingLog={selectedLog}
                    onSave={() => {
                        // Refresh logs
                        const loadLogs = async () => {
                            try {
                                const data = await siteDiaryService.getProjectLogs(selectedProject);
                                setLogs(data);
                            } catch (error) {
                                console.error('Error refreshing logs:', error);
                            }
                        };
                        loadLogs();
                    }}
                />
            )}
        </div>
    );
}
