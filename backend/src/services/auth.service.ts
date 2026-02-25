import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IAuthTokens, ILoginDto, IRefreshTokenData, IRegisterDto, ITokenData } from '../interfaces/auth.interface';
import KhachHang from '../models/KhachHang.model';
import NhanVien from '../models/NhanVien.model';

export default class AuthService {
  private readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'shopapp_access_token_secret';
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'shopapp_refresh_token_secret';
  private readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  public async login(loginDto: ILoginDto): Promise<{ tokens: IAuthTokens; user: any }> {
    try {
      const { SoDienThoai, MatKhau } = loginDto;

      // Kiểm tra số điện thoại trong cả hai bảng NhanVien và KhachHang
      let nhanVienUser = await NhanVien.findOne({
        where: { SoDienThoai },
        include: ['VaiTro']
      });

      // Nếu tìm thấy trong bảng NhanVien
      if (nhanVienUser) {
        const isPasswordValid = await bcrypt.compare(MatKhau, nhanVienUser.MatKhau);
        if (!isPasswordValid) {
          throw new Error('Số điện thoại hoặc mật khẩu không đúng');
        }

        const tokenData: ITokenData = {
          id: nhanVienUser.MaNhanVien,
          role: nhanVienUser.MaVaiTro,
          tokenId: uuidv4()
        };

        const tokens = this.generateTokens(tokenData);

        const userObject: any = nhanVienUser.get({ plain: true });
        delete userObject.MatKhau;

        return {
          tokens,
          user: userObject
        };
      }

      // Nếu không tìm thấy trong bảng NhanVien, tìm trong bảng KhachHang
      const khachHangUser = await KhachHang.findOne({
        where: { SoDienThoai },
        include: ['VaiTro']
      });

      if (!khachHangUser) {
        throw new Error('Số điện thoại hoặc mật khẩu không đúng');
      }

      const isPasswordValid = await bcrypt.compare(MatKhau, khachHangUser.MatKhau);
      if (!isPasswordValid) {
        throw new Error('Số điện thoại hoặc mật khẩu không đúng');
      }

      const tokenData: ITokenData = {
        id: khachHangUser.MaKhachHang,
        role: khachHangUser.MaVaiTro,
        tokenId: uuidv4()
      };

      const tokens = this.generateTokens(tokenData);

      const userObject: any = khachHangUser.get({ plain: true });
      delete userObject.MatKhau;

      return {
        tokens,
        user: userObject
      };
    } catch (error) {
      throw error;
    }
  }

  public async register(registerDto: IRegisterDto): Promise<{ tokens: IAuthTokens; user: any }> {
    try {
      const { SoDienThoai, MatKhau, DiaChi, TenKhachHang, isNhanVien = false } = registerDto;

      // Kiểm tra số điện thoại đã tồn tại chưa
      const existingUser = isNhanVien
        ? await NhanVien.findOne({ where: { SoDienThoai } })
        : await KhachHang.findOne({ where: { SoDienThoai } });

      if (existingUser) {
        throw new Error('Số điện thoại đã được sử dụng');
      }


      let user;
      if (isNhanVien) {
        // Chỉ admin mới có thể tạo nhân viên, nên không cho phép đăng ký nhân viên
        throw new Error('Không thể đăng ký tài khoản nhân viên');
      } else {
        // Đăng ký khách hàng
        user = await KhachHang.create({
          TenKhachHang,
          SoDienThoai,
          MatKhau,
          DiaChi: DiaChi || '',
          MaVaiTro: 2 // Mã vai trò khách hàng
        });
      }

      const tokenData: ITokenData = {
        id: user.MaKhachHang,
        role: user.MaVaiTro,
        tokenId: uuidv4()
      };

      const tokens = this.generateTokens(tokenData);

      // Tạo đối tượng mới từ user và loại bỏ thuộc tính MatKhau
      const userObject: any = user.get({ plain: true });
      delete userObject.MatKhau;

      return {
        tokens,
        user: userObject
      };
    } catch (error) {
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      // Xác thực refresh token
      const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as IRefreshTokenData;

      // Tạo token mới với cùng thông tin nhưng tokenId mới
      const tokenData: ITokenData = {
        id: decoded.id,
        role: decoded.role,
        tokenId: uuidv4() // Tạo tokenId mới
      };

      // Tạo cặp token mới
      return this.generateTokens(tokenData);
    } catch (error) {
      throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  private generateTokens(data: ITokenData): IAuthTokens {
    // Tạo access token
    const accessToken = jwt.sign(
      data,
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { id: data.id, role: data.role, tokenId: data.tokenId },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );

    // Decode để lấy thời gian hết hạn
    const decoded = jwt.decode(accessToken) as ITokenData;
    const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900; // Mặc định 15 phút

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }
} 