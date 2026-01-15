-- =====================================================
-- VIJAKO ERP - FIX FINANCE RLS POLICIES (FORCE APPLY)
-- Migration: 20260115_fix_finance_rls_v2.sql
-- Created: 2026-01-15
-- Purpose: Đảm bảo các bảng tài chính có thể đọc bởi public (anon) để hiển thị trên dashboard
-- =====================================================

-- 1. Contracts
DROP POLICY IF EXISTS "Public read contracts" ON contracts;
DROP POLICY IF EXISTS "Allow read contracts" ON contracts;
CREATE POLICY "Public read contracts" ON contracts FOR SELECT USING (true);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 2. Invoices
DROP POLICY IF EXISTS "Public read invoices" ON invoices;
DROP POLICY IF EXISTS "Allow read invoices" ON invoices;
CREATE POLICY "Public read invoices" ON invoices FOR SELECT USING (true);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 3. Payments
DROP POLICY IF EXISTS "Public read payments" ON payments;
DROP POLICY IF EXISTS "Allow read payments" ON payments;
CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Payment Requests
DROP POLICY IF EXISTS "Public read payment_requests" ON payment_requests;
DROP POLICY IF EXISTS "Allow read payment_requests" ON payment_requests;
CREATE POLICY "Public read payment_requests" ON payment_requests FOR SELECT USING (true);
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- 5. Bank Guarantees
DROP POLICY IF EXISTS "Public read guarantees" ON bank_guarantees;
DROP POLICY IF EXISTS "Allow read guarantees" ON bank_guarantees;
CREATE POLICY "Public read guarantees" ON bank_guarantees FOR SELECT USING (true);
ALTER TABLE bank_guarantees ENABLE ROW LEVEL SECURITY;

-- 6. Cash Flow Records (Monthly)
DROP POLICY IF EXISTS "Public read cashflow" ON cash_flow_records;
DROP POLICY IF EXISTS "Allow read cashflow" ON cash_flow_records;
CREATE POLICY "Public read cashflow" ON cash_flow_records FOR SELECT USING (true);
ALTER TABLE cash_flow_records ENABLE ROW LEVEL SECURITY;

-- 7. Cash Flow Monthly (New table for dashboard)
DROP POLICY IF EXISTS "Public read cashflow_monthly" ON cash_flow_monthly;
CREATE POLICY "Public read cashflow_monthly" ON cash_flow_monthly FOR SELECT USING (true);
ALTER TABLE cash_flow_monthly ENABLE ROW LEVEL SECURITY;

-- 8. Projects (Ensure projects are readable)
DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);


