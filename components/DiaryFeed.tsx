import React, { useEffect, useState } from 'react';
import { diaryService, DailyLog } from '../src/services/diaryService';

interface DiaryFeedProps {
    projectId: string;
}

const WeatherIcon = ({ condition }: { condition?: string }) => {
    // Simple mock mapping
    const icon = condition?.toLowerCase().includes('mưa') ? 'rainy' :
        condition?.toLowerCase().includes('nắng') ? 'sunny' : 'cloud';
    return <span className="material-symbols-outlined text-xl text-slate-500">{icon}</span>;
};

const DiaryFeed: React.FC<DiaryFeedProps> = ({ projectId }) => {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, [projectId]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await diaryService.getRecentLogs(projectId);
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500">Đang tải nhật ký...</div>;

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-2">menu_book</span>
                <p>Chưa có nhật ký nào.</p>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                    + Viết nhật ký hôm nay
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {logs.map((log) => (
                <div key={log.id} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-[-24px] before:w-0.5 before:bg-slate-200 last:before:hidden">
                    {/* Date Bubble */}
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                        {new Date(log.date).getDate()}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-slate-800">
                                    {new Date(log.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <div className="flex items-center gap-1">
                                        <WeatherIcon condition={log.weather?.condition} />
                                        <span>{log.weather?.temp}°C - {log.weather?.condition}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span>{log.manpower_total} nhân sự</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-slate-600 space-y-2">
                            <p className="whitespace-pre-line">{log.work_content}</p>
                            {log.issues && (
                                <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100 flex gap-2">
                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                    {log.issues}
                                </div>
                            )}
                        </div>

                        {log.images && log.images.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                {log.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Site photo ${idx}`}
                                        className="h-20 w-20 object-cover rounded-lg border border-slate-100 cursor-pointer hover:opacity-90"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DiaryFeed;
