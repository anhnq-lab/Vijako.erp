import { Invoice, PaymentRecord, CashFlowData } from '../../types';

// --- Sample Data for Debt Transactions (Giao dịch công nợ) ---

// 1. Invoices (Hóa đơn - Công nợ phải thu/trả)
export const mockInvoices: Invoice[] = [
    // Sales Invoices (Phải thu - Doanh thu)
    {
        id: 'inv-001',
        invoice_code: 'INV-2024-001',
        invoice_type: 'sales',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-001',
        contract_code: 'HD-2024/SLT-01',
        vendor_name: 'Skyline Invest Group', // Chủ đầu tư
        invoice_date: '2024-10-15',
        due_date: '2024-11-15',
        total_amount: 5200000000, // 5.2 tỷ
        paid_amount: 2000000000,
        outstanding_amount: 3200000000,
        status: 'partially_paid'
    },
    {
        id: 'inv-002',
        invoice_code: 'INV-2024-002',
        invoice_type: 'sales',
        project_id: 'p-002',
        project_name: 'Riverside Villa',
        contract_id: 'c-002',
        contract_code: 'HD-2024/RSV-05',
        vendor_name: 'Riverside Development',
        invoice_date: '2024-10-20',
        due_date: '2024-11-20',
        total_amount: 1500000000, // 1.5 tỷ
        paid_amount: 0,
        outstanding_amount: 1500000000,
        status: 'pending'
    },
    {
        id: 'inv-003',
        invoice_code: 'INV-2024-003',
        invoice_type: 'sales',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-001',
        contract_code: 'HD-2024/SLT-01',
        vendor_name: 'Skyline Invest Group',
        invoice_date: '2024-09-01',
        due_date: '2024-10-01',
        total_amount: 3800000000,
        paid_amount: 3800000000,
        outstanding_amount: 0,
        status: 'paid'
    },
    // Purchase Invoices (Phải trả - Chi phí)
    {
        id: 'inv-004',
        invoice_code: 'PUR-2024-105',
        invoice_type: 'purchase',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-003',
        contract_code: 'HD-TP/HP-01',
        vendor_name: 'Thép Hòa Phát',
        invoice_date: '2024-10-10',
        due_date: '2024-11-10',
        total_amount: 850000000, // 850tr
        paid_amount: 0,
        outstanding_amount: 850000000,
        status: 'pending'
    },
    {
        id: 'inv-005',
        invoice_code: 'PUR-2024-106',
        invoice_type: 'purchase',
        project_id: 'p-002',
        project_name: 'Riverside Villa',
        contract_id: 'c-004',
        contract_code: 'HD-XM/HT-02',
        vendor_name: 'Xi măng Hà Tiên',
        invoice_date: '2024-10-12',
        due_date: '2024-11-12',
        total_amount: 420000000,
        paid_amount: 200000000,
        outstanding_amount: 220000000,
        status: 'partially_paid'
    },
    {
        id: 'inv-006',
        invoice_code: 'PUR-2024-099',
        invoice_type: 'purchase',
        project_id: 'p-003',
        project_name: 'Sunshine School',
        contract_id: 'c-005',
        contract_code: 'HD-NC/VJK-01',
        vendor_name: 'Nhân công An Phát',
        invoice_date: '2024-09-25',
        due_date: '2024-10-25',
        total_amount: 150000000,
        paid_amount: 0,
        outstanding_amount: 150000000,
        status: 'overdue'
    }
];

// 2. Payments (Giao dịch thu/chi thực tế)
export const mockPayments: PaymentRecord[] = [
    // Receipts (Thu tiền)
    {
        id: 'pay-001',
        payment_code: 'PAY-IN-001',
        payment_type: 'receipt',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-001',
        contract_code: 'HD-2024/SLT-01',
        payment_date: '2024-10-18',
        amount: 2000000000,
        payment_method: 'bank_transfer',
        partner_name: 'Skyline Invest Group',
        status: 'completed',
        description: 'Thanh toán đợt 1 HĐ HD-2024/SLT-01'
    },
    {
        id: 'pay-002',
        payment_code: 'PAY-IN-002',
        payment_type: 'receipt',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-001',
        contract_code: 'HD-2024/SLT-01',
        payment_date: '2024-09-05',
        amount: 3800000000,
        payment_method: 'bank_transfer',
        partner_name: 'Skyline Invest Group',
        status: 'completed',
        description: 'Tạm ứng hợp đồng'
    },
    // Disbursements (Chi tiền)
    {
        id: 'pay-003',
        payment_code: 'PAY-OUT-001',
        payment_type: 'disbursement',
        project_id: 'p-002',
        project_name: 'Riverside Villa',
        contract_id: 'c-004',
        contract_code: 'HD-XM/HT-02',
        payment_date: '2024-10-20',
        amount: 200000000,
        payment_method: 'bank_transfer',
        partner_name: 'Xi măng Hà Tiên',
        status: 'completed',
        description: 'Thanh toán tiền xi măng đợt 1'
    },
    {
        id: 'pay-004',
        payment_code: 'PAY-OUT-002',
        payment_type: 'disbursement',
        project_id: 'p-001',
        project_name: 'Skyline Tower',
        contract_id: 'c-006',
        contract_code: 'HD-MB/TB-01',
        payment_date: '2024-10-22',
        amount: 50000000,
        payment_method: 'cash',
        partner_name: 'Thuê máy ủi Minh Long',
        status: 'pending',
        description: 'Thanh toán ca máy tháng 10'
    }
];

// --- Sample Data for Budget Cash Flow (Dòng tiền ngân sách) ---

export const mockCashFlow: CashFlowData[] = [
    { name: 'T1/2024', thu: 4500000000, chi: 3500000000, net: 1000000000 },
    { name: 'T2/2024', thu: 5200000000, chi: 4800000000, net: 400000000 },
    { name: 'T3/2024', thu: 4800000000, chi: 5500000000, net: -700000000 }, // Âm
    { name: 'T4/2024', thu: 6100000000, chi: 4200000000, net: 1900000000 },
    { name: 'T5/2024', thu: 5500000000, chi: 5000000000, net: 500000000 },
    { name: 'T6/2024', thu: 6700000000, chi: 5800000000, net: 900000000 },
    { name: 'T7/2024', thu: 7200000000, chi: 6100000000, net: 1100000000 },
    { name: 'T8/2024', thu: 6800000000, chi: 6500000000, net: 300000000 },
    { name: 'T9/2024', thu: 8100000000, chi: 6900000000, net: 1200000000 },
    { name: 'T10/2024', thu: 7900000000, chi: 7200000000, net: 700000000 },
    // Forecast (Dự báo)
    { name: 'T11/2024', thu: 9200000000, chi: 7500000000, net: 1700000000 },
    { name: 'T12/2024', thu: 10500000000, chi: 8200000000, net: 2300000000 },
];
