import { Model, DataTypes, Optional } from 'sequelize';
import { IKhachHang } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';
import bcrypt from 'bcrypt';

// Interface cho các thuộc tính KhachHang khi tạo mới
interface KhachHangCreationAttributes extends Optional<IKhachHang, 'MaKhachHang'> {}

// Model KhachHang kế thừa từ Model Sequelize
class KhachHang extends Model<IKhachHang, KhachHangCreationAttributes> implements IKhachHang {
  public MaKhachHang!: number;
  public MaVaiTro!: number;
  public TenKhachHang!: string;
  public SoDienThoai!: string;
  public MatKhau!: string;
  public DiaChi?: string;

  // Phương thức kiểm tra mật khẩu
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.MatKhau);
  }
}

// Khởi tạo model
KhachHang.init(
  {
    MaKhachHang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaVaiTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'VaiTro',
        key: 'MaVaiTro',
      },
    },
    TenKhachHang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SoDienThoai: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MatKhau: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'KhachHang',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['SoDienThoai']
      }
    ],
    hooks: {
      beforeCreate: async (khachHang: KhachHang) => {
        if (khachHang.MatKhau) {
          khachHang.MatKhau = await bcrypt.hash(khachHang.MatKhau, 12);
        }
      },
      beforeUpdate: async (khachHang: KhachHang) => {
        if (khachHang.changed('MatKhau')) {
          khachHang.MatKhau = await bcrypt.hash(khachHang.MatKhau, 12);
        }
      },
    },
  }
);

export default KhachHang; 