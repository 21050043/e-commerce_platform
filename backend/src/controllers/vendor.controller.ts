import { Request, Response } from 'express';
import VendorService from '../services/vendor.service';
import AdminService from '../services/admin.service';

export default class VendorController {
  private vendorService = new VendorService();
  private adminService = new AdminService();

  public applyVendor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.user!;
      const data = { ...req.body, MaKhachHang: id };
      const application = await this.vendorService.applyVendor(data);
      return res.status(201).json({ message: 'Đã gửi hồ sơ đăng ký người bán', application });
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

  public listApplications = async (req: Request, res: Response): Promise<Response> => {
    try {
      const status = (req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED') || 'PENDING';
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');
      const result = await this.adminService.listVendorApplications(status, page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Không thể lấy danh sách hồ sơ người bán' });
    }
  };

  public approve = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.adminService.approveVendorApplication(id);
      return res.status(200).json({ message: 'Đã phê duyệt người bán', application: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Không thể phê duyệt' });
    }
  };

  public reject = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const result = await this.adminService.rejectVendorApplication(id, reason || '');
      return res.status(200).json({ message: 'Đã từ chối hồ sơ người bán', application: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Không thể từ chối' });
    }
  };
}


