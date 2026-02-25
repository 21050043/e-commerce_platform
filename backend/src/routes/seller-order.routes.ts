import { Router } from 'express';
import { body } from 'express-validator';
import SellerOrderController from '../controllers/seller-order.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const sellerOrderController = new SellerOrderController();

// Tất cả routes chỉ cho Người bán (role 3)
const sellerOnly = [authMiddleware, roleMiddleware([3])];

// ─── Thống kê dashboard ────────────────────────────────────────────
router.get('/stats', ...sellerOnly, sellerOrderController.getStats);

// ─── Danh sách sub-orders của người bán ───────────────────────────
// Query: ?page=1&limit=10&trangThai=Đã đặt hàng
router.get('/', ...sellerOnly, sellerOrderController.getMyOrders);

// ─── Chi tiết 1 sub-order ─────────────────────────────────────────
router.get('/:id', ...sellerOnly, sellerOrderController.getOrderDetail);

// ─── Cập nhật trạng thái sub-order ────────────────────────────────
router.put(
    '/:id/status',
    ...sellerOnly,
    body('trangThai')
        .notEmpty().withMessage('Trạng thái không được để trống')
        .isIn(['Đã đặt hàng', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'])
        .withMessage('Trạng thái không hợp lệ'),
    sellerOrderController.updateStatus
);

export default router;
