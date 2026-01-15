# Tài liệu Kỹ thuật: Module Quản lý Thanh toán Khối lượng (Payment Claims)

Tài liệu này cung cấp cái nhìn sâu rộng về kiến trúc và logic vận hành của module Thanh toán khối lượng.

## 1. Schema Database (Supabase / PostgreSQL)

Hệ thống bao gồm 7 bảng chính:

### payment_contracts
Lưu trữ thông tin cấu hình tài chính cho từng hợp đồng.
- `contract_id`: Liên kết tới bảng hợp đồng chính.
- `retention_percent`: % giữ lại bảo hành.
- `retention_limit`: Hạn mức giữ lại tối đa tiền mặt.
- `advance_amount`: Tổng tiền tạm ứng.
- `vat_percent`: % thuế GTGT.

### boq_items
Lưu trữ danh mục hạng mục công việc (Bill of Quantities).
- `parent_id`: Hỗ trợ cấu trúc cây vô hạn.
- `contract_qty`: Khối lượng gốc trong hợp đồng.
- `unit_rate`: Đơn giá cố định hoặc đơn giá điều chỉnh.

### interim_payment_claims (IPCs)
Lưu trữ hồ sơ thanh toán từng đợt.
- Hỗ trợ **Dual Tracking**: Lưu trữ song song số liệu `submitted_*` (do QS trình) và `certified_*` (do Khách hàng duyệt).

### ipc_work_details
Lưu trữ khối lượng thực hiện chi tiết cho từng đợt IPC.
- `current_qty`: Khối lượng thực hiện trong đợt.
- `cumulative_qty`: Tổng khối lượng thực hiện tính đến hết đợt.

### variations, ipc_documents, ipc_workflow_history
Các bảng phụ trợ quản lý phát sinh, tài liệu và lịch sử phê duyệt.

## 2. Engine Tính toán Tài chính

Logic tính toán nằm trong hàm `calculateIPCFinancials` tại `paymentClaimService.ts`.

### Công thức Hoàn trả tạm ứng (Advance Repayment)
Hệ thống sử dụng quy tắc hoàn ứng lũy tiến:
- Bắt đầu hoàn ứng khi tiến độ đạt 20%.
- Hoàn ứng hết 100% khi tiến độ đạt 80%.
- Công thức: `Cumulative_Repayment = ((Current_Progress - 20%) / (80% - 20%)) * Total_Advance`

### Công thức Giữ lại bảo hành (Retention)
- `Calculated_Retention = Gross_Total * Retention_%`
- `Final_Retention = Min(Calculated_Retention, Retention_Limit)`

## 3. Hệ thống Workflow & State Machine

Trạng thái IPC chuyển đổi theo luồng:
`draft` -> `internal_review` -> `submitted` -> `certified` -> `invoiced`.

- Khi chuyển sang `certified`, hệ thống yêu cầu input bộ số liệu `certified_*` để làm Baseline cho kỳ tiếp theo.
- Logic lấy số liệu kỳ trước luôn ưu tiên lấy từ bản ghi `certified` gần nhất.

## 4. Tích hợp Excel

Sử dụng thư viện `xlsx` để xử lý file trên client-side.
- **Import**: Sử dụng heuristic để tìm dòng header và phân loại item/group.
- **Export**: Tạo Workbook đa sheet với định dạng CSS-like cho Excel.

---
*Phát triển bởi: Antigravity AI Assistant*
