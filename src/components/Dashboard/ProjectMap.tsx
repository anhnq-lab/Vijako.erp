import React, { useEffect, useRef, useState } from 'react';

interface ProjectPoint {
    id: string;
    name: string;
    code: string;
    schedule_performance: 'ahead' | 'on_track' | 'delayed' | 'preparing' | 'completed';
    lat: number;
    lng: number;
    location: string;
    manager?: string;
}

const mockProjects: ProjectPoint[] = [
    { id: '1', code: 'P-ZEN', name: 'The Zen - Gamuda Garden', schedule_performance: 'completed', lat: 20.9735, lng: 105.8642, location: 'Hoàng Mai, Hà Nội', manager: 'Phạm Tuấn' },
    { id: '2', code: 'P-GREENSHADE', name: 'Nhà máy rèm Greenshade', schedule_performance: 'on_track', lat: 20.5833, lng: 105.9167, location: 'KCN Đồng Văn, Hà Nam', manager: 'Nguyễn Quốc Anh' },
    { id: '3', code: 'P-SKYLIGHT', name: 'Skylight City', schedule_performance: 'ahead', lat: 21.0285, lng: 105.8542, location: 'Hà Nội', manager: 'Trần Thị Bình' },
    { id: '4', code: 'P-CENTRAL', name: 'Central Park Residence', schedule_performance: 'delayed', lat: 10.7626, lng: 106.6602, location: 'TP. HCM', manager: 'Lê Hoàng Cường' },
    { id: '5', code: 'P-SUNURBAN', name: 'Sun Urban City Hà Nam', schedule_performance: 'on_track', lat: 20.5422, lng: 105.9128, location: 'Phủ Lý, Hà Nam', manager: 'Nguyễn Quốc Anh' },
    { id: '6', code: 'P-002', name: 'Nhà máy sản xuất linh kiện', schedule_performance: 'on_track', lat: 21.000, lng: 106.000, location: 'Bắc Ninh', manager: 'Vũ Minh Tuấn' },
    { id: '7', code: 'P-001', name: 'Vijako Tower', schedule_performance: 'delayed', lat: 21.0667, lng: 105.7917, location: 'Tây Hồ Tây, Hà Nội', manager: 'Nguyễn Quốc Anh' },
    { id: '8', code: 'P-002', name: 'KCN Trấn Yên', schedule_performance: 'on_track', lat: 21.7333, lng: 104.9167, location: 'Trấn Yên, Yên Bái', manager: 'Trần Văn Bình' },
    { id: '9', code: 'P-005', name: 'Trường Tiểu học Tiên Sơn', schedule_performance: 'completed', lat: 21.1856, lng: 106.1234, location: 'Việt Yên, Bắc Giang', manager: 'Ban chỉ huy Vijako' },
];

interface ProjectMapProps {
    projects?: any[];
}

const ProjectMap: React.FC<ProjectMapProps> = ({ projects }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Use projects prop or fallback to mock
    const mapData = projects && projects.length > 0 ? projects : mockProjects;

    const sendDataToMap = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_PROJECTS',
                projects: mapData
            }, '*');
        }
    };

    useEffect(() => {
        const handleMapMessage = (event: MessageEvent) => {
            if (event.data.type === 'MAP_READY') {
                setIsMapReady(true);
            }
        };

        window.addEventListener('message', handleMapMessage);
        return () => window.removeEventListener('message', handleMapMessage);
    }, []);

    useEffect(() => {
        if (isMapReady) {
            sendDataToMap();
        }
    }, [isMapReady, mapData]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-100 relative group">
            <iframe
                ref={iframeRef}
                src="/map.html"
                className="w-full h-full border-none"
                title="Project Map"
            />

            {/* Legend Overlay - Modern style */}
            <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl pointer-events-none sm:pointer-events-auto min-w-[150px]">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 border-b border-slate-100 pb-2">CHÚ THÍCH TIẾN ĐỘ</h5>
                <div className="space-y-2.5">
                    {[
                        { color: '#10B981', label: 'Vượt tiến độ' },
                        { color: '#3B82F6', label: 'Đúng tiến độ' },
                        { color: '#EF4444', label: 'Chậm tiến độ' },
                        { color: '#F59E0B', label: 'Đang chuẩn bị' },
                        { color: '#94A3B8', label: 'Hoàn thành' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full shadow-[0_0_8px] relative" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}44` }}>
                                <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: item.color }}></span>
                            </span>
                            <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-lg flex items-center gap-3">
                <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                    <span className="material-symbols-outlined text-white text-[18px]">explore</span>
                </div>
                <div>
                    <span className="block text-[10px] font-black text-blue-600 uppercase tracking-wider leading-none mb-1">Hệ thống Vijako ERP</span>
                    <span className="block text-sm font-black text-slate-800 leading-none">BẢN ĐỒ DỰ ÁN</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectMap;
