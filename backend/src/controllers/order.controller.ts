import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import OrderService from '../services/order.service';

export default class OrderController {
  private orderService = new OrderService();

  public createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Lấy MaKhachHang từ user đã xác thực
      const { id: MaKhachHang } = req.user!;
      const orderData = {
        ...req.body,
        MaKhachHang
      };

      const order = await this.orderService.createOrder(orderData);
      return res.status(201).json({
        message: 'Đặt hàng thành công',
        order
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi đặt hàng'
      });
    }
  };

  public getOrdersByCustomerId = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Lấy MaKhachHang từ user đã xác thực
      const { id: customerId, role } = req.user!;
      
      // Kiểm tra xác thực customerId và vai trò
      if (!customerId) {
        return res.status(401).json({
          message: 'Không tìm thấy thông tin người dùng'
        });
      }
      
      // Xác nhận người dùng là khách hàng hoặc người bán
      if (role !== 2 && role !== 3) {
        return res.status(403).json({
          message: 'Chỉ tài khoản khách hàng và người bán mới có thể xem đơn hàng của họ, Admin và nhân viên vui lòng sử dụng trang quản lý đơn hàng'
        });
      }
      
      console.log(`Fetching orders for customer ID: ${customerId}`);
      
      const orders = await this.orderService.getOrdersByCustomerId(customerId);
      
      console.log(`Found ${orders.length} orders for customer ID: ${customerId}`);
      
      return res.status(200).json(orders);
    } catch (error: any) {
      console.error('Error in getOrdersByCustomerId controller:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
      });
    }
  };

  public getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await this.orderService.getOrderById(orderId);
      
      // Kiểm tra quyền truy cập - khách hàng chỉ có thể xem đơn hàng của họ
      if (req.user!.role === 2 && order.MaKhachHang !== req.user!.id) {
        return res.status(403).json({
          message: 'Bạn không có quyền xem đơn hàng này'
        });
      }

      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.orderService.getAllOrders(page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
      });
    }
  };

  public updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderId = parseInt(req.params.id);
      const { trangThai } = req.body;
      
      const order = await this.orderService.updateOrderStatus(orderId, trangThai);
      return res.status(200).json({
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order
      });
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };
} 