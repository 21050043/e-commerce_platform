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
import { Model, DataTypes } from 'sequelize';

// Thiết lập các mối quan hệ giữa các model

// VaiTro - NhanVien
VaiTro.hasMany(NhanVien, { foreignKey: 'MaVaiTro', as: 'NhanViens' });
NhanVien.belongsTo(VaiTro, { foreignKey: 'MaVaiTro', as: 'VaiTro' });

// VaiTro - KhachHang
VaiTro.hasMany(KhachHang, { foreignKey: 'MaVaiTro', as: 'KhachHangs' });
KhachHang.belongsTo(VaiTro, { foreignKey: 'MaVaiTro', as: 'VaiTro' });

// DanhMuc - SanPham
DanhMuc.hasMany(SanPham, { foreignKey: 'MaDanhMuc', as: 'SanPhams' });
SanPham.belongsTo(DanhMuc, { foreignKey: 'MaDanhMuc', as: 'DanhMuc' });

// KhachHang - NguoiBan (1-1 vendor profile)
KhachHang.hasOne(NguoiBan, { foreignKey: 'MaKhachHang', as: 'NguoiBan' });
NguoiBan.belongsTo(KhachHang, { foreignKey: 'MaKhachHang', as: 'KhachHang' });

// NguoiBan - SanPham (vendor owns products)
NguoiBan.hasMany(SanPham, { foreignKey: 'MaNguoiBan', as: 'SanPhams' });
SanPham.belongsTo(NguoiBan, { foreignKey: 'MaNguoiBan', as: 'NguoiBan' });

// NguoiBan - DanhMuc (many-to-many via NguoiBanDanhMuc)
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

// KhachHang - HoaDon
KhachHang.hasMany(HoaDon, { foreignKey: 'MaKhachHang', as: 'HoaDons' });
HoaDon.belongsTo(KhachHang, { foreignKey: 'MaKhachHang', as: 'KhachHang' });

// NhanVien - HoaDon
NhanVien.hasMany(HoaDon, { foreignKey: 'MaNhanVien', as: 'HoaDons' });
HoaDon.belongsTo(NhanVien, { foreignKey: 'MaNhanVien', as: 'NhanVien' });

// HoaDon - ChiTietHoaDon
HoaDon.hasMany(ChiTietHoaDon, { foreignKey: 'MaHoaDon', as: 'ChiTietHoaDons' });
ChiTietHoaDon.belongsTo(HoaDon, { foreignKey: 'MaHoaDon', as: 'HoaDon' });

// SanPham - ChiTietHoaDon
SanPham.hasMany(ChiTietHoaDon, { foreignKey: 'MaSanPham', as: 'ChiTietHoaDons' });
ChiTietHoaDon.belongsTo(SanPham, { foreignKey: 'MaSanPham', as: 'SanPham' });

// Hàm khởi tạo các model
const initializeModels = async () => {
  try {
    // Đồng bộ models nhưng không thay đổi cấu trúc bảng
    await sequelize.sync({ force: false });
    logger.db.synchronized();
  } catch (error) {
    logger.error('Không thể đồng bộ hóa các model:', error);
  }
};

// Export các model và hàm khởi tạo
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
  initializeModels
}; 