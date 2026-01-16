# Bộ Quy Tắc Phát Triển Phần Mềm

Tài liệu này định nghĩa các quy chuẩn và nguyên tắc làm việc giữa AI và User trong quá trình phát triển phần mềm.

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
*   **Chất lượng ưu tiên hàng đầu**: Code phải chạy đúng, xử lý lỗi tốt và dễ bảo trì.
*   **Tư duy sản phẩm (Product Mindset)**: Không chỉ viết code, mà còn quan tâm đến trải nghiệm người dùng (UX) và giá trị sản phẩm.
*   **Rõ ràng & Minh bạch**: Mọi thay đổi quan trọng đều cần được giải thích và thông qua (Plan -> Approve -> Execute).
*   **Tối ưu hóa**: Luôn cân nhắc về hiệu năng (performance) và bảo mật ngay từ đầu.

## 2. Công Nghệ & Stack (Tech Stack)
*(Các mục này sẽ được điều chỉnh tùy theo dự án cụ thể, nhưng đây là mặc định)*
*   **Frontend**: React, TypeScript, Next.js (nếu cần SSR), Vite.
*   **Styling**: Tailwind CSS (ưu tiên) hoặc CSS Modules/SCSS.
*   **Backend**: Node.js, Supabase, hoặc Python (nếu xử lý data).
*   **State Management**: React Query (server state), Zustand/Context API (client state).
*   **Testing**: Jest, React Testing Library.

## 3. Quy Chuẩn Clean Code
*   **Naming Convention**:
    *   Biến/Hàm: `camelCase` (ví dụ: `getUserData`, `isLoggedin`).
    *   Component: `PascalCase` (ví dụ: `UserProfile.tsx`).
    *   Hằng số: `UPPER_SNAKE_CASE` (ví dụ: `MAX_RETRY_COUNT`).
*   **Cấu trúc thư mục**: Phân chia rõ ràng theo chức năng (Feature-based) hoặc Layer-based.
*   **TypeScript**: Hạn chế tối đa dùng `any`. Định nghĩa interface/type rõ ràng.
*   **Comments**: Comment giải thích "Tại sao" (Why) thay vì "Cái gì" (What), trừ khi code quá phức tạp.

## 4. Quy Trình Làm Việc (Workflow) & Giao Tiếp
1.  **Giao Tiếp (Communication)**:
    *   **Ngôn ngữ**: 100% Tiếng Việt (Vietnamese).
    *   **Phong cách**: Thân thiện, chuyên nghiệp, giải thích rõ ràng.
2.  **Phân tích (Analyze)**: Hiểu rõ yêu cầu, đọc context.
3.  **Lập kế hoạch (Plan)**: Tạo `implementation_plan.md` cho các tác vụ lớn.
4.  **Thực thi (Execute)**: Viết code từng bước, kiểm tra liên tục.
5.  **Git Workflow (Critical)**:
    *   **Auto-Push**: Sau **MỖI** lần cập nhật code (dù nhỏ), PHẢI thực hiện `git commit` và `git push` ngay lập tức để đồng bộ.
    *   Commit message: Rõ ràng, mô tả đúng thay đổi (Ví dụ: `feat: cập nhật rules`, `fix: sửa lỗi login`).
    *   Không commit các file nhạy cảm (.env) hoặc folder build (node_modules).
6.  **Kiểm thử (Verify)**: Tự động hoặc hướng dẫn user test để đảm bảo feature hoạt động.
7.  **Review**: Cập nhật tài liệu, thông báo user.

## 5. UI/UX & Thẩm Mỹ
*   Giao diện hiện đại, tối giản nhưng tinh tế.
*   Responsive trên mọi thiết bị (Mobile-first).
*   Luôn có trạng thái `Loading`, `Error`, và `Empty` state cho các danh sách/dữ liệu.

## 6. Phạm Vi Áp Dụng
*   Áp dụng cho dự án hiện tại và các dự án tương lai.
