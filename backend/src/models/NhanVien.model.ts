import { Model, DataTypes, Optional } from 'sequelize';
import { INhanVien } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';
import bcrypt from 'bcrypt';

// Interface cho các thuộc tính NhanVien khi tạo mới
interface NhanVienCreationAttributes extends Optional<INhanVien, 'MaNhanVien'> {}

// Model NhanVien kế thừa từ Model Sequelize
class NhanVien extends Model<INhanVien, NhanVienCreationAttributes> implements INhanVien {
  public MaNhanVien!: number;
  public MaVaiTro!: number;
  public TenNhanVien!: string;
  public SoDienThoai!: string;
  public MatKhau!: string;
  public DiaChi?: string;

  // Phương thức kiểm tra mật khẩu
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.MatKhau);
  }
}

// Khởi tạo model
NhanVien.init(
  {
    MaNhanVien: {
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
    TenNhanVien: {
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
    tableName: 'NhanVien',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['SoDienThoai']
      }
    ],
    hooks: {
      beforeCreate: async (nhanVien: NhanVien) => {
        if (nhanVien.MatKhau) {
          nhanVien.MatKhau = await bcrypt.hash(nhanVien.MatKhau, 12);
        }
      },
      beforeUpdate: async (nhanVien: NhanVien) => {
        if (nhanVien.changed('MatKhau')) {
          nhanVien.MatKhau = await bcrypt.hash(nhanVien.MatKhau, 12);
        }
      },
    },
  }
);

export default NhanVien; 