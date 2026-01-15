-- Fix RLS policies to allow public (anon) access for Finance tables
-- Previous policies were limited to 'authenticated' role

-- Contracts
DROP POLICY IF EXISTS "Allow read contracts" ON contracts;
CREATE POLICY "Public read contracts" ON contracts FOR SELECT USING (true);

-- Bidding
DROP POLICY IF EXISTS "Allow read bidding" ON bidding_packages;
CREATE POLICY "Public read bidding" ON bidding_packages FOR SELECT USING (true);

-- Guarantees
DROP POLICY IF EXISTS "Allow read guarantees" ON bank_guarantees;
CREATE POLICY "Public read guarantees" ON bank_guarantees FOR SELECT USING (true);

-- Invoices
DROP POLICY IF EXISTS "Allow read invoices" ON invoices;
CREATE POLICY "Public read invoices" ON invoices FOR SELECT USING (true);

-- Payments
DROP POLICY IF EXISTS "Allow read payments" ON payments;
CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true);

-- Cash Flow
DROP POLICY IF EXISTS "Allow read cashflow" ON cash_flow_records;
CREATE POLICY "Public read cashflow" ON cash_flow_records FOR SELECT USING (true);

-- Payment Requests
DROP POLICY IF EXISTS "Allow read payment_requests" ON payment_requests;
CREATE POLICY "Public read payment_requests" ON payment_requests FOR SELECT USING (true);
