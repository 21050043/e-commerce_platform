import { Model, DataTypes, Optional } from 'sequelize';
import { ISanPham } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';
import DanhMuc from './DanhMuc.model';
import ChiTietHoaDon from './ChiTietHoaDon.model';
import NguoiBan from './NguoiBan.model';

// Interface cho các thuộc tính SanPham khi tạo mới
interface SanPhamCreationAttributes extends Optional<ISanPham, 'MaSanPham' | 'Ngaytao' | 'NgayCapNhat' | 'HinhAnh'> {}

// Model SanPham kế thừa từ Model Sequelize
class SanPham extends Model<ISanPham, SanPhamCreationAttributes> implements ISanPham {
  public MaSanPham!: number;
  public TenSanPham!: string;
  public MaDanhMuc!: number;
  public MoTa?: string;
  public SoLuong!: number;
  public GiaSanPham!: number;
  public Ngaytao?: Date;
  public NgayCapNhat?: Date;
  public HinhAnh?: string;
  public MaNguoiBan?: number;
  public TrangThaiKiemDuyet?: 'ACTIVE' | 'SUSPENDED';
  public LyDoTamDung?: string | null;
  public NgayTamDung?: Date | null;
  public NguoiTamDung?: number | null;
}

// Khởi tạo model
SanPham.init(
  {
    MaSanPham: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenSanPham: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MaDanhMuc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DanhMuc',
        key: 'MaDanhMuc',
      },
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    GiaSanPham: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    Ngaytao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    HinhAnh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    MaNguoiBan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NguoiBan',
        key: 'MaNguoiBan',
      },
    },
    TrangThaiKiemDuyet: {
      type: DataTypes.ENUM('ACTIVE', 'SUSPENDED'),
      allowNull: true,
      defaultValue: 'ACTIVE',
    },
    LyDoTamDung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    NgayTamDung: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    NguoiTamDung: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NhanVien',
        key: 'MaNhanVien',
      },
    },
  },
  {
    sequelize,
    tableName: 'SanPham',
    timestamps: false,
    hooks: {
      // Tắt hook tự động cập nhật để tránh lỗi định dạng ngày
      // beforeCreate: (sanPham: SanPham) => {
      //   sanPham.Ngaytao = new Date();
      // },
      // beforeUpdate: (sanPham: SanPham) => {
      //   sanPham.NgayCapNhat = new Date();
      // },
    },
  }
);

export default SanPham; 