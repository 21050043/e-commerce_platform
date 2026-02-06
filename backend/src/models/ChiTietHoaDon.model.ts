import { Model, DataTypes, Optional } from 'sequelize';
import { IChiTietHoaDon } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

// Interface cho các thuộc tính ChiTietHoaDon khi tạo mới
interface ChiTietHoaDonCreationAttributes extends Optional<IChiTietHoaDon, 'MaChiTiet'> {}

// Model ChiTietHoaDon kế thừa từ Model Sequelize
class ChiTietHoaDon extends Model<IChiTietHoaDon, ChiTietHoaDonCreationAttributes> implements IChiTietHoaDon {
  public MaChiTiet!: number;
  public MaHoaDon!: number;
  public MaSanPham!: number;
  public SoLuong!: number;
  public DonGia!: number;
  public ThanhTien!: number;
}

// Khởi tạo model
ChiTietHoaDon.init(
  {
    MaChiTiet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HoaDon',
        key: 'MaHoaDon',
      },
    },
    MaSanPham: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SanPham',
        key: 'MaSanPham',
      },
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DonGia: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'ChiTietHoaDon',
    timestamps: false,
    hooks: {
      beforeValidate: (chiTietHoaDon: ChiTietHoaDon) => {
        // Tự động tính thành tiền = số lượng * đơn giá
        chiTietHoaDon.ThanhTien = chiTietHoaDon.SoLuong * Number(chiTietHoaDon.DonGia);
      },
    },
  }
);

export default ChiTietHoaDon; 