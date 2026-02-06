USE shop;

-- Create table VaiTro
CREATE TABLE IF NOT EXISTS VaiTro (
    MaVaiTro INT PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL
);

-- Create table NhanVien
CREATE TABLE IF NOT EXISTS NhanVien (
    MaNhanVien INT AUTO_INCREMENT PRIMARY KEY,
    MaVaiTro INT NOT NULL,
    TenNhanVien VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    DiaChi VARCHAR(255),
    CONSTRAINT FK_NhanVien_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

-- Create table KhachHang
CREATE TABLE IF NOT EXISTS KhachHang (
    MaKhachHang INT AUTO_INCREMENT PRIMARY KEY,
    MaVaiTro INT NOT NULL,
    TenKhachHang VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    DiaChi VARCHAR(255),
    CONSTRAINT FK_KhachHang_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

-- Create table DanhMuc
CREATE TABLE IF NOT EXISTS DanhMuc (
    MaDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL,
    HinhAnh VARCHAR(255)
);

-- Create table SanPham
CREATE TABLE IF NOT EXISTS SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSanPham VARCHAR(100) NOT NULL,
    MaDanhMuc INT NOT NULL,
    MoTa TEXT,
    SoLuong INT NOT NULL DEFAULT 0,
    GiaSanPham DECIMAL(18, 2) NOT NULL,
    Ngaytao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    HinhAnh VARCHAR(255),
    MaNguoiBan INT NULL,
    TrangThaiKiemDuyet VARCHAR(20) DEFAULT 'ACTIVE',
    LyDoTamDung TEXT NULL,
    NgayTamDung DATETIME NULL,
    NguoiTamDung INT NULL,
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc),
    CONSTRAINT FK_SanPham_NguoiBan FOREIGN KEY (MaNguoiBan) REFERENCES NguoiBan(MaNguoiBan),
    CONSTRAINT CHK_TrangThaiKiemDuyet CHECK (TrangThaiKiemDuyet IN ('ACTIVE', 'SUSPENDED')),
    CONSTRAINT FK_SanPham_NguoiTamDung FOREIGN KEY (NguoiTamDung) REFERENCES NhanVien(MaNhanVien)
);

-- Create table HoaDon
CREATE TABLE IF NOT EXISTS HoaDon (
    MaHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT NOT NULL,
    MaNhanVien INT NULL,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(18, 2) NOT NULL,
    PhuongThucTT VARCHAR(50) NOT NULL,
    DiaChi VARCHAR(255) NOT NULL,
    TrangThai VARCHAR(50) DEFAULT 'Đang xử lý',
    CONSTRAINT FK_HoaDon_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

-- Create table ChiTietHoaDon
CREATE TABLE IF NOT EXISTS ChiTietHoaDon (
    MaChiTiet INT AUTO_INCREMENT PRIMARY KEY,
    MaHoaDon INT NOT NULL,
    MaSanPham INT NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18, 2) NOT NULL,
    ThanhTien DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_ChiTietHoaDon_HoaDon FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon),
    CONSTRAINT FK_ChiTietHoaDon_SanPham FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

-- Create table NguoiBan (Vendor)
CREATE TABLE IF NOT EXISTS NguoiBan (
    MaNguoiBan INT AUTO_INCREMENT PRIMARY KEY,
    MaKhachHang INT NOT NULL,
    LoaiHinh ENUM('CA_NHAN','DOANH_NGHIEP') NOT NULL,
    TenCuaHang VARCHAR(150),
    DiaChiKinhDoanh VARCHAR(255) NOT NULL,
    EmailLienHe VARCHAR(150),
    MaDanhMucChinh INT NOT NULL,
    SoDienThoaiLienHe VARCHAR(15) NOT NULL,
    TrangThai ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    LyDoTuChoi VARCHAR(255),
    NgayDuyet DATETIME NULL,
    CONSTRAINT FK_NguoiBan_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    CONSTRAINT FK_NguoiBan_DanhMuc FOREIGN KEY (MaDanhMucChinh) REFERENCES DanhMuc(MaDanhMuc)
);

-- Bridge table: NguoiBan <-> DanhMuc (many-to-many business categories)
CREATE TABLE IF NOT EXISTS NguoiBanDanhMuc (
    MaNguoiBan INT NOT NULL,
    MaDanhMuc INT NOT NULL,
    PRIMARY KEY (MaNguoiBan, MaDanhMuc),
    CONSTRAINT FK_NBDM_NguoiBan FOREIGN KEY (MaNguoiBan) REFERENCES NguoiBan(MaNguoiBan) ON DELETE CASCADE,
    CONSTRAINT FK_NBDM_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc) ON DELETE CASCADE
);
