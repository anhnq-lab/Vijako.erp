import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { paymentClaimService, BOQItem } from '../services/paymentClaimService';
import { showToast as toast } from './ui/Toast';
import * as XLSX from 'xlsx';

interface ImportBOQModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentContractId: string;
    onSuccess?: () => void;
}

export const ImportBOQModal: React.FC<ImportBOQModalProps> = ({
    isOpen,
    onClose,
    paymentContractId,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                setPreviewData(jsonData.slice(0, 10)); // Chỉ lấy 10 dòng đầu để preview
                setError(null);
            } catch (err) {
                console.error('Lỗi parse Excel:', err);
                setError('Không thể đọc file Excel. Vui lòng kiểm tra định dạng.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        try {
            toast.loading('Đang xử lý dữ liệu BOQ...');

            await paymentClaimService.importBOQFromExcel(file, paymentContractId);

            toast.dismiss();
            toast.success('Đã nhập thành công danh sách hạng mục công việc (BOQ)');
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Lỗi import BOQ:', err);
            toast.dismiss();
            toast.error(err.message || 'Có lỗi xảy ra khi nhập dữ liệu');
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Import BOQ từ Excel</h2>
                        <p className="text-sm text-slate-500 font-medium">Chọn file định dạng BM-01 (.xlsx, .xls)</p>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-premium">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Upload Area */}
                    <label className={`
                        border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer transition-premium
                        ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-primary hover:bg-primary/5'}
                    `}>
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                        <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Upload />
                        </div>
                        <p className="font-bold text-slate-900">{file ? file.name : 'Nhấp để chọn file hoặc kéo thả'}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Hỗ trợ Excel (.xlsx, .xls) tối đa 10MB</p>
                    </label>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {previewData.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Xem trước dữ liệu (10 dòng đầu)</p>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-[10px] font-bold">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Mã hiệu</th>
                                            <th className="px-4 py-2 text-left">Mô tả</th>
                                            <th className="px-4 py-2 text-right">Khối lượng</th>
                                            <th className="px-4 py-2 text-right">Đơn giá</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className="text-slate-600">
                                                <td className="px-4 py-2">{row['Mã hiệu'] || row['Code'] || '-'}</td>
                                                <td className="px-4 py-2 truncate max-w-[200px]">{row['Mô tả'] || row['Description'] || '-'}</td>
                                                <td className="px-4 py-2 text-right">{row['Khối lượng'] || row['Qty'] || '0'}</td>
                                                <td className="px-4 py-2 text-right font-black">{row['Đơn giá'] || row['Rate'] || '0'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Guidelines */}
                    <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 text-blue-700">
                        <FileText size={20} className="shrink-0" />
                        <div className="text-xs leading-relaxed">
                            <p className="font-black uppercase tracking-wider mb-1">Quy định file BM-01:</p>
                            <ul className="list-disc list-inside font-medium space-y-1 opacity-80">
                                <li>Sheet đầu tiên phải chứa danh sách BOQ</li>
                                <li>Cột bắt buộc: Mã hiệu, Mô tả, Đơn vị, Khối lượng, Đơn giá</li>
                                <li>Dữ liệu bắt đầu từ dòng thứ 5 (sau header template)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={onClose} className="flex-1 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-premium">
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="flex-[2] h-14 mesh-gradient text-white rounded-2xl font-black text-sm shadow-premium hover:opacity-90 transition-premium flex items-center justify-center gap-2 group"
                    >
                        {importing ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-premium" />
                        )}
                        Xác nhận Import
                    </button>
                </div>
            </div>
        </div>
    );
};
