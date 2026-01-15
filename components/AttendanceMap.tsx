import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';

interface AttendanceLocation {
    id: string;
    employeeName: string;
    employeeCode: string;
    lat: number;
    lng: number;
    timestamp: string;
    isInGeofence: boolean;
}

interface AttendanceMapProps {
    onCheckIn?: () => void;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Vijako Tower coordinates (example - adjust as needed)
const center = {
    lat: 21.0285,
    lng: 105.8542
};

// Geofence radius in meters
const GEOFENCE_RADIUS = 200;

// Mock attendance data - replace with real data from props or API
const mockAttendanceLocations: AttendanceLocation[] = [
    {
        id: '1',
        employeeName: 'Lê Văn Trang',
        employeeCode: 'NV-001',
        lat: 21.0287,
        lng: 105.8545,
        timestamp: '08:15',
        isInGeofence: true
    },
    {
        id: '2',
        employeeName: 'Nguyễn Thị Mai',
        employeeCode: 'NV-002',
        lat: 21.0283,
        lng: 105.8540,
        timestamp: '08:20',
        isInGeofence: true
    },
    {
        id: '3',
        employeeName: 'Trần Văn Hùng',
        employeeCode: 'NV-003',
        lat: 21.0290,
        lng: 105.8548,
        timestamp: '08:25',
        isInGeofence: true
    },
    {
        id: '4',
        employeeName: 'Phạm Minh Tuấn',
        employeeCode: 'NV-004',
        lat: 21.0310,
        lng: 105.8580,
        timestamp: '08:30',
        isInGeofence: false
    }
];

const AttendanceMap: React.FC<AttendanceMapProps> = ({ onCheckIn }) => {
    const [selectedMarker, setSelectedMarker] = useState<AttendanceLocation | null>(null);
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey
    });

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center p-6">
                    <span className="material-symbols-outlined text-red-500 text-5xl mb-3">error</span>
                    <p className="text-sm text-slate-700 font-bold">Google Maps API key không được cấu hình</p>
                    <p className="text-xs text-slate-500 mt-1">Vui lòng thêm VITE_GOOGLE_API_KEY vào file .env.local</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center p-6">
                    <span className="material-symbols-outlined text-red-500 text-5xl mb-3">error</span>
                    <p className="text-sm text-slate-700 font-bold">Lỗi khi tải Google Maps</p>
                    <p className="text-xs text-slate-500 mt-1">{loadError.message}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-100">
                <div className="text-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-slate-700 font-bold">Đang tải bản đồ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={16}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                }}
            >
                {/* Geofence Circle */}
                <Circle
                    center={center}
                    radius={GEOFENCE_RADIUS}
                    options={{
                        fillColor: '#1f3f89',
                        fillOpacity: 0.1,
                        strokeColor: '#1f3f89',
                        strokeOpacity: 0.4,
                        strokeWeight: 2
                    }}
                />

                {/* Center Marker for Site */}
                <Marker
                    position={center}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#1f3f89',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }}
                    title="Vijako Tower"
                />

                {/* Employee Attendance Markers */}
                {mockAttendanceLocations.map((location) => (
                    <Marker
                        key={location.id}
                        position={{ lat: location.lat, lng: location.lng }}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: location.isInGeofence ? '#10b981' : '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                        }}
                        onClick={() => setSelectedMarker(location)}
                        animation={location.isInGeofence ? undefined : window.google.maps.Animation.BOUNCE}
                    />
                ))}

                {/* Info Window */}
                {selectedMarker && (
                    <InfoWindow
                        position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div className="p-2">
                            <p className="font-bold text-sm text-slate-900">{selectedMarker.employeeName}</p>
                            <p className="text-xs text-slate-500">{selectedMarker.employeeCode}</p>
                            <p className="text-xs text-slate-600 mt-1">Check-in: {selectedMarker.timestamp}</p>
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${selectedMarker.isInGeofence
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {selectedMarker.isInGeofence ? 'Trong khu vực' : 'Ngoài khu vực'}
                            </span>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Chú thích</h4>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-blue-600 border-2 border-white"></div>
                        <span className="text-[10px] text-slate-600">Vị trí công trường</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-full bg-green-500 border-2 border-white"></div>
                        <span className="text-[10px] text-slate-600">Nhân viên (trong khu vực)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-full bg-red-500 border-2 border-white"></div>
                        <span className="text-[10px] text-slate-600">Nhân viên (ngoài khu vực)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full border-2 border-blue-600 bg-blue-600/10"></div>
                        <span className="text-[10px] text-slate-600">Vùng geofence ({GEOFENCE_RADIUS}m)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMap;
