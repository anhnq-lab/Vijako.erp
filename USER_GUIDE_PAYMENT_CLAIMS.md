# Hướng dẫn Sử dụng: Module Quản lý Thanh toán Khối lượng (Payment Claims)

Tài liệu này hướng dẫn chi tiết cách vận hành module Thanh toán khối lượng trong hệ thống ERP VIJAKO theo quy trình ISO QT-CL-20.

## 1. Khởi tạo Hợp đồng & BOQ

Để bắt đầu quản lý thanh toán, bạn cần thiết lập nền tảng dữ liệu cho hợp đồng.

### Bước 1: Tạo Hợp đồng thanh toán
- Truy cập vào menu **Tài chính/Kế toán** -> Chọn tab **Thanh toán khối lượng**.
- Nhấn chọn hợp đồng từ danh sách hợp đồng gốc để khởi tạo thông tin thanh toán.
- Thiết lập các tham số tài chính:
  - **Tạm ứng**: Số tiền chủ đầu tư đã tạm ứng.
  - **Giữ lại bảo hành**: % giữ lại (thường là 5%) và hạn mức tối đa.
  - **Thuế VAT**: Thông thường là 10% hoặc 8%.

### Bước 2: Import BOQ từ Excel (BM-01)
- Trong giao diện hợp đồng, chọn nút **"Import BOQ"**.
- Tải lên file Excel mẫu BM-01. Hệ thống sẽ tự động phân tích cấu trúc cây (Bills -> Groups -> Items).
- Kiểm tra lại đơn giá và khối lượng hợp đồng sau khi import.

## 2. Quản lý Thanh toán từng đợt (IPC)

### Bước 1: Tạo hồ sơ IPC mới
- Nhấn **"Tạo IPC mới"**. Hệ thống sẽ tự động đánh số đợt (VD: Đợt 01, Đợt 02).
- Chọn khoảng thời gian thanh toán (Ngày bắt đầu - Ngày kết thúc).
- Hệ thống sẽ tự động kế thừa khối lượng lũy kế từ kỳ trước đó.

### Bước 2: Nhập khối lượng thực hiện
- Tại bảng **Chi tiết khối lượng**, nhập khối lượng thực hiện trong kỳ này vào cột **"Khối lượng kỳ này"**.
- Hệ thống sẽ tính toán thời gian thực:
  - `Lũy kế khối lượng = Kỳ trước + Kỳ này`
  - `Thành tiền = Lũy kế khối lượng * Đơn giá`

### Bước 3: Quản lý phát sinh (Variations)
- Nếu có các hạng mục ngoài hợp đồng, sử dụng nút **"Thêm phát sinh"**.
- Chỉ các hạng mục phát sinh ở trạng thái **"Đã duyệt"** mới được tính vào giá trị thanh toán của IPC.

## 4. Quy trình Phê duyệt & Workflow

Module áp dụng quy trình phê duyệt chặt chẽ:

1. **Nháp (Draft)**: QS đang soạn thảo hồ sơ.
2. **Duyệt nội bộ (Internal Review)**: Gửi Chỉ huy trưởng hoặc Ban Giám đốc duyệt trước.
3. **Đã trình (Submitted)**: Hồ sơ đã gửi cho Khách hàng/Tư vấn giám sát.
4. **Đã duyệt (Certified)**: Khách hàng đã ký xác nhận giá trị.
5. **Xuất hóa đơn (Invoiced)**: Phòng kế toán đã xuất hóa đơn dựa trên giá trị duyệt.

## 5. Tính năng Dual Tracking (Theo dõi kép)

Đây là tính năng quan trọng nhất để đối soát số liệu:
- Khi phê duyệt IPC (Chuyển từ `Submitted` sang `Certified`), người duyệt có thể điều chỉnh chi tiết từng con số khách hàng thực tế duyệt (có thể khác với số đề xuất).
- Các trường điều chỉnh bao gồm: Giá trị công việc, Phát sinh, MOS, Giữ lại bảo hành, Hoàn ứng.
- **Lưu ý**: Số liệu `Certified` này sẽ được dùng làm căn cứ **Lũy kế kỳ trước** cho IPC đợt tiếp theo.

## 6. Xuất báo cáo Excel

- Tại danh sách IPC, nhấn biểu tượng **Download** để xuất hồ sơ.
- File Excel xuất ra bao gồm 3 sheet tiêu chuẩn:
  - **Bìa**: Thư đệ trình và thông tin chung.
  - **BM-01**: Chi tiết khối lượng thực hiện.
  - **PL-01**: Bảng tổng hợp các giá trị tài chính.

---
*Lưu ý: Nếu gặp lỗi trong quá trình sử dụng, vui lòng liên hệ bộ phận IT hoặc gửi phản hồi qua email helpdesk@vijako.com.vn.*
