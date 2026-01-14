-- Recruitment System Tables
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    salary_range TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('open', 'closed', 'paused')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES job_postings(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cv_url TEXT,
    cover_letter TEXT,
    status TEXT CHECK (status IN ('applied', 'screening', 'interviewing', 'offered', 'rejected')) DEFAULT 'applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read open jobs" ON job_postings FOR SELECT USING (status = 'open');
CREATE POLICY "Public submit application" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own application" ON job_applications FOR SELECT USING (true); -- Simplified for now

-- Seed Job Postings (Matching image)
INSERT INTO job_postings (title, department, start_date, end_date, description)
VALUES 
('KẾ TOÁN TỔNG HỢP', 'Phòng Tài chính kế toán', '2025-03-06', '2025-07-02', 'Quản lý các hoạt động kế toán tổng hợp của công ty.'),
('NHÂN VIÊN KẾ TOÁN', 'Phòng Tài chính kế toán', '2025-03-06', '2025-07-02', 'Hỗ trợ các công việc kế toán hàng ngày.'),
('CHUYÊN VIÊN ĐẦU TƯ', 'Bộ phận đầu tư', '2025-05-30', '2025-06-29', 'Phân tích và nghiên cứu các cơ hội đầu tư mới.'),
('CÁN BỘ KỸ THUẬT MEP', 'Bộ phận Cơ điện', '2025-05-27', '2025-06-26', 'Giám sát và triển khai các hạng mục cơ điện tại công trường.'),
('CHUYÊN VIÊN HÀNH CHÍNH – NHÂN SỰ', 'Phòng Hành chính nhân sự và Bộ phận thư ký', '2025-05-27', '2025-06-26', 'Quản lý các công việc hành chính và hỗ trợ tuyển dụng.'),
('TUYỂN DỤNG THỦ KHO CÔNG TRÌNH', 'Bộ phận vật tư', '2025-04-14', '2025-05-15', 'Quản lý kho vật tư tại các dự án.'),
('TUYỂN DỤNG CÁN BỘ TRẮC ĐẠC', 'Các Ban chỉ huy công trường', '2025-04-14', '2025-05-15', 'Thực hiện các công việc khảo sát, trắc đạc tại hiện trường.'),
('TUYỂN DỤNG PHÓ GIÁM ĐỐC', 'Bộ phận Nhà công nghiệp', '2025-04-01', '2025-10-05', 'Hỗ trợ Giám đốc điều hành các hoạt động kinh doanh.'),
('TUYỂN DỤNG CÁN BỘ KỸ THUẬT HIỆN TRƯỜNG', 'Bộ phận Nhà công nghiệp', '2025-03-28', '2025-04-29', 'Giám sát thi công và quản lý chất lượng công trình.'),
('TUYỂN DỤNG KẾ TOÁN ĐẦU TƯ', 'Bộ phận đầu tư', '2025-03-01', '2025-04-15', 'Quản lý tài chính và báo cáo cho các dự án đầu tư.');
