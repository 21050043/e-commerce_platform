import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Validation middleware
const loginValidation = [
  body('SoDienThoai')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('MatKhau')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

const registerValidation = [
  body('SoDienThoai')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('MatKhau')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('TenKhachHang')
    .notEmpty().withMessage('Tên khách hàng không được để trống'),
  body('DiaChi')
    .optional()
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

export default router; 