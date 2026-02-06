import { Transaction, QueryTypes } from 'sequelize';
import { sequelize } from '../config/db.config';
import HoaDon from '../models/HoaDon.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import KhachHang from '../models/KhachHang.model';
import NhanVien from '../models/NhanVien.model';
import { IHoaDon } from '../interfaces/models.interface';

interface OrderItem {
  MaSanPham: number;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

interface CreateOrderData {
  MaKhachHang: number;
  MaNhanVien?: number | null;
  PhuongThucTT: string;
  DiaChi: string;
  TongTien: number;
  items: OrderItem[];
}

interface InsertedOrder {
  MaHoaDon: number;
  MaKhachHang: number;
  MaNhanVien?: number | null;
  NgayLap: Date;
  TongTien: number;
  PhuongThucTT: string;
  DiaChi: string;
  TrangThai: string;
}

export default class OrderService {
  public async createOrder(orderData: CreateOrderData) {
    const t: Transaction = await sequelize.transaction();

    try {
      // Tạo hóa đơn bằng Sequelize (MySQL)
      const order = await HoaDon.create(
        {
          MaKhachHang: orderData.MaKhachHang,
          MaNhanVien: orderData.MaNhanVien || null,
          NgayLap: new Date(),
          TongTien: orderData.TongTien,
          PhuongThucTT: orderData.PhuongThucTT,
          DiaChi: orderData.DiaChi,
          TrangThai: 'Đã đặt hàng'
        },
        { transaction: t }
      );

      // Xử lý từng sản phẩm trong đơn hàng
      for (const item of orderData.items) {
        const product = await SanPham.findByPk(item.MaSanPham, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product) {
          throw new Error(`Sản phẩm với mã ${item.MaSanPham} không tồn tại`);
        }
        if (product.SoLuong < item.SoLuong) {
          throw new Error(`Sản phẩm ${product.TenSanPham} không đủ số lượng`);
        }

        await ChiTietHoaDon.create(
          {
            MaHoaDon: order.MaHoaDon,
            MaSanPham: item.MaSanPham,
            SoLuong: item.SoLuong,
            DonGia: item.DonGia,
            ThanhTien: item.ThanhTien
          },
          { transaction: t }
        );

        await product.update({ SoLuong: product.SoLuong - item.SoLuong }, { transaction: t });
      }

      await t.commit();

      // Trả về hóa đơn đã tạo (kèm associations nếu cần)
      const created = await HoaDon.findByPk(order.MaHoaDon);
      return created;
    } catch (error) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error('Lỗi khi rollback:', rollbackError);
      }
      throw error;
    }
  }

  public async getOrdersByCustomerId(customerId: number) {
    try {
      // Dùng Sequelize để truy vấn thay vì SQL Server raw
      const orders = await HoaDon.findAll({
        where: { MaKhachHang: customerId },
        order: [['NgayLap', 'DESC']],
        include: [
          {
            model: ChiTietHoaDon,
            as: 'ChiTietHoaDons',
            include: [{ model: SanPham, as: 'SanPham' }]
          }
        ]
      });
      return orders as unknown as any[];
    } catch (error) {
      console.error('Error in getOrdersByCustomerId:', error);
      throw error;
    }
  }

  public async getOrderById(orderId: number) {
    try {
      const order = await HoaDon.findByPk(orderId, {
        include: [
          {
            model: ChiTietHoaDon,
            as: 'ChiTietHoaDons',
            include: [{ model: SanPham, as: 'SanPham' }]
          },
          { model: KhachHang, as: 'KhachHang' },
          { model: NhanVien, as: 'NhanVien' }
        ]
      });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  public async getAllOrders(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await HoaDon.findAndCountAll({
        include: [
          { model: KhachHang, as: 'KhachHang' },
          { model: NhanVien, as: 'NhanVien' }
        ],
        limit,
        offset,
        order: [['NgayLap', 'DESC']]
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        orders: rows
      };
    } catch (error) {
      throw error;
    }
  }

  public async updateOrderStatus(orderId: number, trangThai: string) {
    try {
      const order = await HoaDon.findByPk(orderId);
      
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      // Kiểm tra luồng chuyển trạng thái hợp lệ
      const validTransitions: { [key: string]: string[] } = {
        'Đã đặt hàng': ['Đang xử lý', 'Đã hủy'],
        'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
        'Đang giao hàng': ['Đã giao hàng', 'Đã hủy'],
        'Đã giao hàng': [],
        'Đã hủy': []
      };

      const currentStatus = order.TrangThai;
      if (!currentStatus) {
        throw new Error('Trạng thái hiện tại của đơn hàng không hợp lệ');
      }
      const allowedNextStatuses = validTransitions[currentStatus] || [];

      if (!allowedNextStatuses.includes(trangThai)) {
        throw new Error(`Không thể chuyển trạng thái từ "${currentStatus}" sang "${trangThai}"`);
      }

      await order.update({ TrangThai: trangThai });
      return order;
    } catch (error) {
      throw error;
    }
  }
} 