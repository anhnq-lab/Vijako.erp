
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ProjectPoint {
    id: string;
    name: string;
    status: 'preparing' | 'executing' | 'completed' | 'operating';
    lat: number;
    lng: number;
    location: string;
}

const mockProjects: ProjectPoint[] = [
    { id: '1', name: 'Dự án Sun Urban City', status: 'executing', lat: 20.5422, lng: 105.9128, location: 'Phủ Lý, Hà Nam' },
    { id: '2', name: 'The Nine Tower', status: 'completed', lat: 21.0360, lng: 105.7825, location: 'Cầu Giấy, Hà Nội' },
    { id: '3', name: 'Foxconn BG Factory', status: 'executing', lat: 21.2185, lng: 106.2015, location: 'Việt Yên, Bắc Giang' },
    { id: '4', name: 'Aeon Mall Vinh', status: 'preparing', lat: 18.6735, lng: 105.6813, location: 'Vinh, Nghệ An' },
    { id: '5', name: 'Cầu Mỹ Thuận 2', status: 'operating', lat: 10.2742, lng: 105.9555, location: 'Tiền Giang' },
    { id: '6', name: 'Khu công nghiệp Trấn Yên', status: 'preparing', lat: 21.7333, lng: 104.9167, location: 'Yên Bái' },
    { id: '7', name: 'Trường Tiểu học Tiên Sơn', status: 'executing', lat: 21.1856, lng: 106.1234, location: 'Bắc Ninh' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'preparing': return '#F97316'; // Orange
        case 'executing': return '#3B82F6'; // Blue
        case 'completed': return '#22C55E'; // Green
        case 'operating': return '#EF4444'; // Red
        default: return '#94A3B8';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'preparing': return 'Đang chuẩn bị';
        case 'executing': return 'Đang thực hiện';
        case 'completed': return 'Hoàn thành';
        case 'operating': return 'Vận hành';
        default: return 'Không xác định';
    }
};

const createCustomIcon = (color: string) => {
    return new L.DivIcon({
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
                        icon={createCustomIcon(getStatusColor(project.status))}
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
                                        style={{ backgroundColor: getStatusColor(project.status) }}
                                    ></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getStatusColor(project.status) }}>
                                        {getStatusLabel(project.status)}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ScaleControl position="bottomleft" />
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-lg pointer-events-none sm:pointer-events-auto">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">CHÚ THÍCH</h5>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#F97316]"></span>
                        <span className="text-xs font-medium text-slate-700">Đang chuẩn bị</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#3B82F6]"></span>
                        <span className="text-xs font-medium text-slate-700">Đang thực hiện</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#22C55E]"></span>
                        <span className="text-xs font-medium text-slate-700">Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-[#EF4444]"></span>
                        <span className="text-xs font-medium text-slate-700">Vận hành</span>
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
