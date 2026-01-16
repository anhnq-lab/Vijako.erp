import React, { useState } from 'react';
import { MaterialRequest, MaterialRequestItem, Project } from '../../../types';
import { supplyChainService } from '../../services/supplyChainService';
import { useAuth } from '../../context/AuthContext';

interface PurchaseRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onSave: () => void;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ isOpen, onClose, projects, onSave }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form Data
    const [projectId, setProjectId] = useState(projects[0]?.id || '');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent' | 'Low'>('Normal');
    const [deliveryDate, setDeliveryDate] = useState('');

    // Items
    const [items, setItems] = useState<Partial<MaterialRequestItem>[]>([
        { item_name: '', unit: '', quantity: 1, notes: '' }
    ]);

    const handleAddItem = () => {
        setItems([...items, { item_name: '', unit: '', quantity: 1, notes: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleUpdateItem = (index: number, field: keyof MaterialRequestItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await supplyChainService.createRequest({
                project_id: projectId,
                title,
                priority,
                delivery_date: deliveryDate,
                requester_id: user?.employee_id // Link to current user
            }, items);

            alert('Đã gửi yêu cầu vật tư thành công!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">add_shopping_cart</span> Tạo Yêu cầu Vật tư (PR)
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Dự án</label>
                            <select
                                required
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold"
                            >
                                <option value="">Chọn dự án...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Mức độ ưu tiên</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm"
                            >
                                <option value="Low">Thấp</option>
                                <option value="Normal">Bình thường</option>
                                <option value="High">Cao</option>
                                <option value="Urgent">Khẩn cấp</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Tiêu đề yêu cầu</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="V/v: Cấp vật tư thép sàn tầng 5..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Ngày cần hàng</label>
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm"
                        />
                    </div>

                    {/* Items List */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Danh sách vật tư</label>
                            <button type="button" onClick={handleAddItem} className="text-xs font-bold text-primary hover:underline">+ Thêm dòng</button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <input
                                            required
                                            placeholder="Tên vật tư..."
                                            value={item.item_name}
                                            onChange={(e) => handleUpdateItem(index, 'item_name', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            placeholder="ĐVT..."
                                            value={item.unit}
                                            onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            required
                                            type="number"
                                            placeholder="SL"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-red-500">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-light shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </div>
        </div>
    );
};
