import { Router } from 'express';
import { body } from 'express-validator';
import ProductController from '../controllers/product.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const productController = new ProductController();

// Cấu hình multer để xử lý upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
});

// Validation middleware
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

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/vendor/:vendorId', productController.getVendorShop);
router.get('/:id', productController.getProductById);

// Protected routes (chỉ vendor mới được CRUD)
router.post('/', authMiddleware, roleMiddleware([3]), upload.single('image'), productValidation, productController.createProduct);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([3]),
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('=== Product update route hit ===');
    console.log('Product ID:', req.params.id);
    console.log('Request has file:', !!req.file);
    next();
  },
  productValidation,
  productController.updateProduct
);
router.delete('/:id', authMiddleware, roleMiddleware([3]), productController.deleteProduct);

export default router; 