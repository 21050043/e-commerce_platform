import { Request, Response } from 'express';
import VendorService from '../services/vendor.service';
import AdminService from '../services/admin.service';
import AuthService from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';


export default class VendorController {
  constructor(
    private vendorService = new VendorService(),
    private adminService = new AdminService(),
    private authService = new AuthService()
  ) { }


  public applyVendor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.user!;
      const data = { ...req.body, MaKhachHang: id };
      const application = await this.vendorService.applyVendor(data);
      
      // Generate new token with seller role (3)
      const tokens = this.authService.generateTokens({
        id: id,
        role: 3,
        tokenId: uuidv4()
      });

      // Set refresh token cookie (consistent with AuthController)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        path: '/api/auth/refresh'
      });

      return res.status(201).json({ 
        message: 'Đăng ký người bán thành công', 
        application,
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        role: 3
      });

    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Không thể gửi hồ sơ người bán' });
    }
  };

  public getMyVendorProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.user!;
      const profile = await this.vendorService.getMyVendorProfile(id);
      return res.status(200).json(profile);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Không thể lấy hồ sơ người bán' });
    }
  };

  public updateVendorProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.user!;
      const updatedProfile = await this.vendorService.updateVendorProfile(id, req.body);
      return res.status(200).json({
        message: 'Cập nhật thông tin người bán thành công',
        profile: updatedProfile
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Không thể cập nhật thông tin người bán' });
    }
  };

  // Admin methods (listApplications, approve, reject) removed as registration is now auto-approved.
}


