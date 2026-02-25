import { Router } from 'express';
import { body } from 'express-validator';
import OrderController from '../controllers/order.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Validation cho tạo đơn hàng
const createOrderValidation = [
  body('PhuongThucTT').notEmpty().withMessage('Phương thức thanh toán không được để trống'),
  body('DiaChi').notEmpty().withMessage('Địa chỉ không được để trống'),
  body('TongTien')
    .notEmpty().withMessage('Tổng tiền không được để trống')
    .isFloat({ min: 0 }).withMessage('Tổng tiền phải là số dương'),
  body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất một sản phẩm'),
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
    .isFloat({ min: 0 }).withMessage('Thành tiền phải là số dương'),
];

// ─── Khách hàng đặt hàng ───────────────────────────────────────────
router.post('/', authMiddleware, createOrderValidation, orderController.createOrder);

// ─── Khách hàng xem đơn hàng của mình ─────────────────────────────
router.get('/my-orders', authMiddleware, orderController.getOrdersByCustomerId);

// ─── Xem chi tiết 1 hoá đơn (khách hàng + người bán) ──────────────
router.get('/:id', authMiddleware, orderController.getOrderById);

export default router;