# Kế hoạch: Cải tiến Chất lượng và Trải nghiệm Dự án

## Tóm tắt nội dung
Sau khi rà soát (Audit) mã nguồn, tôi phát hiện một số điểm cần cải thiện để dự án đạt tiêu chuẩn "Gorgeous" và "SOLID" như yêu cầu của bạn.

---

## 🛡️ Bảo mật & Backend (SOLID)

### 1. Chống Thao túng giá (Price Manipulation)
> [!IMPORTANT]
> **Vấn đề**: Hiện tại `OrderService.createOrder` đang tin tưởng hoàn toàn vào `DonGia` gửi từ Frontend. Kẻ xấu có thể can thiệp request để mua sản phẩm với giá 0đ.
- **Giải pháp**: Lấy giá trực tiếp từ database cho mỗi sản phẩm trong logic tạo đơn hàng.

### 2. Dependency Injection (DI)
> [!NOTE]
> **SOLID**: Áp dụng Inversion of Control bằng cách truyền Service vào Controller qua constructor thay vì tạo mới (`new`).
- Áp dụng cho: `OrderController`, `SellerOrderController`, `VendorController`.

### 3. Kiểm soát trạng thái Vendor
- Khi đặt hàng, hệ thống sẽ kiểm tra xem Shop (Vendor) đó có đang ở trạng thái `APPROVED` hay không. Chặn đặt hàng nếu shop bị khóa hoặc chưa kích hoạt.

---

## ✨ Aesthetics & UX (Gorgeous UI)

### 1. Hero Animations & Transitions
- Cài đặt và sử dụng `framer-motion`.
- **Page Transitions**: Hiệu ứng trượt nhẹ hoặc fade khi chuyển giữa các trang quản lý.
- **Hero Effects**: Tiêu đề trang, các card thống kê sẽ có hiệu ứng xuất hiện kèm độ trễ (stagger).
- **Modal Animations**: Modal mượt mà hơn với scale & opacity.

### 2. Micro-interactions
- Feedback khi nhấn nút (Scale down nhẹ).
- Hiệu ứng "Lấp lánh" (Shimmer) cho các state loading.
- Hiệu ứng thành công bắt mắt khi cập nhật đơn hàng hoặc đăng ký thành công.

---

## 🧹 Clean Code & Công cụ

### 1. Centralized Error Handling
- Tạo một middleware xử lý lỗi tập trung để trả về format JSON thống nhất, tránh việc `try-catch` lặp lại quá nhiều ở Controller.

### 2. Chuẩn hóa Naming
- Đảm bảo tính nhất quán giữa Backend (PascalCase cho DB fields) và Frontend (camelCase cho mapping).

---

## Proposed Changes (Chi tiết)

### [Component] Backend Core
#### [MODIFY] [order.service.ts](file:///c:/Users/chung/Downloads/e-commerce_platform/backend/src/services/order.service.ts)
- Thay đổi logic `createOrder`: sử dụng `product.Gia` thay vì `item.DonGia` từ client.
#### [MODIFY] [Controllers...](file:///c:/Users/chung/Downloads/e-commerce_platform/backend/src/controllers/)
- Refactor sang Dependency Injection.

### [Component] Frontend UI
#### [MODIFY] [DashboardLayout.tsx](file:///c:/Users/chung/Downloads/e-commerce_platform/frontend/src/layouts/DashboardLayout.tsx)
- Tích hợp `AnimatePresence` và `motion` cho content body.
#### [MODIFY] [Home.tsx](file:///c:/Users/chung/Downloads/e-commerce_platform/frontend/src/pages/Home.tsx)
- Thêm Hero section bắt mắt với các animation xuất hiện tinh tế.

---

## Verification Plan

### Automated/Manual Testing
- **Test Bảo mật**: Dùng Postman gửi đơn hàng với giá sai lệch → Phải nhận lỗi hoặc hệ thống tự tính lại theo giá đúng.
- **Test UX**: Quay video màn hình kiểm tra độ mượt của animation (60fps).
- **Test SOLID**: Kiểm tra unit test (nếu có) hoặc đảm bảo server khởi động không lỗi sau khi refactor DI.
