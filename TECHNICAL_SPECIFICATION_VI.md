# Đặc Tả Kỹ Thuật Hệ Thống Vijako ERP

Tài liệu này định nghĩa kiến trúc kỹ thuật, mô hình dữ liệu và các nguyên tắc phát triển cốt lõi cho dự án **Vijako ERP**.

## 1. Tổng Quan Dự Án (Project Overview)

- **Mục tiêu:** Xây dựng hệ thống quản trị tập trung, kết nối liền mạch giữa văn phòng và công trường.
- **Phạm vi:** Bao gồm các module lõi: Quản lý Dự án, Thanh toán (IPC), Tài chính, Nhân sự và Cung ứng.
- **Trạng thái:** *Production Ready* (Sẵn sàng triển khai).

## 2. Công Nghệ & Stack (Tech Stack)

*(Các mục này là mặc định cho phiên bản 2.0)*

- **Frontend:** `React 18`, `TypeScript`, `Vite`.
- **Styling:** `Tailwind CSS` (ưu tiên) hoặc `Lucide React` (icons).
- **Backend:** `Supabase` (PostgreSQL, Auth, Edge Functions).
- **State Management:** `TanStack Query` (server state), `Context API` (client state).
- **Database:** `PostgreSQL` với `Row Level Security` (RLS).
- **Maps:** `Leaflet` & `React-Leaflet` cho bản đồ dự án.

## 3. Kiến Trúc Hệ Thống (System Architecture)

- **Mô hình:** Client-Server kiến trúc `Serverless`.
- **Bảo mật (Security):**
    - **Authentication:** Sử dụng `Supabase Auth` (JWT).
    - **Authorization:** Phân quyền chặt chẽ bằng `RLS Policies`.
- **Hiệu năng (Performance):** Sử dụng `React.lazy` để code splitting và `stale-while-revalidate` caching strategy.

## 4. Đặc Tả Chức Năng (Functional Specifications)

### 4.1. Phân hệ Thanh toán (Payment Claims)

*(Đây là module phức tạp nhất, xử lý nghiệp vụ QS)*

- **Cấu trúc dữ liệu:**
    - Quản lý hạng mục theo `WBSItem` và `BOQItem`.
    - Hỗ trợ **Dual Tracking**: Lưu trữ song song giá trị `submitted` (nhà thầu) và `certified` (TVGS).
- **Logic Tài chính (Calculation Engine):**
    - **Advance Repayment:** Tự động tính hoàn ứng theo % tiến độ (ví dụ: thu hồi từ 20% - 80%).
    - **Retention Money:** Tự động giữ lại 5% - 10% giá trị thanh toán đến khi đạt `retention_limit`.

### 4.2. Phân hệ Nhân sự (HRM)

- **Quản lý hồ sơ:** Mỗi `Employee` gắn với một `user_id` và `employee_code`.
- **Chấm công:**
    - Sử dụng `Geolocation API` để xác thực vị trí chấm công.
    - Tính năng **Face Check-in** (dự kiến phase 2).

### 4.3. Quản lý Chuỗi Cung ứng (Supply Chain)

- **Yêu cầu vật tư:** `MaterialRequest` được tạo từ công trường, link trực tiếp với kho `Inventories`.
- **Đấu thầu:** So sánh giá `BiddingQuote` từ nhiều `Vendor` trên một giao diện Matrix.

## 5. Quy Chuẩn Clean Code

- **Naming Convention:**
    - Biến/Hàm: `camelCase` (ví dụ: `calculateIPCAmount`, `fetchProjectList`).
    - Component: `PascalCase` (ví dụ: `ProjectDetail.tsx`, `PaymentTable.tsx`).
    - Database Tables: `snake_case` (ví dụ: `payment_contracts`, `daily_logs`).
- **File Structure:**
    - `src/components`: UI components tái sử dụng (Button, Input).
    - `src/pages`: Các screen chính (Dashboard, Project).
    - `src/types.ts`: Định nghĩa TypeScript Interfaces toàn cục.

## 6. Tài Liệu Tham Khảo (References)

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **React Query:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
