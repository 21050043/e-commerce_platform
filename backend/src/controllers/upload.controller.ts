import { Request, Response } from 'express';
import * as path from 'path';
import * as multer from 'multer';

// Extend Express Request type
declare global {
  namespace Express {
    // Không định nghĩa lại các thuộc tính của Request
  }
}

export default class UploadController {
  /**
   * Upload một hình ảnh
   */
  public uploadSingleImage = (req: Request, res: Response): Response => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Không tìm thấy file để upload'
        });
      }

      // Đường dẫn tương đối đến file
      const relativePath = `/uploads/${path.basename(req.file.path)}`;

      return res.status(200).json({
        message: 'Upload thành công',
        fileName: req.file.filename,
        filePath: relativePath
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi upload file'
      });
    }
  };

  /**
   * Upload nhiều hình ảnh
   */
  public uploadMultipleImages = (req: Request, res: Response): Response => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          message: 'Không tìm thấy file để upload'
        });
      }

      // Chuyển đổi req.files thành mảng
      let files: Express.Multer.File[] = [];
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // Trường hợp req.files là object với key là fieldname
        Object.values(req.files).forEach(fileArray => {
          if (Array.isArray(fileArray)) {
            files = [...files, ...fileArray];
          }
        });
      }

      // Tạo danh sách đường dẫn tương đối
      const filePaths = files.map(file => ({
        fileName: file.filename,
        filePath: `/uploads/${path.basename(file.path)}`
      }));

      return res.status(200).json({
        message: 'Upload thành công',
        files: filePaths
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi upload file'
      });
    }
  };
} 