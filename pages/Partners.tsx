import React, { useState, useEffect } from 'react';
import { partnerService } from '../src/services/partnerService';
import { Partner } from '../types';
import { PermissionGate } from '../src/components/PermissionGate';
import { PERMISSIONS } from '../src/utils/permissions';
import { ExportButton } from '../src/components/ui/ExportComponents';

const PartnerModal = ({
    isOpen,
    onClose,
    partner,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    partner?: Partner | null;
    onSave: (data: Partial<Partner>) => Promise<void>;
}) => {
    const [formData, setFormData] = useState<Partial<Partner>>({
        type: 'customer',
        status: 'active',
        rating: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (partner) {
            setFormData(partner);
        } else {
            setFormData({
                type: 'customer',
                status: 'active',
                rating: 0
            });
        }
    }, [partner, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-900">
                        {partner ? 'Chỉnh sửa Đối tác' : 'Thêm Đối tác mới'}
                    </h2>
                    <button onClick={onClose} className="size-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Mã đối tác <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                value={formData.code || ''}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="VD: CUS001"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Loại đối tác</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="customer">Khách hàng (Chủ đầu tư)</option>
                                <option value="supplier">Nhà cung cấp</option>
                                <option value="subcontractor">Nhà thầu phụ</option>
                                <option value="team">Tổ đội thi công</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tên đối tác <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Tên công ty / tổ đội..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Mã số thuế</label>
                            <input
                                type="text"
                                value={formData.tax_code || ''}
                                onChange={e => setFormData({ ...formData, tax_code: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Người liên hệ</label>
                            <input
                                type="text"
                                value={formData.contact_person || ''}
                                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Đánh giá (Sao)</label>
                            <select
                                value={formData.rating}
                                onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="0">Chưa đánh giá</option>
                                <option value="1">1 Sao - Kém</option>
                                <option value="2">2 Sao - Trung bình</option>
                                <option value="3">3 Sao - Khá</option>
                                <option value="4">4 Sao - Tốt</option>
                                <option value="5">5 Sao - Xuất sắc</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2"
                        >
                            {loading && <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <span>Lưu thông tin</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Partners() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'customer' | 'supplier' | 'subcontractor' | 'team'>('customer');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const data = await partnerService.getAllPartners();
            setPartners(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPartners();
    }, []);

    const filteredPartners = partners.filter(p => p.type === activeTab);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200/50 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">CRM System</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Quản lý Đối tác
                        <span className="size-2 rounded-full bg-blue-500 animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Danh sách Khách hàng, Nhà cung cấp và Thầu phụ</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton
                        data={filteredPartners}
                        filename={`partners-${activeTab}`}
                        title="Xuất Excel"
                    />
                    <PermissionGate allowedRoles={PERMISSIONS.MANAGE_USERS} showError>
                        <button
                            onClick={() => {
                                setEditingPartner(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-light shadow-premium transition-premium"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Thêm mới</span>
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    {/* Tabs */}
                    <div className="flex items-center p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                        {[
                            { id: 'customer', label: 'Khách hàng', icon: 'storefront' },
                            { id: 'supplier', label: 'Nhà cung cấp', icon: 'inventory_2' },
                            { id: 'subcontractor', label: 'Thầu phụ', icon: 'engineering' },
                            { id: 'team', label: 'Tổ đội', icon: 'groups' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-premium ${activeTab === tab.id
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-primary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-glass overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã & Tên</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin khác</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đánh giá</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPartners.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {p.code}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mt-1 inline-block
                                                            ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                                        {p.contact_person || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                                                        {p.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-slate-700 truncate max-w-[200px]" title={p.address}>
                                                        {p.address || 'Chưa cập nhật địa chỉ'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono">
                                                        MST: {p.tax_code || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-0.5 text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${i < p.rating ? 1 : 0}` }}>
                                                            star
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setEditingPartner(p);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="size-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPartners.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400">
                                                Chưa có dữ liệu đối tác
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <PartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partner={editingPartner}
                onSave={async (data) => {
                    if (editingPartner) {
                        await partnerService.updatePartner(editingPartner.id, data);
                    } else {
                        await partnerService.createPartner(data as any);
                    }
                    loadPartners();
                }}
            />
        </div>
    );
}
