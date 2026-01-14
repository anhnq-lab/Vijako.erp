import React, { useState, useEffect } from 'react';
import { diaryService } from '../src/services/diaryService';
import { DailyLog, DiaryStatus, ManpowerDetail, EquipmentDetail } from '../types';

interface DiaryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    projectId: string;
    existingLog?: DailyLog | null;
}

const parseWeather = (weather: any) => {
    if (!weather) return { temp: 25, condition: 'Nắng', humidity: 70 };
    return weather;
};

export default function DiaryFormModal({ isOpen, onClose, onSaved, projectId, existingLog }: DiaryFormModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weather, setWeather] = useState({ temp: 25, condition: 'Nắng', humidity: 70 });
    const [workContent, setWorkContent] = useState('');
    const [issues, setIssues] = useState('');
    const [manpowerDetails, setManpowerDetails] = useState<ManpowerDetail[]>([]);
    const [equipmentDetails, setEquipmentDetails] = useState<EquipmentDetail[]>([]);
    const [safetyDetails, setSafetyDetails] = useState('');
    const [status, setStatus] = useState<DiaryStatus>('Draft');
    const [images, setImages] = useState<string[]>([]);

    // UI Helpers
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (existingLog) {
                setDate(existingLog.date);
                setWeather(parseWeather(existingLog.weather));
                setWorkContent(existingLog.work_content || '');
                setIssues(existingLog.issues || '');
                setManpowerDetails(existingLog.manpower_details || []);
                setEquipmentDetails(existingLog.equipment_details || []);
                setSafetyDetails(existingLog.safety_details || '');
                setStatus(existingLog.status || 'Draft');
                setImages(existingLog.images || []);
            } else {
                // Reset for new log
                setDate(new Date().toISOString().split('T')[0]);
                setWeather({ temp: 28, condition: 'Nắng', humidity: 75 });
                setWorkContent('');
                setIssues('');
                setManpowerDetails([]);
                setEquipmentDetails([]);
                setSafetyDetails('');
                setStatus('Draft');
                setImages([]);
            }
        }
    }, [isOpen, existingLog]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const totalManpower = manpowerDetails.reduce((sum, item) => sum + (parseInt(String(item.count)) || 0), 0);

            const logData = {
                project_id: projectId,
                date,
                weather,
                work_content: workContent,
                issues,
                manpower_total: totalManpower,
                manpower_details: manpowerDetails,
                equipment_details: equipmentDetails,
                safety_details: safetyDetails,
                status,
                images,
                progress_update: {} // Placeholder
            };

            if (existingLog) {
                await diaryService.updateLog(existingLog.id, logData);
            } else {
                await diaryService.createLog(logData);
            }
            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi lưu nhật ký.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const url = await diaryService.uploadDiaryImage(projectId, file);
            if (url) {
                setImages(prev => [...prev, url]);
            }
        } catch (error) {
            alert('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    // Manpower Helpers
    const addManpower = () => setManpowerDetails([...manpowerDetails, { role: '', count: 1, notes: '' }]);
    const removeManpower = (idx: number) => setManpowerDetails(manpowerDetails.filter((_, i) => i !== idx));
    const updateManpower = (idx: number, field: keyof ManpowerDetail, value: any) => {
        const newDetails = [...manpowerDetails];
        newDetails[idx] = { ...newDetails[idx], [field]: value };
        setManpowerDetails(newDetails);
    };

    // Equipment Helpers
    const addEquipment = () => setEquipmentDetails([...equipmentDetails, { name: '', count: 1, status: 'Working', notes: '' }]);
    const removeEquipment = (idx: number) => setEquipmentDetails(equipmentDetails.filter((_, i) => i !== idx));
    const updateEquipment = (idx: number, field: keyof EquipmentDetail, value: any) => {
        const newDetails = [...equipmentDetails];
        newDetails[idx] = { ...newDetails[idx], [field]: value };
        setEquipmentDetails(newDetails);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {existingLog ? 'Cập nhật Nhật ký' : 'Viết Nhật ký Thi công'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Ngày báo cáo</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                            <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option value="Draft">Nháp</option>
                                <option value="Submitted">Đã nộp</option>
                                <option value="Approved">Đã duyệt</option>
                                <option value="Rejected">Từ chối</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                                <span className="material-symbols-outlined">wb_sunny</span>
                                Thời tiết
                            </label>
                        </div>
                    </div>

                    {/* Weather Details (Compact Row) */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                            <label className="text-xs text-slate-500">Nhiệt độ (°C)</label>
                            <input type="number" value={weather.temp} onChange={e => setWeather({ ...weather, temp: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Thời tiết</label>
                            <input type="text" value={weather.condition} onChange={e => setWeather({ ...weather, condition: e.target.value })} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Độ ẩm (%)</label>
                            <input type="number" value={weather.humidity} onChange={e => setWeather({ ...weather, humidity: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-sm" />
                        </div>
                    </div>

                    {/* Work Content */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung công việc đã thực hiện</label>
                        <textarea
                            rows={5}
                            value={workContent}
                            onChange={e => setWorkContent(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="- Lắp đặt cốt thép dầm sàn tầng 3..."
                        ></textarea>
                    </div>

                    {/* Manpower */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">Nhân lực (Manpower)</label>
                            <button onClick={addManpower} className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors">+ Thêm</button>
                        </div>
                        {manpowerDetails.map((item, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-start">
                                <input placeholder="Chức danh / Tổ đội" value={item.role} onChange={e => updateManpower(idx, 'role', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" />
                                <input type="number" placeholder="Số lượng" value={item.count} onChange={e => updateManpower(idx, 'count', parseInt(e.target.value))} className="w-20 px-3 py-2 border border-slate-300 rounded text-sm" />
                                <input placeholder="Ghi chú" value={item.notes} onChange={e => updateManpower(idx, 'notes', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" />
                                <button onClick={() => removeManpower(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </div>
                        ))}
                        {manpowerDetails.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có thông tin nhân lực.</p>}
                    </div>

                    {/* Equipment */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">Máy móc thiết bị (Equipment)</label>
                            <button onClick={addEquipment} className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors">+ Thêm</button>
                        </div>
                        {equipmentDetails.map((item, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-start">
                                <input placeholder="Tên thiết bị" value={item.name} onChange={e => updateEquipment(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" />
                                <input type="number" placeholder="SL" value={item.count} onChange={e => updateEquipment(idx, 'count', parseInt(e.target.value))} className="w-16 px-3 py-2 border border-slate-300 rounded text-sm" />
                                <select value={item.status} onChange={e => updateEquipment(idx, 'status', e.target.value)} className="w-32 px-3 py-2 border border-slate-300 rounded text-sm bg-white">
                                    <option value="Working">HĐ Tốt</option>
                                    <option value="Maintenance">Bảo trì</option>
                                    <option value="Idle">Chờ việc</option>
                                </select>
                                <button onClick={() => removeEquipment(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </div>
                        ))}
                        {equipmentDetails.length === 0 && <p className="text-xs text-slate-400 italic">Chưa có thông tin thiết bị.</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Issues */}
                        <div>
                            <label className="block text-sm font-bold text-red-600 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                Sự cố / Vướng mắc
                            </label>
                            <textarea
                                rows={3}
                                value={issues}
                                onChange={e => setIssues(e.target.value)}
                                className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Mô tả sự cố nếu có..."
                            ></textarea>
                        </div>
                        {/* Safety */}
                        <div>
                            <label className="block text-sm font-bold text-orange-600 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                                An toàn lao động
                            </label>
                            <textarea
                                rows={3}
                                value={safetyDetails}
                                onChange={e => setSafetyDetails(e.target.value)}
                                className="w-full px-3 py-2 border border-orange-200 bg-orange-50 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Ghi nhận an toàn..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Hình ảnh thực tế</label>
                        <div className="flex flex-wrap gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group w-24 h-24">
                                    <img src={img} alt="diary" className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm" />
                                    <button
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                            <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
                                        <span className="text-xs text-slate-500 mt-1">Upload</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        {loading ? 'Đang lưu...' : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Lưu Nhật Ký
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
