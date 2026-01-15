import React, { useState, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { Attendance, Employee } from '../types';

export interface AttendanceLocation {
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
    attendanceData?: (Attendance & { employee?: Employee })[];
    siteCenter?: { lat: number; lng: number };
    geofenceRadius?: number;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Default Vijako Tower coordinates
const DEFAULT_CENTER = {
    lat: 21.0285,
    lng: 105.8542
};

// Default geofence radius in meters
const DEFAULT_GEOFENCE_RADIUS = 200;

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const AttendanceMap: React.FC<AttendanceMapProps> = ({
    onCheckIn,
    attendanceData = [],
    siteCenter = DEFAULT_CENTER,
    geofenceRadius = DEFAULT_GEOFENCE_RADIUS
}) => {
    const [selectedMarker, setSelectedMarker] = useState<AttendanceLocation | null>(null);
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey
    });

    // Transform attendance data to location markers
    const attendanceLocations: AttendanceLocation[] = useMemo(() => {
        return attendanceData
            .filter(att => att.location_lat && att.location_lng) // Only include records with GPS
            .map(att => {
                const distance = calculateDistance(
                    siteCenter.lat,
                    siteCenter.lng,
                    att.location_lat!,
                    att.location_lng!
                );
                const checkInTime = new Date(att.check_in);
                const timeString = checkInTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return {
                    id: att.id,
                    employeeName: att.employee?.full_name || 'Unknown',
                    employeeCode: att.employee?.employee_code || 'N/A',
                    lat: att.location_lat!,
                    lng: att.location_lng!,
                    timestamp: timeString,
                    isInGeofence: distance <= geofenceRadius
                };
            });
    }, [attendanceData, siteCenter, geofenceRadius]);

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

    // Show message if no attendance data
    if (attendanceLocations.length === 0) {
        return (
            <div className="relative w-full h-full">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={siteCenter}
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
                        center={siteCenter}
                        radius={geofenceRadius}
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
                        position={siteCenter}
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
                </GoogleMap>

                {/* No Data Overlay */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600">Chưa có dữ liệu check-in hôm nay</p>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Chú thích</h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full bg-blue-600 border-2 border-white"></div>
                            <span className="text-[10px] text-slate-600">Vị trí công trường</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full border-2 border-blue-600 bg-blue-600/10"></div>
                            <span className="text-[10px] text-slate-600">Vùng geofence ({geofenceRadius}m)</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={siteCenter}
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
                    center={siteCenter}
                    radius={geofenceRadius}
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
                    position={siteCenter}
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
                {attendanceLocations.map((location) => (
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

            {/* Count Overlay */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">group</span>
                    <span className="text-sm font-bold text-slate-900">{attendanceLocations.length} nhân viên</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                    {attendanceLocations.filter(l => l.isInGeofence).length} trong khu vực • {attendanceLocations.filter(l => !l.isInGeofence).length} ngoài khu vực
                </p>
            </div>

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
                        <span className="text-[10px] text-slate-600">Vùng geofence ({geofenceRadius}m)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMap;
