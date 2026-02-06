import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { generateRandomCode } from '../utils/helpers';

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadsFolder = () => {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    const uploadDir = createUploadsFolder();
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = `${Date.now()}-${generateRandomCode(8)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Kiểm tra file có phải là hình ảnh không
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên các file hình ảnh (jpg, jpeg, png, gif, webp)'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 5); // Tối đa 5 ảnh 