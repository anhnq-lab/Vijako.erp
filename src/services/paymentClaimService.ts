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
    VariationStatus
} from '../../types';

export type {
    PaymentContract,
    BOQItem,
    InterimPaymentClaim,
    IPCWorkDetail,
    Variation,
    IPCDocument,
    IPCWorkflowHistory,
    IPCFinancialSummary
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

/**
 * Import BOQ từ Excel (placeholder - sẽ implement sau)
 */
export const importBOQFromExcel = async (
    file: File,
    paymentContractId: string
): Promise<BOQItem[]> => {
    // TODO: Implement Excel parsing với thư viện xlsx
    // Sẽ parse file Excel BM-01 format
    console.warn('importBOQFromExcel: Not implemented yet');
    throw new Error('Not implemented');
};

// ==========================================
// INTERIM PAYMENT CLAIM (IPC) OPERATIONS
// ==========================================

/**
 * Tạo IPC mới
 */
export const createIPC = async (
    data: Omit<InterimPaymentClaim, 'id' | 'created_at' | 'updated_at' | 'works_executed_amount' | 'variations_amount' | 'mos_amount' | 'gross_total' | 'retention_amount' | 'advance_repayment' | 'net_payment' | 'vat_amount' | 'total_with_vat'>
): Promise<InterimPaymentClaim | null> => {
    const { data: result, error } = await supabase
        .from('interim_payment_claims')
        .insert({
            ...data,
            works_executed_amount: 0,
            variations_amount: 0,
            mos_amount: 0,
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

    // 7. Advance Repayment (placeholder - cần implement rule engine)
    // TODO: Parse advance_repayment_rule và tính toán
    const advance_repayment = 0;

    // 8. Net Payment = Gross - Retention - Advance Repayment
    const net_payment = gross_total - retention_amount - advance_repayment;

    // 9. VAT
    const vat_percent = Number(pc.vat_percent) / 100;
    const vat_amount = net_payment * vat_percent;

    // 10. Total with VAT
    const total_with_vat = net_payment + vat_amount;

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
        .update(summary)
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
    certifiedNetPayment: number,
    approverName: string
): Promise<InterimPaymentClaim | null> => {
    const { data, error } = await supabase
        .from('interim_payment_claims')
        .update({
            status: 'certified' as IPCStatus,
            certified_date: new Date().toISOString().split('T')[0],
            certified_net_payment: certifiedNetPayment
        })
        .eq('id', ipcId)
        .select()
        .single();

    if (error) {
        console.error('Error certifying IPC:', error);
        throw error;
    }

    // Log workflow history
    await logWorkflowHistory(ipcId, 'submitted', 'certified', null, approverName, `Đã duyệt: ${certifiedNetPayment.toLocaleString()} VND`);

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

    if (error) {
        console.error('Error fetching variations:', error);
        throw error;
    }

    return data || [];
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

    // Variations
    createVariation,
    getVariationsByContract,
    approveVariation,
    rejectVariation,

    // Workflow
    getIPCWorkflowHistory
};
