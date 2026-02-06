import SanPham from '../models/SanPham.model';
import DanhMuc from '../models/DanhMuc.model';
import NguoiBan from '../models/NguoiBan.model';
import KhachHang from '../models/KhachHang.model';
import { Op } from 'sequelize';
import { ISanPham } from '../interfaces/models.interface';

export default class ProductService {
  public async getAllProducts(page = 1, limit = 10, includeSuspended = false) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = {};
      if (!includeSuspended) {
        whereClause.TrangThaiKiemDuyet = 'ACTIVE';
      }
      
      const { count, rows } = await SanPham.findAndCountAll({
        where: whereClause,
        include: [{ model: DanhMuc, as: 'DanhMuc' }, { model: NguoiBan, as: 'NguoiBan' }],
        limit,
        offset,
        order: [['NgayCapNhat', 'DESC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async getProductsByVendor(vendorId: number, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await SanPham.findAndCountAll({
        where: { MaNguoiBan: vendorId },
        include: [{ model: DanhMuc, as: 'DanhMuc' }, { model: NguoiBan, as: 'NguoiBan' }],
        limit,
        offset,
        order: [['NgayCapNhat', 'DESC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async getProductById(id: number, includeSuspended = false) {
    try {
      const whereClause: any = { MaSanPham: id };
      if (!includeSuspended) {
        whereClause.TrangThaiKiemDuyet = 'ACTIVE';
      }

      const product = await SanPham.findOne({
        where: whereClause,
        include: [
          { model: DanhMuc, as: 'DanhMuc' },
          {
            model: NguoiBan,
            as: 'NguoiBan',
            include: [{ model: KhachHang, as: 'KhachHang' }]
          }
        ]
      });

      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  public async getProductsByCategory(categoryId: number, page = 1, limit = 10, includeSuspended = false) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = { MaDanhMuc: categoryId };
      if (!includeSuspended) {
        whereClause.TrangThaiKiemDuyet = 'ACTIVE';
      }
      
      const { count, rows } = await SanPham.findAndCountAll({
        where: whereClause,
        include: [{ model: DanhMuc, as: 'DanhMuc' }, { model: NguoiBan, as: 'NguoiBan' }],
        limit,
        offset,
        order: [['NgayCapNhat', 'DESC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async searchProducts(query: string, page = 1, limit = 10, includeSuspended = false) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = {
        [Op.or]: [
          { TenSanPham: { [Op.like]: `%${query}%` } },
          { MoTa: { [Op.like]: `%${query}%` } }
        ]
      };
      
      if (!includeSuspended) {
        whereClause.TrangThaiKiemDuyet = 'ACTIVE';
      }
      
      const { count, rows } = await SanPham.findAndCountAll({
        where: whereClause,
        include: [{ model: DanhMuc, as: 'DanhMuc' }, { model: NguoiBan, as: 'NguoiBan' }],
        limit,
        offset,
        order: [['NgayCapNhat', 'DESC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async createProduct(productData: Partial<ISanPham>) {
    try {
      console.log('=== Service: createProduct ===');
      console.log('Product data:', productData);
      
      // Kiểm tra các trường bắt buộc
      if (!productData.TenSanPham || !productData.MaDanhMuc || productData.SoLuong === undefined || productData.GiaSanPham === undefined) {
        throw new Error('Thiếu thông tin sản phẩm bắt buộc');
      }
      // Tạo sản phẩm bằng Sequelize (tương thích MySQL)
      const product = await SanPham.create({
        TenSanPham: productData.TenSanPham,
        MaDanhMuc: productData.MaDanhMuc,
        MoTa: productData.MoTa ?? undefined,
        SoLuong: productData.SoLuong,
        GiaSanPham: productData.GiaSanPham,
        HinhAnh: productData.HinhAnh ?? undefined,
        MaNguoiBan: productData.MaNguoiBan ?? undefined,
        Ngaytao: new Date(),
        NgayCapNhat: new Date()
      });
      
      if (!product) {
        throw new Error('Không thể lấy sản phẩm đã tạo');
      }
      
      return product;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  public async updateProduct(id: number, productData: Partial<ISanPham>, user?: { id: number; role: number }) {
    try {
      console.log('=== Service: updateProduct ===');
      console.log('Product ID:', id);
      console.log('Update data:', productData);
      
      // Kiểm tra sự tồn tại của sản phẩm trước
      const product = await SanPham.findByPk(id);
      
      if (!product) {
        console.log('Product not found with ID:', id);
        throw new Error('Sản phẩm không tồn tại');
      }

      // Nếu là vendor, bắt buộc là chủ sở hữu
      if (user && user.role === 3) {
        const ownerId = productData.MaNguoiBan;
        if (!ownerId || product.MaNguoiBan !== ownerId) {
          throw new Error('Bạn không có quyền cập nhật sản phẩm này');
        }
      }

      // Cập nhật bằng Sequelize (tương thích MySQL)
      const updateData: Partial<ISanPham> = {};
      if (productData.TenSanPham !== undefined) updateData.TenSanPham = productData.TenSanPham;
      if (productData.MaDanhMuc !== undefined) updateData.MaDanhMuc = productData.MaDanhMuc;
      if (productData.MoTa !== undefined) updateData.MoTa = productData.MoTa;
      if (productData.SoLuong !== undefined) updateData.SoLuong = productData.SoLuong;
      if (productData.GiaSanPham !== undefined) updateData.GiaSanPham = productData.GiaSanPham;
      if (productData.HinhAnh !== undefined) updateData.HinhAnh = productData.HinhAnh;
      updateData.NgayCapNhat = new Date();

      await product.update(updateData);

      // Lấy sản phẩm đã cập nhật
      const updatedProduct = await SanPham.findByPk(id, {
        include: [{ model: DanhMuc, as: 'DanhMuc' }]
      });
      
      if (!updatedProduct) {
        console.log('Updated product not found');
        throw new Error('Không thể lấy sản phẩm đã cập nhật');
      }
      
      console.log('Product updated successfully');
      return updatedProduct;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  public async deleteProduct(id: number) {
    try {
      const product = await SanPham.findByPk(id);
      
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      await product.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  public async suspendProduct(id: number, reason: string, adminId: number) {
    try {
      const product = await SanPham.findByPk(id);
      
      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      if (product.TrangThaiKiemDuyet === 'SUSPENDED') {
        throw new Error('Sản phẩm đã bị tạm dừng');
      }

      await product.update({
        TrangThaiKiemDuyet: 'SUSPENDED',
        LyDoTamDung: reason,
        NgayTamDung: new Date(),
        NguoiTamDung: adminId
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  public async unsuspendProduct(id: number) {
    try {
      const product = await SanPham.findByPk(id);

      if (!product) {
        throw new Error('Sản phẩm không tồn tại');
      }

      if (product.TrangThaiKiemDuyet === 'ACTIVE') {
        throw new Error('Sản phẩm không bị tạm dừng');
      }

      await product.update({
        TrangThaiKiemDuyet: 'ACTIVE',
        LyDoTamDung: null,
        NgayTamDung: null,
        NguoiTamDung: null
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  public async getVendorShopInfo(vendorId: number) {
    try {
      // Get vendor info with customer details
      const vendor = await NguoiBan.findOne({
        where: { MaNguoiBan: vendorId },
        include: [{ model: KhachHang, as: 'KhachHang' }]
      });

      if (!vendor) {
        throw new Error('Người bán không tồn tại');
      }

      // Count active products
      const productCount = await SanPham.count({
        where: {
          MaNguoiBan: vendorId,
          TrangThaiKiemDuyet: 'ACTIVE'
        }
      });

      // Get products for the shop (limit to recent ones)
      const products = await SanPham.findAll({
        where: {
          MaNguoiBan: vendorId,
          TrangThaiKiemDuyet: 'ACTIVE'
        },
        include: [{ model: DanhMuc, as: 'DanhMuc' }],
        limit: 20,
        order: [['NgayCapNhat', 'DESC']]
      });

      // Mock rating for now (can be replaced with actual rating system later)
      const averageRating = 4.9;

      return {
        vendor: {
          MaNguoiBan: vendor.MaNguoiBan,
          TenCuaHang: vendor.TenCuaHang,
          DiaChiKinhDoanh: vendor.DiaChiKinhDoanh,
          SoDienThoaiLienHe: vendor.SoDienThoaiLienHe,
          KhachHang: (vendor as any).KhachHang ? {
            TenKhachHang: (vendor as any).KhachHang.TenKhachHang
          } : undefined
        },
        stats: {
          productCount,
          averageRating
        },
        products
      };
    } catch (error) {
      throw error;
    }
  }
}
