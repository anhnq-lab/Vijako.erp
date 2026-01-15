import { supabase } from '../lib/supabase';

// =====================================================
// TYPES
// =====================================================

export interface Invoice {
    id: string;
    invoice_code: string;
    invoice_type: 'sales' | 'purchase';
    project_id?: string;
    contract_id?: string;
    vendor_name: string;
    vendor_tax_code?: string;
    vendor_address?: string;
    invoice_date: string;
    due_date?: string;
    amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    status: 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
    is_ai_scanned?: boolean;
    ai_confidence?: number;
    budget_category?: string;
    description?: string;
    notes?: string;
    attachments?: any[];
    created_at?: string;
    updated_at?: string;
}

export interface Payment {
    id: string;
    payment_code: string;
    payment_type: 'receipt' | 'disbursement';
    project_id?: string;
    contract_id?: string;
    invoice_id?: string;
    payment_date: string;
    amount: number;
    payment_method?: string;
    reference_number?: string;
    partner_name: string;
    bank_account?: string;
    bank_name?: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled';
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    description?: string;
    notes?: string;
    attachments?: any[];
    created_at?: string;
    updated_at?: string;
}

export interface CashFlowRecord {
    id: string;
    record_date: string;
    flow_type: 'inflow' | 'outflow';
    category?: string;
    project_id?: string;
    payment_id?: string;
    invoice_id?: string;
    amount: number;
    description?: string;
    notes?: string;
    created_at?: string;
}

export interface PaymentRequest {
    id: string;
    request_code: string;
    project_id?: string;
    contract_id?: string;
    partner_name: string;
    request_date: string;
    amount: number;
    work_description?: string;
    progress_percentage?: number;
    status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'paid' | 'rejected';
    quality_check_passed?: boolean;
    quality_notes?: string;
    rejection_reason?: string;
    notes?: string;
    attachments?: any[];
    created_at?: string;
    updated_at?: string;
}

export interface CashFlowSummary {
    month: string;
    inflow: number;
    outflow: number;
    net: number;
}

export interface ARAPSummary {
    total_receivables: number;
    total_payables: number;
    overdue_receivables: number;
    overdue_payables: number;
}

// =====================================================
// INVOICE SERVICES
// =====================================================

export const invoiceService = {
    async getAllInvoices(): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('invoice_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getInvoiceById(id: string): Promise<Invoice> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('project_id', projectId)
            .order('invoice_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
        // Calculate outstanding amount
        const outstanding = (invoice.total_amount || 0) - (invoice.paid_amount || 0);

        const { data, error } = await supabase
            .from('invoices')
            .insert({
                ...invoice,
                outstanding_amount: outstanding
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
        const { data, error } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteInvoice(id: string): Promise<void> {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getOverdueInvoices(): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('status', 'overdue')
            .order('due_date', { ascending: true });

        if (error) throw error;
        return data || [];
    }
};

// =====================================================
// PAYMENT SERVICES
// =====================================================

export const paymentService = {
    async getAllPayments(): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getPaymentById(id: string): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPayment(payment: Partial<Payment>): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;

        // Create corresponding cash flow record - DEPRECATED in favor of Realtime View
        /*
        if (data) {
            await cashFlowService.createCashFlowRecord({
                record_date: payment.payment_date!,
                flow_type: payment.payment_type === 'receipt' ? 'inflow' : 'outflow',
                category: payment.payment_type === 'receipt' ? 'Payment Received' : 'Payment Made',
                payment_id: data.id,
                amount: payment.amount!,
                description: `Payment ${data.payment_code}: ${payment.partner_name}`
            });
        }
        */

        return data;
    },

    async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async approvePayment(id: string, approvedBy: string): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'approved',
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async completePayment(id: string): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async rejectPayment(id: string, reason: string): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status: 'rejected',
                rejection_reason: reason
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// =====================================================
// CASH FLOW SERVICES
// =====================================================

export const cashFlowService = {
    async getAllCashFlowRecords(): Promise<CashFlowRecord[]> {
        // Fetch directly from payments triggers/view implies we should source from payments for realtime accuracy
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('status', 'completed')
            .order('payment_date', { ascending: false });

        if (error) throw error;

        // Map payments to CashFlowRecord interface
        return (data || []).map(p => ({
            id: p.id,
            record_date: p.payment_date,
            flow_type: p.payment_type === 'receipt' ? 'inflow' : 'outflow',
            category: p.payment_type === 'receipt' ? 'Thu tiền' : 'Chi tiền',
            payment_id: p.id,
            amount: p.amount,
            description: p.description || p.partner_name,
            notes: p.notes
        }));
    },

    async getCashFlowByDateRange(startDate: string, endDate: string): Promise<CashFlowRecord[]> {
        const { data, error } = await supabase
            .from('cash_flow_records')
            .select('*')
            .gte('record_date', startDate)
            .lte('record_date', endDate)
            .order('record_date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async createCashFlowRecord(record: Partial<CashFlowRecord>): Promise<CashFlowRecord> {
        const { data, error } = await supabase
            .from('cash_flow_records')
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getCashFlowSummary(months: number = 12): Promise<CashFlowSummary[]> {
        const { data, error } = await supabase
            .from('view_cash_flow_realtime')
            .select('*')
            .limit(months);

        if (error) throw error;

        // Map view columns to CashFlowSummary interface
        return (data || []).map(row => ({
            month: `T${row.month_index}/${row.year}`,
            inflow: Number(row.inflow),
            outflow: Number(row.outflow),
            net: Number(row.net_flow)
        }));
    },

    async getCurrentCashBalance(): Promise<number> {
        // Sum net_flow from the realtime view
        const { data, error } = await supabase
            .from('view_cash_flow_realtime')
            .select('net_flow');

        if (error) throw error;

        const balance = (data || []).reduce((acc, row) => acc + Number(row.net_flow), 0);
        return balance;
    }
};

// =====================================================
// PAYMENT REQUEST SERVICES
// =====================================================

export const paymentRequestService = {
    async getAllPaymentRequests(): Promise<PaymentRequest[]> {
        const { data, error } = await supabase
            .from('payment_requests')
            .select('*')
            .order('request_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getPaymentRequestById(id: string): Promise<PaymentRequest> {
        const { data, error } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPaymentRequest(request: Partial<PaymentRequest>): Promise<PaymentRequest> {
        const { data, error } = await supabase
            .from('payment_requests')
            .insert(request)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest> {
        const { data, error } = await supabase
            .from('payment_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async approvePaymentRequest(id: string, approvedBy: string): Promise<PaymentRequest> {
        const { data, error } = await supabase
            .from('payment_requests')
            .update({
                status: 'approved',
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async rejectPaymentRequest(id: string, reason: string): Promise<PaymentRequest> {
        const { data, error } = await supabase
            .from('payment_requests')
            .update({
                status: 'rejected',
                rejection_reason: reason
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// =====================================================
// ANALYTICS & REPORTING
// =====================================================

export const financeAnalytics = {
    async getARAPSummary(): Promise<ARAPSummary> {
        // Get total receivables
        const { data: receivables } = await supabase
            .from('invoices')
            .select('outstanding_amount')
            .eq('invoice_type', 'sales')
            .neq('status', 'cancelled');

        // Get total payables
        const { data: payables } = await supabase
            .from('invoices')
            .select('outstanding_amount')
            .eq('invoice_type', 'purchase')
            .neq('status', 'cancelled');

        // Get overdue receivables
        const { data: overdueAR } = await supabase
            .from('invoices')
            .select('outstanding_amount')
            .eq('invoice_type', 'sales')
            .eq('status', 'overdue');

        // Get overdue payables
        const { data: overdueAP } = await supabase
            .from('invoices')
            .select('outstanding_amount')
            .eq('invoice_type', 'purchase')
            .eq('status', 'overdue');

        return {
            total_receivables: (receivables || []).reduce((sum, r) => sum + r.outstanding_amount, 0),
            total_payables: (payables || []).reduce((sum, p) => sum + p.outstanding_amount, 0),
            overdue_receivables: (overdueAR || []).reduce((sum, r) => sum + r.outstanding_amount, 0),
            overdue_payables: (overdueAP || []).reduce((sum, p) => sum + p.outstanding_amount, 0)
        };
    }
};
