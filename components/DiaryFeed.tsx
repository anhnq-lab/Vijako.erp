import React, { useEffect, useState } from 'react';
import { diaryService } from '../src/services/diaryService';
import { DailyLog } from '../types';

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
                                    {log.status && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                log.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    log.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        'bg-slate-100 text-slate-500 border-slate-200' // Draft
                                            }`}>
                                            {log.status === 'Approved' ? 'Đã duyệt' :
                                                log.status === 'Submitted' ? 'Đã nộp' :
                                                    log.status === 'Rejected' ? 'Từ chối' : 'Nháp'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-slate-600 space-y-4">
                            {/* Work Content */}
                            <div>
                                <h5 className="text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">engineering</span>
                                    Nội dung công việc
                                </h5>
                                <p className="whitespace-pre-line pl-5 border-l-2 border-slate-100">{log.work_content}</p>
                            </div>

                            {/* Manpower Details */}
                            {log.manpower_details && log.manpower_details.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                        Chi tiết nhân lực
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2 pl-5">
                                        {log.manpower_details.map((m, idx) => (
                                            <div key={idx} className="flex justify-between text-xs bg-slate-50 p-1.5 rounded">
                                                <span>{m.role}</span>
                                                <span className="font-bold">{m.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Equipment Details */}
                            {log.equipment_details && log.equipment_details.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">agriculture</span>
                                        Máy móc thiết bị
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2 pl-5">
                                        {log.equipment_details.map((e, idx) => (
                                            <div key={idx} className="flex justify-between text-xs bg-slate-50 p-1.5 rounded border border-slate-100">
                                                <span>{e.name}</span>
                                                <span className={`font-bold ${e.status === 'Working' ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {e.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Safety & Issues */}
                            {(log.issues || log.safety_details) && (
                                <div className="space-y-2">
                                    {log.safety_details && (
                                        <div className="p-2 bg-orange-50 text-orange-800 rounded text-xs border border-orange-100 flex gap-2">
                                            <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                                            <div>
                                                <span className="font-bold">An toàn: </span>
                                                {log.safety_details}
                                            </div>
                                        </div>
                                    )}
                                    {log.issues && (
                                        <div className="p-2 bg-red-50 text-red-700 rounded text-xs border border-red-100 flex gap-2">
                                            <span className="material-symbols-outlined text-[16px]">warning</span>
                                            <div>
                                                <span className="font-bold">Sự cố/Vướng mắc: </span>
                                                {log.issues}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {log.images && log.images.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">Hình ảnh thực tế</h5>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {log.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Site photo ${idx}`}
                                            className="h-24 w-auto object-cover rounded-lg border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div >
    );
};

export default DiaryFeed;
