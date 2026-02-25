import { Model, DataTypes, Optional } from 'sequelize';
import { IHoaDon } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

// Bỏ MaNhanVien — Admin/Staff không còn tham gia luồng đơn hàng trong mô hình platform
interface HoaDonCreationAttributes extends Optional<IHoaDon, 'MaHoaDon' | 'NgayLap' | 'TrangThai'> { }

class HoaDon extends Model<IHoaDon, HoaDonCreationAttributes> implements IHoaDon {
  public MaHoaDon!: number;
  public MaKhachHang!: number;
  public NgayLap?: Date;
  public TongTien!: number;
  public PhuongThucTT!: string;
  public DiaChi!: string;
  public TrangThai?: string;
}

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
      defaultValue: 'Đã đặt hàng',
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