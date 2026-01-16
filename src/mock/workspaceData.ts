
import { UserTask, UserNote } from '../services/workspaceService';
import { ApprovalRequest, ApprovalStatus } from '../../types';

export const mockTasks: UserTask[] = [
    {
        id: 't-001',
        title: 'Giao ban công trường sáng',
        sub: 'Họp điều phối với các nhà thầu phụ tại Zone A',
        time: '08:00',
        status: 'done',
        type: 'meeting',
        priority: 'high'
    },
    {
        id: 't-002',
        title: 'Nghiệm thu thép sàn tầng 5',
        sub: 'Kiểm tra khoảng cách đai, móc neo theo TCVN 4453',
        time: '09:30',
        status: 'active',
        type: 'site',
        file: 'Ban_ve_san_T5_Rev03.pdf',
        priority: 'high'
    },
    {
        id: 't-003',
        title: 'Duyệt hồ sơ thanh toán Vật tư',
        sub: 'Nhà cung cấp: Thép Hòa Phát (Đợt 3)',
        time: '11:00',
        status: 'pending',
        type: 'doc'
    },
    {
        id: 't-004',
        title: 'Kiểm tra an toàn giàn giáo',
        sub: 'Khu vực mặt ngoài trục 1-4 (Giáo Ringlock)',
        time: '14:00',
        status: 'pending',
        type: 'site'
    },
    {
        id: 't-005',
        title: 'Họp với Chủ đầu tư',
        sub: 'Báo cáo tiến độ tuần 3 tháng 10 & Chốt màu sơn',
        time: '15:30',
        status: 'pending',
        type: 'meeting'
    },
    {
        id: 't-006',
        title: 'Ký duyệt Nhật ký thi công',
        sub: 'Tổng hợp các vấn đề phát sinh trong ngày',
        time: '17:00',
        status: 'pending',
        type: 'doc'
    },
];

export const mockApprovals: ApprovalRequest[] = [
    {
        id: 'APR-2023-001',
        title: 'Đề xuất mua Bê tông thương phẩm (Đợt 5)',
        description: 'Đổ sàn tầng 6 - Zone B. Khối lượng: 120m3. Mác 300.',
        type: 'Vật tư',
        status: 'pending',
        priority: 'urgent',
        created_by: 'user-002',
        project_id: 'PRJ-001',
        project_name: 'Vijako Tower',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'APR-2023-002',
        title: 'Tạm ứng thanh toán nhân công',
        description: 'Chi trả lương tổ đội cốt pha (Tuần 2/10).',
        type: 'Thanh toán',
        status: 'pending',
        priority: 'normal',
        created_by: 'user-003',
        project_id: 'PRJ-001',
        project_name: 'Vijako Tower',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'APR-2023-003',
        title: 'Thuê Cẩu 50 tấn',
        description: 'Phục vụ lắp dựng kèo thép mái sảnh chính.',
        type: 'Thiết bị',
        status: 'pending',
        priority: 'high',
        created_by: 'user-004',
        project_id: 'PRJ-002',
        project_name: 'Skylight City',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'APR-2023-004',
        title: 'Xin nghỉ phép: Trần Thị B',
        description: 'Lý do: Việc gia đình (2 ngày).',
        type: 'Nhân sự',
        status: 'approved',
        priority: 'normal',
        created_by: 'user-005',
        project_id: 'PRJ-001',
        project_name: 'Vijako Tower',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'APR-2023-005',
        title: 'Đề xuất sửa chữa máy phát điện',
        description: 'Máy phát 300kVA bị hỏng bộ điều tốc.',
        type: 'Sửa chữa',
        status: 'rejected',
        priority: 'high',
        created_by: 'user-006',
        project_id: 'PRJ-001',
        project_name: 'Vijako Tower',
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const mockNote: UserNote = {
    id: 'note-001',
    content: '- Gọi lại cho anh Bình (Bê tông Việt Úc) trước 3h chiều để chốt lịch đổ bê tông.\n- Kiểm tra lại bản vẽ Shop tầng 6 vì có thay đổi kích thước dầm.\n- Nhắc kho chuẩn bị đủ vật tư bảo hộ cho công nhân mới.'
};

export const mockCheckIn = {
    id: 'att-001',
    employee_id: 'emp-001',
    check_in: new Date(new Date().setHours(7, 45, 0, 0)).toISOString(),
    check_out: null,
    status: 'present',
    date: new Date().toISOString().split('T')[0]
};
