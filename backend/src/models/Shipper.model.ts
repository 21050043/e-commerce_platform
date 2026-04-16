import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db.config';

interface IShipper {
  MaShipper: number;
  MaKhachHang: number;
  DiaChiHoatDong: string;
  LoaiXe: string;
  TrangThai: 'ACTIVE' | 'INACTIVE';
  NgayDangKy: Date;
}

interface ShipperCreationAttributes extends Optional<IShipper, 'MaShipper' | 'NgayDangKy'> {}

class Shipper extends Model<IShipper, ShipperCreationAttributes> implements IShipper {
  public MaShipper!: number;
  public MaKhachHang!: number;
  public DiaChiHoatDong!: string;
  public LoaiXe!: string;
  public MaNguoiBan?: number;
  public TrangThai!: 'ACTIVE' | 'INACTIVE';
  public NgayDangKy!: Date;
}

Shipper.init(
  {
    MaShipper: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKhachHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'KhachHang',
        key: 'MaKhachHang',
      },
    },
    DiaChiHoatDong: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    LoaiXe: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Loại xe: Xe máy, Ô tô, Xe tải, v.v.',
    },
    TrangThai: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    NgayDangKy: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'Shipper',
    timestamps: false,
  }
);

export default Shipper;
