import React, { useState, useEffect } from 'react';
import { Contract } from '../../types';
import { contractFileService, ContractAttachment } from '../services/contractFileService';
import { ComponentLoader } from './ui/LoadingComponents';

interface ContractDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: Contract | null;
    onEdit: (contract: Contract) => void;
    onDelete: (id: string) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
    isOpen,
    onClose,
    contract,
    onEdit,
    onDelete,
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'payments' | 'files'>('info');
    const [files, setFiles] = useState<ContractAttachment[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        if (isOpen && contract) {
            loadFiles();
        }
    }, [isOpen, contract]);

    const loadFiles = async () => {
        if (!contract) return;
        try {
            setLoadingFiles(true);
            const data = await contractFileService.getContractFiles(contract.id);
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!contract || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        try {
            setUploading(true);
            await contractFileService.uploadContractFile(contract.id, file);
            await loadFiles();
            e.target.value = ''; // Reset input
        } catch (error: any) {
            alert(error.message || 'Lỗi khi upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: string, fileUrl: string, fileName: string) => {
        if (!confirm(`Xóa file "${fileName}"?`)) return;

        try {
            await contractFileService.deleteContractFile(fileId, fileUrl);
            await loadFiles();
        } catch (error) {
            alert('Lỗi khi xóa file');
        }
    };

    const handleDownload = (fileUrl: string, fileName: string) => {
        contractFileService.downloadFile(fileUrl, fileName);
    };

    const handleDeleteContract = () => {
        if (!contract) return;
        if (confirm(`Xóa hợp đồng "${contract.contract_code}"? Hành động này không thể hoàn tác.`)) {
            onDelete(contract.id);
            onClose();
        }
    };

    if (!isOpen || !contract) return null;

    const paymentProgress = contract.value
        ? Math.min(100, Math.round((contract.paid_amount || 0) / contract.value * 100))
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-premium w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-black text-slate-900 font-mono">
                                    {contract.contract_code}
                                </h2>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${contract.status === 'active' ? 'bg-emerald/10 text-emerald' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {contract.status === 'active' ? 'Đang thực hiện' : contract.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">
                                {contract.partner_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(contract)}
                                className="size-10 rounded-xl hover:bg-blue-50 flex items-center justify-center text-blue-600 transition-premium"
                                title="Sửa"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                                onClick={handleDeleteContract}
                                className="size-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-600 transition-premium"
                                title="Xóa"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-premium"
                            >
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-6">
                        {[
                            { id: 'info', label: 'Thông tin', icon: 'info' },
                            { id: 'payments', label: 'Thanh toán', icon: 'payments' },
                            { id: 'files', label: 'Tài liệu', icon: 'attach_file' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-premium ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoRow label="Loại hợp đồng" value={contract.contract_type === 'revenue' ? 'Doanh thu (A-B)' : 'Chi phí (B-C)'} />
                                <InfoRow label="Giá trị" value={`${Number(contract.value || 0).toLocaleString()} ₫`} />
                                <InfoRow label="Ngày ký" value={contract.signing_date || 'N/A'} />
                                <InfoRow label="Thời gian" value={`${contract.start_date || 'N/A'} ~ ${contract.end_date || 'N/A'}`} />
                            </div>
                            {contract.description && (
                                <div>
                                    <p className="text-sm font-bold text-slate-700 mb-2">Mô tả</p>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{contract.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Tiến độ thanh toán</p>
                                        <p className="text-3xl font-black text-slate-900 mt-1">{paymentProgress}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-700">Đã thanh toán</p>
                                        <p className="text-xl font-black text-emerald mt-1">
                                            {Number(contract.paid_amount || 0).toLocaleString()} ₫
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald to-blue-500 rounded-full transition-all"
                                        style={{ width: `${paymentProgress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs font-bold text-slate-600">
                                    <span>0 ₫</span>
                                    <span>{Number(contract.value || 0).toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Còn lại</p>
                                    <p className="text-xl font-black text-slate-900 mt-1">
                                        {Number((contract.value || 0) - (contract.paid_amount || 0)).toLocaleString()} ₫
                                    </p>
                                </div>
                                {contract.retention_amount && contract.retention_amount > 0 && (
                                    <div className="p-4 bg-amber-50 rounded-xl">
                                        <p className="text-xs font-bold text-amber-700 uppercase">Tạm giữ</p>
                                        <p className="text-xl font-black text-amber-900 mt-1">
                                            {Number(contract.retention_amount).toLocaleString()} ₫
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="space-y-4">
                            {/* Upload Button */}
                            <div>
                                <label htmlFor="file-upload" className={`flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light shadow-premium transition-premium cursor-pointer w-fit ${uploading ? 'opacity-50' : ''}`}>
                                    {uploading ? (
                                        <>
                                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Đang upload...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                            <span>Upload file</span>
                                        </>
                                    )}
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                                    disabled={uploading}
                                />
                                <p className="text-xs text-slate-500 mt-2">Max 10MB. PDF, DOC, XLS, JPG, PNG</p>
                            </div>

                            {/* Files List */}
                            {loadingFiles ? (
                                <ComponentLoader />
                            ) : files.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-6xl text-slate-300">folder_open</span>
                                    <p className="text-slate-400 font-bold mt-4">Chưa có tài liệu</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-premium group">
                                            <span className="material-symbols-outlined text-primary text-[32px]">description</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{file.file_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {(file.file_size && file.file_size > 0) ? `${Math.round(file.file_size / 1024)} KB` : 'Unknown size'} •
                                                    {new Date(file.uploaded_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(file.file_url, file.file_name)}
                                                className="size-10 rounded-xl hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-premium opacity-0 group-hover:opacity-100"
                                                title="Tải xuống"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFile(file.id, file.file_url, file.file_name)}
                                                className="size-10 rounded-xl hover:bg-red-100 flex items-center justify-center text-red-600 transition-premium opacity-0 group-hover:opacity-100"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
);
