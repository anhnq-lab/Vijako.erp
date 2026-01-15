-- Enable public read access for Finance & Contracts tables
-- This is necessary because the app currently runs in anonymous mode without a logged-in user session,
-- but the previous RLS policies restricted access to 'authenticated' users only.

-- 1. Contracts
DROP POLICY IF EXISTS "Allow public read contracts" ON contracts;
CREATE POLICY "Allow public read contracts" ON contracts FOR SELECT USING (true);

-- 2. Invoices
DROP POLICY IF EXISTS "Allow public read invoices" ON invoices;
CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);

-- 3. Payments
DROP POLICY IF EXISTS "Allow public read payments" ON payments;
CREATE POLICY "Allow public read payments" ON payments FOR SELECT USING (true);

-- 4. Payment Requests
DROP POLICY IF EXISTS "Allow public read payment_requests" ON payment_requests;
CREATE POLICY "Allow public read payment_requests" ON payment_requests FOR SELECT USING (true);

-- 5. Cash Flow Records
DROP POLICY IF EXISTS "Allow public read cashflow" ON cash_flow_records;
CREATE POLICY "Allow public read cashflow" ON cash_flow_records FOR SELECT USING (true);

-- 6. Bank Guarantees
DROP POLICY IF EXISTS "Allow public read guarantees" ON bank_guarantees;
CREATE POLICY "Allow public read guarantees" ON bank_guarantees FOR SELECT USING (true);

-- 7. Bidding Packages
DROP POLICY IF EXISTS "Allow public read bidding" ON bidding_packages;
CREATE POLICY "Allow public read bidding" ON bidding_packages FOR SELECT USING (true);

-- 8. Projects (Ensure projects are also readable)
-- Check if policy exists or just create a catch-all for reading
DROP POLICY IF EXISTS "Allow public read projects" ON projects;
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
