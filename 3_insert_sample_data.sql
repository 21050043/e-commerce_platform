USE shop;

-- Seed VaiTro
INSERT INTO VaiTro (MaVaiTro, TenVaiTro)
VALUES 
    (0, 'Quản trị viên'),
    (1, 'Nhân viên'),
    (2, 'Khách hàng');

-- Seed NhanVien (passwords are already bcrypt hashed)
INSERT INTO NhanVien (MaVaiTro, TenNhanVien, SoDienThoai, MatKhau, DiaChi)
VALUES
    (0, 'Admin', '0901234567', '$2a$12$Gd1DwtLpJOiVaEhLXjKwKuOL50wDb1FOtTb6AGrD8mrDCxyrmOquy', '123 Đường Admin, Quận 1, TP HCM'),
    (1, 'Nhân viên 1', '0912345678', '$2a$12$L3un9Wg1yMnyvTKuWAxKF.nW4aV2FS6f6OauasyJ5m1Csr0ORLEZa', '456 Đường NV, Quận 2, TP HCM'),
    (1, 'Nhân viên 2', '0912345679', '$2a$12$M9kPXni1vigAngFnz2Y7vuMRwjF1CuoAlczkXLOUrWa81O3ewtky6', '789 Đường NV, Quận 3, TP HCM');

-- Seed KhachHang (passwords are already bcrypt hashed)
INSERT INTO KhachHang (MaVaiTro, TenKhachHang, SoDienThoai, MatKhau, DiaChi)
VALUES
    (2, 'Khách hàng 1', '0923456789', '$2a$12$kDOXSl3QsobIKnqa0.7/kuJzEwQiqxQmKnoLw6HBiWsDFHeTdr55e', '123 Đường KH, Quận 1, TP HCM'),
    (2, 'Khách hàng 2', '0923456780', '$2a$12$3WErTWo5laf8.5Ks3/OItuwAkQvRToX/hZ.cI8SxT4ywBSNWiq2DG', '456 Đường KH, Quận 2, TP HCM'),
    (2, 'Khách hàng 3', '0923456781', '$2a$12$hHzaPBHADKEAPG5yoqrGZO2HagmBG3WRlirwx9fMWvDrV6tmJVGUK', '789 Đường KH, Quận 3, TP HCM');

-- Seed NguoiBan
INSERT INTO NguoiBan (MaKhachHang, LoaiHinh, TenCuaHang, DiaChiKinhDoanh, EmailLienHe, MaDanhMucChinh, SoDienThoaiLienHe, TrangThai)
VALUES
    (1, 'CA_NHAN', 'Cửa hàng Hoa 1', '123 Đường Vendor, Quận 1, TP HCM', 'vendor1@example.com', 1, '0934567890', 'APPROVED');

-- Seed DanhMuc
INSERT INTO DanhMuc (TenDanhMuc, HinhAnh)
VALUES 
    ('Hoa sinh nhật', 'https://media.loveitopcdn.com/1219/thumb/gio-hoa-tang-chuc-mung-16.jpg'),
    ('Hoa khai trương', 'https://hoatuoi9x.com/wp-content/uploads/2021/08/125-3.jpg'),
    ('Hoa cưới', 'https://sansan.vn/wp-content/uploads/2020/07/hoa-baby.jpg'),
    ('Hoa tang lễ', 'https://hoatuoidatviet.vn/upload/sanpham/ke-tang-hinh-thanh-gia-1798.jpg'),
    ('Quà tặng lưu niệm', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'),
    ('Gấu bông', 'https://bizweb.dktcdn.net/thumb/1024x1024/100/450/808/products/439447444-454697126956015-2933455761937038741-n-1714744059531.jpg?v=1714744063193');

-- Seed SanPham
INSERT INTO SanPham (TenSanPham, MaDanhMuc, MoTa, SoLuong, GiaSanPham, HinhAnh, MaNguoiBan)
VALUES
    -- Danh mục 1: Hoa sinh nhật
    ('Bó hoa hồng đỏ', 1, 'Bó hoa gồm 20 bông hồng đỏ tươi thắm, tượng trưng cho tình yêu mãnh liệt', 50, 500000, 'https://hoatuoihuythao.com/upload/sanpham/bohoahongdodepnhat1401.jpg', 1),
    ('Hoa lan hồ điệp', 1, 'Chậu hoa lan hồ điệp sang trọng, phù hợp làm quà tặng sinh nhật', 25, 1200000, 'https://storage.googleapis.com/cdn_dlhf_vn/public/products/OWC0/OWC05HP037/IMG_8126_800x800.png', 1),
    ('Giỏ hoa tulip', 1, 'Giỏ hoa tulip nhiều màu sắc tươi tắn, thích hợp tặng sinh nhật', 35, 750000, 'https://www.pexels.com/photo/white-tulips-in-a-basket-15419300/', 1),
    ('Bó hoa hướng dương', 1, 'Bó hoa hướng dương tràn đầy năng lượng và sự tích cực', 40, 450000, 'http://pexels.com/photo/colorful-floral-bouquets-in-istanbul-shop-display-32477274/', 1),
    ('Hộp hoa mix pastel', 1, 'Hộp hoa với tông màu pastel nhẹ nhàng dành tặng người yêu thương', 30, 680000, 'https://www.pexels.com/photo/heap-of-rose-petals-and-gift-box-4041245/', 1),

    -- Danh mục 2: Hoa khai trương
    ('Lẵng hoa khai trương', 2, 'Lẵng hoa gồm các loại hoa tươi đa sắc, phù hợp tặng dịp khai trương', 30, 850000, 'https://hoatuoihuythao.com/upload/sanpham/langhoakhaitruongdepgiare015.jpg', 1),
    ('Kệ hoa chúc mừng', 2, 'Kệ hoa hai tầng trang trọng dành cho dịp khai trương, khánh thành', 20, 1500000, 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 1),
    ('Hoa Cát Tường', 2, 'Lẵng hoa hướng dương tượng trưng cho sự thành công và thịnh vượng', 25, 920000, 'https://images.pexels.com/photos/1488310/pexels-photo-1488310.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Lẵng hoa lan hồ điệp', 2, 'Lẵng hoa lan hồ điệp sang trọng cho dịp khai trương cửa hàng', 15, 1800000, 'https://images.pexels.com/photos/9130825/pexels-photo-9130825.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Kệ hoa tươi chúc mừng', 2, 'Kệ hoa trang trọng với tone màu đỏ - vàng, biểu tượng của sự may mắn', 20, 1350000, 'https://images.pexels.com/photos/4872082/pexels-photo-4872082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),

    -- Danh mục 3: Hoa cưới
    ('Hoa cầm tay cô dâu', 3, 'Bó hoa cầm tay dành cho cô dâu trong ngày cưới, gồm hoa hồng trắng và baby', 20, 650000, 'https://hoatuoi360.vn/uploads/file/Baiviet2023/hoa-cuoi-cam-tay-hoa-hong-7.jpg', 1),
    ('Bó hoa cưới hồng pastel', 3, 'Bó hoa cưới với tông màu hồng pastel lãng mạn', 25, 780000, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 1),
    ('Hoa cưới cầm tay sen đá', 3, 'Bó hoa cưới từ các loại sen đá, hiện đại và độc đáo', 15, 850000, 'https://images.pexels.com/photos/12615497/pexels-photo-12615497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Hoa cưới cầm tay vintage', 3, 'Bó hoa cưới phong cách vintage với các loại hoa khô', 20, 720000, 'https://images.pexels.com/photos/27986406/pexels-photo-27986406/free-photo-of-bouquet-of-roses-on-wedding-veil.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Hoa cài áo chú rể', 3, 'Hoa cài áo vest cho chú rể đồng điệu với hoa cưới', 50, 120000, 'https://images.pexels.com/photos/14450286/pexels-photo-14450286.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),

    -- Danh mục 4: Hoa tang lễ
    ('Vòng hoa chia buồn', 4, 'Vòng hoa tang lễ thể hiện lòng thành kính với người đã khuất', 15, 750000, 'https://cdn.litiflorist.com/upload/1660277850187.png', 1),
    ('Kệ hoa tang lễ', 4, 'Kệ hoa trang nghiêm với tông màu trắng, tím', 20, 950000, 'https://images.pexels.com/photos/7317745/pexels-photo-7317745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Lẵng hoa chia buồn', 4, 'Lẵng hoa thể hiện sự chia buồn sâu sắc', 15, 820000, 'https://images.pexels.com/photos/6231818/pexels-photo-6231818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Vòng hoa tang tròn', 4, 'Vòng hoa tang truyền thống với hoa cúc trắng', 20, 680000, 'https://images.pexels.com/photos/6841645/pexels-photo-6841645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),

    -- Danh mục 5: Quà tặng lưu niệm
    ('Khung ảnh lưu niệm', 5, 'Khung ảnh để bàn làm từ gỗ tự nhiên, thiết kế sang trọng', 60, 180000, 'https://shopquatructuyen.com/wp-content/uploads/2019/05/khung-anh-co-dien-5.jpg', 1),
    ('Bình hoa trang trí', 5, 'Bình hoa thủy tinh nghệ thuật đặt bàn', 40, 250000, 'https://images.pexels.com/photos/5446916/pexels-photo-5446916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Đồng hồ để bàn vintage', 5, 'Đồng hồ để bàn phong cách cổ điển', 30, 320000, 'https://images.pexels.com/photos/31819421/pexels-photo-31819421/free-photo-of-vintage-floral-lampshade-and-table-clock.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Mô hình trang trí', 5, 'Mô hình trang trí độc đáo handmade', 25, 280000, 'https://images.pexels.com/photos/7174515/pexels-photo-7174515.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Bộ ly thủy tinh cao cấp', 5, 'Bộ 6 ly thủy tinh cao cấp làm quà tặng', 20, 420000, 'https://images.pexels.com/photos/7809794/pexels-photo-7809794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),

    -- Danh mục 6: Gấu bông
    ('Gấu bông Teddy', 6, 'Gấu bông Teddy size lớn, chất liệu mềm mại, an toàn', 40, 350000, 'https://bizweb.dktcdn.net/100/459/249/products/02.jpg?v=1657252163400', 1),
    ('Gấu bông Panda', 6, 'Gấu bông hình gấu trúc Panda ngộ nghĩnh', 35, 280000, 'https://salt.tikicdn.com/cache/w300/ts/product/8b/a1/1a/35be10558729eae4722a3181cca79913.jpg', 1),
    ('Thú bông Totoro', 6, 'Thú bông hình nhân vật Totoro nổi tiếng', 30, 320000, 'https://images.pexels.com/photos/5488397/pexels-photo-5488397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Thú bông Unicorn', 6, 'Gấu bông hình kỳ lân nhiều màu sắc', 25, 300000, 'https://images.pexels.com/photos/20558686/pexels-photo-20558686/free-photo-of-close-up-of-a-person-holding-a-small-mirror-next-to-a-cuddly-toy-and-a-tulip.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1),
    ('Thú bông khủng long', 6, 'Thú bông hình khủng long dễ thương cho bé', 30, 250000, 'https://images.pexels.com/photos/15261916/pexels-photo-15261916/free-photo-of-big-teddy-toy-on-grass.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 1);

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