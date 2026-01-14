import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { showToast } from './Toast';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

interface ExportOption {
    format: ExportFormat;
    label: string;
    icon: string;
    description: string;
}

const exportOptions: ExportOption[] = [
    {
        format: 'excel',
        label: 'Excel (.xlsx)',
        icon: 'table_chart',
        description: 'Xuất dữ liệu sang file Excel với đầy đủ định dạng'
    },
    {
        format: 'csv',
        label: 'CSV (.csv)',< br /> icon: 'description',
    description: 'Xuất dữ liệu dạng văn bản đơn giản, phù hợp với hầu hết ứng dụng'
  },
{
    format: 'pdf',
        label: 'PDF (.pdf)',
            icon: 'picture_as_pdf',
                description: 'Xuất báo cáo định dạng PDF, sẵn sàng in ấn'
}
];

// Export to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Auto-size columns
        const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.values(r).map((v: any) => String(v).length)), 10);
        worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: Math.min(maxWidth, 30) }));

        XLSX.writeFile(workbook, `${filename}.xlsx`);
        showToast.success(`Đã xuất ${data.length} dòng dữ liệu sang Excel`);
        return true;
    } catch (error) {
        console.error('Export to Excel failed:', error);
        showToast.error('Lỗi khi xuất file Excel');
        return false;
    }
};

// Export to CSV
export const exportToCSV = (data: any[], filename: string) => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();

        showToast.success(`Đã xuất ${data.length} dòng dữ liệu sang CSV`);
        return true;
    } catch (error) {
        console.error('Export to CSV failed:', error);
        showToast.error('Lỗi khi xuất file CSV');
        return false;
    }
};

// Export to PDF (Basic implementation - can be enhanced with libraries like jsPDF)
export const exportToPDF = (data: any[], filename: string, title: string) => {
    try {
        // Basic HTML to PDF conversion
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1f3f89; border-bottom: 2px solid #1f3f89; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1f3f89; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Vijako ERP - Construction Management System</p>
          </div>
        </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
            showToast.success('Đã mở cửa sổ in PDF');
            return true;
        } else {
            throw new Error('Could not open print window');
        }
    } catch (error) {
        console.error('Export to PDF failed:', error);
        showToast.error('Lỗi khi xuất file PDF');
        return false;
    }
};

// Export Modal Component
interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    filename?: string;
    title?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    data,
    filename = 'export',
    title = 'Dữ liệu xuất'
}) => {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (data.length === 0) {
            showToast.error('Không có dữ liệu để xuất');
            return;
        }

        setExporting(true);

        try {
            let success = false;

            switch (selectedFormat) {
                case 'excel':
                    success = exportToExcel(data, filename);
                    break;
                case 'csv':
                    success = exportToCSV(data, filename);
                    break;
                case 'pdf':
                    success = exportToPDF(data, filename, title);
                    break;
            }

            if (success) {
                setTimeout(() => onClose(), 1000);
            }
        } finally {
            setExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-[24px] text-primary">download</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Xuất dữ liệu</h2>
                            <p className="text-xs text-slate-500">{data.length} mục</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    <p className="text-sm text-slate-600 mb-4">
                        Chọn định dạng file bạn muốn xuất:
                    </p>

                    {exportOptions.map((option) => (
                        <button
                            key={option.format}
                            onClick={() => setSelectedFormat(option.format)}
                            className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${selectedFormat === option.format
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${selectedFormat === option.format ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                <span className="material-symbols-outlined text-[24px]">{option.icon}</span>
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{option.label}</span>
                                    {selectedFormat === option.format && (
                                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={exporting}
                        className="flex-1 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Đang xuất...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span>Xuất file</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Export Button Component
interface ExportButtonProps {
    data: any[];
    filename?: string;
    title?: string;
    variant?: 'primary' | 'secondary';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    data,
    filename = 'export',
    title = 'Dữ liệu xuất',
    variant = 'primary'
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const buttonClass = variant === 'primary'
        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50';

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${buttonClass}`}
            >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Xuất dữ liệu</span>
            </button>

            <ExportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={data}
                filename={filename}
                title={title}
            />
        </>
    );
};
