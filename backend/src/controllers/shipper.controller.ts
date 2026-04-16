import { Request, Response } from 'express';
import ShipperService from '../services/shipper.service';
import AuthService from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';

export default class ShipperController {
  private shipperService = new ShipperService();
  private authService = new AuthService();

  public applyShipper = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.user!;
      const { agreed, diaChiHoatDong, loaiXe } = req.body;
      
      if (!agreed) {
        return res.status(400).json({ message: 'Bạn phải đồng ý với điều khoản để đăng ký shipper' });
      }

      if (!diaChiHoatDong || !loaiXe) {
        return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ hoạt động và loại xe' });
      }

      await this.shipperService.applyShipper(id, {
        diaChiHoatDong,
        loaiXe,
      });

      const tokens = this.authService.generateTokens({
        id,
        role: 4,
        tokenId: uuidv4()
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        path: '/api/auth/refresh'
      });

      return res.status(201).json({
        message: 'Đăng ký shipper thành công',
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        role: 4
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Không thể đăng ký shipper' });
    }
  };

  public getMyOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: khachHangId } = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const trangThai = (req.query.trangThai as string) || 'Đang giao hàng';

      const result = await this.shipperService.getShippingOrders(khachHangId, page, limit, trangThai);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Lỗi khi lấy danh sách đơn hàng shipper' });
    }
  };

  public getOrderDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: khachHangId } = req.user!;
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
      }

      const order = await this.shipperService.getShippingOrderById(khachHangId, orderId);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  };

  public updateStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: khachHangId } = req.user!;
      const orderId = parseInt(req.params.id);
      const { trangThai } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
      }

      if (!trangThai) {
        return res.status(400).json({ message: 'Trạng thái không được để trống' });
      }

      const updated = await this.shipperService.updateShippingOrderStatus(khachHangId, orderId, trangThai);
      return res.status(200).json({
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  public getStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: khachHangId } = req.user!;
      const stats = await this.shipperService.getShipperStats(khachHangId);
      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Lỗi khi lấy thống kê shipper' });
    }
  };
}
