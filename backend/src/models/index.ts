import { sequelize } from '../config/db.config';
import { logger } from '../utils/logger';

// Import các model
import VaiTro from './VaiTro.model';
import NhanVien from './NhanVien.model';
import KhachHang from './KhachHang.model';
import DanhMuc from './DanhMuc.model';
import SanPham from './SanPham.model';
import HoaDon from './HoaDon.model';
import ChiTietHoaDon from './ChiTietHoaDon.model';
import NguoiBan from './NguoiBan.model';
import DonHangNguoiBan from './DonHangNguoiBan.model';
import { DataTypes } from 'sequelize';

// ─────────────────────────────────────────────
// Quan hệ: VaiTro
// ─────────────────────────────────────────────
VaiTro.hasMany(NhanVien, { foreignKey: 'MaVaiTro', as: 'NhanViens' });
NhanVien.belongsTo(VaiTro, { foreignKey: 'MaVaiTro', as: 'VaiTro' });

VaiTro.hasMany(KhachHang, { foreignKey: 'MaVaiTro', as: 'KhachHangs' });
KhachHang.belongsTo(VaiTro, { foreignKey: 'MaVaiTro', as: 'VaiTro' });

// ─────────────────────────────────────────────
// Quan hệ: DanhMuc ↔ SanPham
// ─────────────────────────────────────────────
DanhMuc.hasMany(SanPham, { foreignKey: 'MaDanhMuc', as: 'SanPhams' });
SanPham.belongsTo(DanhMuc, { foreignKey: 'MaDanhMuc', as: 'DanhMuc' });

// ─────────────────────────────────────────────
// Quan hệ: KhachHang ↔ NguoiBan (1-1 vendor profile)
// ─────────────────────────────────────────────
KhachHang.hasOne(NguoiBan, { foreignKey: 'MaKhachHang', as: 'NguoiBan' });
NguoiBan.belongsTo(KhachHang, { foreignKey: 'MaKhachHang', as: 'KhachHang' });

// ─────────────────────────────────────────────
// Quan hệ: NguoiBan ↔ SanPham
// ─────────────────────────────────────────────
NguoiBan.hasMany(SanPham, { foreignKey: 'MaNguoiBan', as: 'SanPhams' });
SanPham.belongsTo(NguoiBan, { foreignKey: 'MaNguoiBan', as: 'NguoiBan' });

// ─────────────────────────────────────────────
// Quan hệ: NguoiBan ↔ DanhMuc (many-to-many)
// ─────────────────────────────────────────────
const NguoiBanDanhMuc = sequelize.define('NguoiBanDanhMuc', {
  MaNguoiBan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  MaDanhMuc: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'NguoiBanDanhMuc',
  timestamps: false,
});

NguoiBan.belongsToMany(DanhMuc, { through: NguoiBanDanhMuc, foreignKey: 'MaNguoiBan', otherKey: 'MaDanhMuc', as: 'DanhMucs' });
DanhMuc.belongsToMany(NguoiBan, { through: NguoiBanDanhMuc, foreignKey: 'MaDanhMuc', otherKey: 'MaNguoiBan', as: 'NguoiBans' });

// ─────────────────────────────────────────────
// Quan hệ: KhachHang ↔ HoaDon (master order)
// Lưu ý: MaNhanVien đã bỏ — Admin/Staff không tham gia luồng đơn hàng
// ─────────────────────────────────────────────
KhachHang.hasMany(HoaDon, { foreignKey: 'MaKhachHang', as: 'HoaDons' });
HoaDon.belongsTo(KhachHang, { foreignKey: 'MaKhachHang', as: 'KhachHang' });

// ─────────────────────────────────────────────
// Quan hệ: HoaDon ↔ ChiTietHoaDon
// ─────────────────────────────────────────────
HoaDon.hasMany(ChiTietHoaDon, { foreignKey: 'MaHoaDon', as: 'ChiTietHoaDons' });
ChiTietHoaDon.belongsTo(HoaDon, { foreignKey: 'MaHoaDon', as: 'HoaDon' });

// ─────────────────────────────────────────────
// Quan hệ: SanPham ↔ ChiTietHoaDon
// ─────────────────────────────────────────────
SanPham.hasMany(ChiTietHoaDon, { foreignKey: 'MaSanPham', as: 'ChiTietHoaDons' });
ChiTietHoaDon.belongsTo(SanPham, { foreignKey: 'MaSanPham', as: 'SanPham' });

// ─────────────────────────────────────────────
// Quan hệ: HoaDon ↔ DonHangNguoiBan (sub-orders)
// Mô hình platform: 1 HoaDon → N sub-orders (1 per người bán)
// ─────────────────────────────────────────────
HoaDon.hasMany(DonHangNguoiBan, { foreignKey: 'MaHoaDon', as: 'DonHangNguoiBans' });
DonHangNguoiBan.belongsTo(HoaDon, { foreignKey: 'MaHoaDon', as: 'HoaDon' });

NguoiBan.hasMany(DonHangNguoiBan, { foreignKey: 'MaNguoiBan', as: 'DonHangNguoiBans' });
DonHangNguoiBan.belongsTo(NguoiBan, { foreignKey: 'MaNguoiBan', as: 'NguoiBan' });

// ─────────────────────────────────────────────
// Khởi tạo models
// ─────────────────────────────────────────────
const initializeModels = async () => {
  try {
    await sequelize.sync({ force: false });
    logger.db.synchronized();
  } catch (error) {
    logger.error('Không thể đồng bộ hóa các model:', error);
  }
};

export {
  sequelize,
  VaiTro,
  NhanVien,
  KhachHang,
  DanhMuc,
  SanPham,
  HoaDon,
  ChiTietHoaDon,
  NguoiBan,
  NguoiBanDanhMuc,
  DonHangNguoiBan,
  initializeModels,
};