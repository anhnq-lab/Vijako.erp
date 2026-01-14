import * as L from 'leaflet';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue safely
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Handle potential ESM default issues
const Leaflet = (L as any).default || L;

const DefaultIcon = Leaflet.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Update prototype safely
if (Leaflet.Marker && Leaflet.Marker.prototype && Leaflet.Marker.prototype.options) {
    Leaflet.Marker.prototype.options.icon = DefaultIcon;
}

interface ProjectPoint {
    id: string;
    name: string;
    schedule_performance: 'ahead' | 'on_track' | 'delayed' | 'preparing' | 'completed';
    lat: number;
    lng: number;
    location: string;
}

const mockProjects: ProjectPoint[] = [
    { id: '1', name: 'Dự án Sun Urban City', schedule_performance: 'delayed', lat: 20.5422, lng: 105.9128, location: 'Phủ Lý, Hà Nam' },
    { id: '2', name: 'The Nine Tower', schedule_performance: 'completed', lat: 21.0360, lng: 105.7825, location: 'Cầu Giấy, Hà Nội' },
    { id: '3', name: 'Foxconn BG Factory', schedule_performance: 'on_track', lat: 21.2185, lng: 106.2015, location: 'Việt Yên, Bắc Giang' },
    { id: '4', name: 'Aeon Mall Vinh', schedule_performance: 'preparing', lat: 18.6735, lng: 105.6813, location: 'Vinh, Nghệ An' },
    { id: '5', name: 'Cầu Mỹ Thuận 2', schedule_performance: 'ahead', lat: 10.2742, lng: 105.9555, location: 'Tiền Giang' },
    { id: '6', name: 'Khu công nghiệp Trấn Yên', schedule_performance: 'preparing', lat: 21.7333, lng: 104.9167, location: 'Yên Bái' },
    { id: '7', name: 'Trường Tiểu học Tiên Sơn', schedule_performance: 'on_track', lat: 21.1856, lng: 106.1234, location: 'Bắc Ninh' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ahead': return '#14B8A6';    // Teal
        case 'on_track': return '#3B82F6'; // Blue
        case 'delayed': return '#EF4444';  // Red
        case 'preparing': return '#F59E0B';// Orange
        case 'completed': return '#64748B'; // Gray
        default: return '#94A3B8';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ahead': return 'Vượt tiến độ';
        case 'on_track': return 'Đúng tiến độ';
        case 'delayed': return 'Chậm tiến độ';
        case 'preparing': return 'Đang chuẩn bị';
        case 'completed': return 'Hoàn thành';
        default: return 'Không xác định';
    }
};

const createCustomIcon = (color: string) => {
    return new Leaflet.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -7]
    });
};

const ProjectMap = () => {
    // Center of Vietnam roughly
    const center: [number, number] = [16.0471, 108.2062];

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-100 relative group">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mockProjects.map(project => (
                    <Marker
                        key={project.id}
                        position={[project.lat, project.lng]}
                        icon={createCustomIcon(getStatusColor(project.schedule_performance))}
                    >
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{project.name}</h4>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {project.location}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="size-2 rounded-full"
                                        style={{ backgroundColor: getStatusColor(project.schedule_performance) }}
                                    ></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getStatusColor(project.schedule_performance) }}>
                                        {getStatusLabel(project.schedule_performance)}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ScaleControl position="bottomleft" />
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-xl pointer-events-none sm:pointer-events-auto min-w-[140px]">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">CHÚ THÍCH TIẾN ĐỘ</h5>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#14B8A6]"></span>
                        <span className="text-xs font-bold text-slate-700">Vượt tiến độ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#3B82F6]"></span>
                        <span className="text-xs font-bold text-slate-700">Đúng tiến độ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#EF4444]"></span>
                        <span className="text-xs font-bold text-slate-700">Chậm tiến độ</span>
                    </div>
                    <div className="flex items-center gap-2 border-t border-slate-50 pt-2 mt-1">
                        <span className="size-2.5 rounded-full bg-[#F59E0B]"></span>
                        <span className="text-xs font-medium text-slate-500 italic">Đang chuẩn bị</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#64748B]"></span>
                        <span className="text-xs font-medium text-slate-500 italic">Hoàn thành</span>
                    </div>
                </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">map</span>
                <span className="text-sm font-bold text-slate-900">BẢN ĐỒ VỊ TRÍ DỰ ÁN</span>
            </div>

            {/* Custom Zoom Controls */}
            <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2">
                <button className="size-8 bg-white border border-slate-200 rounded shadow-md flex items-center justify-center hover:bg-slate-50 text-slate-600" onClick={() => {
                    // Note: Internal leaflet access would be needed for a proper manual zoom button
                    // For now just placeholders or rely on default controls if zoomControl=true
                }}>
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <button className="size-8 bg-white border border-slate-200 rounded shadow-md flex items-center justify-center hover:bg-slate-50 text-slate-600">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
            </div>
        </div>
    );
};

export default ProjectMap;
