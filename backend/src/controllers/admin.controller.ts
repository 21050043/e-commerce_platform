import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import AdminService from '../services/admin.service';
import ProductService from '../services/product.service';
import OrderService from '../services/order.service';

export default class AdminController {
  private adminService = new AdminService();
  private productService = new ProductService();
  private orderService = new OrderService();

  /**
   * Lấy thông tin tổng quan cho dashboard
   */
  public getDashboardSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userRole = req.user?.role;

      if (userRole === 3) {
        // Vendor dashboard - chỉ hiển thị dữ liệu của vendor
        const summary = await this.adminService.getVendorDashboardSummary(req.user!.id);
        return res.status(200).json(summary);
      } else {
        // Admin/Staff dashboard - hiển thị dữ liệu tổng quan
        const summary = await this.adminService.getDashboardSummary();
        return res.status(200).json(summary);
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy thông tin tổng quan'
      });
    }
  };

  /**
   * Quản lý người dùng
   */
  public getAllCustomers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const customers = await this.adminService.getAllCustomers(page, limit);
      return res.status(200).json(customers);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách khách hàng'
      });
    }
  };

  public getAllStaff = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const staff = await this.adminService.getAllStaff(page, limit);
      return res.status(200).json(staff);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách nhân viên'
      });
    }
  };

  public getAllVendors = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const vendors = await this.adminService.getAllVendors(page, limit);
      return res.status(200).json(vendors);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách người bán'
      });
    }
  };

  public getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const roleType = req.query.role as string;

      const user = await this.adminService.getUserById(id, roleType === 'staff' ? 1 : 2);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userData = req.body;
      const newUser = await this.adminService.createUser(userData);

      return res.status(201).json({
        message: 'Tạo người dùng thành công',
        user: newUser
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tạo người dùng'
      });
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      const userData = req.body;
      const roleType = req.query.role as string;

      const updatedUser = await this.adminService.updateUser(id, roleType === 'staff' ? 1 : 2, userData);

      return res.status(200).json({
        message: 'Cập nhật người dùng thành công',
        user: updatedUser
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi cập nhật người dùng'
      });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const roleType = req.query.role as string;

      await this.adminService.deleteUser(id, roleType === 'staff' ? 1 : 2);

      return res.status(200).json({
        message: 'Xóa người dùng thành công'
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi xóa người dùng'
      });
    }
  };

  public changeUserRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      const { newRole } = req.body;
      const roleType = req.query.role as string;

      await this.adminService.changeUserRole(id, roleType === 'staff' ? 1 : 2, newRole);

      return res.status(200).json({
        message: 'Thay đổi vai trò người dùng thành công'
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi thay đổi vai trò người dùng'
      });
    }
  };

  /**
   * Quản lý sản phẩm (sử dụng lại ProductService)
   */
  public getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.productService.getAllProducts(page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách sản phẩm'
      });
    }
  };

  public getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);
      return res.status(200).json(product);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  /**
   * Quản lý đơn hàng (Admin chỉ xem tổng quan — không can thiệp vào luồng giao dịch)
   * Trong mô hình platform, người bán tự quản lý đơn hàng của mình.
   */
  public getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.adminService.getAllOrders(page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng'
      });
    }
  };

  public getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await this.orderService.getOrderById(orderId);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  /**
   * NOTE: updateOrderStatus bị bỏ trong mô hình platform.
   * Người bán (role 3) tự cập nhật trạng thái qua /api/seller/orders/:id/status.
   * Admin không can thiệp vào luồng giao dịch của người bán.
   */

  /**
   * Lấy đơn hàng của một khách hàng bất kỳ (cho admin/staff xem).
   */
  public getOrdersByCustomerId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: 'Mã khách hàng không hợp lệ' });
      }
      const orders = await this.orderService.getOrdersByCustomerId(customerId);
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách đơn hàng của khách hàng'
      });
    }
  };

  /**
   * Tạm dừng sản phẩm
   */
  public suspendProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const productId = parseInt(req.params.id);
      const { lyDoTamDung } = req.body;
      const adminId = req.user!.id;

      if (!lyDoTamDung || lyDoTamDung.trim().length === 0) {
        return res.status(400).json({
          message: 'Lý do tạm dừng không được để trống'
        });
      }

      const product = await this.productService.suspendProduct(productId, lyDoTamDung, adminId);

      return res.status(200).json({
        message: 'Tạm dừng sản phẩm thành công',
        product
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tạm dừng sản phẩm'
      });
    }
  };

  /**
   * Hủy tạm dừng sản phẩm
   */
  public unsuspendProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const productId = parseInt(req.params.id);
      const product = await this.productService.unsuspendProduct(productId);

      return res.status(200).json({
        message: 'Hủy tạm dừng sản phẩm thành công',
        product
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi hủy tạm dừng sản phẩm'
      });
    }
  };
} 