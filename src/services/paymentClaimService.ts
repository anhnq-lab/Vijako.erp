import { supabase } from '../lib/supabase';
import {
    PaymentContract,
    BOQItem,
    InterimPaymentClaim,
    IPCWorkDetail,
    Variation,
    IPCDocument,
    IPCWorkflowHistory,
    IPCFinancialSummary,
    IPCStatus,
    VariationStatus,
    VariationType
} from '../../types';

export type {
    PaymentContract,
    BOQItem,
    InterimPaymentClaim,
    IPCWorkDetail,
    Variation,
    IPCDocument,
    IPCWorkflowHistory,
    IPCFinancialSummary,
    IPCStatus,
    VariationStatus,
    VariationType
};

// ==========================================
// PAYMENT CONTRACT & BOQ MANAGEMENT
// ==========================================

/**
 * Tạo Payment Contract mới từ một contract hiện có
 */
export const createPaymentContract = async (
    data: Omit<PaymentContract, 'id' | 'created_at' | 'updated_at'>
): Promise<PaymentContract | null> => {
    const { data: result, error } = await supabase
        .from('payment_contracts')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating payment contract:', error);
        throw error;
    }

    return result;
};

/**
 * Lấy Payment Contract theo contract_id
 */
export const getPaymentContractByContractId = async (
    contractId: string
): Promise<PaymentContract | null> => {
    const { data, error } = await supabase
        .from('payment_contracts')
        .select(`
            *,
            contracts:contract_id (
                contract_code,
                name,
                partner_name,
                project_id,
                projects:project_id (name)
            )
        `)
        .eq('contract_id', contractId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching payment contract:', error);
        throw error;
    }

    // Map joined fields
    const contracts = Array.isArray(data.contracts) ? data.contracts[0] : data.contracts;
    const projects = contracts?.projects;

    return {
        ...data,
        contract_code: contracts?.contract_code,
        contract_name: contracts?.name,
        partner_name: contracts?.partner_name,
        project_name: projects?.name
    };
};

/**
 * Lấy tất cả Payment Contracts
 */
export const getAllPaymentContracts = async (): Promise<PaymentContract[]> => {
    const { data, error } = await supabase
        .from('payment_contracts')
        .select(`
            *,
            contracts:contract_id (
                contract_code,
                name,
                partner_name,
                project_id,
                projects:project_id (name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching payment contracts:', error);
        throw error;
    }

    return (data || []).map(pc => {
        const contracts = Array.isArray(pc.contracts) ? pc.contracts[0] : pc.contracts;
        const projects = contracts?.projects;

        return {
            ...pc,
            contract_code: contracts?.contract_code,
            contract_name: contracts?.name,
            partner_name: contracts?.partner_name,
            project_name: projects?.name
        };
    });
};

/**
 * Lấy BOQ theo payment_contract_id (cây phân cấp)
 */
export const getBOQTree = async (paymentContractId: string): Promise<BOQItem[]> => {
    const { data, error } = await supabase
        .from('boq_items')
        .select('*')
        .eq('payment_contract_id', paymentContractId)
        .order('item_code', { ascending: true });

    if (error) {
        console.error('Error fetching BOQ items:', error);
        throw error;
    }

    // Build tree structure
    const items = data || [];
    const itemMap = new Map<string, BOQItem & { children: BOQItem[] }>();
    const rootItems: BOQItem[] = [];

    // First pass: Create map
    items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: Build tree
    items.forEach(item => {
        const node = itemMap.get(item.id)!;
        if (item.parent_id && itemMap.has(item.parent_id)) {
            itemMap.get(item.parent_id)!.children.push(node);
        } else {
            rootItems.push(node);
        }
    });

    return rootItems;
};

/**
 * Thêm BOQ item
 */
export const createBOQItem = async (
    data: Omit<BOQItem, 'id' | 'created_at' | 'contract_amount'>
): Promise<BOQItem | null> => {
    const { data: result, error } = await supabase
        .from('boq_items')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating BOQ item:', error);
        throw error;
    }

    return result;
};

/**
 * Cập nhật BOQ item
 */
export const updateBOQItem = async (
    id: string,
    updates: Partial<BOQItem>
): Promise<BOQItem | null> => {
    const { data, error } = await supabase
        .from('boq_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating BOQ item:', error);
        throw error;
    }

    return data;
};

import * as XLSX from 'xlsx';

/**
 * Import BOQ từ Excel (Định dạng BM-01)
 */
export const importBOQFromExcel = async (
    file: File,
    paymentContractId: string
): Promise<BOQItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Chuyển sang JSON nhưng giữ header gốc để map
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Tìm dòng tiêu đề (chứa các từ khóa)
                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
                    const row = jsonData[i];
                    if (row.some(cell => typeof cell === 'string' && (cell.includes('Mô tả') || cell.includes('Description') || cell.includes('hạng mục')))) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) {
                    throw new Error('Không tìm thấy dòng tiêu đề trong file Excel. Vui lòng kiểm tra định dạng BM-01.');
                }

                const headers = jsonData[headerRowIdx].map(h => String(h || '').trim());
                const colMap = {
                    item_code: headers.findIndex(h => h.includes('Mã hiệu') || h.toLowerCase() === 'code' || h.includes('STT')),
                    description: headers.findIndex(h => h.includes('Mô tả') || h.includes('Description')),
                    unit: headers.findIndex(h => h.includes('Đơn vị') || h.toLowerCase() === 'unit'),
                    qty: headers.findIndex(h => h.includes('Khối lượng') || h.includes('Qty') || h.includes('Số lượng')),
                    rate: headers.findIndex(h => h.includes('Đơn giá') || h.toLowerCase() === 'rate')
                };

                const boqData = jsonData.slice(headerRowIdx + 1);
                const itemsToInsert: any[] = [];
                let currentParentId: string | undefined = undefined;
                let lastParentByLevel: Record<number, string> = {};

                for (const row of boqData) {
                    const description = row[colMap.description];
                    if (!description || String(description).trim() === '') continue;

                    const item_code = String(row[colMap.item_code] || '').trim();
                    const unit = String(row[colMap.unit] || '').trim();
                    const contract_qty = parseFloat(row[colMap.qty]) || 0;
                    const unit_rate = parseFloat(row[colMap.rate]) || 0;

                    // Xác định level dựa trên dấu chấm trong mã hiệu hoặc format gạch chân (giả lập đơn giản)
                    const dots = (item_code.match(/\./g) || []).length;
                    const level = dots;

                    const newItem = {
                        payment_contract_id: paymentContractId,
                        item_code,
                        description: String(description).trim(),
                        unit: unit || null,
                        unit_rate,
                        contract_qty,
                        contract_amount: unit_rate * contract_qty,
                        parent_id: level > 0 ? lastParentByLevel[level - 1] : null
                    };

                    // Insert từng cái để lấy ID cho quan hệ cha con (trong thực tế nên dùng batch nhưng Supabase .select() giúp lấy ID)
                    const { data: inserted, error } = await supabase
                        .from('boq_items')
                        .insert(newItem)
                        .select()
                        .single();

                    if (error) throw error;

                    lastParentByLevel[level] = inserted.id;
                    itemsToInsert.push(inserted);
                }

                resolve(itemsToInsert);
            } catch (err) {
                console.error('Error parsing BOQ Excel:', err);
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

// ==========================================
// INTERIM PAYMENT CLAIM (IPC) OPERATIONS
// ==========================================

/**
 * Log workflow history
 */
const logWorkflowHistory = async (
    ipcId: string,
    fromStatus: IPCStatus,
    toStatus: IPCStatus,
    approverId: string | null,
    approverName: string,
    comments?: string
): Promise<void> => {
    await supabase.from('ipc_workflow_history').insert({
        ipc_id: ipcId,
        from_status: fromStatus,
        to_status: toStatus,
        approver_id: approverId,
        approver_name: approverName,
        comments: comments
    });
};

/**
 * Tạo IPC mới
 */
export const createIPC = async (
    data: Omit<InterimPaymentClaim, 'id' | 'created_at' | 'updated_at' | 'works_executed_amount' | 'variations_amount' | 'gross_total' | 'retention_amount' | 'advance_repayment' | 'net_payment' | 'vat_amount' | 'total_with_vat'>
): Promise<InterimPaymentClaim | null> => {
    const { data: result, error } = await supabase
        .from('interim_payment_claims')
        .insert({
            ...data,
            works_executed_amount: 0,
            variations_amount: 0,
            gross_total: 0,
            retention_amount: 0,
            advance_repayment: 0,
            net_payment: 0,
            vat_amount: 0,
            total_with_vat: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating IPC:', error);
        throw error;
    }

    return result;
};

/**
 * Lấy IPC by ID với tất cả thông tin
 */
export const getIPCById = async (id: string): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .select(`
            *,
            payment_contracts:payment_contract_id (
                *,
                contracts:contract_id (contract_code, projects:project_id (name))
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching IPC:', error);
        throw error;
    }

    const paymentContract = Array.isArray(data.payment_contracts) ? data.payment_contracts[0] : data.payment_contracts;
    const contract = paymentContract?.contracts;
    const project = contract?.projects;

    return {
        ...data,
        contract_code: contract?.contract_code,
        project_name: project?.name
    };
};

/**
 * Lấy tất cả IPCs theo payment_contract_id
 */
export const getIPCsByContract = async (paymentContractId: string): Promise<InterimPaymentClaim[]> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .select('*')
        .eq('payment_contract_id', paymentContractId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching IPCs:', error);
        throw error;
    }

    return data || [];
};

/**
 * Lấy IPC work details
 */
export const getIPCWorkDetails = async (ipcId: string): Promise<IPCWorkDetail[]> => {
    const { data, error } = await supabase
        .from('ipc_work_details')
        .select(`
            *,
            boq_items:boq_item_id (
                item_code,
                description,
                unit,
                unit_rate,
                contract_qty,
                contract_amount
            )
        `)
        .eq('ipc_id', ipcId);

    if (error) {
        console.error('Error fetching IPC work details:', error);
        throw error;
    }

    return (data || []).map(wd => {
        const boqItem = Array.isArray(wd.boq_items) ? wd.boq_items[0] : wd.boq_items;
        return {
            ...wd,
            item_code: boqItem?.item_code,
            description: boqItem?.description,
            unit: boqItem?.unit,
            unit_rate: boqItem?.unit_rate,
            contract_qty: boqItem?.contract_qty,
            contract_amount: boqItem?.contract_amount
        };
    });
};

/**
 * Cập nhật work details hàng loạt
 */
export const updateIPCWorkDetails = async (
    ipcId: string,
    workDetails: Array<{
        boq_item_id: string;
        current_qty: number;
        cumulative_qty: number;
    }>
): Promise<IPCWorkDetail[]> => {
    // Xóa work details cũ
    await supabase.from('ipc_work_details').delete().eq('ipc_id', ipcId);

    // Lấy BOQ items để tính amount
    const boqItemIds = workDetails.map(wd => wd.boq_item_id);
    const { data: boqItems } = await supabase
        .from('boq_items')
        .select('id, unit_rate')
        .in('id', boqItemIds);

    const boqItemMap = new Map((boqItems || []).map(item => [item.id, item]));

    // Tạo work details mới với amounts
    const detailsToInsert = workDetails.map(wd => {
        const boqItem = boqItemMap.get(wd.boq_item_id);
        const unit_rate = boqItem?.unit_rate || 0;

        return {
            ipc_id: ipcId,
            boq_item_id: wd.boq_item_id,
            current_qty: wd.current_qty,
            cumulative_qty: wd.cumulative_qty,
            current_amount: wd.current_qty * unit_rate,
            cumulative_amount: wd.cumulative_qty * unit_rate
        };
    });

    const { data, error } = await supabase
        .from('ipc_work_details')
        .insert(detailsToInsert)
        .select();

    if (error) {
        console.error('Error updating IPC work details:', error);
        throw error;
    }

    return data || [];
};

/**
 * ENGINE TÍNH TOÁN TÀI CHÍNH - Core function
 */
export const calculateIPCFinancials = async (ipcId: string): Promise<IPCFinancialSummary> => {
    // 1. Lấy IPC và payment contract
    const ipc = await getIPCById(ipcId);
    if (!ipc) throw new Error('IPC not found');

    const paymentContract = await supabase
        .from('payment_contracts')
        .select('*')
        .eq('id', ipc.payment_contract_id)
        .single();

    if (paymentContract.error) throw paymentContract.error;
    const pc = paymentContract.data;

    // 2. Tính Works Executed Amount (SUM của cumulative_amount)
    const { data: workDetails } = await supabase
        .from('ipc_work_details')
        .select('cumulative_amount')
        .eq('ipc_id', ipcId);

    const works_executed_amount = (workDetails || []).reduce(
        (sum, wd) => sum + Number(wd.cumulative_amount),
        0
    );

    // 3. Tính Variations Amount (chỉ approved)
    const { data: approvedVariations } = await supabase
        .from('variations')
        .select('approved_amount')
        .eq('payment_contract_id', ipc.payment_contract_id)
        .eq('status', 'approved' as VariationStatus);

    const variations_amount = (approvedVariations || []).reduce(
        (sum, v) => sum + Number(v.approved_amount || 0),
        0
    );

    // 4. MOS amount (Material On Site) - lấy từ IPC record
    const mos_amount = Number(ipc.mos_amount || 0);

    // 5. Gross Total
    const gross_total = works_executed_amount + variations_amount + mos_amount;

    // 6. Retention Amount = Min(Gross Total * Retention%, Retention Limit)
    const retention_percent = Number(pc.retention_percent) / 100; // Convert to decimal
    const retention_limit = Number(pc.retention_limit);
    const calculated_retention = gross_total * retention_percent;
    const retention_amount = Math.min(calculated_retention, retention_limit);

    // 7. Advance Repayment
    // Quy tắc thông thường: Hoàn trả theo tỷ lệ % khối lượng hoàn thành 
    // Hoặc hoàn trả khi đạt ngưỡng % nhất định (VD: từ 20% đến 80% giá trị HĐ)
    let advance_repayment = 0;
    const contract_value = Number(pc.contract_value || 0);
    const advance_total = Number(pc.advance_amount || 0);

    if (contract_value > 0 && advance_total > 0) {
        const progress_percent = (gross_total / contract_value) * 100;

        // Giả định quy tắc mặc định: Hoàn trả từ 20% đến 80% tiến độ
        const start_percent = 20;
        const end_percent = 80;

        if (progress_percent > start_percent) {
            const repayment_progress = Math.min(progress_percent, end_percent) - start_percent;
            const total_repayment_range = end_percent - start_percent;
            const cumulative_repayment = (repayment_progress / total_repayment_range) * advance_total;

            // Lấy giá trị đã hoàn trả ở các kỳ trước
            const { data: previousIPCs } = await supabase
                .from('interim_payment_claims')
                .select('advance_repayment, certified_advance_repayment')
                .eq('payment_contract_id', ipc.payment_contract_id)
                .neq('id', ipcId)
                .lt('created_at', ipc.created_at || new Date().toISOString());

            const total_already_repaid = (previousIPCs || []).reduce(
                (sum, item) => sum + Number(item.certified_advance_repayment ?? item.advance_repayment ?? 0),
                0
            );

            advance_repayment = Math.max(0, cumulative_repayment - total_already_repaid);
            // Đảm bảo không hoàn trả quá tổng tiền tạm ứng
            advance_repayment = Math.min(advance_repayment, advance_total - total_already_repaid);
        }
    }

    // 8. Net Payment = Gross - Retention - Advance Repayment
    const net_payment = gross_total - retention_amount - advance_repayment;

    // 9. VAT
    const vat_percent = Number(pc.vat_percent || 10) / 100;
    const vat_amount = net_payment * vat_percent;

    // 10. Total with VAT
    const total_with_vat = net_payment + vat_amount;

    // 11. Thanh toán thực tế kỳ này (Net Payment Current Period)
    // = Net Payment lũy kế - Net Payment kỳ trước
    const { data: lastIPC } = await supabase
        .from('interim_payment_claims')
        .select('net_payment, certified_net_payment')
        .eq('payment_contract_id', ipc.payment_contract_id)
        .neq('id', ipcId)
        .lt('created_at', ipc.created_at || new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

    const cumulative_net_payment_prev = lastIPC?.[0]?.certified_net_payment ?? lastIPC?.[0]?.net_payment ?? 0;
    const current_period_net_payment = net_payment - cumulative_net_payment_prev;

    const summary: IPCFinancialSummary = {
        works_executed_amount,
        variations_amount,
        mos_amount,
        gross_total,
        retention_amount,
        advance_repayment,
        net_payment,
        vat_amount,
        total_with_vat
    };

    // Update IPC với các giá trị đã tính
    await supabase
        .from('interim_payment_claims')
        .update({
            ...summary,
            // Thêm trường bổ sung nếu có trong schema, nếu không summary đã đủ
        })
        .eq('id', ipcId);

    return summary;
};

/**
 * Submit IPC (chuyển trạng thái)
 */
export const submitIPC = async (ipcId: string): Promise<InterimPaymentClaim | null> => {
    // Tính toán lại trước khi submit
    await calculateIPCFinancials(ipcId);

    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'submitted' as IPCStatus,
            submitted_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) {
        console.error('Error submitting IPC:', error);
        throw error;
    }

    // Log workflow history
    await logWorkflowHistory(ipcId, 'draft', 'submitted', 'System', 'Đã trình khách hàng');

    return data;
};

/**
 * Certify IPC (khách hàng xác nhận)
 */
export const certifyIPC = async (
    ipcId: string,
    certifiedDetails: Partial<IPCFinancialSummary>,
    approverName: string
): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'certified' as IPCStatus,
            certified_date: new Date().toISOString().split('T')[0],
            certified_net_payment: certifiedDetails.net_payment,
            certified_works_executed_amount: certifiedDetails.works_executed_amount,
            certified_variations_amount: certifiedDetails.variations_amount,
            certified_mos_amount: certifiedDetails.mos_amount,
            certified_retention_amount: certifiedDetails.retention_amount,
            certified_advance_repayment: certifiedDetails.advance_repayment,
            certified_vat_amount: certifiedDetails.vat_amount,
            certified_total_with_vat: certifiedDetails.total_with_vat
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) {
        console.error('Error certifying IPC:', error);
        throw error;
    }

    // Log workflow history
    await logWorkflowHistory(ipcId, 'submitted', 'certified', null, approverName, `Đã duyệt: ${(certifiedDetails.net_payment || 0).toLocaleString()} VND`);

    return data;
};

/**
 * Review IPC nội bộ (QS -> Chỉ huy trưởng)
 */
export const reviewIPC = async (ipcId: string, reviewerName: string, comments?: string): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'internal_review' as IPCStatus
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) throw error;

    await logWorkflowHistory(ipcId, 'draft', 'internal_review', null, reviewerName, comments || 'Đang duyệt nội bộ');
    return data;
};

/**
 * Từ chối IPC
 */
export const rejectIPC = async (ipcId: string, fromStatus: IPCStatus, rejecterName: string, reason: string): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'rejected' as IPCStatus
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) throw error;

    await logWorkflowHistory(ipcId, fromStatus, 'rejected', null, rejecterName, reason);
    return data;
};

/**
 * Xuất hóa đơn cho IPC (certified -> invoiced)
 */
export const invoiceIPC = async (ipcId: string, invoiceNumber: string, actionBy: string): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'invoiced' as IPCStatus
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) throw error;

    await logWorkflowHistory(ipcId, 'certified', 'invoiced', null, actionBy, `Đã xuất hóa đơn: ${invoiceNumber}`);
    return data;
};

// ==========================================
// VARIATION MANAGEMENT
// ==========================================

/**
 * Tạo Variation mới
 */
export const createVariation = async (
    data: Omit<Variation, 'id' | 'created_at' | 'updated_at'>
): Promise<Variation | null> => {
    const { data: result, error } = await supabase
        .from('variations')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating variation:', error);
        throw error;
    }

    return result;
};

/**
 * Lấy variations theo payment_contract_id
 */
export const getVariationsByContract = async (paymentContractId: string): Promise<Variation[]> => {
    const { data, error } = await supabase
        .from('variations')
        .select('*')
        .eq('payment_contract_id', paymentContractId)
        .order('created_at', { ascending: false });

    return data || [];
};

/**
 * Export IPC ra Excel (Định dạng BM-01 & PL-01)
 */
export const exportIPCToExcel = async (ipcId: string): Promise<void> => {
    // 1. Lấy dữ liệu IPC, Contract, Work Details
    const ipc = await getIPCById(ipcId);
    if (!ipc) throw new Error('IPC not found');

    const workDetails = await getIPCWorkDetails(ipcId);
    if (!workDetails.length) throw new Error('No work details found for this IPC');

    // 2. Tạo Workbook
    const wb = XLSX.utils.book_new();

    // --- SHEET 1: BÌA (BI-01) ---
    const coverData = [
        ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
        ['Độc lập - Tự do - Hạnh phúc'],
        [''],
        ['HỒ SƠ THANH TOÁN KHỐI LƯỢNG (IPC)'],
        [`Đợt thanh toán: ${ipc.ipc_number}`],
        [''],
        ['DỰ ÁN:', ipc.project_name],
        ['HỢP ĐỒNG:', ipc.contract_code],
        ['NHÀ THẦU:', 'CÔNG TY CỔ PHẦN VIJAKO'],
        [''],
        ['Giai đoạn thanh toán:'],
        [`Từ ngày: ${ipc.period_start}`],
        [`Đến ngày: ${ipc.period_end}`],
        [''],
        ['Ngày lập:', new Date().toLocaleDateString('vi-VN')]
    ];
    const wsCover = XLSX.utils.aoa_to_sheet(coverData);
    XLSX.utils.book_append_sheet(wb, wsCover, 'Bìa');

    // --- SHEET 2: BẢNG KHỐI LƯỢNG (BM-01) ---
    const bmHeaders = [
        ['STT', 'Mã hiệu', 'Nội dung công việc', 'Đơn vị', 'Đơn giá', 'Khối lượng HĐ', 'KL Thực hiện kỳ trước', 'KL Thực hiện kỳ này', 'KL Lũy kế', 'Thành tiền']
    ];
    const bmRows = workDetails.map((wd, idx) => [
        idx + 1,
        wd.item_code,
        wd.description,
        wd.unit,
        wd.unit_rate,
        wd.contract_qty,
        (wd.cumulative_qty || 0) - (wd.current_qty || 0),
        wd.current_qty,
        wd.cumulative_qty,
        wd.current_amount
    ]);
    const wsBM = XLSX.utils.aoa_to_sheet([...bmHeaders, ...bmRows]);
    XLSX.utils.book_append_sheet(wb, wsBM, 'BM-01 (Khối lượng)');

    // --- SHEET 3: TỔNG HỢP TÀI CHÍNH (PL-01) ---
    const plData = [
        ['BẢNG TỔNG HỢP GIÁ TRỊ THANH TOÁN (PL-01)'],
        [''],
        ['1. Giá trị công việc hoàn thành theo BOQ:', ipc.works_executed_amount],
        ['2. Giá trị phát sinh đã được duyệt:', ipc.variations_amount],
        ['3. Giá trị vật tư tại hiện trường (MOS):', ipc.mos_amount],
        ['4. TỔNG GIÁ TRỊ GỘP (1+2+3):', ipc.gross_total],
        [''],
        ['5. Khấu trừ giữ lại bảo hành:', ipc.retention_amount],
        ['6. Hoàn trả tạm ứng:', ipc.advance_repayment],
        [''],
        ['7. GIÁ TRỊ THANH TOÁN RÒNG (4-5-6):', ipc.net_payment],
        ['8. Thuế GTGT (VAT):', ipc.vat_amount],
        ['9. TỔNG CỘNG THANH TOÁN (7+8):', ipc.total_with_vat]
    ];
    const wsPL = XLSX.utils.aoa_to_sheet(plData);
    XLSX.utils.book_append_sheet(wb, wsPL, 'PL-01 (Tài chính)');

    // 3. Xuất file
    const fileName = `IPC_${ipc.ipc_number}_${ipc.contract_code}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Approve Variation
 */
export const approveVariation = async (
    id: string,
    approvedAmount: number,
    approvedBy: string
): Promise<Variation | null> => {
    const { data, error } = await supabase
        .from('variations')
        .update({
            status: 'approved' as VariationStatus,
            approved_amount: approvedAmount,
            approved_by: approvedBy,
            approved_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error approving variation:', error);
        throw error;
    }

    return data;
};

/**
 * Reject Variation
 */
export const rejectVariation = async (id: string, reason?: string): Promise<Variation | null> => {
    const { data, error } = await supabase
        .from('variations')
        .update({
            status: 'rejected' as VariationStatus
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error rejecting variation:', error);
        throw error;
    }

    return data;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================


/**
 * Get workflow history cho IPC
 */
export const getIPCWorkflowHistory = async (ipcId: string): Promise<IPCWorkflowHistory[]> => {
    const { data, error } = await supabase
        .from('ipc_workflow_history')
        .select('*')
        .eq('ipc_id', ipcId)
        .order('action_date', { ascending: true });

    if (error) {
        console.error('Error fetching workflow history:', error);
        throw error;
    }

    return data || [];
};

// Export service object
export const paymentClaimService = {
    // Contracts & BOQ
    createPaymentContract,
    getPaymentContractByContractId,
    getAllPaymentContracts,
    getBOQTree,
    createBOQItem,
    updateBOQItem,
    importBOQFromExcel,

    // IPCs
    createIPC,
    getIPCById,
    getIPCsByContract,
    getIPCWorkDetails,
    updateIPCWorkDetails,
    calculateIPCFinancials,
    submitIPC,
    certifyIPC,
    reviewIPC,
    rejectIPC,
    invoiceIPC,
    exportIPCToExcel,

    // Variations
    createVariation,
    getVariationsByContract,
    approveVariation,
    rejectVariation,

    // Workflow
    getIPCWorkflowHistory
};
