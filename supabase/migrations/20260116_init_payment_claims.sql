-- ==========================================
-- PAYMENT CLAIM MANAGEMENT SYSTEM (QT-CL-20)
-- Migration: Tạo schema cho quản lý thanh toán khối lượng
-- Date: 2026-01-16
-- ==========================================

-- ==========================================
-- 1. PAYMENT CONTRACTS TABLE
-- Lưu điều khoản thanh toán cho mỗi hợp đồng
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payment_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    retention_percent NUMERIC(5, 2) DEFAULT 5.00, -- % giữ lại, VD: 5.00 = 5%
    retention_limit NUMERIC(15, 2) DEFAULT 0, -- Hạn mức giữ lại tối đa
    advance_payment_amount NUMERIC(15, 2) DEFAULT 0, -- Số tiền tạm ứng
    advance_repayment_rule TEXT, -- Quy tắc hoàn ứng (JSON hoặc formula)
    vat_percent NUMERIC(5, 2) DEFAULT 10.00, -- % VAT, VD: 10.00 = 10%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ràng buộc: Mỗi contract chỉ có 1 payment_contract
    CONSTRAINT unique_contract_payment UNIQUE(contract_id)
);

-- Index cho tra cứu nhanh
CREATE INDEX idx_payment_contracts_contract_id ON public.payment_contracts(contract_id);

-- ==========================================
-- 2. BOQ ITEMS TABLE
-- Bill of Quantities - Cấu trúc cây phân cấp
-- Bill → Group → Item
-- ==========================================

CREATE TABLE IF NOT EXISTS public.boq_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_contract_id UUID REFERENCES public.payment_contracts(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL, -- VD: "Bill 1", "Bill 2"
    group_code TEXT, -- VD: "1.0", "2.1" (NULL nếu là Bill root)
    item_code TEXT NOT NULL, -- VD: "1.1.01", "2.3.05"
    description TEXT NOT NULL, -- Mô tả hạng mục công việc
    unit TEXT NOT NULL, -- Đơn vị (m3, m2, kg, tấn, ...)
    unit_rate NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Đơn giá
    contract_qty NUMERIC(15, 3) NOT NULL DEFAULT 0, -- Khối lượng hợp đồng
    contract_amount NUMERIC(15, 2) GENERATED ALWAYS AS (unit_rate * contract_qty) STORED, -- Tự động tính
    parent_id UUID REFERENCES public.boq_items(id) ON DELETE CASCADE, -- Cho cấu trúc cây
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ràng buộc: item_code phải unique trong 1 payment_contract
    CONSTRAINT unique_item_code_per_contract UNIQUE(payment_contract_id, item_code)
);

-- Indexes cho tree queries và performance
CREATE INDEX idx_boq_items_payment_contract ON public.boq_items(payment_contract_id);
CREATE INDEX idx_boq_items_parent_id ON public.boq_items(parent_id);
CREATE INDEX idx_boq_items_bill_number ON public.boq_items(payment_contract_id, bill_number);

-- ==========================================
-- 3. INTERIM PAYMENT CLAIMS (IPCs) TABLE
-- Hồ sơ thanh toán từng đợt
-- ==========================================

CREATE TYPE ipc_status AS ENUM (
    'draft',            -- Nháp
    'internal_review',  -- Đang duyệt nội bộ
    'submitted',        -- Đã trình khách hàng
    'certified',        -- Khách hàng đã xác nhận
    'invoiced',         -- Đã xuất hóa đơn
    'rejected'          -- Từ chối
);

CREATE TABLE IF NOT EXISTS public.interim_payment_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_contract_id UUID REFERENCES public.payment_contracts(id) ON DELETE CASCADE,
    ipc_number TEXT NOT NULL, -- VD: "Đợt 01", "Đợt 02", "No. 01"
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status ipc_status DEFAULT 'draft',
    
    -- Ngày quan trọng trong workflow
    submitted_date DATE, -- Ngày trình khách hàng
    certified_date DATE, -- Ngày khách hàng xác nhận
    
    -- Các giá trị tài chính tính toán (sẽ update qua service layer)
    works_executed_amount NUMERIC(15, 2) DEFAULT 0, -- Giá trị công việc đã hoàn thành
    variations_amount NUMERIC(15, 2) DEFAULT 0, -- Giá trị phát sinh (đã duyệt)
    mos_amount NUMERIC(15, 2) DEFAULT 0, -- Material On Site (vật tư tại hiện trường)
    gross_total NUMERIC(15, 2) DEFAULT 0, -- Tổng gộp
    retention_amount NUMERIC(15, 2) DEFAULT 0, -- Số tiền giữ lại
    advance_repayment NUMERIC(15, 2) DEFAULT 0, -- Hoàn trả tạm ứng
    net_payment NUMERIC(15, 2) DEFAULT 0, -- Thanh toán ròng
    vat_amount NUMERIC(15, 2) DEFAULT 0, -- Thuế VAT
    total_with_vat NUMERIC(15, 2) DEFAULT 0, -- Tổng cộng có VAT
    
    -- Dual tracking: Số tiền trình vs Số tiền duyệt
    submitted_net_payment NUMERIC(15, 2), -- Số tiền mình trình
    certified_net_payment NUMERIC(15, 2), -- Số tiền khách hàng duyệt
    
    created_by UUID, -- ID người tạo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ràng buộc: ipc_number phải unique trong 1 payment_contract
    CONSTRAINT unique_ipc_number_per_contract UNIQUE(payment_contract_id, ipc_number)
);

-- Indexes
CREATE INDEX idx_ipcs_payment_contract ON public.interim_payment_claims(payment_contract_id);
CREATE INDEX idx_ipcs_status ON public.interim_payment_claims(status);
CREATE INDEX idx_ipcs_dates ON public.interim_payment_claims(period_start, period_end);

-- ==========================================
-- 4. IPC WORK DETAILS TABLE
-- Chi tiết khối lượng thực hiện từng hạng mục BOQ trong mỗi IPC
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ipc_work_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ipc_id UUID REFERENCES public.interim_payment_claims(id) ON DELETE CASCADE,
    boq_item_id UUID REFERENCES public.boq_items(id) ON DELETE CASCADE,
    
    -- Khối lượng
    current_qty NUMERIC(15, 3) DEFAULT 0, -- Khối lượng kỳ này
    cumulative_qty NUMERIC(15, 3) DEFAULT 0, -- Lũy kế đến kỳ này
    
    -- Giá trị (tự động tính dựa vào unit_rate từ BOQ)
    current_amount NUMERIC(15, 2) DEFAULT 0, -- Giá trị kỳ này
    cumulative_amount NUMERIC(15, 2) DEFAULT 0, -- Giá trị lũy kế
    
    notes TEXT, -- Ghi chú nếu có
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ràng buộc: Mỗi BOQ item chỉ xuất hiện 1 lần trong 1 IPC
    CONSTRAINT unique_boq_item_per_ipc UNIQUE(ipc_id, boq_item_id)
);

-- Indexes
CREATE INDEX idx_ipc_work_details_ipc ON public.ipc_work_details(ipc_id);
CREATE INDEX idx_ipc_work_details_boq_item ON public.ipc_work_details(boq_item_id);

-- ==========================================
-- 5. VARIATIONS TABLE
-- Quản lý phát sinh hợp đồng
-- ==========================================

CREATE TYPE variation_type AS ENUM (
    'material_change',  -- Thay đổi vật liệu
    'quantity_change',  -- Thay đổi khối lượng
    'new_item'          -- Hạng mục mới
);

CREATE TYPE variation_status AS ENUM (
    'pending',   -- Chờ duyệt
    'approved',  -- Đã duyệt
    'rejected'   -- Từ chối
);

CREATE TABLE IF NOT EXISTS public.variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_contract_id UUID REFERENCES public.payment_contracts(id) ON DELETE CASCADE,
    variation_code TEXT NOT NULL, -- VD: "VO-001", "VO-002"
    type variation_type NOT NULL,
    description TEXT NOT NULL,
    
    -- Số tiền
    proposed_amount NUMERIC(15, 2) NOT NULL, -- Số tiền đề xuất
    approved_amount NUMERIC(15, 2), -- Số tiền đã duyệt (NULL nếu chưa duyệt)
    
    status variation_status DEFAULT 'pending',
    
    -- Liên kết tới BOQ item nếu có (VD: thay đổi vật liệu của item nào đó)
    boq_item_id UUID REFERENCES public.boq_items(id) ON DELETE SET NULL,
    
    approved_date DATE, -- Ngày phê duyệt
    approved_by UUID, -- Người phê duyệt
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ràng buộc: variation_code phải unique trong 1 payment_contract
    CONSTRAINT unique_variation_code_per_contract UNIQUE(payment_contract_id, variation_code)
);

-- Indexes
CREATE INDEX idx_variations_payment_contract ON public.variations(payment_contract_id);
CREATE INDEX idx_variations_status ON public.variations(status);

-- ==========================================
-- 6. IPC DOCUMENTS TABLE
-- Tài liệu đính kèm cho mỗi IPC
-- ==========================================

CREATE TYPE ipc_document_type AS ENUM (
    'photo',              -- Hình ảnh thi công
    'bienbannghiemthu',   -- Biên bản nghiệm thu
    'boqdetail',          -- Chi tiết BOQ
    'other'               -- Khác
);

CREATE TABLE IF NOT EXISTS public.ipc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ipc_id UUID REFERENCES public.interim_payment_claims(id) ON DELETE CASCADE,
    document_type ipc_document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- URL từ Supabase Storage
    file_size BIGINT, -- Kích thước file (bytes)
    uploaded_by UUID, -- ID người upload
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ipc_documents_ipc ON public.ipc_documents(ipc_id);
CREATE INDEX idx_ipc_documents_type ON public.ipc_documents(document_type);

-- ==========================================
-- 7. IPC WORKFLOW HISTORY TABLE
-- Lịch sử phê duyệt workflow
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ipc_workflow_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ipc_id UUID REFERENCES public.interim_payment_claims(id) ON DELETE CASCADE,
    from_status ipc_status NOT NULL,
    to_status ipc_status NOT NULL,
    approver_id UUID, -- ID người phê duyệt
    approver_name TEXT NOT NULL,
    comments TEXT, -- Ý kiến phê duyệt
    action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ipc_workflow_history_ipc ON public.ipc_workflow_history(ipc_id);
CREATE INDEX idx_ipc_workflow_history_date ON public.ipc_workflow_history(action_date DESC);

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS cho tất cả bảng
ALTER TABLE public.payment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interim_payment_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipc_work_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipc_workflow_history ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho public access (demo mode)
-- Trong production, nên có role-based policies

-- Payment Contracts
DROP POLICY IF EXISTS "Allow all access to payment_contracts" ON public.payment_contracts;
CREATE POLICY "Allow all access to payment_contracts" ON public.payment_contracts FOR ALL USING (true);

-- BOQ Items
DROP POLICY IF EXISTS "Allow all access to boq_items" ON public.boq_items;
CREATE POLICY "Allow all access to boq_items" ON public.boq_items FOR ALL USING (true);

-- IPCs
DROP POLICY IF EXISTS "Allow all access to interim_payment_claims" ON public.interim_payment_claims;
CREATE POLICY "Allow all access to interim_payment_claims" ON public.interim_payment_claims FOR ALL USING (true);

-- IPC Work Details
DROP POLICY IF EXISTS "Allow all access to ipc_work_details" ON public.ipc_work_details;
CREATE POLICY "Allow all access to ipc_work_details" ON public.ipc_work_details FOR ALL USING (true);

-- Variations
DROP POLICY IF EXISTS "Allow all access to variations" ON public.variations;
CREATE POLICY "Allow all access to variations" ON public.variations FOR ALL USING (true);

-- IPC Documents
DROP POLICY IF EXISTS "Allow all access to ipc_documents" ON public.ipc_documents;
CREATE POLICY "Allow all access to ipc_documents" ON public.ipc_documents FOR ALL USING (true);

-- IPC Workflow History
DROP POLICY IF EXISTS "Allow all access to ipc_workflow_history" ON public.ipc_workflow_history;
CREATE POLICY "Allow all access to ipc_workflow_history" ON public.ipc_workflow_history FOR ALL USING (true);

-- ==========================================
-- 9. FUNCTIONS & TRIGGERS
-- ==========================================

-- Function để tự động update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers cho các bảng có updated_at
CREATE TRIGGER update_payment_contracts_modtime
    BEFORE UPDATE ON public.payment_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_interim_payment_claims_modtime
    BEFORE UPDATE ON public.interim_payment_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_variations_modtime
    BEFORE UPDATE ON public.variations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 10. COMMENTS (Tài liệu cho database)
-- ==========================================

COMMENT ON TABLE public.payment_contracts IS 'Điều khoản thanh toán cho hợp đồng (retention, advance, VAT rules)';
COMMENT ON TABLE public.boq_items IS 'Bill of Quantities - Cấu trúc cây phân cấp các hạng mục công việc';
COMMENT ON TABLE public.interim_payment_claims IS 'Hồ sơ thanh toán từng đợt (IPC)';
COMMENT ON TABLE public.ipc_work_details IS 'Chi tiết khối lượng thực hiện từng hạng mục trong mỗi IPC';
COMMENT ON TABLE public.variations IS 'Phát sinh hợp đồng (material change, quantity change, new items)';
COMMENT ON TABLE public.ipc_documents IS 'Tài liệu đính kèm IPC (photos, biên bản, BOQ details)';
COMMENT ON TABLE public.ipc_workflow_history IS 'Lịch sử phê duyệt workflow của IPC';

-- Migration completed successfully!
