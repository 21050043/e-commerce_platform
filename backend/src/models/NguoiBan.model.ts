import { Model, DataTypes, Optional } from 'sequelize';
import { INguoiBan } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

interface NguoiBanCreationAttributes extends Optional<INguoiBan, 'MaNguoiBan' | 'TenCuaHang' | 'EmailLienHe' | 'TrangThai' | 'LyDoTuChoi' | 'NgayDuyet'> {}

class NguoiBan extends Model<INguoiBan, NguoiBanCreationAttributes> implements INguoiBan {
  public MaNguoiBan!: number;
  public MaKhachHang!: number;
  public LoaiHinh!: 'CA_NHAN' | 'DOANH_NGHIEP';
  public TenCuaHang?: string;
  public DiaChiKinhDoanh!: string;
  public EmailLienHe?: string;
  public MaDanhMucChinh!: number;
  public SoDienThoaiLienHe!: string;
  public TrangThai?: 'PENDING' | 'APPROVED' | 'REJECTED';
  public LyDoTuChoi?: string;
  public NgayDuyet?: Date | null;
}

NguoiBan.init(
  {
    MaNguoiBan: {
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
    LoaiHinh: {
      type: DataTypes.ENUM('CA_NHAN', 'DOANH_NGHIEP'),
      allowNull: false,
    },
    TenCuaHang: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    DiaChiKinhDoanh: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    EmailLienHe: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    MaDanhMucChinh: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DanhMuc',
        key: 'MaDanhMuc',
      },
    },
    SoDienThoaiLienHe: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: true,
      defaultValue: 'PENDING',
    },
    LyDoTuChoi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    NgayDuyet: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'NguoiBan',
    timestamps: false,
  }
);

export default NguoiBan;



