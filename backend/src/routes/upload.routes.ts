import { Router } from 'express';
import UploadController from '../controllers/upload.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/upload.middleware';

const router = Router();
const uploadController = new UploadController();

// Upload một ảnh - yêu cầu admin hoặc nhân viên
router.post(
  '/image',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  uploadSingleImage,
  uploadController.uploadSingleImage
);

// Upload nhiều ảnh - yêu cầu admin hoặc nhân viên
router.post(
  '/images',
  authMiddleware,
  roleMiddleware([0, 1]), // Admin và nhân viên
  uploadMultipleImages,
  uploadController.uploadMultipleImages
);

export default router; 