import KhachHang from '../models/KhachHang.model';
import NhanVien from '../models/NhanVien.model';
import SanPham from '../models/SanPham.model';
import DanhMuc from '../models/DanhMuc.model';
import HoaDon from '../models/HoaDon.model';
import VaiTro from '../models/VaiTro.model';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/db.config';
import bcrypt from 'bcrypt';
import NguoiBan from '../models/NguoiBan.model';
import { Transaction } from 'sequelize';

export default class AdminService {
  /**
   * Lấy thông tin tổng quan cho dashboard của vendor
   */
  public async getVendorDashboardSummary(vendorCustomerId: number) {
    try {
      // Tìm vendor profile từ customer ID
      const vendorProfile = await NguoiBan.findOne({
        where: { MaKhachHang: vendorCustomerId }
      });

      if (!vendorProfile) {
        throw new Error('Không tìm thấy hồ sơ người bán');
      }

      // Đếm sản phẩm của vendor
      const totalProducts = await SanPham.count({
        where: { MaNguoiBan: vendorProfile.MaNguoiBan }
      });

      // Đếm đơn hàng có sản phẩm của vendor này
      const totalOrders = await HoaDon.count({
        include: [{
          model: sequelize.models.ChiTietHoaDon,
          as: 'ChiTietHoaDons',
          include: [{
            model: SanPham,
            as: 'SanPham',
            where: { MaNguoiBan: vendorProfile.MaNguoiBan }
          }]
        }]
      });

      // Tính doanh thu từ sản phẩm của vendor
      const revenue = await sequelize.query(`
        SELECT COALESCE(SUM(ct.ThanhTien), 0) as revenue
        FROM ChiTietHoaDon ct
        JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        JOIN HoaDon hd ON ct.MaHoaDon = hd.MaHoaDon
        WHERE sp.MaNguoiBan = :vendorId 
        AND hd.TrangThai != 'Đã hủy'
      `, {
        replacements: { vendorId: vendorProfile.MaNguoiBan },
        type: QueryTypes.SELECT
      });

      return {
        totalProducts,
        totalCategories: 0, // Vendors don't see categories
        totalCustomers: 0,  // Vendors don't see customers
        totalOrders,
        revenue: (revenue[0] as any)?.revenue || 0,
        pendingVendors: 0   // Vendors don't see pending vendors
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin tổng quan cho dashboard (Admin/Staff)
   */
  public async getDashboardSummary() {
    try {
      const totalProducts = await SanPham.count();
      const totalCategories = await DanhMuc.count();
      const totalCustomers = await KhachHang.count();
      const totalOrders = await HoaDon.count();
      const pendingVendors = await NguoiBan.count({ where: { TrangThai: 'PENDING' } });

      // Tính tổng doanh thu
      const revenue = await HoaDon.sum('TongTien', {
        where: {
          TrangThai: {
            [Op.ne]: 'Đã hủy'
          }
        }
      });

      return {
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        revenue: revenue || 0,
        pendingVendors
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin xem toàn bộ hoá đơn (chỉ đọc — không thay đổi trạng thái).
   * Trong mô hình platform, người bán tự quản lý đơn hàng của mình.
   */
  public async getAllOrders(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await HoaDon.findAndCountAll({
        include: [{ model: KhachHang, as: 'KhachHang' }],
        limit,
        offset,
        order: [['NgayLap', 'DESC']],
      });
      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        orders: rows,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Quản lý khách hàng
   */
  public async getAllCustomers(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await KhachHang.findAndCountAll({
        attributes: {
          exclude: ['MatKhau']
        },
        include: [
          { model: VaiTro, as: 'VaiTro' },
          { model: NguoiBan, as: 'NguoiBan' }
        ],
        limit,
        offset,
        order: [['MaKhachHang', 'ASC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        customers: rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Danh sách người bán (role = 3)
   */
  public async getAllVendors(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await KhachHang.findAndCountAll({
        attributes: { exclude: ['MatKhau'] },
        where: { MaVaiTro: 3 },
        include: [
          { model: VaiTro, as: 'VaiTro' },
          { model: NguoiBan, as: 'NguoiBan' }
        ],
        limit,
        offset,
        order: [['MaKhachHang', 'ASC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        users: rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vendor applications list/approve/reject
   */
  public async listVendorApplications(status: 'PENDING' | 'APPROVED' | 'REJECTED', page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await NguoiBan.findAndCountAll({
        where: { TrangThai: status },
        include: [
          { model: KhachHang, as: 'KhachHang', include: [{ model: VaiTro, as: 'VaiTro' }] },
        ],
        limit,
        offset,
        order: [['MaNguoiBan', 'DESC']]
      });
      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        applications: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async approveVendorApplication(maNguoiBan: number) {
    const t: Transaction = await sequelize.transaction();
    try {
      const app = await NguoiBan.findByPk(maNguoiBan, { transaction: t });
      if (!app) throw new Error('Hồ sơ người bán không tồn tại');
      if (app.TrangThai === 'APPROVED') return app;

      await app.update({ TrangThai: 'APPROVED', LyDoTuChoi: null, NgayDuyet: new Date() }, { transaction: t });

      // Update user role to vendor (3)
      // Ensure role 3 exists in VaiTro
      const vendorRole = await VaiTro.findByPk(3, { transaction: t });
      if (!vendorRole) {
        await VaiTro.create({ MaVaiTro: 3, TenVaiTro: 'Người bán' } as any, { transaction: t });
      }
      const customer = await KhachHang.findByPk(app.MaKhachHang, { transaction: t });
      if (!customer) throw new Error('Khách hàng không tồn tại');
      await customer.update({ MaVaiTro: 3 }, { transaction: t });

      await t.commit();
      return app;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  public async rejectVendorApplication(maNguoiBan: number, reason: string) {
    try {
      const app = await NguoiBan.findByPk(maNguoiBan);
      if (!app) throw new Error('Hồ sơ người bán không tồn tại');
      await app.update({ TrangThai: 'REJECTED', LyDoTuChoi: reason, NgayDuyet: null });
      return app;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Quản lý nhân viên
   */
  public async getAllStaff(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await NhanVien.findAndCountAll({
        attributes: {
          exclude: ['MatKhau']
        },
        include: [{
          model: VaiTro,
          as: 'VaiTro'
        }],
        limit,
        offset,
        order: [['MaNhanVien', 'ASC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        staff: rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  public async getUserById(id: number, role: number) {
    try {
      let user;

      if (role === 2) {
        // Khách hàng
        user = await KhachHang.findByPk(id, {
          attributes: { exclude: ['MatKhau'] },
          include: [{ model: VaiTro, as: 'VaiTro' }]
        });
      } else {
        // Nhân viên hoặc Admin
        user = await NhanVien.findByPk(id, {
          attributes: { exclude: ['MatKhau'] },
          include: [{ model: VaiTro, as: 'VaiTro' }]
        });
      }

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo người dùng mới
   */
  public async createUser(userData: any) {
    const t = await sequelize.transaction();

    try {
      const { MaVaiTro, MatKhau, SoDienThoai, ...rest } = userData;

      // Kiểm tra số điện thoại đã tồn tại chưa
      let existingUser;
      if (MaVaiTro === 2) {
        existingUser = await KhachHang.findOne({ where: { SoDienThoai } });
      } else {
        existingUser = await NhanVien.findOne({ where: { SoDienThoai } });
      }
      if (existingUser) {
        throw new Error('Số điện thoại đã được sử dụng');
      }

      let newUser;

      if (MaVaiTro === 2) {
        // Tạo khách hàng
        newUser = await KhachHang.create({
          ...rest,
          MaVaiTro,
          SoDienThoai,
          MatKhau // plain text, model sẽ tự hash
        }, { transaction: t });
      } else {
        // Tạo nhân viên hoặc admin
        newUser = await NhanVien.create({
          ...rest,
          MaVaiTro,
          SoDienThoai,
          MatKhau // plain text, model sẽ tự hash
        }, { transaction: t });
      }

      await t.commit();

      // Trả về người dùng không kèm mật khẩu
      const userObj = newUser.get({ plain: true });
      const { MatKhau: _, ...userWithoutPassword } = userObj;

      return userWithoutPassword;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  public async updateUser(id: number, role: number, userData: any) {
    try {
      // Không cho phép cập nhật mật khẩu qua API này
      const { MatKhau, ...updateData } = userData;

      if (role === 2) {
        // Khách hàng
        const user = await KhachHang.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        await user.update(updateData);

        // Trả về user không kèm mật khẩu
        const userObj = user.get({ plain: true });
        const { MatKhau: _, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
      } else {
        // Nhân viên hoặc Admin
        const user = await NhanVien.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        await user.update(updateData);

        // Trả về user không kèm mật khẩu
        const userObj = user.get({ plain: true });
        const { MatKhau: _, ...userWithoutPassword } = userObj;
        return userWithoutPassword;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa người dùng
   */
  public async deleteUser(id: number, role: number) {
    try {
      if (role === 2) {
        // Khách hàng
        const user = await KhachHang.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        await user.destroy();
      } else {
        // Nhân viên hoặc Admin
        const user = await NhanVien.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        if (user.MaVaiTro === 0) {
          // Kiểm tra xem còn admin khác không
          const adminCount = await NhanVien.count({
            where: { MaVaiTro: 0 }
          });

          if (adminCount <= 1) {
            throw new Error('Không thể xóa admin duy nhất');
          }
        }

        await user.destroy();
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thay đổi vai trò người dùng
   */
  public async changeUserRole(id: number, role: number, newRole: number) {
    try {
      if (role === 2) {
        // Khách hàng
        const user = await KhachHang.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        await user.update({ MaVaiTro: newRole });
      } else {
        // Nhân viên hoặc Admin
        const user = await NhanVien.findByPk(id);

        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }

        // Kiểm tra nếu là admin cuối cùng
        if (user.MaVaiTro === 0 && newRole !== 0) {
          const adminCount = await NhanVien.count({
            where: { MaVaiTro: 0 }
          });

          if (adminCount <= 1) {
            throw new Error('Không thể thay đổi vai trò của admin duy nhất');
          }
        }

        await user.update({ MaVaiTro: newRole });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
} 