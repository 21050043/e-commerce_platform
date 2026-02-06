import { Model, DataTypes, Optional } from 'sequelize';
import { IHoaDon } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';
import KhachHang from './KhachHang.model';
import NhanVien from './NhanVien.model';
import ChiTietHoaDon from './ChiTietHoaDon.model';

// Interface cho các thuộc tính HoaDon khi tạo mới
interface HoaDonCreationAttributes extends Optional<IHoaDon, 'MaHoaDon' | 'NgayLap' | 'TrangThai'> {}

// Model HoaDon kế thừa từ Model Sequelize
class HoaDon extends Model<IHoaDon, HoaDonCreationAttributes> implements IHoaDon {
  public MaHoaDon!: number;
  public MaKhachHang!: number;
  public MaNhanVien?: number | null;
  public NgayLap?: Date;
  public TongTien!: number;
  public PhuongThucTT!: string;
  public DiaChi!: string;
  public TrangThai?: string;
}

// Khởi tạo model
HoaDon.init(
  {
    MaHoaDon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KhachHang',
        key: 'MaKhachHang',
      },
    },
    MaNhanVien: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NhanVien',
        key: 'MaNhanVien',
      },
    },
    NgayLap: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    TongTien: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    PhuongThucTT: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Đang xử lý',
    },
  },
  {
    sequelize,
    tableName: 'HoaDon',
    timestamps: false,
    hooks: {
      beforeCreate: (hoaDon: HoaDon) => {
        hoaDon.NgayLap = new Date();
      },
    },
  }
);

export default HoaDon; 