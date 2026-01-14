import React, { useState, useEffect } from 'react';
import { alertService } from '../src/services/alertService';
import { Alert, AlertType, AlertSeverity } from '../types';

const SeverityBadge = ({ severity }: { severity: AlertSeverity }) => {
    const styles = {
        low: 'bg-blue-50 text-blue-700 border-blue-200',
        medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        high: 'bg-orange-50 text-orange-700 border-orange-200',
        critical: 'bg-red-50 text-red-700 border-red-200 animate-pulse'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[severity]}`}>
            {severity}
        </span>
    );
};

const AlertIcon = ({ type }: { type: AlertType }) => {
    switch (type) {
        case 'deadline': return <span className="material-symbols-outlined text-orange-500">alarm</span>;
        case 'risk': return <span className="material-symbols-outlined text-red-500">warning</span>;
        case 'document': return <span className="material-symbols-outlined text-blue-500">folder_open</span>;
        case 'contract': return <span className="material-symbols-outlined text-purple-500">description</span>;
        case 'approval': return <span className="material-symbols-outlined text-green-500">verified_user</span>;
        case 'safety': return <span className="material-symbols-outlined text-yellow-600">engineering</span>;
        default: return <span className="material-symbols-outlined">notifications</span>;
    }
};

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<AlertType | 'all'>('all');

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await alertService.getAllAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await alertService.markAsRead(id);
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    };

    const handleDismiss = async (id: string) => {
        await alertService.dismissAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center shrink-0 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trung tâm Cảnh báo</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Quản lý và xử lý các thông báo quan trọng trong hệ thống</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadAlerts}
                        className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                    <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        Cấu hình
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col p-8 gap-6">
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tổng cảnh báo</p>
                        <h3 className="text-3xl font-black text-slate-900">{alerts.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-red-500">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Critical/High</p>
                        <h3 className="text-3xl font-black text-red-600">
                            {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chưa đọc</p>
                        <h3 className="text-3xl font-black text-primary">
                            {alerts.filter(a => !a.is_read).length}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sắp đến hạn</p>
                        <h3 className="text-3xl font-black text-orange-500">
                            {alerts.filter(a => a.type === 'deadline').length}
                        </h3>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
                    {['all', 'deadline', 'risk', 'document', 'contract', 'approval', 'safety'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'
                                }`}
                        >
                            {f === 'all' ? 'Tất cả' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-[48px] text-slate-300 animate-spin">refresh</span>
                            <p className="text-slate-400 font-bold mt-4">Nạp dữ liệu cảnh báo...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-[64px] text-slate-200">notifications_off</span>
                            <p className="text-slate-400 font-bold mt-4">Không có cảnh báo nào cần xử lý</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`bg-white p-6 rounded-2xl border transition-all group flex gap-5 items-start ${alert.is_read ? 'border-slate-100 opacity-80' : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 ring-inset ring-primary/5 hover:ring-2'
                                        }`}
                                >
                                    <div className={`size-12 rounded-2xl shrink-0 flex items-center justify-center ${alert.severity === 'critical' ? 'bg-red-50' :
                                            alert.severity === 'high' ? 'bg-orange-50' : 'bg-blue-50'
                                        }`}>
                                        <AlertIcon type={alert.type} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <SeverityBadge severity={alert.severity} />
                                            {alert.project_name && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.project_name}</span>
                                            )}
                                            <span className="text-[10px] text-slate-400 ml-auto font-mono">
                                                {new Date(alert.created_at).toLocaleString('vi-VN')}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">{alert.title}</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{alert.description}</p>

                                        {alert.due_date && (
                                            <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                <span className="material-symbols-outlined text-[16px] text-orange-500">event</span>
                                                <span className="text-xs font-bold text-slate-600">Hạn chót: {new Date(alert.due_date).toLocaleString('vi-VN')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        {!alert.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(alert.id)}
                                                className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all border border-primary/20"
                                            >
                                                Đã đọc
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDismiss(alert.id)}
                                            className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                                        >
                                            Bỏ qua
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
