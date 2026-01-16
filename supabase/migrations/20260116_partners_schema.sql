-- Migration: Create Partners Table (CRM)
-- Description: Unified table for Customers, Suppliers, Subcontractors, Teams.

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g. CUS001, SUP001, SUB001
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'subcontractor', 'team')),
    
    -- Contact Info
    tax_code TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Details
    contact_person TEXT,
    contact_phone TEXT,
    
    -- Business Info
    bank_name TEXT,
    bank_account TEXT,
    
    -- Status & Rating
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted', 'potential')),
    rating INTEGER DEFAULT 0, -- 1-5 stars
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert partners" ON partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update partners" ON partners FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete partners" ON partners FOR DELETE USING (auth.role() = 'authenticated'); -- Simplified

-- Create index for search
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_name ON partners USING gin(to_tsvector('simple', name));
