-- Seed HRM Data based on Organizational Chart
-- First, clear existing employees to avoid conflicts if needed (optional, but good for clean seed)
-- DELETE FROM employees;

INSERT INTO employees (employee_code, full_name, role, department, site, status)
VALUES 
-- Ban Điều hành
('VJ-0001', 'Lê Văn Trọng', 'Tổng Giám đốc', 'Ban Điều hành', 'Văn phòng chính', 'active'),
('VJ-0002', 'Trần Bảo Ngọc', 'Phó Tổng Giám đốc', 'Ban Điều hành', 'Văn phòng chính', 'active'),
('VJ-0003', 'Nguyễn Minh Đức', 'Giám đốc Điều hành', 'Ban Điều hành', 'Văn phòng chính', 'active'),

-- Khối Hỗ trợ - Phòng Tài chính Kế toán
('VJ-1001', 'Phạm Thị Lan', 'Trưởng phòng Tài chính Kế toán', 'Phòng Tài chính Kế toán', 'Văn phòng chính', 'active'),
('VJ-1002', 'Hoàng Văn Hải', 'Kế toán Tổng hợp', 'Phòng Tài chính Kế toán', 'Văn phòng chính', 'active'),
('VJ-1003', 'Nguyễn Thu Hà', 'Kế toán viên', 'Phòng Tài chính Kế toán', 'Văn phòng chính', 'active'),
('VJ-1004', 'Lê Thị Mai', 'Kế toán Đầu tư', 'Phòng Tài chính Kế toán', 'Văn phòng chính', 'active'),
('VJ-1005', 'Đỗ Thùy Linh', 'Kế toán thanh toán', 'Phòng Tài chính Kế toán', 'Văn phòng chính', 'active'),

-- Khối Hỗ trợ - Phòng Hành chính Nhân sự
('VJ-2001', 'Đỗ Thành Vinh', 'Trưởng phòng Hành chính Nhân sự', 'Phòng Hành chính Nhân sự', 'Văn phòng chính', 'active'),
('VJ-2002', 'Nguyễn Phương Thảo', 'Chuyên viên Nhân sự', 'Phòng Hành chính Nhân sự', 'Văn phòng chính', 'active'),
('VJ-2003', 'Trần Văn Quyết', 'Chuyên viên Hành chính', 'Phòng Hành chính Nhân sự', 'Văn phòng chính', 'active'),
('VJ-2004', 'Lê Kim Liên', 'Thư ký Ban Điều hành', 'Phòng Hành chính Nhân sự', 'Văn phòng chính', 'active'),

-- Khối Điều hành Sản xuất - Phòng Quản lý Thi công
('VJ-3001', 'Nguyễn Hữu Thắng', 'Trưởng phòng Quản lý Thi công', 'Phòng Quản lý Thi công', 'Văn phòng chính', 'active'),
('VJ-3002', 'Lý Văn Nam', 'Kỹ sư Xây dựng', 'Phòng Quản lý Thi công', 'Vijako Tower', 'active'),
('VJ-3003', 'Bùi Văn Bình', 'Cán bộ Kỹ thuật hiện trường', 'Phòng Quản lý Thi công', 'The Nine', 'active'),
('VJ-3004', 'Phạm Minh Hoàng', 'Kỹ sư giám sát', 'Phòng Quản lý Thi công', 'Vijako Tower', 'active'),

-- Khối Điều hành Sản xuất - Phòng Đấu thầu & QL Hợp đồng
('VJ-4001', 'Vũ Thị Hồng', 'Trưởng phòng Đấu thầu', 'Phòng Đấu thầu và Quản lý Hợp đồng', 'Văn phòng chính', 'active'),
('VJ-4002', 'Trần Trung Kiên', 'Chuyên viên Đấu thầu', 'Phòng Đấu thầu và Quản lý Hợp đồng', 'Văn phòng chính', 'active'),
('VJ-4003', 'Nguyễn Thanh Tùng', 'Chuyên viên QS', 'Phòng Đấu thầu và Quản lý Hợp đồng', 'Văn phòng chính', 'active'),

-- Khối Điều hành Sản xuất - Phòng Quản lý Cơ điện (MEP)
('VJ-5001', 'Tạ Văn Tùng', 'Trưởng phòng MEP', 'Phòng Quản lý Cơ điện', 'Văn phòng chính', 'active'),
('VJ-5002', 'Nguyễn Văn Hùng', 'Kỹ sư MEP', 'Phòng Quản lý Cơ điện', 'Vijako Tower', 'active'),
('VJ-5003', 'Đặng Đình Huy', 'Kỹ sư điện', 'Phòng Quản lý Cơ điện', 'The Nine', 'active'),

-- Khối Điều hành Sản xuất - Phòng Quản lý Vật tư & Thiết bị
('VJ-6001', 'Lê Hoàng Anh', 'Trưởng phòng Vật tư', 'Phòng Quản lý Vật tư & Thiết bị', 'Văn phòng chính', 'active'),
('VJ-6002', 'Nguyễn Văn Đạt', 'Nhân viên Vật tư', 'Phòng Quản lý Vật tư & Thiết bị', 'The Nine', 'active'),
('VJ-6003', 'Trần Văn Phước', 'Thủ kho công trình', 'Phòng Quản lý Vật tư & Thiết bị', 'Vijako Tower', 'active'),

-- Khối Điều hành Sản xuất - Ban An toàn
('VJ-7001', 'Trương Văn Sỹ', 'Trưởng Ban An toàn', 'Ban An toàn', 'Văn phòng chính', 'active'),
('VJ-7002', 'Vũ Văn Khải', 'Cán bộ An toàn', 'Ban An toàn', 'Vijako Tower', 'active'),

-- Các Ban chỉ huy công trường & Tổ đội (Seed more to reach 125 total)
('VJ-8001', 'Nguyễn Văn An', 'Chỉ huy trưởng', 'Ban QLDA', 'Vijako Tower', 'active'),
('VJ-8002', 'Trần Văn Long', 'Chỉ huy phó', 'Ban QLDA', 'Vijako Tower', 'active'),
('VJ-8003', 'Lê Thị Hoa', 'Kế toán công trường', 'Ban QLDA', 'The Nine', 'active'),
('VJ-8004', 'Phạm Văn Hậu', 'Kỹ sư trắc đạc', 'Ban QLDA', 'Vijako Tower', 'active');

-- Generate 91 more staff/workers for Ban QLDA to reach 125
INSERT INTO employees (employee_code, full_name, role, department, site, status)
SELECT 
    'VJ-W' || LPAD(i::text, 4, '0'),
    CASE (i % 4)
        WHEN 0 THEN 'Nguyễn Văn ' || i
        WHEN 1 THEN 'Trần Thị ' || i
        WHEN 2 THEN 'Lê Hoàng ' || i
        ELSE 'Phạm Minh ' || i
    END,
    CASE 
        WHEN i <= 30 THEN 'Kỹ sư hiện trường'
        WHEN i <= 60 THEN 'Công nhân lành nghề'
        ELSE 'Lao động phổ thông'
    END,
    'Ban QLDA',
    CASE (i % 2) WHEN 0 THEN 'Vijako Tower' ELSE 'The Nine' END,
    'active'
FROM generate_series(1, 91) AS i
ON CONFLICT (employee_code) DO UPDATE 
SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    site = EXCLUDED.site,
    status = EXCLUDED.status;
