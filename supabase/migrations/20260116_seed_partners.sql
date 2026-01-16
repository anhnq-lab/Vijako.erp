-- Seed Data for Partners
INSERT INTO partners (code, name, type, tax_code, address, phone, email, contact_person, status, rating) VALUES
-- Customers (Chủ đầu tư)
('CUS001', 'Tập đoàn VinGroup', 'customer', '0101245486', 'Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Hà Nội', '02439749999', 'info@vingroup.net', 'Phạm Nhật Vượng', 'active', 5),
('CUS002', 'Sungroup', 'customer', '0400586975', 'Tầng 19, Tòa nhà Sun City, 13 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', '02439386777', 'contact@sungroup.com.vn', 'Lê Viết Lam', 'active', 5),
('CUS003', 'Ecopark Corp', 'customer', '0900246182', 'KĐT Ecopark, Văn Giang, Hưng Yên', '02462612345', 'sales@ecopark.com.vn', 'Đào Ngọc Thanh', 'active', 4),

-- Suppliers (Nhà cung cấp)
('SUP001', 'Thép Hòa Phát', 'supplier', '0900189284', 'KCN Phố Nối A, Hưng Yên', '02462848666', 'banhang@hoaphat.com.vn', 'Nguyễn Mạnh Tuấn', 'active', 5),
('SUP002', 'Xi măng Vicem Hà Tiên', 'supplier', '0300101234', 'Kiên Lương, Kiên Giang', '02838323215', 'p.kinhdoanh@vicem.vn', 'Trần Việt Thắng', 'active', 4),
('SUP003', 'Bê tông Lê Phan', 'supplier', '0301456789', 'Xa lộ Hà Nội, TP. Thủ Đức', '02838960072', 'sales@lephan.com', 'Lê Hồng Anh', 'active', 4),
('SUP004', 'Sơn Dulux Việt Nam', 'supplier', '0100112233', 'KCN Tiên Sơn, Bắc Ninh', '1900555561', 'support@dulux.vn', 'Kỹ thuật viên', 'active', 3),

-- Subcontractors (Thầu phụ)
('SUB001', 'Công ty M&E An Phát', 'subcontractor', '0105678912', '123 Giảng Võ, Đống Đa, Hà Nội', '0912345678', 'contact@anphatme.com', 'Nguyễn Văn An', 'active', 4),
('SUB002', 'Nội thất Gỗ Xanh', 'subcontractor', '0108899776', 'Thạch Thất, Hà Nội', '0987654321', 'info@goxanh.vn', 'Phạm Văn Mộc', 'active', 3),
('SUB003', 'Xây dựng Tuấn Minh (Ép cọc)', 'subcontractor', '0103344556', 'Thường Tín, Hà Nội', '0909090909', 'epcoc@tuanminh.com', 'Trần Tuấn Minh', 'warning', 2),

-- Teams (Tổ đội)
('TEAM01', 'Tổ nề - Ông Bảy', 'team', NULL, 'Hà Nam', '0988776655', NULL, 'Nguyễn Văn Bảy', 'active', 4),
('TEAM02', 'Tổ sắt - Ông Chín', 'team', NULL, 'Nam Định', '0911223344', NULL, 'Lê Văn Chín', 'active', 5),
('TEAM03', 'Tổ cốp pha - Anh Tư', 'team', NULL, 'Thanh Hóa', '0933445566', NULL, 'Phạm Văn Tư', 'active', 3)
ON CONFLICT (code) DO NOTHING;
