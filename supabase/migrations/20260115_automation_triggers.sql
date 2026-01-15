-- Migration: 20260115_automation_triggers.sql
-- Description: Add database functions and triggers for realtime financial calculations

-- ==========================================
-- 1. Helper Function: Safe Cast / Sum
-- ==========================================

-- Function to update Contract Financials (Paid Amount) from Payments
CREATE OR REPLACE FUNCTION public.update_contract_financials()
RETURNS TRIGGER AS $function$
DECLARE
    v_contract_id UUID;
BEGIN
    -- Determine contract_id from NEW or OLD record
    IF (TG_OP = 'DELETE') THEN
        v_contract_id := OLD.contract_id;
    ELSE
        v_contract_id := NEW.contract_id;
    END IF;

    -- If no contract_id, exit
    IF v_contract_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate total paid amount from COMPLETED payments
    WITH payment_stats AS (
        SELECT COALESCE(SUM(amount), 0) as total_paid
        FROM public.payments
        WHERE contract_id = v_contract_id
          AND status = 'completed'
    )
    UPDATE public.contracts
    SET paid_amount = payment_stats.total_paid,
        updated_at = NOW()
    FROM payment_stats
    WHERE id = v_contract_id;

    RETURN NULL;
END;
$function$ LANGUAGE plpgsql;

-- Trigger for Contracts
DROP TRIGGER IF EXISTS trigger_update_contract_financials ON public.payments;
CREATE TRIGGER trigger_update_contract_financials
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_contract_financials();


-- ==========================================
-- 2. Function to update Invoice Financials from Payments
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_invoice_financials()
RETURNS TRIGGER AS $function$
DECLARE
    v_invoice_id UUID;
BEGIN
    -- Determine invoice_id
    IF (TG_OP = 'DELETE') THEN
        v_invoice_id := OLD.invoice_id;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;

    IF v_invoice_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate total paid for this invoice
    -- Update Invoice status and amounts
    WITH payment_stats AS (
        SELECT COALESCE(SUM(amount), 0) as total_paid
        FROM public.payments
        WHERE invoice_id = v_invoice_id
          AND status = 'completed'
    )
    UPDATE public.invoices
    SET paid_amount = payment_stats.total_paid,
        outstanding_amount = total_amount - payment_stats.total_paid,
        status = CASE 
            WHEN (total_amount - payment_stats.total_paid) <= 0 THEN 'paid'
            WHEN payment_stats.total_paid > 0 THEN 'partially_paid'
            ELSE status
        END,
        updated_at = NOW()
    FROM payment_stats
    WHERE id = v_invoice_id;

    RETURN NULL;
END;
$function$ LANGUAGE plpgsql;

-- Trigger for Invoices (listening on Payments)
DROP TRIGGER IF EXISTS trigger_update_invoice_financials ON public.payments;
CREATE TRIGGER trigger_update_invoice_financials
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_financials();


-- ==========================================
-- 3. Function to update Project Budget (Actual Amount) from Invoices
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_project_budget_actual()
RETURNS TRIGGER AS $function$
DECLARE
    v_project_id UUID;
    v_category TEXT;
BEGIN
    -- Determine project_id and category
    IF (TG_OP = 'DELETE') THEN
        v_project_id := OLD.project_id;
        v_category := OLD.budget_category;
    ELSE
        v_project_id := NEW.project_id;
        v_category := NEW.budget_category;
    END IF;

    IF v_project_id IS NULL OR v_category IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate Actual Amount (Sum of Approved/Paid/Pending Invoices, excluding cancelled)
    WITH invoice_stats AS (
        SELECT COALESCE(SUM(total_amount), 0) as total_actual
        FROM public.invoices
        WHERE project_id = v_project_id
          AND budget_category = v_category
          AND status <> 'cancelled'
    )
    UPDATE public.project_budget
    SET actual_amount = invoice_stats.total_actual
    FROM invoice_stats
    WHERE project_id = v_project_id AND category = v_category;

    RETURN NULL;
END;
$function$ LANGUAGE plpgsql;

-- Trigger for Project Budget (listening on Invoices)
DROP TRIGGER IF EXISTS trigger_update_project_budget_actual ON public.invoices;
CREATE TRIGGER trigger_update_project_budget_actual
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_project_budget_actual();


-- ==========================================
-- 4. Realtime Cash Flow View
-- ==========================================

DROP VIEW IF EXISTS public.view_cash_flow_realtime;

CREATE VIEW public.view_cash_flow_realtime AS
SELECT 
    DATE_TRUNC('month', payment_date) as month_date,
    EXTRACT(MONTH FROM payment_date) as month_index,
    EXTRACT(YEAR FROM payment_date) as year,
    -- Inflow: Receipt payments
    COALESCE(SUM(CASE WHEN payment_type = 'receipt' THEN amount ELSE 0 END), 0) as inflow,
    -- Outflow: Disbursement payments
    COALESCE(SUM(CASE WHEN payment_type = 'disbursement' THEN amount ELSE 0 END), 0) as outflow,
    -- Net
    COALESCE(SUM(CASE WHEN payment_type = 'receipt' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN payment_type = 'disbursement' THEN amount ELSE 0 END), 0) as net_flow
FROM public.payments
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', payment_date), EXTRACT(MONTH FROM payment_date), EXTRACT(YEAR FROM payment_date)
ORDER BY month_date DESC;

-- Grant permissions
GRANT SELECT ON public.view_cash_flow_realtime TO authenticated;
GRANT SELECT ON public.view_cash_flow_realtime TO service_role;
