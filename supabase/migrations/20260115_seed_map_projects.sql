-- Migration to add coordinates and schedule performance to projects for Map view
-- Date: 2026-01-15

-- 1. Ensure columns exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS schedule_performance TEXT CHECK (schedule_performance IN ('ahead', 'on_track', 'delayed', 'preparing', 'completed'));

-- 2. Insert or Update project data
INSERT INTO public.projects (code, name, location, manager, status, lat, lng, schedule_performance, progress, plan_progress)
VALUES 
('P-KINGPALACE', 'King Palace Residences Hà Nội', '108 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'VIJAKO', 'completed', 20.9982, 105.8115, 'completed', 100, 100),
('P-LEGEND', 'The Legend', 'Thanh Xuân, Hà Nội', 'Lâm Hoàng Anh', 'completed', 21.0003, 105.8048, 'completed', 100, 100),
('P-IA20', 'Công trình nhà ở IA20', 'Khu đô thị Ciputra, Tây Hồ, Hà Nội', 'Lâm Hoàng Anh', 'completed', 21.0827, 105.7925, 'completed', 100, 100),
('P-SUNURBAN', 'Sun Urban City Hà Nam & Lam Hạ Center Point', 'Phủ Lý, Hà Nam', 'Nguyễn Văn An', 'active', 20.5422, 105.9128, 'on_track', 25, 30),
('P-ZEN', 'The Zen - Gamuda Garden', 'Hoàng Mai, Hà Nội', 'Phạm Tuấn', 'completed', 20.9735, 105.8642, 'completed', 100, 100),
('P-GREENSHADE', 'Nhà máy rèm Greenshade', 'KCN Đồng Văn, Hà Nam', 'Nguyễn Văn An', 'active', 20.5833, 105.9167, 'on_track', 60, 55),
('P-PHUCDIEN', 'KCN Phúc Điền', 'Cẩm Giàng, Hải Dương', 'Đỗ Văn Toàn', 'active', 20.9333, 106.3167, 'on_track', 100, 100),
('P-64NLB', '64 Nguyễn Lương Bằng', '64 Nguyễn Lương Bằng, Đống Đa, Hà Nội', 'Hồ Xuân Hương', 'active', 21.0125, 105.8285, 'on_track', 40, 40),
('P-001', 'Vijako Tower - Giai đoạn 2', 'KĐT Tây Hồ Tây, Hà Nội', 'Nguyễn Văn An', 'active', 21.0667, 105.7917, 'delayed', 45, 52),
('P-002', 'Khu Công nghiệp Trấn Yên', 'Trấn Yên, Yên Bái', 'Trần Văn Bình', 'active', 21.7333, 104.9167, 'on_track', 80, 75),
('P-003', 'The Nine Tower', 'Cầu Giấy, Hà Nội', 'Lê Văn Cường', 'completed', 21.0360, 105.7825, 'completed', 100, 100),
('P-005', 'Trường Tiểu học Tiên Sơn', 'Việt Yên, Bắc Giang', 'Ban chỉ huy Vijako', 'completed', 21.1856, 106.1234, 'completed', 100, 100),
('P-FOXCONN', 'Foxconn BG Factory', 'Việt Yên, Bắc Giang', 'Lê Văn C', 'active', 21.2185, 106.2015, 'on_track', 65, 60),
('P-AEON-VINH', 'Aeon Mall Vinh', 'Vinh, Nghệ An', 'Phạm Thị D', 'pending', 18.6735, 105.6813, 'preparing', 5, 5),
('P-MYTHUAN', 'Cầu Mỹ Thuận 2', 'Tiền Giang', 'Hoàng Văn E', 'active', 10.2742, 105.9555, 'ahead', 90, 85)

ON CONFLICT (code) DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    location = COALESCE(projects.location, EXCLUDED.location),
    manager = COALESCE(projects.manager, EXCLUDED.manager),
    status = COALESCE(projects.status, EXCLUDED.status);
