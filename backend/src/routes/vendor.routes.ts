import { Router } from 'express';
import { body } from 'express-validator';
import VendorController from '../controllers/vendor.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import ProductController from '../controllers/product.controller';
import multer from 'multer';

const router = Router();
const vendorController = new VendorController();
const productController = new ProductController();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Vendor apply & profile
router.post(
  '/apply',
  authMiddleware,
  body('LoaiHinh').isIn(['CA_NHAN', 'DOANH_NGHIEP']).withMessage('Loại hình không hợp lệ'),
  body('DiaChiKinhDoanh').notEmpty(),
  body('MaDanhMucChinh').isInt(),
  body('SoDienThoaiLienHe').matches(/^[0-9]{10}$/),
  vendorController.applyVendor
);

router.get('/me', authMiddleware, vendorController.getMyVendorProfile);
router.put(
  '/me',
  authMiddleware,
  body('DiaChiKinhDoanh').optional().notEmpty().withMessage('Địa chỉ kinh doanh không được để trống'),
  body('SoDienThoaiLienHe').optional().matches(/^[0-9]{10}$/).withMessage('Số điện thoại liên hệ phải có 10 chữ số'),
  vendorController.updateVendorProfile
);

// Vendor product management (role 3)
router.get('/products', authMiddleware, roleMiddleware([3]), productController.getVendorProducts);
router.post('/products', authMiddleware, roleMiddleware([3]), upload.single('image'), productController.createProduct);
router.put('/products/:id', authMiddleware, roleMiddleware([3]), upload.single('image'), productController.updateProduct);
router.delete('/products/:id', authMiddleware, roleMiddleware([3]), productController.deleteProduct);

// Admin: vendor applications
router.get('/applications', authMiddleware, roleMiddleware([0]), vendorController.listApplications);
router.put('/applications/:id/approve', authMiddleware, roleMiddleware([0]), vendorController.approve);
router.put('/applications/:id/reject', authMiddleware, roleMiddleware([0]), vendorController.reject);

export default router;


