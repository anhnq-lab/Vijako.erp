import React, { useState, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, Area
} from 'recharts';
import { financeService, Contract, BankGuarantee, PaymentRequest, CashFlowData } from '../src/services/financeService';
import { biddingService } from '../src/services/biddingService';
import { projectService } from '../src/services/projectService';
import { Project, BiddingPackage } from '../types';
import { InvoiceScanModal } from '../components/InvoiceScanModal';
import { ExtractedInvoice } from '../src/services/invoiceService';

// --- Enhanced Data ---

// --- Constants (Still useful for structure) ---

const costStructureData = [
    { name: 'Vật tư (Materials)', value: 45, color: '#1f3f89' },
    { name: 'Nhân công (Labor)', value: 25, color: '#07883d' },
    { name: 'Máy (Equipment)', value: 15, color: '#FACC15' },
    { name: 'Thầu phụ (Sub-con)', value: 10, color: '#F97316' },
    { name: 'Khác (Overhead)', value: 5, color: '#94a3b8' },
];

const debtAgingData = [
    { name: 'Trong hạn', value: 25.5, color: '#07883d' },
    { name: '1-30 ngày', value: 8.2, color: '#FACC15' },
    { name: '31-60 ngày', value: 4.5, color: '#F97316' },
    { name: '> 60 ngày', value: 2.1, color: '#EF4444' },
];

// --- Sub-Components ---

const ContractDetailModal = ({ isOpen, onClose, contract }: { isOpen: boolean, onClose: () => void, contract: Contract | null }) => {
    if (!isOpen || !contract) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-black text-slate-900 text-xl">Chi tiết Hợp đồng</h3>
                        <p className="text-sm text-slate-500 font-mono">{contract.contract_code}</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-8 grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Đối tác / Nhà thầu</p>
                            <p className="font-bold text-slate-900 text-lg">{contract.partner_name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Giá trị Hợp đồng</p>
                            <p className="font-black text-primary text-2xl">{(contract.value || 0).toLocaleString()} ₫</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <p className="text-[10px] text-green-600 font-black uppercase mb-1">Đã thanh toán</p>
                                <p className="font-bold text-green-900">{(contract.paid_amount || 0).toLocaleString()} ₫</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Giữ lại (Retention)</p>
                                <p className="font-bold text-slate-900">{(contract.retention_amount || 0).toLocaleString()} ₫</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Trạng thái & Rủi ro</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${contract.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                                    {contract.status === 'active' ? 'ĐANG HIỆU LỰC' : 'ĐÃ THANH LÝ'}
                                </span>
                                {contract.is_risk && (
                                    <span className="px-3 py-1.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">warning</span> CÓ RỦI RO
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 italic">"Hợp đồng đang trong giai đoạn thanh toán đợt cuối. Cần kiểm tra hồ sơ hoàn công trước khi giải ngân phần giữ lại."</p>
                        </div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-black text-sm rounded-xl hover:bg-slate-50 transition-all">Đóng</button>
                    <button className="px-6 py-2.5 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Sửa thông tin</button>
                </div>
            </div>
        </div>
    );
};

const AddContractModal = ({ isOpen, onClose, onAdd, projects }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => void, projects: Project[] }) => {
    const [formData, setFormData] = useState({
        contract_code: '',
        partner_name: '',
        project_id: '',
        value: 0,
        paid_amount: 0,
        retention_amount: 0,
        status: 'active',
        is_risk: false
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-900 text-xl">Thêm Hợp đồng mới</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mã Hợp đồng</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            placeholder="Ví dụ: CT-2024-001"
                            value={formData.contract_code}
                            onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Đối tác / Nhà thầu</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            placeholder="Tên công ty hoặc cá nhân"
                            value={formData.partner_name}
                            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Thuộc Dự án</label>
                        <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                        >
                            <option value="">-- Chọn dự án --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Giá trị (VNĐ)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                        <input
                            type="checkbox"
                            className="size-4 text-primary border-slate-300 rounded focus:ring-primary"
                            checked={formData.is_risk}
                            onChange={(e) => setFormData({ ...formData, is_risk: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-red-700">Đánh dấu hợp đồng có rủi ro</span>
                    </div>
                </div>
                <div className="px-6 py-5 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-100 rounded-xl transition-all">Hủy</button>
                    <button
                        onClick={() => onAdd(formData)}
                        disabled={!formData.contract_code || !formData.project_id}
                        className="px-8 py-2.5 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lưu Hợp đồng
                    </button>
                </div>
            </div>
        </div>
    );
};

// === Bank Guarantee Modals ===
const GuaranteeDetailModal = ({ isOpen, onClose, guarantee, onDelete }: any) => {
    if (!isOpen || !guarantee) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div><h3 className="font-black text-slate-900 text-xl">Chi tiết Bảo lãnh</h3><p className="text-sm text-slate-500 font-mono">{guarantee.code}</p></div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Loại</p><p className="font-bold text-slate-900">{guarantee.type}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Ngân hàng</p><p className="font-bold text-slate-900">{guarantee.bank_name}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Dự án</p><p className="font-bold text-slate-900">{guarantee.project_name || 'N/A'}</p></div>
                    </div>
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Giá trị</p><p className="font-black text-primary text-xl">{guarantee.value?.toLocaleString()} ₫</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Ngày hết hạn</p><p className="font-bold text-slate-900">{new Date(guarantee.expiry_date).toLocaleDateString('vi-VN')}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Trạng thái</p><span className={`px-3 py-1 rounded-full text-xs font-bold ${guarantee.status === 'warning' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{guarantee.status === 'warning' ? 'Sắp hết hạn' : 'Còn hiệu lực'}</span></div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-50 flex justify-between bg-slate-50/30">
                    <button onClick={() => onDelete(guarantee.id)} className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl">Xóa</button>
                    <button onClick={onClose} className="px-6 py-2.5 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary/90">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const AddGuaranteeModal = ({ isOpen, onClose, onAdd, projects }: any) => {
    const [formData, setFormData] = useState({ code: '', type: 'Bảo lãnh thực hiện HĐ', bank_name: '', project_id: '', value: 0, expiry_date: '', status: 'active' });
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="font-black text-slate-900 text-xl">Thêm Bảo lãnh</h3><button onClick={onClose} className="text-slate-400"><span className="material-symbols-outlined">close</span></button></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Mã BL</label><input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Loại</label><select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option>Bảo lãnh thực hiện HĐ</option><option>Bảo lãnh dự thầu</option><option>Bảo lãnh bảo hành</option></select></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Ngân hàng</label><input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Dự án</label><select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}><option value="">-- Chọn --</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Giá trị (VNĐ)</label><input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Ngày hết hạn</label><input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} /></div>
                </div>
                <div className="px-6 py-5 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30"><button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-100 rounded-xl">Hủy</button><button onClick={() => onAdd(formData)} disabled={!formData.code} className="px-8 py-2.5 bg-primary text-white font-black text-sm rounded-xl disabled:opacity-50">Lưu</button></div>
            </div>
        </div>
    );
};

// === Payment Request Modal ===
const PaymentDetailModal = ({ isOpen, onClose, payment, onApprove, onReject }: any) => {
    if (!isOpen || !payment) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div><h3 className="font-black text-slate-900 text-xl">Chi tiết Yêu cầu TT</h3><p className="text-sm text-slate-500 font-mono">{payment.code}</p></div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Nhà thầu phụ</p><p className="font-bold text-slate-900 text-lg">{payment.partner_name || 'N/A'}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Dự án</p><p className="font-bold text-slate-900">{payment.project_name || 'N/A'}</p></div>
                    </div>
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Số tiền</p><p className="font-black text-primary text-2xl">{payment.amount?.toLocaleString()} ₫</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Trạng thái</p><span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'approved' ? 'bg-green-100 text-green-700' : payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{payment.status === 'approved' ? 'Đã duyệt' : payment.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}</span></div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-black text-sm rounded-xl">Đóng</button>
                    {payment.status === 'pending' && (<><button onClick={() => onReject(payment.id)} className="px-6 py-2.5 bg-red-500 text-white font-black text-sm rounded-xl">Từ chối</button><button onClick={() => onApprove(payment.id)} className="px-6 py-2.5 bg-green-500 text-white font-black text-sm rounded-xl">Duyệt</button></>)}
                </div>
            </div>
        </div>
    );
};

// === Bidding Package Modal ===
const BiddingDetailModal = ({ isOpen, onClose, pkg, onDelete, onPublish }: any) => {
    if (!isOpen || !pkg) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div><h3 className="font-black text-slate-900 text-xl">Chi tiết Gói thầu</h3><p className="text-sm text-slate-500">{pkg.title}</p></div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Tên gói</p><p className="font-bold text-slate-900 text-lg">{pkg.title}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Dự án</p><p className="font-bold text-slate-900">{pkg.project_name || 'N/A'}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Hạn nộp</p><p className="font-bold text-slate-900">{pkg.deadline}</p></div>
                    </div>
                    <div className="space-y-4">
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Ngân sách</p><p className="font-black text-primary text-2xl">{pkg.budget ? `${(pkg.budget / 1000000000).toFixed(1)} Tỷ` : 'N/A'}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase">Trạng thái</p><span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.status === 'published' ? 'bg-blue-100 text-blue-700' : pkg.status === 'awarded' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{pkg.status === 'published' ? 'Đang mời thầu' : pkg.status === 'awarded' ? 'Đã chọn' : 'Bản nháp'}</span></div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-50 flex justify-between bg-slate-50/30">
                    <button onClick={() => onDelete(pkg.id)} className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl">Xóa</button>
                    <div className="flex gap-3"><button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-black text-sm rounded-xl">Đóng</button>{pkg.status === 'draft' && <button onClick={() => onPublish(pkg.id)} className="px-6 py-2.5 bg-blue-500 text-white font-black text-sm rounded-xl">Công bố</button>}</div>
                </div>
            </div>
        </div>
    );
};

const AddBiddingModal = ({ isOpen, onClose, onAdd, projects }: any) => {
    const [formData, setFormData] = useState({ title: '', project_id: '', budget: 0, deadline: '', status: 'draft' });
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h3 className="font-black text-slate-900 text-xl">Tạo Gói thầu</h3><button onClick={onClose} className="text-slate-400"><span className="material-symbols-outlined">close</span></button></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Tên gói</label><input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Dự án</label><select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}><option value="">-- Chọn --</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Ngân sách (VNĐ)</label><input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Hạn nộp</label><input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} /></div>
                </div>
                <div className="px-6 py-5 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30"><button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-100 rounded-xl">Hủy</button><button onClick={() => onAdd(formData)} disabled={!formData.title} className="px-8 py-2.5 bg-primary text-white font-black text-sm rounded-xl disabled:opacity-50">Lưu</button></div>
            </div>
        </div>
    );
};

const ContractCard = ({ code, partner, value, paid, retention, warning, status, onViewDetail }: any) => {
    const paidPercent = Math.round((paid / value) * 100);
    return (
        <div className={`bg-white rounded-xl p-5 border ${warning ? 'border-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.15)] ring-1 ring-orange-100' : 'border-slate-100 shadow-sm'} flex flex-col hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">{code}</span>
                        {warning && <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse"><span className="material-symbols-outlined text-[10px]">warning</span> Risk</span>}
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1 text-sm" title={partner}>{partner}</h4>
                    <p className="text-xs text-slate-500">Dự án: The Manor Central Park</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {status === 'active' ? 'Hiệu lực' : 'Thanh lý'}
                </span>
            </div>

            <div className="space-y-4 flex-1">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Giá trị HĐ</span>
                        <span className="font-bold text-slate-900 text-sm">{value.toLocaleString()} ₫</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${paidPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-slate-500">
                        <span>Đã TT: {paidPercent}%</span>
                        <span className="font-bold text-primary">{paid.toLocaleString()} ₫</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-auto">
                    <div className="text-xs">
                        <p className="text-slate-400">Giữ lại (Retention)</p>
                        <p className="font-bold text-slate-700">{retention.toLocaleString()} ₫</p>
                    </div>
                    <button
                        onClick={onViewDetail}
                        className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                    >
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}

const PaymentRequestRow = ({ id, sub, project, amount, date, status, blocked, onView }: any) => (
    <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${blocked ? 'bg-red-50/30' : ''}`}>
        <td className="px-4 py-3 font-mono text-xs text-slate-500 font-bold">{id}</td>
        <td className="px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{sub}</p>
            {blocked && <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[12px]">block</span> Hồ sơ chất lượng thiếu</p>}
        </td>
        <td className="px-4 py-3 text-xs text-slate-600">{project}</td>
        <td className="px-4 py-3 text-sm font-bold text-slate-900">{amount}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{date}</td>
        <td className="px-4 py-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                {status === 'approved' ? 'Đã duyệt' : status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
            </span>
        </td>
        <td className="px-4 py-3 text-right">
            <button
                onClick={onView}
                className="size-8 rounded flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
        </td>
    </tr>
)

const GuaranteeRow = ({ code, type, project, bank, value, expiry, status, onView }: any) => {
    // Calculate progress for visual bar (mock logic)
    const progress = status === 'warning' ? 90 : 40;

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-mono text-xs text-slate-500 font-bold">{code}</td>
            <td className="px-4 py-3 text-sm font-bold text-slate-900">{type}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{project}</td>
            <td className="px-4 py-3 text-sm text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">account_balance</span>
                {bank}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-primary">{value}</td>
            <td className="px-4 py-3 w-48">
                <div className="flex justify-between text-[10px] mb-1">
                    <span className={status === 'warning' ? 'text-red-600 font-bold' : 'text-slate-500'}>{expiry}</span>
                    {status === 'warning' && <span className="text-red-600 font-bold">Sắp hết hạn</span>}
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${status === 'warning' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <button
                    onClick={onView}
                    className="size-8 rounded flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
                >
                    <span className="material-symbols-outlined">visibility</span>
                </button>
            </td>
        </tr>
    )
}

const BiddingPackageRow = ({ pkg, onView }: { pkg: BiddingPackage, onView: () => void }) => (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
        <td className="px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{pkg.title}</p>
            <p className="text-[10px] text-slate-500 font-mono italic">ID: {pkg.id.split('-')[0]}</p>
        </td>
        <td className="px-4 py-3 text-xs text-slate-600">
            {pkg.budget ? `${(pkg.budget / 1000000000).toFixed(1)} Tỷ` : 'N/A'}
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{pkg.deadline}</td>
        <td className="px-4 py-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${pkg.status === 'published' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                pkg.status === 'awarded' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                {pkg.status === 'published' ? 'Đang mời thầu' : pkg.status === 'awarded' ? 'Đã có kết quả' : 'Bản nháp'}
            </span>
        </td>
        <td className="px-4 py-3 text-right">
            <button
                onClick={onView}
                className="text-primary text-xs font-bold hover:underline"
            >
                Xem hồ sơ
            </button>
        </td>
    </tr>
);

const StatCard = ({ title, value, sub, icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className={`size-12 rounded-xl flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 my-1">{value}</h3>
            <p className="text-xs text-slate-500">{sub}</p>
        </div>
    </div>
)

const AIFinancialInsight = () => (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl p-6 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-5">
            <span className="material-symbols-outlined text-[150px]">psychology_alt</span>
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <span className="material-symbols-outlined text-[20px] text-yellow-300">auto_awesome</span>
                </span>
                <h3 className="font-bold text-lg">CFO Assistant Insight</h3>
            </div>

            <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Rủi ro thanh khoản</p>
                    <p className="text-sm font-medium">Dòng tiền ròng tháng 6 dự báo dương <span className="text-green-400 font-bold">+57 Tỷ</span>, nhưng áp lực chi trả cho nhà cung cấp Vật tư sẽ tăng mạnh vào tuần 3 (khoảng 22 Tỷ).</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-indigo-200 font-bold uppercase mb-1">Khuyến nghị tối ưu</p>
                    <p className="text-sm font-medium">Cân nhắc giải ngân sớm gói vay lưu động tại BIDV để hưởng lãi suất ưu đãi 6.2% trước ngày 15/06.</p>
                </div>
            </div>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400">Cập nhật: 5 phút trước</span>
            <button className="text-xs font-bold bg-white text-indigo-900 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors">Chi tiết</button>
        </div>
    </div>
)

export default function Finance() {
    const [activeTab, setActiveTab] = useState('contracts');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [biddingPackages, setBiddingPackages] = useState<BiddingPackage[]>([]);
    const [bankGuarantees, setBankGuarantees] = useState<BankGuarantee[]>([]);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [cashFlowRecords, setCashFlowRecords] = useState<CashFlowData[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // Guarantee Modal states
    const [isAddGuaranteeModalOpen, setIsAddGuaranteeModalOpen] = useState(false);
    const [isGuaranteeDetailModalOpen, setIsGuaranteeDetailModalOpen] = useState(false);
    const [selectedGuarantee, setSelectedGuarantee] = useState<BankGuarantee | null>(null);

    // Payment Request Modal states
    const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);

    // Bidding Modal states
    const [isAddBiddingModalOpen, setIsAddBiddingModalOpen] = useState(false);
    const [isBiddingDetailModalOpen, setIsBiddingDetailModalOpen] = useState(false);
    const [selectedBidding, setSelectedBidding] = useState<BiddingPackage | null>(null);

    // AI Scan Invoice Modal state
    const [isInvoiceScanModalOpen, setIsInvoiceScanModalOpen] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Helper to handle individual promises
            const wrap = async <T,>(p: Promise<T>, name: string): Promise<T | null> => {
                try {
                    return await p;
                } catch (err) {
                    console.error(`Failed to fetch ${name}:`, err);
                    setError(prev => (prev ? `${prev}, ${name}` : `Lỗi tải: ${name}`));
                    return null;
                }
            };

            const [cData, bData, bgData, prData, cfData, pData] = await Promise.all([
                wrap(financeService.getAllContracts(), 'Hợp đồng'),
                wrap(biddingService.getAllPackages(), 'Gói thầu'),
                wrap(financeService.getAllBankGuarantees(), 'Bảo lãnh'),
                wrap(financeService.getAllPaymentRequests(), 'Yêu cầu thanh toán'),
                wrap(financeService.getCashFlowData(), 'Dòng tiền'),
                wrap(projectService.getAllProjects(), 'Dự án')
            ]);

            if (cData) setContracts(cData);
            if (bData) setBiddingPackages(bData);
            if (bgData) setBankGuarantees(bgData);
            if (prData) setPaymentRequests(prData);
            if (cfData) setCashFlowRecords(cfData);
            if (pData) setProjects(pData);

            // If all failed, it's likely a connection issue
            if (!cData && !bData && !bgData && !prData && !cfData && !pData) {
                setError('Không thể kết nối với Supabase. Vui lòng kiểm tra biến môi trường hoặc kết nối mạng.');
            }
        } catch (err: any) {
            console.error('Critical failure in fetchData', err);
            setError('Lỗi hệ thống nghiêm trọng: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContract = async (data: any) => {
        try {
            await financeService.createContract(data);
            setIsAddModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi lưu hợp đồng');
        }
    };

    const handleViewDetail = (contract: Contract) => {
        setSelectedContract(contract);
        setIsDetailModalOpen(true);
    };

    // === Guarantee Handlers ===
    const handleAddGuarantee = async (data: any) => {
        try {
            await financeService.createBankGuarantee(data);
            setIsAddGuaranteeModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi lưu bảo lãnh');
        }
    };

    const handleViewGuarantee = (guarantee: BankGuarantee) => {
        setSelectedGuarantee(guarantee);
        setIsGuaranteeDetailModalOpen(true);
    };

    const handleDeleteGuarantee = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa bảo lãnh này?')) {
            try {
                await financeService.deleteBankGuarantee(id);
                setIsGuaranteeDetailModalOpen(false);
                fetchData();
            } catch (error) {
                alert('Lỗi khi xóa bảo lãnh');
            }
        }
    };

    // === Payment Handlers ===
    const handleViewPayment = (payment: PaymentRequest) => {
        setSelectedPayment(payment);
        setIsPaymentDetailModalOpen(true);
    };

    const handleApprovePayment = async (id: string) => {
        try {
            await financeService.approvePaymentRequest(id);
            setIsPaymentDetailModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi duyệt thanh toán');
        }
    };

    const handleRejectPayment = async (id: string) => {
        const reason = prompt('Lý do từ chối:');
        if (reason !== null) {
            try {
                await financeService.rejectPaymentRequest(id, reason);
                setIsPaymentDetailModalOpen(false);
                fetchData();
            } catch (error) {
                alert('Lỗi khi từ chối thanh toán');
            }
        }
    };

    // === Bidding Handlers ===
    const handleAddBidding = async (data: any) => {
        try {
            await biddingService.createPackage(data);
            setIsAddBiddingModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi tạo gói thầu');
        }
    };

    const handleViewBidding = (pkg: BiddingPackage) => {
        setSelectedBidding(pkg);
        setIsBiddingDetailModalOpen(true);
    };

    const handleDeleteBidding = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa gói thầu này?')) {
            try {
                await biddingService.deletePackage(id);
                setIsBiddingDetailModalOpen(false);
                fetchData();
            } catch (error) {
                alert('Lỗi khi xóa gói thầu');
            }
        }
    };

    const handlePublishBidding = async (id: string) => {
        try {
            await biddingService.publishPackage(id);
            setIsBiddingDetailModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi khi công bố gói thầu');
        }
    };

    const handleSaveScannedInvoice = async (data: ExtractedInvoice & { project_id: string }) => {
        try {
            // Create a new contract record for the invoice
            // In a real system, this might go to an 'Invoices' or 'Expenses' table
            // Given the current schema, we'll store it in 'contracts' to reflect in budget/financials
            await financeService.createContract({
                contract_code: data.invoice_code || `INV-${Date.now().toString().slice(-6)}`,
                partner_name: data.vendor_name,
                project_id: data.project_id,
                value: data.amount,
                paid_amount: data.amount, // Assume paid if it's an invoice being scanned
                retention_amount: 0,
                status: 'completed',
                type: data.type,
                budget_category: data.suggested_budget_category
            });

            fetchData();
            alert('Đã lưu hóa đơn vào hệ thống!');
        } catch (error) {
            console.error('Error saving scanned invoice:', error);
            alert('Lỗi khi lưu hóa đơn');
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light">
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0 shadow-sm z-10">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Quản lý Tài chính & Hợp đồng</h2>
                    <p className="text-sm text-slate-500 mt-1">Kiểm soát dòng tiền, hợp đồng A-B, B-B và thanh quyết toán.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span> Báo cáo
                    </button>
                    <button
                        onClick={() => setIsInvoiceScanModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span> Quét hóa đơn AI
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span> Tạo hợp đồng mới
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                <div className="max-w-[1600px] mx-auto space-y-8">

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard title="Tổng Doanh thu (YTD)" value="450.5 Tỷ" sub="Đạt 82% kế hoạch năm" icon="payments" color="bg-blue-50 text-blue-600" />
                        <StatCard title="Dư nợ Phải thu (AR)" value="85.2 Tỷ" sub="Quá hạn > 30 ngày: 12.5 Tỷ" icon="account_balance_wallet" color="bg-orange-50 text-orange-600" />
                        <StatCard title="Dư nợ Phải trả (AP)" value="42.8 Tỷ" sub="Đến hạn thanh toán tuần này: 5.2 Tỷ" icon="outbound" color="bg-red-50 text-red-600" />
                        <StatCard title="Dòng tiền mặt (Cash)" value="125.4 Tỷ" sub="Khả dụng: 85.4 Tỷ" icon="savings" color="bg-green-50 text-green-600" />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <span className="material-symbols-outlined shrink-0 text-red-600">error</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold">Lỗi kết nối dữ liệu</p>
                                <p className="text-xs opacity-80">{error}</p>
                            </div>
                            <button
                                onClick={() => fetchData()}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Advanced Analysis Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Cash Flow - Composed Chart */}
                        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        Biểu đồ Dòng tiền & Thanh khoản
                                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Đơn vị: Tỷ VNĐ</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-primary rounded-sm"></span> Dòng tiền vào
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-red-400 rounded-sm"></span> Dòng tiền ra
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="size-3 bg-yellow-400 rounded-full border border-slate-200"></span> Dòng tiền ròng (Net)
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cashFlowRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="thu" name="Tiền vào" fill="#1f3f89" radius={[4, 4, 0, 0]} barSize={16} />
                                        <Bar dataKey="chi" name="Tiền ra" fill="#f87171" radius={[4, 4, 0, 0]} barSize={16} />
                                        <Line type="monotone" dataKey="net" name="Dòng tiền ròng (Net)" stroke="#FACC15" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Insight & Cost Structure */}
                        <div className="xl:col-span-4 flex flex-col gap-6 min-h-[400px]">
                            {/* AI Card */}
                            <div className="flex-1">
                                <AIFinancialInsight />
                            </div>

                            {/* Mini Cost Structure */}
                            <div className="h-40 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                                <div className="size-32 relative flex-shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costStructureData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={55}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {costStructureData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Cấu trúc<br />Chi phí</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    {costStructureData.slice(0, 3).map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                                            </div>
                                            <span className="font-bold">{item.value}%</span>
                                        </div>
                                    ))}
                                    <button className="text-[10px] text-primary font-bold mt-1 hover:underline">Xem chi tiết</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area with Tabs */}
                    <div>
                        <div className="flex items-center gap-8 border-b border-slate-200 mb-6 font-bold text-sm">
                            {['contracts', 'bidding', 'guarantees', 'payables'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                        }`}
                                >
                                    {tab === 'contracts' && 'Hợp đồng Đầu ra (A-B)'}
                                    {tab === 'bidding' && 'Quản lý Đấu thầu (Bidding)'}
                                    {tab === 'guarantees' && 'Bảo lãnh (Bank Guarantees)'}
                                    {tab === 'payables' && 'Thanh toán & Công nợ'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'contracts' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {loading ? (
                                    <div className="col-span-full p-8 text-center text-slate-500">Đang tải hợp đồng...</div>
                                ) : contracts.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-slate-500">Chưa có hợp đồng nào.</div>
                                ) : (
                                    contracts.map(contract => (
                                        <ContractCard
                                            key={contract.id}
                                            code={contract.contract_code}
                                            partner={contract.partner_name}
                                            value={contract.value}
                                            paid={contract.paid_amount}
                                            retention={contract.retention_amount}
                                            status={contract.status}
                                            warning={contract.is_risk}
                                            onViewDetail={() => handleViewDetail(contract)}
                                        />
                                    ))
                                )}

                                <div
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-6 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-slate-50/50 group min-h-[200px]"
                                >
                                    <span className="material-symbols-outlined text-[40px] mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                                    <span className="text-sm font-bold">Thêm Hợp đồng mới</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bidding' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="font-bold text-slate-900">Danh sách Gói thầu</h3>
                                    <button
                                        onClick={() => setIsAddBiddingModalOpen(true)}
                                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        Tạo gói thầu mới
                                    </button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                        <tr>
                                            <th className="px-4 py-3">Tên Gói thầu</th>
                                            <th className="px-4 py-3">Ngân sách dự kiến</th>
                                            <th className="px-4 py-3">Hạn nộp hồ sơ</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {biddingPackages.length > 0 ? biddingPackages.map(pkg => (
                                            <BiddingPackageRow
                                                key={pkg.id}
                                                pkg={pkg}
                                                onView={() => handleViewBidding(pkg)}
                                            />
                                        )) : (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-bold">Chưa có gói thầu nào.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'guarantees' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="font-bold text-slate-900">Danh sách Bảo lãnh</h3>
                                    <button
                                        onClick={() => setIsAddGuaranteeModalOpen(true)}
                                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        Thêm bảo lãnh
                                    </button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">Mã BL</th>
                                            <th className="px-4 py-3">Loại Bảo lãnh</th>
                                            <th className="px-4 py-3">Dự án</th>
                                            <th className="px-4 py-3">Ngân hàng</th>
                                            <th className="px-4 py-3">Giá trị</th>
                                            <th className="px-4 py-3">Thời hạn còn lại</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bankGuarantees.length > 0 ? bankGuarantees.map(bg => (
                                            <GuaranteeRow
                                                key={bg.id}
                                                code={bg.code}
                                                type={bg.type}
                                                project={bg.project_name || 'N/A'}
                                                bank={bg.bank_name}
                                                value={(bg.value / 1000000000).toFixed(1) + ' Tỷ'}
                                                expiry={new Date(bg.expiry_date).toLocaleDateString('vi-VN')}
                                                status={bg.status}
                                                onView={() => handleViewGuarantee(bg)}
                                            />
                                        )) : (
                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-bold">Chưa có bảo lãnh nào.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'payables' && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="xl:col-span-2 space-y-6">
                                    {/* Debt Aging Visualization */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                        <h4 className="font-bold text-slate-900 text-sm mb-3">Phân tích Tuổi nợ (Debt Aging)</h4>
                                        <div className="flex gap-1 h-8 w-full rounded-lg overflow-hidden">
                                            {debtAgingData.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="h-full flex items-center justify-center text-[10px] font-bold text-white relative group"
                                                    style={{ width: `${(item.value / 40.3) * 100}%`, backgroundColor: item.color }}
                                                    title={`${item.name}: ${item.value} Tỷ`}
                                                >
                                                    <span className="truncate px-1">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span>Tổng nợ: <strong>40.3 Tỷ</strong></span>
                                            <span className="text-red-600 font-bold">Nợ quá hạn: 6.6 Tỷ</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-900">Yêu cầu Thanh toán (Thầu phụ)</h3>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 border rounded text-xs font-medium bg-slate-50 hover:bg-slate-100">Tất cả</button>
                                                <button className="px-3 py-1.5 border rounded text-xs font-medium text-red-700 border-red-200 bg-red-50 hover:bg-red-100">Đang bị chặn (1)</button>
                                            </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Mã YC</th>
                                                    <th className="px-4 py-3">Nhà thầu phụ</th>
                                                    <th className="px-4 py-3">Dự án</th>
                                                    <th className="px-4 py-3">Số tiền</th>
                                                    <th className="px-4 py-3">Ngày gửi</th>
                                                    <th className="px-4 py-3">Trạng thái</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentRequests.length > 0 ? paymentRequests.map(pr => (
                                                    <PaymentRequestRow
                                                        key={pr.id}
                                                        id={pr.code}
                                                        sub={pr.partner_name || 'N/A'}
                                                        project={pr.project_name || 'N/A'}
                                                        amount={pr.amount.toLocaleString() + ' ₫'}
                                                        date={new Date(pr.submission_date).toLocaleDateString('vi-VN')}
                                                        status={pr.status === 'paid' ? 'approved' : pr.status} // Map paid to approved color for now or add more statuses
                                                        blocked={pr.is_blocked}
                                                        onView={() => handleViewPayment(pr)}
                                                    />
                                                )) : (
                                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-bold">Chưa có yêu cầu thanh toán nào.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6">
                                    <h3 className="font-bold text-slate-900 mb-4">Tự động hóa & Cảnh báo</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <span className="material-symbols-outlined text-[60px] text-blue-600">auto_awesome</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                                <h4 className="font-bold text-slate-900 text-sm">Work Acceptance Generator</h4>
                                            </div>
                                            <div className="text-xs text-slate-600 mb-3 leading-relaxed relative z-10">
                                                Hệ thống tự động tạo Biên bản nghiệm thu dựa trên Nhật ký thi công tuần này.
                                            </div>
                                            <button className="w-full py-2 bg-primary text-white rounded text-xs font-bold shadow-sm hover:bg-primary/90 relative z-10">
                                                Tạo 12 Biên bản (Draft)
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <h4 className="font-bold text-slate-900 text-sm mb-2">Sự kiện Tài chính Sắp tới</h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-red-600 mt-0.5">error</span>
                                                    <span>Thầu phụ <strong>"Điện lạnh REE"</strong> hết hạn bảo lãnh THHĐ vào ngày 15/11.</span>
                                                </li>
                                                <li className="flex items-start gap-2 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-orange-500 mt-0.5">warning</span>
                                                    <span>Dự án <strong>Sun Urban</strong> chưa thanh toán tạm ứng đợt 2 theo điều khoản HĐ.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddContractModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddContract}
                projects={projects}
            />

            <ContractDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contract={selectedContract}
            />

            <AddGuaranteeModal
                isOpen={isAddGuaranteeModalOpen}
                onClose={() => setIsAddGuaranteeModalOpen(false)}
                onAdd={handleAddGuarantee}
                projects={projects}
            />

            <GuaranteeDetailModal
                isOpen={isGuaranteeDetailModalOpen}
                onClose={() => setIsGuaranteeDetailModalOpen(false)}
                guarantee={selectedGuarantee}
                onDelete={handleDeleteGuarantee}
            />

            <PaymentDetailModal
                isOpen={isPaymentDetailModalOpen}
                onClose={() => setIsPaymentDetailModalOpen(false)}
                payment={selectedPayment}
                onApprove={handleApprovePayment}
                onReject={handleRejectPayment}
            />

            <AddBiddingModal
                isOpen={isAddBiddingModalOpen}
                onClose={() => setIsAddBiddingModalOpen(false)}
                onAdd={handleAddBidding}
                projects={projects}
            />

            <BiddingDetailModal
                isOpen={isBiddingDetailModalOpen}
                onClose={() => setIsBiddingDetailModalOpen(false)}
                pkg={selectedBidding}
                onDelete={handleDeleteBidding}
                onPublish={handlePublishBidding}
            />

            <InvoiceScanModal
                isOpen={isInvoiceScanModalOpen}
                onClose={() => setIsInvoiceScanModalOpen(false)}
                onSave={handleSaveScannedInvoice}
                projects={projects}
            />
        </div>
    );
}