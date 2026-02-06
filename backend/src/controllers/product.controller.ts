import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ProductService from '../services/product.service';
import * as path from 'path';
import * as fs from 'fs';

export default class ProductController {
  private productService = new ProductService();

  public getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // For customers (role 2) and unauthenticated users, don't include suspended products
      // For admin/staff/vendor, include suspended products
      const includeSuspended = req.user && req.user.role !== 2;
      const result = await this.productService.getAllProducts(page, limit, includeSuspended);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách sản phẩm'
      });
    }
  };

  public getVendorProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      if (req.user?.role !== 3) {
        return res.status(403).json({ message: 'Chỉ người bán mới được truy cập' });
      }
      const ownerId = await this.getVendorIdByCustomerId(req.user.id);
      if (!ownerId) {
        return res.status(400).json({ message: 'Không tìm thấy hồ sơ người bán' });
      }
      const result = await this.productService.getProductsByVendor(ownerId, page, limit);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách sản phẩm người bán' });
    }
  };

  public getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      // For customers (role 2) and unauthenticated users, don't include suspended products
      // For admin/staff/vendor, include suspended products
      const includeSuspended = req.user && req.user.role !== 2;
      const product = await this.productService.getProductById(id, includeSuspended);
      return res.status(200).json(product);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // For customers (role 2) and unauthenticated users, don't include suspended products
      // For admin/staff/vendor, include suspended products
      const includeSuspended = req.user && req.user.role !== 2;
      const result = await this.productService.getProductsByCategory(categoryId, page, limit, includeSuspended);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách sản phẩm theo danh mục'
      });
    }
  };

  public searchProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({
          message: 'Vui lòng nhập từ khóa tìm kiếm'
        });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // For customers (role 2) and unauthenticated users, don't include suspended products
      // For admin/staff/vendor, include suspended products
      const includeSuspended = req.user && req.user.role !== 2;
      const result = await this.productService.searchProducts(query, page, limit, includeSuspended);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tìm kiếm sản phẩm'
      });
    }
  };

  public createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Xử lý tệp hình ảnh nếu có
      let imagePath = null;
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const uploadPath = path.join(__dirname, '../../public/uploads', fileName);
        
        // Đảm bảo thư mục tồn tại
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(uploadPath, req.file.buffer);
        imagePath = `/uploads/${fileName}`;
      }

      // Gán owner là vendor hiện tại nếu có
      const productData = {
        ...req.body,
        HinhAnh: imagePath || req.body.HinhAnh,
        MaNguoiBan: req.user?.role === 3 ? (await this.getVendorIdByCustomerId(req.user!.id)) : undefined
      } as any;

      const product = await this.productService.createProduct(productData);
      return res.status(201).json({
        message: 'Tạo sản phẩm thành công',
        product
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tạo sản phẩm'
      });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log('=== START updateProduct ===');
      console.log('Request URL:', req.originalUrl);
      console.log('Request params:', req.params);
      console.log('Request headers:', req.headers);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // Kiểm tra id hợp lệ
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.log('Invalid ID:', req.params.id);
        return res.status(400).json({
          message: 'ID sản phẩm không hợp lệ'
        });
      }

      // Kiểm tra sản phẩm có tồn tại và trạng thái tạm dừng
      const existingProduct = await this.productService.getProductById(id, true); // includeSuspended = true
      if (!existingProduct) {
        return res.status(404).json({
          message: 'Sản phẩm không tồn tại'
        });
      }

      // Kiểm tra nếu vendor cố gắng chỉnh sửa sản phẩm đã bị tạm dừng
      if (req.user?.role === 3 && existingProduct.TrangThaiKiemDuyet === 'SUSPENDED') {
        return res.status(403).json({
          message: 'Không thể chỉnh sửa sản phẩm đã bị tạm dừng. Vui lòng liên hệ quản trị viên.'
        });
      }

      // Log thông tin request để debug
      console.log('Update product request:', {
        id,
        body: req.body,
        file: req.file ? 'File exists' : 'No file'
      });

      // Xử lý tệp hình ảnh nếu có
      let imagePath = null;
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const uploadPath = path.join(__dirname, '../../public/uploads', fileName);
        
        // Đảm bảo thư mục tồn tại
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(uploadPath, req.file.buffer);
        imagePath = `/uploads/${fileName}`;
      }

      // Chuẩn bị dữ liệu cập nhật
      const productData: any = {
        TenSanPham: req.body.TenSanPham,
        MaDanhMuc: parseInt(req.body.MaDanhMuc),
        MoTa: req.body.MoTa || '',
        SoLuong: parseInt(req.body.SoLuong),
        GiaSanPham: parseFloat(req.body.GiaSanPham)
      };

      // Thêm hình ảnh nếu có
      if (imagePath) {
        productData.HinhAnh = imagePath;
      }

      console.log('Product data to update:', productData);

      // Kiểm tra quyền sở hữu (vendor chỉ được sửa sản phẩm của mình)
      if (req.user?.role === 3) {
        const ownerId = await this.getVendorIdByCustomerId(req.user.id);
        // Service sẽ kiểm tra lại ownership khi cập nhật
        productData.MaNguoiBan = ownerId;
      }

      // Cập nhật sản phẩm
      const product = await this.productService.updateProduct(id, productData, req.user);
      console.log('Product updated successfully:', product.MaSanPham);
      
      return res.status(200).json({
        message: 'Cập nhật sản phẩm thành công',
        product
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        message: error.message || 'Lỗi khi cập nhật sản phẩm'
      });
    }
  };

  private async getVendorIdByCustomerId(customerId: number): Promise<number | undefined> {
    try {
      const { NguoiBan } = await import('../models');
      const profile = await NguoiBan.findOne({ where: { MaKhachHang: customerId } });
      return profile?.MaNguoiBan;
    } catch {
      return undefined;
    }
  }

  public deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);

      // Get product details including suspended status
      const product = await this.productService.getProductById(id, true); // includeSuspended = true
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }

      // Vendor ownership check
      if (req.user?.role === 3) {
        const ownerId = await this.getVendorIdByCustomerId(req.user.id);
        if (!ownerId || product.MaNguoiBan !== ownerId) {
          return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
        }

        // Allow vendor to delete suspended products
        if (product.TrangThaiKiemDuyet === 'SUSPENDED') {
          await this.productService.deleteProduct(id);
          return res.status(200).json({
            message: 'Xóa sản phẩm bị tạm dừng thành công'
          });
        }
      }

      // For admin/staff, allow deletion of any product
      await this.productService.deleteProduct(id);
      return res.status(200).json({
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public getVendorShop = async (req: Request, res: Response): Promise<Response> => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const shopInfo = await this.productService.getVendorShopInfo(vendorId);
      return res.status(200).json(shopInfo);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy thông tin cửa hàng'
      });
    }
  };
}
