import { Router } from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Validation middleware cho cập nhật thông tin
const updateProfileValidation = [
  body('TenKhachHang').optional().isLength({ max: 100 }).withMessage('Tên không được vượt quá 100 ký tự'),
  body('TenNhanVien').optional().isLength({ max: 100 }).withMessage('Tên không được vượt quá 100 ký tự'),
  body('SoDienThoai')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .matches(/^[0-9]{10}$/).withMessage('Số điện thoại phải có 10 chữ số'),
  body('DiaChi')
    .notEmpty().withMessage('Địa chỉ không được để trống')
];

// Validation middleware cho đổi mật khẩu
const changePasswordValidation = [
  body('MatKhauCu')
    .notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('MatKhauMoi')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// Lấy thông tin profile người dùng
router.get(
  '/profile',
  authMiddleware,
  userController.getUserProfile
);

// Cập nhật thông tin profile
router.put(
  '/profile',
  authMiddleware,
  updateProfileValidation,
  userController.updateUserProfile
);

// Đổi mật khẩu
router.put(
  '/change-password',
  authMiddleware,
  changePasswordValidation,
  userController.changePassword
);

export default router; 