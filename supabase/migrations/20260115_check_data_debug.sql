-- CHECK DATA EXISTENCE AND TABLE STRUCTURE
-- Run this in Supabase SQL Editor to verify data

-- 1. Check Row Counts
SELECT 'contracts' as table_name, count(*) as row_count FROM contracts
UNION ALL
SELECT 'bank_guarantees', count(*) FROM bank_guarantees
UNION ALL
SELECT 'payment_requests', count(*) FROM payment_requests;

-- 2. Check Column Names for Contracts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contracts' 
AND column_name LIKE '%type%';

-- 3. Check bank_guarantees columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bank_guarantees';
