-- =====================================================
-- VIJAKO ERP - FINANCE & CONTRACTS DATABASE SCHEMA
-- Supabase Migration
-- Version: 1.0
-- Created: 2026-01-14
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONTRACTS MODULE TABLES
-- =====================================================

-- 1. Contracts Table (Hợp đồng)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_code VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('revenue', 'expense')),
    partner_name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Financial details
    contract_value DECIMAL(18, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    retention_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    retention_percentage DECIMAL(5, 2) DEFAULT 5.00,
    
    -- Contract status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'terminated')),
    is_risk BOOLEAN DEFAULT FALSE,
    risk_note TEXT,
    
    -- Dates
    signing_date DATE,
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    
    -- Metadata
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bidding Packages Table (Gói thầu)
CREATE TABLE IF NOT EXISTS bidding_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Bidding details
    budget DECIMAL(18, 2),
    description TEXT,
    requirements TEXT,
    
    -- Timeline
    publish_date DATE,
    submission_deadline DATE,
    evaluation_deadline DATE,
    award_date DATE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'evaluating', 'awarded', 'cancelled')),
    
    -- Winner
    winner_contractor_id UUID,
    winning_bid_amount DECIMAL(18, 2),
    
    -- Metadata
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bank Guarantees Table (Bảo lãnh ngân hàng)
CREATE TABLE IF NOT EXISTS bank_guarantees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guarantee_code VARCHAR(50) UNIQUE NOT NULL,
    guarantee_type VARCHAR(50) NOT NULL,
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    
    -- Bank details
    bank_name VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255),
    
    -- Financial
    guarantee_value DECIMAL(18, 2) NOT NULL,
    
    -- Dates
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'returned', 'claimed')),
    
    -- Metadata
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FINANCE MODULE TABLES
-- =====================================================

-- 4. Invoices Table (Hóa đơn)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_code VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('sales', 'purchase')),
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    
    -- Partner info
    vendor_name VARCHAR(255) NOT NULL,
    vendor_tax_code VARCHAR(50),
    vendor_address TEXT,
    
    -- Invoice details
    invoice_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(18, 2) NOT NULL,
    tax_amount DECIMAL(18, 2) DEFAULT 0,
    total_amount DECIMAL(18, 2) NOT NULL,
    
    -- Payment
    paid_amount DECIMAL(18, 2) DEFAULT 0,
    outstanding_amount DECIMAL(18, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'overdue', 'cancelled')),
    
    -- AI Extraction (if scanned)
    is_ai_scanned BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(5, 2),
    ai_extraction_data JSONB,
    
    -- Budget category
    budget_category VARCHAR(100),
    
    -- Metadata
    description TEXT,
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payments Table (Thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_code VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('receipt', 'disbursement')),
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_date DATE NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    
    -- Partner
    partner_name VARCHAR(255) NOT NULL,
    bank_account VARCHAR(50),
    bank_name VARCHAR(255),
    
    -- Status & Approval
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'cancelled')),
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Metadata
    description TEXT,
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Cash Flow Records Table (Dòng tiền)
CREATE TABLE IF NOT EXISTS cash_flow_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_date DATE NOT NULL,
    
    -- Flow type
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
    category VARCHAR(100),
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Amount
    amount DECIMAL(18, 2) NOT NULL,
    
    -- Description
    description TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payment Requests Table (Yêu cầu thanh toán)
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    
    -- Request details
    partner_name VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    
    -- Progress/Milestone
    work_description TEXT,
    progress_percentage DECIMAL(5, 2),
    
    -- Status & Approval workflow
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewing', 'approved', 'paid', 'rejected')),
    submitted_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Quality check (for construction)
    quality_check_passed BOOLEAN DEFAULT FALSE,
    quality_notes TEXT,
    
    -- Metadata
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Contracts indexes
CREATE INDEX idx_contracts_project_id ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- Bidding packages indexes
CREATE INDEX idx_bidding_project_id ON bidding_packages(project_id);
CREATE INDEX idx_bidding_status ON bidding_packages(status);

-- Bank guarantees indexes
CREATE INDEX idx_guarantees_project_id ON bank_guarantees(project_id);
CREATE INDEX idx_guarantees_contract_id ON bank_guarantees(contract_id);
CREATE INDEX idx_guarantees_expiry ON bank_guarantees(expiry_date);

-- Invoices indexes
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_name);

-- Payments indexes
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- Cash flow indexes
CREATE INDEX idx_cashflow_date ON cash_flow_records(record_date DESC);
CREATE INDEX idx_cashflow_project ON cash_flow_records(project_id);
CREATE INDEX idx_cashflow_type ON cash_flow_records(flow_type);

-- Payment requests indexes
CREATE INDEX idx_payment_requests_project ON payment_requests(project_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_date ON payment_requests(request_date DESC);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bidding_updated_at BEFORE UPDATE ON bidding_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guarantees_updated_at BEFORE UPDATE ON bank_guarantees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cashflow_updated_at BEFORE UPDATE ON cash_flow_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidding_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Policies (allow authenticated users to read all, modify based on role)
-- Note: Adjust based on your auth setup

-- Contracts policies
CREATE POLICY "Allow read contracts" ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert contracts" ON contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update contracts" ON contracts FOR UPDATE TO authenticated USING (true);

-- Bidding policies
CREATE POLICY "Allow read bidding" ON bidding_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert bidding" ON bidding_packages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update bidding" ON bidding_packages FOR UPDATE TO authenticated USING (true);

-- Bank guarantees policies
CREATE POLICY "Allow read guarantees" ON bank_guarantees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert guarantees" ON bank_guarantees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update guarantees" ON bank_guarantees FOR UPDATE TO authenticated USING (true);

-- Invoices policies
CREATE POLICY "Allow read invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update invoices" ON invoices FOR UPDATE TO authenticated USING (true);

-- Payments policies
CREATE POLICY "Allow read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update payments" ON payments FOR UPDATE TO authenticated USING (true);

-- Cash flow policies
CREATE POLICY "Allow read cashflow" ON cash_flow_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert cashflow" ON cash_flow_records FOR INSERT TO authenticated WITH CHECK (true);

-- Payment requests policies
CREATE POLICY "Allow read payment_requests" ON payment_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert payment_requests" ON payment_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update payment_requests" ON payment_requests FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Contract summary view
CREATE OR REPLACE VIEW contract_summary AS
SELECT 
    contract_type,
    status,
    COUNT(*) as contract_count,
    SUM(contract_value) as total_value,
    SUM(paid_amount) as total_paid,
    SUM(contract_value - paid_amount) as total_outstanding
FROM contracts
GROUP BY contract_type, status;

-- Cash flow summary view
CREATE OR REPLACE VIEW cash_flow_summary AS
SELECT 
    DATE_TRUNC('month', record_date) as month,
    flow_type,
    SUM(amount) as total_amount
FROM cash_flow_records
GROUP BY DATE_TRUNC('month', record_date), flow_type
ORDER BY month DESC;

-- Invoice aging view
CREATE OR REPLACE VIEW invoice_aging AS
SELECT 
    id,
    invoice_code,
    vendor_name,
    invoice_date,
    due_date,
    total_amount,
    outstanding_amount,
    CASE 
        WHEN due_date >= CURRENT_DATE THEN 'Current'
        WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
        WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
        ELSE 'Over 60 days'
    END as aging_category,
    CURRENT_DATE - due_date as days_overdue
FROM invoices
WHERE status NOT IN ('paid', 'cancelled')
AND outstanding_amount > 0;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE contracts IS 'Quản lý hợp đồng A-B (revenue) và B-C (expense)';
COMMENT ON TABLE bidding_packages IS 'Quản lý gói thầu và quy trình đấu thầu';
COMMENT ON TABLE bank_guarantees IS 'Quản lý bảo lãnh ngân hàng';
COMMENT ON TABLE invoices IS 'Quản lý hóa đơn bán hàng và mua hàng';
COMMENT ON TABLE payments IS 'Quản lý thanh toán thực tế';
COMMENT ON TABLE cash_flow_records IS 'Ghi nhận dòng tiền vào/ra';
COMMENT ON TABLE payment_requests IS 'Yêu cầu thanh toán từ nhà thầu phụ';
