import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import UserService from '../services/user.service';
import bcrypt from 'bcrypt';

export default class UserController {
  private userService = new UserService();

  /**
   * Lấy thông tin người dùng hiện tại
   */
  public getUserProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Lấy thông tin từ user đã xác thực
      const { id } = req.user!;
      const user = await this.userService.getUserById(id);

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy thông tin người dùng'
      });
    }
  };

  /**
   * Cập nhật thông tin người dùng
   */
  public updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Lấy thông tin từ user đã xác thực
      const { id, role } = req.user!;
      
      const userData = {
        ...(role === 2 ? { TenKhachHang: req.body.TenKhachHang } : { TenNhanVien: req.body.TenNhanVien }),
        SoDienThoai: req.body.SoDienThoai,
        DiaChi: req.body.DiaChi,
      };

      const updatedUser = await this.userService.updateUser(id, role, userData);
      return res.status(200).json({
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi cập nhật thông tin người dùng'
      });
    }
  };

  /**
   * Đổi mật khẩu người dùng
   */
  public changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Lấy thông tin từ user đã xác thực
      const { id, role } = req.user!;
      const { MatKhauCu, MatKhauMoi } = req.body;

      // Kiểm tra mật khẩu cũ
      const user = await this.userService.getUserById(id);
      const isPasswordValid = await bcrypt.compare(MatKhauCu, user.MatKhau);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          message: 'Mật khẩu hiện tại không chính xác'
        });
      }

      // Hash mật khẩu mới và cập nhật
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(MatKhauMoi, salt);
      
      await this.userService.updatePassword(id, role, hashedPassword);
      
      return res.status(200).json({
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi đổi mật khẩu'
      });
    }
  };
} 