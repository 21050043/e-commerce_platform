import { Router } from 'express';
import { body } from 'express-validator';
import CategoryController from '../controllers/category.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// Validation middleware
const categoryValidation = [
  body('TenDanhMuc')
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự')
];

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (chỉ admin và nhân viên)
router.post(
  '/',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  categoryValidation,
  categoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([0, 1]),
  categoryValidation,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([0]), // Chỉ admin
  categoryController.deleteCategory
);

export default router; 