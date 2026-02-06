import KhachHang from '../models/KhachHang.model';
import NhanVien from '../models/NhanVien.model';
import { Op } from 'sequelize';

export default class UserService {
  /**
   * Lấy thông tin người dùng theo ID
   */
  public async getUserById(id: number, role = 2) {
    try {
      let user;

      if (role === 2) {
        // Khách hàng
        user = await KhachHang.findByPk(id, {
          attributes: { exclude: ['MatKhau'] }
        });
      } else {
        // Nhân viên hoặc Admin
        user = await NhanVien.findByPk(id, {
          attributes: { exclude: ['MatKhau'] }
        });
      }

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  public async updateUser(id: number, role: number, userData: any) {
    try {
      if (role === 2) {
        // Khách hàng
        const user = await KhachHang.findByPk(id);
        
        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }
        
        await user.update(userData);
        
        // Trả về user không kèm mật khẩu
        const { MatKhau, ...userWithoutPassword } = user.get();
        return userWithoutPassword;
      } else {
        // Nhân viên hoặc Admin
        const user = await NhanVien.findByPk(id);
        
        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }
        
        await user.update(userData);
        
        // Trả về user không kèm mật khẩu
        const { MatKhau, ...userWithoutPassword } = user.get();
        return userWithoutPassword;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật mật khẩu người dùng
   */
  public async updatePassword(id: number, role: number, hashedPassword: string) {
    try {
      if (role === 2) {
        // Khách hàng
        const user = await KhachHang.findByPk(id);
        
        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }
        
        await user.update({ MatKhau: hashedPassword });
        return true;
      } else {
        // Nhân viên hoặc Admin
        const user = await NhanVien.findByPk(id);
        
        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }
        
        await user.update({ MatKhau: hashedPassword });
        return true;
      }
    } catch (error) {
      throw error;
    }
  }
} 