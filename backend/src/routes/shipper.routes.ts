import { Router } from 'express';
import { body } from 'express-validator';
import ShipperController from '../controllers/shipper.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const shipperController = new ShipperController();

router.post(
  '/apply',
  authMiddleware,
  body('agreed')
    .custom((value) => value === true || value === 'true')
    .withMessage('Bạn phải đồng ý với điều khoản để đăng ký shipper'),
  body('diaChiHoatDong')
    .trim()
    .notEmpty().withMessage('Địa chỉ hoạt động không được để trống')
    .isLength({ min: 10 }).withMessage('Địa chỉ phải có ít nhất 10 ký tự'),
  body('loaiXe')
    .trim()
    .notEmpty().withMessage('Loại xe không được để trống')
    .isIn(['Xe máy', 'Ô tô', 'Xe tải', 'Xe khác']).withMessage('Loại xe không hợp lệ'),
  shipperController.applyShipper
);

router.get('/orders', authMiddleware, roleMiddleware([4]), shipperController.getMyOrders);
router.get('/stats', authMiddleware, roleMiddleware([4]), shipperController.getStats);
router.get('/orders/:id', authMiddleware, roleMiddleware([4]), shipperController.getOrderDetail);
router.put(
  '/orders/:id/status',
  authMiddleware,
  roleMiddleware([4]),
  body('trangThai')
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isIn(['Đã giao hàng']).withMessage('Shipper chỉ có thể cập nhật trạng thái sang Đã giao hàng'),
  shipperController.updateStatus
);

export default router;
