import { read, utils } from 'xlsx';
import { WBSItem } from '../../types';

export const importService = {
    async parseExcelSchedule(file: File): Promise<WBSItem[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

                    if (!jsonData || jsonData.length === 0) {
                        reject(new Error("File is empty"));
                        return;
                    }

                    // Simple column detection via Header row (assume row 0 or 1)
                    let headerRowIndex = 0;
                    // Try to find a row that looks like a header (contains 'Name' or 'WBS' or 'Start')
                    for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                        const row = jsonData[i] as any[];
                        if (row.some(cell => typeof cell === 'string' &&
                            (cell.toLowerCase().includes('name') ||
                                cell.toLowerCase().includes('tên') ||
                                cell.toLowerCase().includes('wbs')))) {
                            headerRowIndex = i;
                            break;
                        }
                    }

                    const headers = (jsonData[headerRowIndex] as any[]).map(h => String(h).toLowerCase().trim());
                    const rows = jsonData.slice(headerRowIndex + 1);

                    const colMap = {
                        wbs: headers.findIndex(h => h.includes('wbs') || h.includes('ma') || h.includes('mã')),
                        name: headers.findIndex(h => h.includes('name') || h.includes('tên') || h.includes('hạng mục') || h.includes('công việc')),
                        start: headers.findIndex(h => h.includes('start') || h.includes('bắt đầu') || h.includes('bd')),
                        end: headers.findIndex(h => h.includes('finish') || h.includes('end') || h.includes('kết thúc') || h.includes('kt')),
                        progress: headers.findIndex(h => h.includes('%') || h.includes('progress') || h.includes('hoàn thành'))
                    };

                    if (colMap.name === -1) {
                        reject(new Error("Could not find 'Name' or 'Tên công việc' column"));
                        return;
                    }

                    const wbsItems: WBSItem[] = rows.map((row: any, index) => {
                        const name = row[colMap.name] || `Task ${index + 1}`;
                        const wbsCode = colMap.wbs !== -1 ? String(row[colMap.wbs]) : `${index + 1}`;

                        // Parse Dates (Excel dates are often numbers, let's assume simple string or date object for now, or use sheet_to_json default parsing)
                        // Note: sheet_to_json with raw:false might help, but sticking to basics first

                        // Helper to parse date
                        const parseDate = (val: any) => {
                            if (!val) return undefined;
                            if (val instanceof Date) return val.toISOString().split('T')[0];
                            // Excel serial number
                            if (typeof val === 'number') {
                                // (val - 25569) * 86400 * 1000
                                const d = new Date(Math.round((val - 25569) * 86400 * 1000));
                                return d.toISOString().split('T')[0];
                            }
                            // String yyyy-mm-dd or dd/mm/yyyy
                            return String(val); // MVP: rely on string
                        };

                        const startDate = colMap.start !== -1 ? parseDate(row[colMap.start]) : undefined;
                        const endDate = colMap.end !== -1 ? parseDate(row[colMap.end]) : undefined;
                        const progress = colMap.progress !== -1 ? (parseFloat(row[colMap.progress]) || 0) : 0;

                        // Auto-detect level based on WBS dots (1.1 = level 1, 1.1.1 = level 2)
                        // If no WBS, assume 0
                        const level = wbsCode.split('.').length - 1;

                        return {
                            id: `imported-${index}`,
                            wbs_code: wbsCode,
                            name: name,
                            level: level >= 0 ? level : 0,
                            progress: progress > 1 ? progress : progress * 100, // Handle 0.5 vs 50
                            start_date: startDate,
                            end_date: endDate,
                            status: (progress === 100 || progress === 1 ? 'done' : 'active') as WBSItem['status'], // deduction
                        };
                    }).filter(item => item.name); // Filter empty rows

                    resolve(wbsItems);

                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = (err) => reject(err);
            reader.readAsBinaryString(file);
        });
    }
};
