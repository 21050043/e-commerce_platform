import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import OrderService from '../services/order.service';

/**
 * Controller đơn hàng cho phía Khách hàng.
 * Admin/Staff không tham gia luồng đơn hàng trong mô hình platform.
 * Người bán dùng SellerOrderController để quản lý sub-orders của họ.
 */
export default class OrderController {
  constructor(private orderService = new OrderService()) { }

  public createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: MaKhachHang } = req.user!;
      const orderData = { ...req.body, MaKhachHang };

      const order = await this.orderService.createOrder(orderData);
      return res.status(201).json({
        message: 'Đặt hàng thành công',
        order,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi đặt hàng',
      });
    }
  };

  public getOrdersByCustomerId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: customerId, role } = req.user!;

      if (!customerId) {
        return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      }

      // Chỉ khách hàng (role 2) và người bán (role 3) xem đơn hàng của mình
      if (role !== 2 && role !== 3) {
        return res.status(403).json({
          message: 'Chỉ khách hàng và người bán mới có thể xem đơn hàng của họ',
        });
      }

      const orders = await this.orderService.getOrdersByCustomerId(customerId);
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng',
      });
    }
  };

  public getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await this.orderService.getOrderById(orderId);

      // Khách hàng chỉ xem đơn hàng của mình
      if (req.user!.role === 2 && (order as any).MaKhachHang !== req.user!.id) {
        return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
      }

      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  };
}