# Task: Kiểm tra và Cải tiến Chất lượng Dự án

## Mục tiêu
Nâng cao tính bảo mật, tuân thủ nguyên tắc SOLID, tối ưu hóa trải nghiệm người dùng (UX) với các hiệu ứng bắt mắt, và dọn dẹp mã nguồn.

---

## Phase 1: Audit & Đề xuất (PLANNING)
- [x] Rà soát lỗi bảo mật (Price manipulation, Role-based Access Control)
- [x] Đánh giá mức độ tuân thủ SOLID
- [x] Đánh giá giao diện & Trải nghiệm người dùng (UX/Aesthetics)
- [x] Viết implementation_plan.md (Bản cải tiến)
- [/] Nhận phản hồi và phê duyệt từ người dùng

## Phase 2: Bảo mật & Backend (EXECUTION)
- [ ] Khắc phục lỗ hổng thao túng giá (Price manipulation) trong Checkout
- [ ] Thêm kiểm tra trạng thái Vendor khi đặt hàng
- [ ] Áp dụng Dependency Injection cho các Controller & Service (SOLID)
- [ ] Tập trung hóa xử lý lỗi (Centralized Error Handling)

## Phase 3: Frontend & Aesthetics (EXECUTION)
- [ ] Cài đặt `framer-motion` cho animations
- [ ] Thêm Hero Animations cho trang chủ và các trang quản lý
- [ ] Tối ưu hóa chuyển cảnh modal và page transitions
- [ ] Chuẩn hóa Loading/Empty states cho toàn bộ hệ thống
- [ ] Hoàn thiện UI trang Thiết lập cửa hàng (Shop Settings)

## Phase 4: Dọn dẹp & Tinh chỉnh (EXECUTION)
- [ ] Chuẩn hóa Naming Convention (CamelCase/PascalCase)
- [ ] Loại bỏ code dư thừa còn sót lại
- [ ] Kiểm tra lỗi Lint và tối ưu performance

## Phase 5: Xác minh (VERIFICATION)
- [ ] Chạy thử nghiệm luồng đặt hàng với giá ảo (đảm bảo bị chặn)
- [ ] Kiểm tra tính mượt mà của animations trên các thiết bị
- [ ] Kiểm tra logic DI và Error handling
- [ ] Viết walkthrough.md tổng kết cải tiến
