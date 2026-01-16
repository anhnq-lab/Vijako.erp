# Tài liệu Đặc tả Kỹ thuật Hệ thống Vijako ERP

## 1. Tổng quan Dự án (Project Overview)

**Vijako ERP** là một hệ thống hoạch định nguồn lực doanh nghiệp chuyên dụng cho lĩnh vực xây dựng và quản lý dự án. Hệ thống được thiết kế để số hóa toàn diện quy trình vận hành từ quản lý dự án, tài chính, nhân sự đến chuỗi cung ứng và thi công hiện trường.

### 1.1. Mục tiêu
- Tập trung hóa dữ liệu dự án và quy trình nghiệp vụ trên một nền tảng duy nhất.
- Tự động hóa các quy trình phê duyệt, thanh toán và báo cáo.
- Cung cấp cái nhìn bao quát thời gian thực (real-time) về sức khỏe tài chính và tiến độ dự án.
- Tăng cường khả năng cộng tác giữa văn phòng và công trường.

### 1.2. Phạm vi
Hệ thống bao gồm các phân hệ chính:
- Quản lý Dự án (Project Management)
- Quản lý Tài chính & Kế toán (Finance & Accounting)
- Quản lý Chuỗi cung ứng (Supply Chain)
- Quản lý Nhân sự & Tuyển dụng (HRM & Recruitment)
- Quản lý Hồ sơ & Tài liệu (Document Management / CDE)
- Quản lý Thi công & Nhật ký công trình (Site Diary)
- Quản lý Thanh toán khối lượng (Payment Claims)

---

## 2. Kiến trúc Kỹ thuật (Technical Architecture)

### 2.1. Công nghệ sử dụng (Tech Stack)

#### Frontend
- **Core Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **UI Library**: Tailwind CSS (Styling), Lucide React (Icons)
- **Component Libraries / Utilities**:
  - `gantt-task-react`: Biểu đồ Gantt cho tiến độ.
  - `recharts`: Biểu đồ thống kê.
  - `leaflet`, `react-leaflet`: Bản đồ số dự án.
  - `react-hot-toast`: Thông báo toast.
  - `date-fns`: Xử lý thời gian.
  - `xlsx`: Xử lý Excel (Import/Export).
  - `@google/generative-ai`: Tích hợp AI Assistant.

#### Backend & Database
- **Platform**: [Supabase](https://supabase.com/) (Backend-as-a-Service)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (lưu trữ tài liệu, hình ảnh)

### 2.2. Cấu trúc Dự án (Project Structure)

```
d:\Vijako.erp
├── src
│   ├── components      # Các UI component tái sử dụng (Button, Input, Layout...)
│   ├── context         # React Context (Auth, Notification...)
│   ├── pages           # Các trang chính của ứng dụng (Dashboard, Project, Finance...)
│   └── types.ts        # Định nghĩa toàn bộ TypeScript interfaces/types
├── supabase            # Cấu hình và migration cho Supabase
├── public              # Static assets
└── package.json        # Dependencies và scripts
```

---

## 3. Mô hình Dữ liệu (Key Data Models)

Hệ thống được xây dựng dựa trên các thực thể chính sau (tham chiếu từ `types.ts`):

### 3.1. Dự án & Hợp đồng (Core)
- **Project**: Chứa thông tin dự án, địa điểm, ngân sách, thành viên.
- **Contract**: Quản lý hợp đồng A (Thu) và B (Chi), giá trị, điều khoản thanh toán.
- **WBSItem**: Cấu trúc phân chia công việc (Work Breakdown Structure).

### 3.2. Tài chính (Finance)
- **Budget**: Ngân sách dự án theo hạng mục.
- **Revenue/Expense**: Dòng tiền thu chi.
- **PaymentRequest**: Yêu cầu thanh toán.
- **Invoice**: Hóa đơn GTGT.
- **PaymentClaim (IPC)**: Hồ sơ thanh toán khối lượng thi công (chi tiết ở mục 4.5).

### 3.3. Chuỗi cung ứng (Supply Chain)
- **Vendor**: Nhà cung cấp, thầu phụ.
- **MaterialRequest**: Yêu cầu vật tư từ công trường.
- **PurchaseOrder (PO)**: Đơn đặt hàng.
- **InventoryItem**: Kho vật tư.

### 3.4. Nhân sự (HRM)
- **Employee**: Hồ sơ nhân sự, chức vụ, phòng ban.
- **DailyLog**: Nhật ký nhân lực và thiết bị hàng ngày trên công trường.

---

## 4. Chi tiết Chức năng các Phân hệ (Module Details)

### 4.1. Dashboard (Bảng điều khiển)
- Hiển thị tổng quan các chỉ số KPI: Tiến độ, Dòng tiền, Công việc cá nhân.
- Tích hợp Widgets: Thời tiết, Lịch, Thông báo nhanh.

### 4.2. Quản lý Dự án (Project Management)
- **Danh sách dự án**: Hiển thị dạng lưới hoặc bản đồ (Leaflet).
- **Chi tiết dự án**:
  - Theo dõi tiến độ WBS.
  - Quản lý rủi ro (Risk Matrix).
  - Quản lý vấn đề (Issues: NCR, RFI).
  - Thư viện tài liệu dự án.

### 4.3. Quản lý Tài chính (Finance)
- Theo dõi dòng tiền (Cash Flow).
- Quản lý hợp đồng và tình trạng thanh toán.
- Báo cáo lãi lỗ (P&L) theo dự án.

### 4.4. Quản lý Hồ sơ Thanh toán (Payment Claims)
*Đây là phân hệ phức tạp nhất, quản lý quy trình QS.*
- **Cấu hình hợp đồng**: Thiết lập % giữ lại, hoàn ứng, VAT.
- **BOQ (Bill of Quantities)**: Quản lý đầu mục khối lượng dạng cây.
- **IPC (Interim Payment Certificate)**:
  - Tính toán tự động: Giá trị thực hiện, Vật liệu tại hiện trường, Biến động giá.
  - Quy trình duyệt: Nhà thầu trình -> Tư vấn duyệt -> Chủ đầu tư xác nhận.
  - Theo dõi lũy kế và hạn mức thanh toán.

### 4.5. Nhật ký thi công (Site Diary)
- Báo cáo ngày về: Thời tiết, Nhân lực (Manpower), Thiết bị (Equipment).
- Ghi nhận công việc đã thực hiện và sự vụ phát sinh.
- Upload hình ảnh hiện trường.
- Quy trình duyệt nhật ký: Kỹ sư -> Chỉ huy trưởng -> TVGS.

### 4.6. Văn phòng số (Digital Workspace)
- **Task Management**: Quản lý công việc cá nhân (Kanban/List).
- **Approval System**: Hệ thống phê duyệt đề xuất online (Nghỉ phép, Thanh toán, Vật tư).
- **Documents**: Hệ thống lưu trữ tài liệu tập trung (CDE) với version control.

---

## 5. Quy trình Nghiệp vụ Chính (Business Processes)

### 5.1. Quy trình Thanh toán (Payment Process)
1. **Lập hồ sơ**: QS lập hồ sơ thanh toán (IPC) dựa trên khối lượng hoàn thành.
2. **Trình duyệt**: Gửi hồ sơ qua workflow phê duyệt nội bộ.
3. **Xác nhận**: TVGS/CĐT xác nhận khối lượng (Certified quantity).
4. **Xuất hóa đơn**: Tài chính xuất hóa đơn dựa trên giá trị được duyệt.
5. **Thanh toán**: Cập nhật trạng thái thanh toán thực tế.

### 5.2. Quy trình Cung ứng (Procurement Process)
1. **Yêu cầu**: Công trường tạo Yêu cầu vật tư (Material Request).
2. **Duyệt**: PM/Giám đốc duyệt yêu cầu.
3. **Báo giá**: Phòng mua hàng thu thập báo giá (Bidding).
4. **Đặt hàng**: Tạo PO gửi nhà cung cấp được chọn.
5. **Nhập kho**: Ghi nhận nhập kho khi hàng về công trường.

---

## 6. Bảo mật & Hiệu năng

### 6.1. Bảo mật
- **Authentication**: Sử dụng JWT thông qua Supabase Auth.
- **Authorization**: Phân quyền dựa trên Role (Admin, Project Manager, Site Engineer, Accountant, Partner).
- **Data Protection**: Row Level Security (RLS) trên PostgreSQL để đảm bảo user chỉ truy cập dữ liệu được phép.

### 6.2. Hiệu năng
- Sử dụng `React.lazy` và `Suspense` để tải trang theo nhu cầu (Code splitting).
- Caching dữ liệu phía Client với `React Query` (Stale time 5 phút).
- Tối ưu hóa render component với React memoization.

---

## 7. Kết luận

Hệ thống Vijako ERP được thiết kế với kiến trúc hiện đại, khả năng mở rộng cao (Scalability) và tập trung vào trải nghiệm người dùng (UX). Nền tảng này sẵn sàng để tích thêm các công nghệ mới như AI (cho phân tích dữ liệu) và IoT (cho giám sát công trường) trong tương lai.
