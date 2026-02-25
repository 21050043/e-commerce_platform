import { Transaction } from 'sequelize';
import { sequelize } from '../config/db.config';
import HoaDon from '../models/HoaDon.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import KhachHang from '../models/KhachHang.model';
import NguoiBan from '../models/NguoiBan.model';
import DonHangNguoiBan from '../models/DonHangNguoiBan.model';
import { IHoaDon } from '../interfaces/models.interface';

interface OrderItem {
  MaSanPham: number;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

interface CreateOrderData {
  MaKhachHang: number;
  PhuongThucTT: string;
  DiaChi: string;
  TongTien: number;
  items: OrderItem[];
}

export default class OrderService {
  /**
   * Tạo hoá đơn master + sub-orders theo từng người bán.
   * Mô hình platform: 1 checkout → 1 HoaDon + N DonHangNguoiBan.
   */
  public async createOrder(orderData: CreateOrderData) {
    const t: Transaction = await sequelize.transaction();

    try {
      // 1. Tạo HoaDon master
      const order = await HoaDon.create(
        {
          MaKhachHang: orderData.MaKhachHang,
          NgayLap: new Date(),
          TongTien: orderData.TongTien,
          PhuongThucTT: orderData.PhuongThucTT,
          DiaChi: orderData.DiaChi,
          TrangThai: 'Đã đặt hàng',
        },
        { transaction: t }
      );

      // 2. Xử lý từng sản phẩm, nhóm theo MaNguoiBan
      const sellerTotals = new Map<number, number>(); // MaNguoiBan → tổng tiền

      for (const item of orderData.items) {
        const product = await SanPham.findByPk(item.MaSanPham, {
          transaction: t,
          lock: t.LOCK.UPDATE,
          include: [{ model: NguoiBan, as: 'NguoiBan' }]
        });

        if (!product) {
          throw new Error(`Sản phẩm với mã ${item.MaSanPham} không tồn tại`);
        }
        if (product.SoLuong < item.SoLuong) {
          throw new Error(`Sản phẩm "${product.TenSanPham}" không đủ số lượng`);
        }
        if (!product.MaNguoiBan || !product.NguoiBan) {
          throw new Error(`Sản phẩm "${product.TenSanPham}" chưa có người bán hợp lệ`);
        }

        // CHỈNH SỬA BẢO MẬT: Kiểm tra trạng thái shop
        if (product.NguoiBan.TrangThai !== 'APPROVED') {
          throw new Error(`Cửa hàng "${product.NguoiBan.TenCuaHang}" hiện không tiếp nhận đơn hàng mới`);
        }

        // CHỈNH SỬA BẢO MẬT: Lấy giá từ DB để tính toán, không tin client
        const securePrice = product.GiaSanPham;
        const secureSubTotal = securePrice * item.SoLuong;

        // Tạo chi tiết hoá đơn
        await ChiTietHoaDon.create(
          {
            MaHoaDon: order.MaHoaDon,
            MaSanPham: item.MaSanPham,
            SoLuong: item.SoLuong,
            DonGia: securePrice,
            ThanhTien: secureSubTotal,
          },
          { transaction: t }
        );

        // Khấu trừ tồn kho
        await product.update(
          { SoLuong: product.SoLuong - item.SoLuong },
          { transaction: t }
        );

        // Cộng dồn tổng tiền theo người bán (dùng giá sạch từ DB)
        const prev = sellerTotals.get(product.MaNguoiBan) ?? 0;
        sellerTotals.set(product.MaNguoiBan, prev + secureSubTotal);
      }

      // 3. Tạo DonHangNguoiBan (1 sub-order per người bán)
      let finalTotal = 0;
      for (const [maNguoiBan, tongTienNB] of sellerTotals.entries()) {
        finalTotal += tongTienNB;
        await DonHangNguoiBan.create(
          {
            MaHoaDon: order.MaHoaDon,
            MaNguoiBan: maNguoiBan,
            TrangThai: 'Đã đặt hàng',
            TongTienNB: tongTienNB,
          },
          { transaction: t }
        );
      }

      // CHỈNH SỬA BẢO MẬT: Cập nhật lại tổng tiền thật của HoaDon master
      await order.update({ TongTien: finalTotal }, { transaction: t });

      await t.commit();

      // 4. Trả về hoá đơn kèm chi tiết
      const created = await HoaDon.findByPk(order.MaHoaDon, {
        include: [
          {
            model: ChiTietHoaDon,
            as: 'ChiTietHoaDons',
            include: [{ model: SanPham, as: 'SanPham' }],
          },
        ],
      });
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

  /**
   * Lấy danh sách hoá đơn của khách hàng (trang /orders của khách).
   */
  public async getOrdersByCustomerId(customerId: number) {
    const orders = await HoaDon.findAll({
      where: { MaKhachHang: customerId },
      order: [['NgayLap', 'DESC']],
      include: [
        {
          model: ChiTietHoaDon,
          as: 'ChiTietHoaDons',
          include: [{ model: SanPham, as: 'SanPham' }],
        },
      ],
    });
    return orders as unknown as any[];
  }

  /**
   * Xem chi tiết 1 hoá đơn (dùng chung cho khách hàng và người bán xem tổng quan).
   */
  public async getOrderById(orderId: number) {
    const order = await HoaDon.findByPk(orderId, {
      include: [
        {
          model: ChiTietHoaDon,
          as: 'ChiTietHoaDons',
          include: [{ model: SanPham, as: 'SanPham' }],
        },
        { model: KhachHang, as: 'KhachHang' },
      ],
    });

    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    return order;
  }
}