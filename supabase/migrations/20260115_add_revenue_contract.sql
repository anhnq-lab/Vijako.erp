-- Migration to add Revenue Contracts for Project: Khách sạn Hà Nội Dream Residence
-- Project ID: cdd98632-ee12-4c29-9b35-7cf55b91d375

INSERT INTO public.contracts (
    contract_code,
    contract_type,
    partner_name,
    project_id,
    contract_value,
    paid_amount,
    retention_amount,
    retention_percentage,
    status,
    signing_date,
    start_date,
    end_date,
    notes,
    created_at,
    updated_at
)
VALUES
(
    'HĐ-2024-CĐT-001',
    'revenue',
    'Tập đoàn Dream Group',
    'cdd98632-ee12-4c29-9b35-7cf55b91d375',
    150000000000, -- 150 Tỷ
    30000000000,  -- 30 Tỷ đã thanh toán
    0,
    5.00,
    'active',
    '2024-01-15',
    '2024-02-01',
    '2025-06-30',
    'Hợp đồng thi công xây dựng trọn gói',
    NOW(),
    NOW()
),
(
    'HĐ-2024-CĐT-001-PL01',
    'revenue',
    'Tập đoàn Dream Group',
    'cdd98632-ee12-4c29-9b35-7cf55b91d375',
    5000000000,   -- 5 Tỷ
    0,
    0,
    5.00,
    'draft',
    '2024-03-01',
    '2024-03-01',
    '2024-05-30',
    'Phụ lục phát sinh 01: Quy hoạch cảnh quan',
    NOW(),
    NOW()
)
ON CONFLICT (contract_code) DO UPDATE SET
    contract_value = EXCLUDED.contract_value,
    paid_amount = EXCLUDED.paid_amount,
    partner_name = EXCLUDED.partner_name,
    contract_type = EXCLUDED.contract_type,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verify data
SELECT contract_code, contract_type, contract_value, partner_name 
FROM public.contracts 
WHERE project_id = 'cdd98632-ee12-4c29-9b35-7cf55b91d375';
