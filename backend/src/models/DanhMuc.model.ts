import { Model, DataTypes, Optional } from 'sequelize';
import { IDanhMuc } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

// Interface cho các thuộc tính DanhMuc khi tạo mới
interface DanhMucCreationAttributes extends Optional<IDanhMuc, 'MaDanhMuc'> {}

// Model DanhMuc kế thừa từ Model Sequelize
class DanhMuc extends Model<IDanhMuc, DanhMucCreationAttributes> implements IDanhMuc {
  public MaDanhMuc!: number;
  public TenDanhMuc!: string;
  public HinhAnh!: string;
  
  // Các mối quan hệ sẽ được định nghĩa trong file index.ts
}

// Khởi tạo model
DanhMuc.init(
  {
    MaDanhMuc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenDanhMuc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    HinhAnh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'DanhMuc',
    timestamps: false,
  }
);

export default DanhMuc; 