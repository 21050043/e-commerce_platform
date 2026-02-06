import { Router } from 'express';
import { body } from 'express-validator';
import OrderDetailController from '../controllers/order-detail.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const orderDetailController = new OrderDetailController();

// Validation cho chi tiết hóa đơn
const orderDetailValidation = [
  body('MaHoaDon')
    .notEmpty().withMessage('Mã hóa đơn không được để trống')
    .isInt().withMessage('Mã hóa đơn phải là số nguyên'),
  body('MaSanPham')
    .notEmpty().withMessage('Mã sản phẩm không được để trống')
    .isInt().withMessage('Mã sản phẩm phải là số nguyên'),
  body('SoLuong')
    .notEmpty().withMessage('Số lượng không được để trống')
    .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên lớn hơn 0'),
  body('DonGia')
    .notEmpty().withMessage('Đơn giá không được để trống')
    .isFloat({ min: 0 }).withMessage('Đơn giá phải là số không âm')
];

// Lấy danh sách chi tiết hóa đơn theo mã hóa đơn
router.get(
  '/order/:orderId',
  authMiddleware,
  orderDetailController.getOrderDetailsByOrderId
);

// Lấy chi tiết hóa đơn theo mã chi tiết
router.get(
  '/:id',
  authMiddleware,
  orderDetailController.getOrderDetailById
);

// Tạo chi tiết hóa đơn mới - chỉ admin và nhân viên
router.post(
  '/',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  orderDetailValidation,
  orderDetailController.createOrderDetail
);

// Cập nhật chi tiết hóa đơn - chỉ admin và nhân viên
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  orderDetailValidation,
  orderDetailController.updateOrderDetail
);

// Xóa chi tiết hóa đơn - chỉ admin và nhân viên
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  orderDetailController.deleteOrderDetail
);

export default router; 