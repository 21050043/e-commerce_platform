import { Router } from 'express';
import { body } from 'express-validator';
import OrderController from '../controllers/order.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Validation middleware
const createOrderValidation = [
  body('PhuongThucTT')
    .notEmpty().withMessage('Phương thức thanh toán không được để trống'),
  body('DiaChi')
    .notEmpty().withMessage('Địa chỉ không được để trống'),
  body('TongTien')
    .notEmpty().withMessage('Tổng tiền không được để trống')
    .isFloat({ min: 0 }).withMessage('Tổng tiền phải là số dương'),
  body('items')
    .isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất một sản phẩm'),
  body('items.*.MaSanPham')
    .notEmpty().withMessage('Mã sản phẩm không được để trống')
    .isInt().withMessage('Mã sản phẩm phải là số nguyên'),
  body('items.*.SoLuong')
    .notEmpty().withMessage('Số lượng không được để trống')
    .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
  body('items.*.DonGia')
    .notEmpty().withMessage('Đơn giá không được để trống')
    .isFloat({ min: 0 }).withMessage('Đơn giá phải là số dương'),
  body('items.*.ThanhTien')
    .notEmpty().withMessage('Thành tiền không được để trống')
    .isFloat({ min: 0 }).withMessage('Thành tiền phải là số dương')
];

const updateOrderStatusValidation = [
  body('trangThai')
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isIn(['Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'])
    .withMessage('Trạng thái không hợp lệ')
];

// Customer routes
router.post(
  '/',
  authMiddleware,
  createOrderValidation,
  orderController.createOrder
);

router.get(
  '/my-orders',
  authMiddleware,
  orderController.getOrdersByCustomerId
);

// Common route
router.get(
  '/:id',
  authMiddleware,
  orderController.getOrderById
);

// Admin/Staff routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  orderController.getAllOrders
);

router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware([0, 1]),
  updateOrderStatusValidation,
  orderController.updateOrderStatus
);

export default router; 