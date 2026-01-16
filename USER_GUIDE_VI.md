# Tài Liệu Mô Tả Tính Năng & Hướng Dẫn Sử Dụng Chi Tiết - Vijako ERP

Tài liệu này cung cấp cái nhìn toàn diện và chuyên sâu về hệ thống quản trị doanh nghiệp **Vijako ERP**, bao gồm mô tả chi tiết từng tính năng, quy tắc nghiệp vụ rẽ nhánh và hướng dẫn thao tác cụ thể.

---

## 1. Tổng Quan Hệ Thống (System Overview)

Hệ thống được thiết kế theo kiến trúc **Cloud-native**, cho phép truy cập mọi lúc mọi nơi trên mọi thiết bị (PC, Laptop, Tablet, Smartphone).

### 1.1. Giao Diện Người Dùng (User Experience)
- **Thiết kế tối giản (Minimalist Design):** Loại bỏ các chi tiết thừa, tập trung vào dữ liệu quan trọng. Sử dụng khoảng trắng hợp lý để giảm tải nhận thức cho người dùng.
- **Thực đơn điều hướng thông minh (Smart Navigation):**
    - Sidebar tự động thu gọn khi xem trên màn hình nhỏ.
    - Chế độ **Dark Mode** giúp bảo vệ mắt khi làm việc ban đêm hoặc trong điều kiện thiếu sáng tại công trường.
- **Tốc độ xử lý:** Ứng dụng công nghệ **Single Page Application (SPA)** giúp chuyển trang tức thì, không cần tải lại toàn bộ trang web.

### 1.2. Cơ Chế Bảo Mật & Phân Quyền
- **Xác thực 2 lớp (2FA):** Tùy chọn bảo mật cao cho các tài khoản Kế toán trưởng và Giám đốc.
- **Phân quyền dữ liệu (Row Level Security):**
    - `Giám đốc`: Xem toàn bộ dữ liệu công ty.
    - `PM Dự án A`: Chỉ xem được dữ liệu của dự án A.
    - `Kế toán kho`: Chỉ xem được module Kho, không xem được module Nhân sự.

---

## 2. Phân Hệ Quản Trị Dự Án (Project Management)

Đây là "trái tim" của hệ thống, nơi tập trung mọi hoạt động sản xuất kinh doanh cốt lõi.

### 2.1. Bảng Thông Tin (Project Dashboard)
Cung cấp cái nhìn "trực thăng" (Helicopter View) về sức khỏe dự án:
- **Tiến độ thi công (S-Curve):** Biểu đồ đường so sánh giữa `Kế hoạch` (Baseline) và `Thực tế` (Actual). Nếu đường thực tế nằm dưới đường kế hoạch -> **Dự án đang chậm**.
- **Chỉ số tài chính:**
    - `Budget Utilized`: Ngân sách đã tiêu thụ.
    - `Cost Variance (CV)`: Chênh lệch chi phí (Lãi/Lỗ tạm tính).
- **Cảnh báo rủi ro:** Hệ thống tự động quét và hiển thị các cảnh báo đỏ như: *Vật tư chậm về*, *Nhân lực thiếu hụt*, *Sắp đến hạn thanh toán*.

### 2.2. Tiến Độ & Gantt Chart (Phần Nâng Cao)
Công cụ lập kế hoạch mạnh mẽ thay thế hoàn toàn MS Project:
- **Cấu trúc WBS (Work Breakdown Structure):** Phân chia công việc thành nhiều cấp (Hạng mục -> Công tác -> Chi tiết). Không giới hạn số cấp.
- **Quản lý phụ thuộc (Dependencies):**
    - Thiết lập các mối quan hệ: `Finish-to-Start` (Việc A xong thì B mới bắt đầu), `Start-to-Start` (A và B cùng làm), v.v.
    - Tự động dời lịch toàn bộ các công việc phía sau nếu công việc phía trước bị trễ (**Auto-scheduling**).
- **Đường Găng (Critical Path Method - CPM):** Hệ thống tự động tính toán và tô màu đỏ các công việc nằm trên đường găng. Bất kỳ sự chậm trễ nào trên các công việc này đều sẽ làm chậm tiến độ toàn dự án.

### 2.3. Nhật Ký Thi Công Số (Site Diary)
Quy trình số hóa giúp minh bạch hóa hoạt động tại công trường:
- **Dữ liệu thời tiết tự động:** Hệ thống kết nối API với trạm khí tượng gần nhất để lấy dữ liệu `Nhiệt độ`, `Độ ẩm`, `Lượng mưa` tại các mốc giờ 7h, 13h, 17h.
- **Quản lý nhân lực thầu phụ:**
    - Ghi nhận số lượng nhân công của từng tổ đội/thầu phụ.
    - Đối chiếu với cam kết trong hợp đồng để đánh giá năng lực thầu phụ.
- **Thư viện ảnh hiện trường:**
    - Ảnh upload được tự động đóng dấu nước (**Watermark**) chứa: *Tọa độ GPS, Thời gian chụp, Tên người chụp* để chống gian lận ảnh cũ.

---

## 3. Phân Hệ Tài Chính & QS (Financial & Quantity Surveying)

Giải quyết bài toán kiểm soát chi phí (Cost Control) chặt chẽ đến từng đồng.

### 3.1. Quản Lý Hợp Đồng (Contracts)
- **Lưu trữ tập trung:** Số hóa toàn bộ hợp đồng A (Với CĐT) và hợp đồng B (Với Thầu phụ/NCC).
- **Cảnh báo hạn mức:** Tự động cảnh báo khi giá trị phụ lục hoặc phát sinh vượt quá giá trị dự phòng phí (`Contingency`) của dự án.

### 3.2. Thanh Toán Khối Lượng (IPC - Interim Payment Certificate)
Tính năng ưu việt nhất, giúp giảm 90% thời gian làm hồ sơ thanh toán:
- **Kế thừa dữ liệu:** Khi tạo đợt thanh toán mới (`IPC n`), hệ thống tự động chốt số liệu `Lũy kế` của `IPC n-1` chuyển sang. Không cần nhập lại, tránh sai số học.
- **Engine tính toán tự động:**
    - **Hoàn ứng (Advance Repayment):** Tự động tính số tiền cần thu hồi dựa trên `Quy tắc hoàn ứng` (Ví dụ: Thu hồi 15% giá trị thanh toán cho đến khi hết tạm ứng).
    - **Giữ lại bảo hành (Retention Money):** Tự động giữ lại 5% hoặc 10% giá trị mỗi đợt, và tự động dừng giữ lại khi đã đạt mức trần (`Retention Cap`).
- **Theo dõi kép (Dual Tracking Logic):**
    - Luôn tồn tại 2 bộ số liệu song song: `Submitted` (Nhà thầu trình) và `Certified` (TVGS/CĐT duyệt).
    - Mọi tính toán tài chính (VAT, Net Payment) đều chạy song song trên cả 2 bộ số liệu này để PM thấy rõ sự cắt giảm từ phía CĐT.

### 3.3. Quản Lý Dòng Tiền (Cashflow)
- **Kế hoạch dòng tiền:** Cho phép PM nhập kế hoạch thu/chi dự kiến cho các tháng tiếp theo.
- **Báo cáo thực tế:** Hệ thống tự động tổng hợp từ các IPC đã duyệt và các PO đã thanh toán để lên báo cáo dòng tiền thực tế.
- **Phân tích chênh lệch:** So sánh Plan vs Actual để rút kinh nghiệm.

---

## 4. Phân Hệ Chuỗi Cung Ứng (Supply Chain Management)

### 4.1. Yêu Cầu Vật Tư (Material Request - MR)
- **Kiểm soát định mức:** Khi kỹ sư yêu cầu vật tư (ví dụ: Thép), hệ thống tự động so sánh với `Tổng khối lượng BoQ` của dự án. Nếu yêu cầu vượt định mức -> Cảnh báo đỏ và yêu cầu giải trình.
- **Quy trình duyệt đa cấp:**
    - Dưới 10 triệu: PM duyệt.
    - Từ 10 - 50 triệu: Giám đốc Khối duyệt.
    - Trên 50 triệu: Tổng Giám đốc duyệt.

### 4.2. Đấu Thầu & Mua Sắm (Procurement)
- **Mời thầu trực tuyến:** Gửi email mời thầu tự động đến danh sách NCC trong hệ thống.
- **Ma trận so sánh giá (Bid Comparison Matrix):**
    - Tự động liệt kê đơn giá của 3 NCC trên cùng một bảng.
    - So sánh chi tiết từng hạng mục, tô màu `Xanh` (Rẻ nhất) và `Đỏ` (Đắt nhất).
    - Tự động tính tổng giá trị gói thầu của từng NCC để ra quyết định nhanh.

### 4.3. Quản Lý Kho (Warehouse)
- **Nhập/Xuất kho:** Hỗ trợ quét mã QR Code trên thiết bị di động để làm phiếu nhập/xuất nhanh tại kho công trường.
- **Báo cáo tồn kho:** Xem tồn kho thời gian thực (Real-time stock). Biết chính xác công trường nào đang thừa vật tư gì để điều chuyển nội bộ, tránh lãng phí mua mới.

---

## 5. Trợ Lý Ảo Thông Minh (AI Assistant)

Hệ thống tích hợp lõi trí tuệ nhân tạo **Google Gemini** để hỗ trợ ra quyết định.

### 5.1. Truy Vấn Dữ Liệu Tự Nhiên (Natural Language Query)
Thay vì phải vào từng báo cáo để xem, người dùng có thể "chat" với hệ thống:
- *"Cho tôi xem doanh thu tháng này của dự án Quảng Ninh?"*
- *"Nhà cung cấp Hòa Phát đang còn nợ bao nhiêu tiền?"*
Hệ thống sẽ tự động truy vấn Database và trả lời con số chính xác.

### 5.2. Phân Tích & Dự Báo
- **Dự báo dòng tiền:** AI phân tích lịch sử thanh toán để dự báo khả năng thiếu hụt dòng tiền trong tương lai.
- **Đánh giá rủi ro:** Phân tích nhật ký thi công và tiến độ để cảnh báo rủi ro chậm tiến độ trước 2 tuần.

---

*Tài liệu này được cập nhật liên tục theo các phiên bản nâng cấp của phần mềm Vijako ERP.*
