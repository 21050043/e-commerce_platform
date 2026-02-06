USE shop;

-- Seed VaiTro
INSERT INTO VaiTro (MaVaiTro, TenVaiTro)
VALUES 
    (0, 'Quản trị viên'),
    (1, 'Nhân viên'),
    (2, 'Khách hàng'),
    (3, 'Người bán');

-- Seed NhanVien (passwords are already bcrypt hashed)
INSERT INTO NhanVien (MaVaiTro, TenNhanVien, SoDienThoai, MatKhau, DiaChi)
VALUES
    (0, 'Admin', '0901234567', '$2a$12$Gd1DwtLpJOiVaEhLXjKwKuOL50wDb1FOtTb6AGrD8mrDCxyrmOquy', '123 Đường Admin, Quận 1, TP HCM'),
    (1, 'Nhân viên 1', '0912345678', '$2a$12$L3un9Wg1yMnyvTKuWAxKF.nW4aV2FS6f6OauasyJ5m1Csr0ORLEZa', '456 Đường NV, Quận 2, TP HCM'),
    (1, 'Nhân viên 2', '0912345679', '$2a$12$M9kPXni1vigAngFnz2Y7vuMRwjF1CuoAlczkXLOUrWa81O3ewtky6', '789 Đường NV, Quận 3, TP HCM');

-- Seed KhachHang (passwords are already bcrypt hashed)
INSERT INTO KhachHang (MaVaiTro, TenKhachHang, SoDienThoai, MatKhau, DiaChi)
VALUES
    (3, 'Khách hàng 1', '0923456789', '$2a$12$kDOXSl3QsobIKnqa0.7/kuJzEwQiqxQmKnoLw6HBiWsDFHeTdr55e', '123 Đường KH, Quận 1, TP HCM'),
    (2, 'Khách hàng 2', '0923456780', '$2a$12$3WErTWo5laf8.5Ks3/OItuwAkQvRToX/hZ.cI8SxT4ywBSNWiq2DG', '456 Đường KH, Quận 2, TP HCM'),
    (2, 'Khách hàng 3', '0923456781', '$2a$12$hHzaPBHADKEAPG5yoqrGZO2HagmBG3WRlirwx9fMWvDrV6tmJVGUK', '789 Đường KH, Quận 3, TP HCM');

-- Seed DanhMuc
INSERT INTO DanhMuc (TenDanhMuc, HinhAnh)
VALUES 
    ('Vi điều khiển & Nhúng', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
    ('Cảm biến', 'https://images.unsplash.com/photo-1591405351990-4726e33df58a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
    ('Module chức năng', 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
    ('Màn hình & Hiển thị', 'https://images.unsplash.com/photo-1563213126-a4273aed9016?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
    ('Nguồn & Phụ kiện', 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
    ('Linh kiện thụ động', 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80');

-- Seed NguoiBan
INSERT INTO NguoiBan (MaKhachHang, LoaiHinh, TenCuaHang, DiaChiKinhDoanh, EmailLienHe, MaDanhMucChinh, SoDienThoaiLienHe, TrangThai)
VALUES
    (1, 'CA_NHAN', 'Linh Kiện Official', '123 Đường Vendor, Quận 1, TP HCM', 'contact@electronic-hub.vn', 1, '0934567890', 'APPROVED');

-- Seed SanPham
INSERT INTO SanPham (TenSanPham, MaDanhMuc, MoTa, SoLuong, GiaSanPham, HinhAnh, MaNguoiBan)
VALUES
    -- Danh mục 1: Vi điều khiển & Nhúng
    ('Arduino Uno R3', 1, 'Board mạch vi điều khiển phổ biến nhất cho người mới bắt đầu lập trình nhúng', 100, 150000, 'https://images.unsplash.com/photo-1608564697171-4191307f9035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('ESP32-WROOM-32', 1, 'Vi điều khiển mạnh mẽ tích hợp Wifi và Bluetooth cho các ứng dụng IoT', 80, 120000, 'https://images.unsplash.com/photo-1591405351990-4726e33df58a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('STM32F103C8T6 Blue Pill', 1, 'Module ARM Cortex-M3 mạnh mẽ, giá rẻ cho các dự án chuyên nghiệp', 50, 65000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Raspberry Pi 4 Model B (4GB)', 1, 'Máy tính nhúng mạnh mẽ, hỗ trợ hệ điều hành Linux đầy đủ', 20, 1850000, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),

    -- Danh mục 2: Cảm biến
    ('Cảm biến siêu âm HC-SR04', 2, 'Sử dụng để đo khoảng cách bằng sóng siêu âm (2cm - 400cm)', 120, 25000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Cảm biến nhiệt độ độ ẩm DHT11', 2, 'Cảm biến cơ bản đo nhiệt độ và độ ẩm kỹ thuật số', 100, 15000, 'https://images.unsplash.com/photo-1591405351990-4726e33df58a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Mắt nhận hồng ngoại PIR HC-SR501', 2, 'Cảm biến chuyển động hồng ngoại thân nhiệt', 70, 35000, 'https://images.unsplash.com/photo-1563213126-a4273aed9016?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),

    -- Danh mục 3: Module chức năng
    ('Module Bluetooth HC-05', 3, 'Module Bluetooth SPP (Serial Port Protocol) cho giao tiếp không dây', 60, 85000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',1),
    ('Module nạp Relay 5V 1 Kênh', 3, 'Điều khiển các thiết bị điện xoay chiều công suất lớn', 150, 12000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Module RFID RC522', 3, 'Module đọc thẻ từ RFID 13.56MHz cho hệ thống kiểm soát cửa', 40, 55000, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),

    -- Danh mục 4: Màn hình & Hiển thị
    ('Màn hình LCD 1602 I2C', 4, 'Màn hình hiển thị văn bản 16 cột x 2 hàng kèm module I2C', 90, 45000, 'https://images.unsplash.com/photo-1563213126-a4273aed9016?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Màn hình OLED 0.96 inch I2C', 4, 'Màn hình hiển thị nhỏ gọn trung thực, độ tương phản cao', 80, 55000, 'https://images.unsplash.com/photo-1563213126-a4273aed9016?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('LED Ma trận 8x8 MAX7219', 4, 'Module hiển thị LED ma trận nhiều bảng ghép nối lại với nhau', 40, 32000, 'https://images.unsplash.com/photo-1563213126-a4273aed9016?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),

    -- Danh mục 5: Nguồn & Phụ kiện
    ('Nguồn Adapter 12V 2A', 5, 'Nguồn cung cấp ổn định cho cá thiết bị điện tử, vi điều khiển', 50, 65000, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Module hạ áp LM2596', 5, 'Module điều chỉnh điện áp DC-DC hạ áp tối đa 3A', 200, 18000, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Dây cắm Breadboard Đực-Cái', 5, 'Bộ 40 dây cắm 20cm hỗ trợ lắp ráp mạch nhanh', 300, 15000, 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),

    -- Danh mục 6: Linh kiện thụ động
    ('Bộ 100 Điện trở các loại', 6, 'Gồm các giá trị thông dụng từ 10 Ohm đến 1M Ohm', 500, 10000, 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Bộ 50 Tụ gốm nhiều giá trị', 6, 'Tụ gốm lọc nguồn, ổn định tín hiệu trong mạch', 200, 8000, 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1),
    ('Combo 10 LED 5mm Đỏ-Xanh-Vàng', 6, 'Đèn LED báo hiệu trạng thái, hiển thị cơ bản', 400, 5000, 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 1);

-- Seed HoaDon
INSERT INTO HoaDon (MaKhachHang, MaNhanVien, NgayLap, TongTien, PhuongThucTT, DiaChi, TrangThai)
VALUES
    (1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), 650000, 'Tiền mặt', '123 Đường KH, Quận 1, TP HCM', 'Đã giao hàng'),
    (2, 3, DATE_SUB(NOW(), INTERVAL 3 DAY), 850000, 'Chuyển khoản', '456 Đường KH, Quận 2, TP HCM', 'Đang giao hàng'),
    (3, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), 1200000, 'Momo', '789 Đường KH, Quận 3, TP HCM', 'Đang xử lý');

-- Seed ChiTietHoaDon
INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, SoLuong, DonGia, ThanhTien)
VALUES
    (1, 3, 1, 650000, 650000),
    (2, 2, 1, 850000, 850000),
    (3, 7, 1, 1200000, 1200000);