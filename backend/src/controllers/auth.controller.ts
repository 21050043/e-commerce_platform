import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/auth.service';

export default class AuthController {
  private authService = new AuthService();

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const loginData = req.body;
      const result = await this.authService.login(loginData);

      // Thiết lập refresh token vào HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (milliseconds)
        sameSite: 'strict',
        path: '/api/auth/refresh'
      });

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || 'Đăng nhập thất bại'
      });
    }
  };

  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const registerData = req.body;
      const result = await this.authService.register(registerData);

      // Thiết lập refresh token vào HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        sameSite: 'strict',
        path: '/api/auth/refresh'
      });

      return res.status(201).json({
        message: 'Đăng ký thành công',
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || 'Đăng ký thất bại'
      });
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Lấy refresh token từ cookie
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token không tồn tại' });
      }

      // Tạo access token mới
      const tokens = await this.authService.refreshToken(refreshToken);

      // Cập nhật refresh token trong cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        path: '/api/auth/refresh'
      });

      return res.status(200).json({
        message: 'Token đã được làm mới',
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      });
    } catch (error: any) {
      return res.status(401).json({
        message: error.message || 'Không thể làm mới token'
      });
    }
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Xóa refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth/refresh'
      });

      return res.status(200).json({
        message: 'Đăng xuất thành công'
      });
    } catch (error: any) {
      return res.status(500).json({
        message: 'Đã xảy ra lỗi khi đăng xuất'
      });
    }
  };
} 