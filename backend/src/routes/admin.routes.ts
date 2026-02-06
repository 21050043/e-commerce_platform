import { Router } from 'express';
import { body } from 'express-validator';
import AdminController from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import ProductController from '../controllers/product.controller';

const router = Router();
const adminController = new AdminController();
const productController = new ProductController();

// Admin không còn tạo/sửa/xóa sản phẩm; chỉ xem

// Validation middleware cho tạo/cập nhật sản phẩm
const productValidation = [
  body('TenSanPham')
    .notEmpty().withMessage('Tên sản phẩm không được để trống')
    .isLength({ max: 100 }).withMessage('Tên sản phẩm không được vượt quá 100 ký tự'),
  body('MaDanhMuc')
    .notEmpty().withMessage('Mã danh mục không được để trống')
    .isInt().withMessage('Mã danh mục phải là số nguyên'),
  body('SoLuong')
    .notEmpty().withMessage('Số lượng không được để trống')
    .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương hoặc 0'),
  body('GiaSanPham')
    .notEmpty().withMessage('Giá sản phẩm không được để trống')
    .isFloat({ min: 0 }).withMessage('Giá sản phẩm phải là số dương')
];

// Validation middleware cho tạo/cập nhật người dùng
const userValidation = [
  body('TenKhachHang').optional().isLength({ max: 100 }).withMessage('Tên không được vượt quá 100 ký tự'),
  body('TenNhanVien').optional().isLength({ max: 100 }).withMessage('Tên không được vượt quá 100 ký tự'),
  body('SoDienThoai')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .matches(/^[0-9]{10}$/).withMessage('Số điện thoại phải có 10 chữ số'),
  body('DiaChi')
    .notEmpty().withMessage('Địa chỉ không được để trống'),
  body('MatKhau').optional()
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('MaVaiTro')
    .notEmpty().withMessage('Vai trò không được để trống')
    .isIn([0, 1, 2, 3]).withMessage('Vai trò không hợp lệ')
];

const roleValidation = [
  body('newRole')
    .notEmpty().withMessage('Vai trò mới không được để trống')
    .isIn([0, 1, 2, 3]).withMessage('Vai trò không hợp lệ')
];

const orderStatusValidation = [
  body('trangThai')
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isIn(['Đã đặt hàng', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'])
    .withMessage('Trạng thái không hợp lệ')
];

const suspendProductValidation = [
  body('lyDoTamDung')
    .notEmpty().withMessage('Lý do tạm dừng không được để trống')
    .isLength({ min: 10 }).withMessage('Lý do tạm dừng phải có ít nhất 10 ký tự')
    .isLength({ max: 500 }).withMessage('Lý do tạm dừng không được vượt quá 500 ký tự')
];

// Dashboard
router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware([0, 1, 3]), // Admin, nhân viên và vendor
  adminController.getDashboardSummary
);

// User management - Chỉ admin mới được quản lý người dùng
router.get(
  '/users/customers',
  authMiddleware,
  roleMiddleware([0]),
  adminController.getAllCustomers
);

router.get(
  '/users/staff',
  authMiddleware,
  roleMiddleware([0]),
  adminController.getAllStaff
);

router.get(
  '/users/vendors',
  authMiddleware,
  roleMiddleware([0]),
  adminController.getAllVendors
);

router.get(
  '/users/:id',
  authMiddleware,
  roleMiddleware([0]),
  adminController.getUserById
);

router.post(
  '/users',
  authMiddleware,
  roleMiddleware([0]),
  userValidation,
  adminController.createUser
);

router.put(
  '/users/:id',
  authMiddleware,
  roleMiddleware([0]),
  userValidation,
  adminController.updateUser
);

router.delete(
  '/users/:id',
  authMiddleware,
  roleMiddleware([0]),
  adminController.deleteUser
);

router.put(
  '/users/:id/role',
  authMiddleware,
  roleMiddleware([0]),
  roleValidation,
  adminController.changeUserRole
);

// Product management - Admin, nhân viên và vendor
router.get(
  '/products',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  adminController.getAllProducts
);

router.get(
  '/products/:id',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  adminController.getProductById
);

// Remove admin product create/update/delete

// Vendor applications endpoints moved to /api/vendor (mounted with admin role)

// Order management - Admin, nhân viên và vendor
router.get(
  '/orders',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  adminController.getAllOrders
);

router.get(
  '/orders/:id',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  adminController.getOrderById
);

router.put(
  '/orders/:id/status',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  orderStatusValidation,
  adminController.updateOrderStatus
);

router.get(
  '/orders/by-customer/:customerId',
  authMiddleware,
  roleMiddleware([0, 1, 3]),
  adminController.getOrdersByCustomerId
);

// Product suspension routes - Admin and staff only
router.put(
  '/products/:id/suspend',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin and staff only
  suspendProductValidation,
  adminController.suspendProduct
);

router.put(
  '/products/:id/unsuspend',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin and staff only
  adminController.unsuspendProduct
);

export default router; 