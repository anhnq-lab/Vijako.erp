-- Migration: Add certified columns for Dual Tracking in IPC module
-- Target Table: interim_payment_claims

ALTER TABLE interim_payment_claims 
ADD COLUMN IF NOT EXISTS certified_works_executed_amount NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_variations_amount NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_mos_amount NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_retention_amount NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_advance_repayment NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_vat_amount NUMERIC(20, 2),
ADD COLUMN IF NOT EXISTS certified_total_with_vat NUMERIC(20, 2);

COMMENT ON COLUMN interim_payment_claims.certified_works_executed_amount IS 'Giá trị công việc hoàn thành khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_variations_amount IS 'Giá trị phát sinh khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_mos_amount IS 'Giá trị MOS khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_retention_amount IS 'Giá trị giữ lại khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_advance_repayment IS 'Giá trị hoàn trả tạm ứng khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_vat_amount IS 'Giá trị VAT khách hàng đã duyệt';
COMMENT ON COLUMN interim_payment_claims.certified_total_with_vat IS 'Tổng cộng sau thuế khách hàng đã duyệt';
