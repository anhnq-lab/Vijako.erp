-- Ensure map-related columns exist (just in case)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS schedule_performance TEXT CHECK (schedule_performance IN ('ahead', 'on_track', 'delayed', 'preparing', 'completed'));

-- Insert/Update Projects from images
-- 1. King Palace Residences Hà Nội
INSERT INTO public.projects (code, name, location, manager, status, start_date, end_date, description, owner, lat, lng, schedule_performance, avatar)
VALUES (
    'P-KINGPALACE',
    'King Palace Residences Hà Nội',
    '108 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    'VIJAKO',
    'completed',
    '2019-07-01',
    '2020-12-31',
    'Dự án nằm trên diện tích khu đất rộng 6.973 m2; Trong đó diện tích xây dựng là 3.137 m2; Tổ hợp bao gồm 2 tòa tháp, cao 36 tầng và 3 tầng hầm, với tổng số 410 căn hộ cao cấp.',
    'Công ty Cổ phần Bất động sản Hoa Anh Đào',
    20.9982, 105.8115,
    'completed',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager = EXCLUDED.manager,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    owner = EXCLUDED.owner,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    avatar = EXCLUDED.avatar;

-- 2. The Legend
INSERT INTO public.projects (code, name, location, manager, status, start_date, end_date, description, owner, lat, lng, schedule_performance, avatar)
VALUES (
    'P-LEGEND',
    'The Legend',
    'Thanh Xuân, Hà Nội',
    'Lâm Hoàng Anh',
    'completed',
    '2017-09-01',
    '2019-04-30',
    'Dự án được xây dựng trên khu đất có tổng diện tích 5.579m2, The Legend gồm 2 tòa tháp căn hộ cao 30 tầng và 2 tầng hầm, có 460 căn hộ.',
    'BDV JSC',
    21.0003, 105.8048,
    'completed',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager = EXCLUDED.manager,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    owner = EXCLUDED.owner,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    avatar = EXCLUDED.avatar;

-- 3. Công trình nhà ở IA20
INSERT INTO public.projects (code, name, location, manager, status, start_date, end_date, description, owner, lat, lng, schedule_performance, avatar)
VALUES (
    'P-IA20',
    'Công trình nhà ở IA20',
    'Khu đô thị Ciputra, Tây Hồ, Hà Nội',
    'Lâm Hoàng Anh',
    'completed',
    '2018-12-01',
    '2020-02-29',
    'Dự án gồm 3 tòa chung cư cao cấp: A1 (29 tầng), tòa A2 (29 tầng), tòa B (40 tầng) với tổng cộng gần 1500 căn hộ và 03 tầng hầm.',
    'Công ty CP Đầu tư BĐS Đông Đô - Bộ Quốc Phòng',
    21.0827, 105.7925,
    'completed',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager = EXCLUDED.manager,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    owner = EXCLUDED.owner,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    avatar = EXCLUDED.avatar;

-- 4. Sunshine City
INSERT INTO public.projects (code, name, location, manager, status, start_date, end_date, description, owner, lat, lng, schedule_performance, avatar)
VALUES (
    'P-SUNCITY',
    'Sunshine City',
    'Khu đô thị Ciputra, Tây Hồ, Hà Nội',
    'VIJAKO',
    'completed',
    '2017-10-01',
    '2020-10-31',
    'Sunshine City có tổng diện tích 5ha, có gần 100 căn biệt thự liền kề và 6 tháp căn hộ với nội thất dát vàng.',
    'Tập đoàn Sunshine',
    21.0845, 105.7940,
    'completed',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecde9d1?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager = EXCLUDED.manager,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    owner = EXCLUDED.owner,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    avatar = EXCLUDED.avatar;

-- 5. Sun Urban City Hà Nam & Lam Hạ Center Point
INSERT INTO public.projects (code, name, location, manager, status, start_date, end_date, description, owner, lat, lng, schedule_performance, avatar)
VALUES (
    'P-SUNURBAN',
    'Sun Urban City Hà Nam & Lam Hạ Center Point',
    'Phủ Lý, Hà Nam',
    'VIJAKO',
    'active',
    '2023-01-01',
    '2026-12-31',
    'Dự án Sun Urban City Hà Nam là khu đô thị sinh thái đẳng cấp do Sun Group phát triển, quy mô lên đến 420ha.',
    'Tập đoàn SUN Group',
    20.5422, 105.9128,
    'on_track',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    manager = EXCLUDED.manager,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    owner = EXCLUDED.owner,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    schedule_performance = EXCLUDED.schedule_performance,
    avatar = EXCLUDED.avatar;
