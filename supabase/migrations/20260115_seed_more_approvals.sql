-- Seed more Approval Requests
-- Nghỉ phép (No project link usually, but for demo we might leave it null or link to office)
INSERT INTO public.approval_requests (type, title, description, status, priority, project_id, created_at)
VALUES 
('Nghỉ phép', 'Nguyễn Văn A - Xin nghỉ phép năm', 'Lý do: Giải quyết việc gia đình (2 ngày)', 'pending', 'normal', NULL, NOW() - INTERVAL '3 hours'),

-- Tuyển dụng
('Tuyển dụng', 'Yêu cầu tuyển dụng Kỹ sư QS', 'Bổ sung nhân sự cho Ban chỉ huy công trường', 'pending', 'high', (SELECT id FROM public.projects LIMIT 1), NOW() - INTERVAL '5 hours'),

-- Công tác phí
('Công tác phí', 'Đề xuất tạm ứng công tác phí', 'Đi công tác tại dự án Hải Phòng (3 ngày)', 'pending', 'normal', NULL, NOW() - INTERVAL '1 day'),

-- Mua sắm thiết bị văn phòng
('Thiết bị', 'Đề xuất mua Laptop mới', 'Laptop cho nhân viên thiết kế mới', 'pending', 'normal', NULL, NOW() - INTERVAL '2 days');
