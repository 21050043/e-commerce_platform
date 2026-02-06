import { Model, DataTypes, Optional } from 'sequelize';
import { IVaiTro } from '../interfaces/models.interface';
import { sequelize } from '../config/db.config';

// Interface cho các thuộc tính VaiTro khi tạo mới
interface VaiTroCreationAttributes extends Optional<IVaiTro, 'MaVaiTro'> {}

// Model VaiTro kế thừa từ Model Sequelize
class VaiTro extends Model<IVaiTro, VaiTroCreationAttributes> implements IVaiTro {
  public MaVaiTro!: number;
  public TenVaiTro!: string;
  
  // Các mối quan hệ sẽ được định nghĩa trong file index.ts
}

// Khởi tạo model
VaiTro.init(
  {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    TenVaiTro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'VaiTro',
    timestamps: false,
  }
);

export default VaiTro; 