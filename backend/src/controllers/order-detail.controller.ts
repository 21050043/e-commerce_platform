import { Request, Response } from 'express';
import OrderDetailService from '../services/order-detail.service';

export default class OrderDetailController {
  private orderDetailService = new OrderDetailService();

  /**
   * Lấy danh sách chi tiết hóa đơn theo mã hóa đơn
   */
  public getOrderDetailsByOrderId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.orderId);
      const orderDetails = await this.orderDetailService.getOrderDetailsByOrderId(orderId);
      return res.status(200).json(orderDetails);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách chi tiết hóa đơn'
      });
    }
  };

  /**
   * Lấy chi tiết hóa đơn theo mã chi tiết
   */
  public getOrderDetailById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const orderDetail = await this.orderDetailService.getOrderDetailById(id);
      
      if (!orderDetail) {
        return res.status(404).json({
          message: 'Chi tiết hóa đơn không tồn tại'
        });
      }
      
      return res.status(200).json(orderDetail);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy chi tiết hóa đơn'
      });
    }
  };

  /**
   * Tạo chi tiết hóa đơn mới
   */
  public createOrderDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderDetailData = req.body;
      const newOrderDetail = await this.orderDetailService.createOrderDetail(orderDetailData);
      
      return res.status(201).json({
        message: 'Tạo chi tiết hóa đơn thành công',
        orderDetail: newOrderDetail
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tạo chi tiết hóa đơn'
      });
    }
  };

  /**
   * Cập nhật chi tiết hóa đơn
   */
  public updateOrderDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const orderDetailData = req.body;
      
      const updatedOrderDetail = await this.orderDetailService.updateOrderDetail(id, orderDetailData);
      
      if (!updatedOrderDetail) {
        return res.status(404).json({
          message: 'Chi tiết hóa đơn không tồn tại'
        });
      }
      
      return res.status(200).json({
        message: 'Cập nhật chi tiết hóa đơn thành công',
        orderDetail: updatedOrderDetail
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi cập nhật chi tiết hóa đơn'
      });
    }
  };

  /**
   * Xóa chi tiết hóa đơn
   */
  public deleteOrderDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      
      const result = await this.orderDetailService.deleteOrderDetail(id);
      
      if (!result) {
        return res.status(404).json({
          message: 'Chi tiết hóa đơn không tồn tại'
        });
      }
      
      return res.status(200).json({
        message: 'Xóa chi tiết hóa đơn thành công'
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi xóa chi tiết hóa đơn'
      });
    }
  };
} 