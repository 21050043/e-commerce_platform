import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db.config';

interface IShipper {
  MaShipper: number;
  MaKhachHang: number;
  DiaChiHoatDong: string;
  LoaiXe: string;
  EmailLienHe?: string;
  HangGPLX?: string;
  HeDieuHanh?: string;
  // TrangThai: trạng thái tài khoản (quản trị viên kiểm soát)
  TrangThai: 'ACTIVE' | 'INACTIVE';
  // TrangThaiHoatDong: chế độ hoạt động (shipper tự bật/tắt)
  TrangThaiHoatDong: 'ACTIVE' | 'VACATION';
  NgayDangKy: Date;
  TongDiemDanhGia?: number;
  SoLuongDanhGia?: number;
}

interface ShipperCreationAttributes extends Optional<IShipper, 'MaShipper' | 'NgayDangKy' | 'TrangThaiHoatDong' | 'TongDiemDanhGia' | 'SoLuongDanhGia'> {}

class Shipper extends Model<IShipper, ShipperCreationAttributes> implements IShipper {
  public MaShipper!: number;
  public MaKhachHang!: number;
  public DiaChiHoatDong!: string;
  public LoaiXe!: string;
  public EmailLienHe?: string;
  public HangGPLX?: string;
  public HeDieuHanh?: string;
  public MaNguoiBan?: number;
  public TrangThai!: 'ACTIVE' | 'INACTIVE';
  public TrangThaiHoatDong!: 'ACTIVE' | 'VACATION';
  public NgayDangKy!: Date;
  public TongDiemDanhGia!: number;
  public SoLuongDanhGia!: number;
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
    EmailLienHe: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    HangGPLX: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    HeDieuHanh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    TrangThaiHoatDong: {
      type: DataTypes.ENUM('ACTIVE', 'VACATION'),
      allowNull: false,
      defaultValue: 'ACTIVE',
      comment: 'Chế độ hoạt động: ACTIVE = đang nhận đơn, VACATION = tạm nghỉ',
    },
    NgayDangKy: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    TongDiemDanhGia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    SoLuongDanhGia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'Shipper',
    timestamps: false,
  }
);

export default Shipper;
