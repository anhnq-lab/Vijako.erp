import React, { useState, useRef } from 'react';
import { invoiceService, ExtractedContract } from '../src/services/invoiceService';
import { Project } from '../types';

interface ContractScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ExtractedContract & { project_id: string }) => void;
    projects: Project[];
}

export const ContractScanModal: React.FC<ContractScanModalProps> = ({ isOpen, onClose, onSave, projects }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedContract | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setExtractedData(null);
        }
    };

    const handleScan = async () => {
        if (!file) return;
        setScanning(true);
        try {
            const data = await invoiceService.scanContract(file);
            setExtractedData(data);
        } catch (error) {
            alert('Lỗi khi quét hợp đồng. Vui lòng thử lại!');
            console.error(error);
        } finally {
            setScanning(false);
        }
    };

    const handleSave = () => {
        if (extractedData) {
            onSave({ ...extractedData, project_id: selectedProjectId || '' });
            onClose();
            // Reset state
            setFile(null);
            setPreviewUrl(null);
            setExtractedData(null);
            setSelectedProjectId('');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">contract_edit</span>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl">Quét Hợp đồng AI</h3>
                            <p className="text-sm text-slate-500">Tự động trích xuất thông tin hợp đồng</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {!extractedData ? (
                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                                    ${file ? 'border-purple-200 bg-purple-50/30' : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf"
                                />

                                {previewUrl ? (
                                    <div className="relative size-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                        {file?.type === 'application/pdf' ? (
                                            <div className="size-full bg-red-50 flex flex-col items-center justify-center">
                                                <span className="material-symbols-outlined text-red-500 text-5xl">picture_as_pdf</span>
                                                <p className="text-[10px] font-bold text-red-600 mt-2 uppercase">PDF Document</p>
                                            </div>
                                        ) : (
                                            <img src={previewUrl} alt="Preview" className="size-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Thay đổi ảnh</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="size-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                            <span className="material-symbols-outlined text-4xl">upload_file</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-900">Chọn hoặc kéo thả hợp đồng vào đây</p>
                                            <p className="text-sm text-slate-500 mt-1">Hỗ trợ định dạng JPG, PNG, PDF (Max 20MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {file && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleScan}
                                        disabled={scanning}
                                        className={`px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-200 flex items-center gap-3 transition-all active:scale-95
                                            ${scanning ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                    >
                                        {scanning ? (
                                            <>
                                                <div className="size-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                ĐANG PHÂN TÍCH...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">psychology</span>
                                                BẮT ĐẦU QUÉT AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Left: Preview */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Tài liệu gốc</h4>
                                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner max-h-[500px]">
                                    {file?.type === 'application/pdf' ? (
                                        <div className="flex items-center justify-center p-12">
                                            <span className="material-symbols-outlined text-slate-400 text-8xl">description</span>
                                        </div>
                                    ) : (
                                        <img src={previewUrl!} alt="Contract" className="w-full object-contain" />
                                    )}
                                </div>
                            </div>

                            {/* Right: Extracted Data */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Dữ liệu AI trích xuất</h4>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Partner */}
                                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-start gap-4">
                                        <div className="size-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                                            <span className="material-symbols-outlined">handshake</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-purple-400 font-black uppercase mb-0.5">Đối tác / Nhà thầu</p>
                                            <input
                                                className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0"
                                                value={extractedData.partner_name}
                                                onChange={(e) => setExtractedData({ ...extractedData, partner_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Values */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Giá trị hợp đồng</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent font-black text-emerald-600 text-xl border-none p-0 focus:ring-0"
                                                    value={extractedData.contract_value}
                                                    onChange={(e) => setExtractedData({ ...extractedData, contract_value: Number(e.target.value) })}
                                                />
                                                <span className="font-bold text-slate-400">{extractedData.currency}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Ngày ký kết</p>
                                            <input
                                                type="date"
                                                className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0"
                                                value={extractedData.signing_date}
                                                onChange={(e) => setExtractedData({ ...extractedData, signing_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Code & Type */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Số hợp đồng</p>
                                            <input
                                                type="text"
                                                className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0"
                                                value={extractedData.contract_code}
                                                onChange={(e) => setExtractedData({ ...extractedData, contract_code: e.target.value })}
                                            />
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Loại hợp đồng</p>
                                            <select
                                                className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0"
                                                value={extractedData.contract_type}
                                                onChange={(e) => setExtractedData({ ...extractedData, contract_type: e.target.value as any })}
                                            >
                                                <option value="revenue">Doanh thu (Đầu ra)</option>
                                                <option value="expense">Chi phí (Đầu vào)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Project */}
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Dự án liên quan</p>
                                        <select
                                            className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0"
                                            value={selectedProjectId}
                                            onChange={(e) => setSelectedProjectId(e.target.value)}
                                        >
                                            <option value="">-- Chọn dự án --</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                                        <p className="text-[10px] text-amber-600 font-black uppercase mb-1 italic flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">info</span> Tóm tắt nội dung
                                        </p>
                                        <p className="text-sm font-medium text-amber-900">{extractedData.summary}</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setExtractedData(null)}
                                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                                    >
                                        Quét lại
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 px-6 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-100"
                                    >
                                        Lưu vào hệ thống
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
