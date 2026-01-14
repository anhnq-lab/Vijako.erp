-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS owner TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS package TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS budget NUMERIC(20, 2);

-- Insert 'Trường Tiểu học Tiên Sơn' data
INSERT INTO public.projects (code, name, location, manager, progress, plan_progress, status, owner, type, package, start_date, end_date, description, area, avatar)
VALUES (
    'P-005',
    'Trường Tiểu học Tiên Sơn',
    'Thôn Thượng Lát, xã Tiên Sơn, huyện Việt Yên, tỉnh Bắc Giang',
    'Ban chỉ huy Vijako', 
    100, 
    100, 
    'completed',
    'CAPITALAND',
    'Công trình thấp tầng',
    'Xây dựng khối phòng học tại trường tiểu học Tiên Sơn',
    '2024-03-01',
    '2024-08-30',
    'Dự án cao 02 tầng, 01 mái BTCT kết hợp kết cấu thép với tổng cộng 12 lớp học, diện tích xây dựng hơn 900m2.',
    'Hơn 900m2',
    'https://images.unsplash.com/photo-1577896335142-152ba0bcc876?q=80&w=800&auto=format&fit=crop' -- Placeholder school image
)
ON CONFLICT (code) DO UPDATE SET
    owner = EXCLUDED.owner,
    type = EXCLUDED.type,
    package = EXCLUDED.package,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    description = EXCLUDED.description,
    area = EXCLUDED.area,
    avatar = EXCLUDED.avatar,
    status = EXCLUDED.status;
