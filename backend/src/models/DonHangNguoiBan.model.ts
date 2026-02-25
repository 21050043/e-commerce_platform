import { Model, DataTypes, Optional } from 'sequelize';
import { IDonHangNguoiBan } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

interface DonHangNguoiBanCreationAttributes extends Optional<IDonHangNguoiBan, 'MaDonHangNB' | 'GhiChu' | 'NgayCapNhat'> {}

/**
 * Sub-order (đơn hàng con) theo từng người bán trong một hoá đơn master.
 * Mô hình platform: 1 HoaDon → N DonHangNguoiBan (1 per người bán).
 * Người bán chỉ thấy và cập nhật trạng thái sub-order của mình.
 */
class DonHangNguoiBan extends Model<IDonHangNguoiBan, DonHangNguoiBanCreationAttributes> implements IDonHangNguoiBan {
  public MaDonHangNB!: number;
  public MaHoaDon!: number;
  public MaNguoiBan!: number;
  public TrangThai!: 'Đã đặt hàng' | 'Đang xử lý' | 'Đang giao hàng' | 'Đã giao hàng' | 'Đã hủy';
  public TongTienNB!: number;
  public GhiChu?: string | null;
  public NgayCapNhat?: Date;
}

DonHangNguoiBan.init(
  {
    MaDonHangNB: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'HoaDon', key: 'MaHoaDon' },
    },
    MaNguoiBan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'NguoiBan', key: 'MaNguoiBan' },
    },
    TrangThai: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Đã đặt hàng',
    },
    TongTienNB: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    GhiChu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'DonHangNguoiBan',
    timestamps: false,
  }
);

export default DonHangNguoiBan;
