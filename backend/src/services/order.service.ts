import { Transaction } from 'sequelize';
import { sequelize } from '../config/db.config';
import HoaDon from '../models/HoaDon.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import KhachHang from '../models/KhachHang.model';
import NguoiBan from '../models/NguoiBan.model';
import DonHangNguoiBan from '../models/DonHangNguoiBan.model';
import Shipper from '../models/Shipper.model';
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

        // BẢO MẬT: Ngăn vendor mua hàng của chính mình (chống buff đơn, đánh giá ảo)
        if (product.NguoiBan.MaKhachHang === orderData.MaKhachHang) {
          throw new Error(`Bạn không thể mua sản phẩm "${product.TenSanPham}" từ cửa hàng của chính mình`);
        }

        // BẢO MẬT: Kiểm tra trạng thái shop và vacation mode
        if (product.NguoiBan.TrangThai !== 'APPROVED') {
          throw new Error(`Cửa hàng "${product.NguoiBan.TenCuaHang}" hiện không tiếp nhận đơn hàng mới`);
        }

        // BẢO MẬT: Kiểm tra Vacation Mode của shop
        if ((product.NguoiBan as any).TrangThaiHoatDong === 'VACATION') {
          throw new Error(`Cửa hàng "${product.NguoiBan.TenCuaHang}" đang tạm nghỉ và không nhận đơn hàng`);
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

  public async confirmDelivery(orderId: number, customerId: number, shipperRating?: number, shipperComment?: string) {
    const order = await HoaDon.findByPk(orderId, {
      include: [{ model: DonHangNguoiBan, as: 'DonHangNguoiBans' }],
    }) as HoaDon & { DonHangNguoiBans?: DonHangNguoiBan[] };

    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    if (order.MaKhachHang !== customerId) {
      throw new Error('Bạn không có quyền xác nhận đơn hàng này');
    }

    const subOrders = order.DonHangNguoiBans || [];
    if (subOrders.length === 0) {
      throw new Error('Không tìm thấy thông tin đơn hàng con để xác nhận');
    }

    const allDelivered = subOrders.every((subOrder: DonHangNguoiBan) => subOrder.TrangThai === 'Đã giao hàng');
    if (!allDelivered) {
      throw new Error('Chỉ đơn hàng đã được giao bởi shipper mới có thể xác nhận');
    }

    await Promise.all(subOrders.map((subOrder: DonHangNguoiBan) => subOrder.update({ TrangThai: 'Hoàn tất' })));
    await order.update({ TrangThai: 'Hoàn tất' });

    if (shipperRating && shipperRating >= 1 && shipperRating <= 5) {
      const shipperIds = Array.from(
        new Set(subOrders.map((subOrder: DonHangNguoiBan) => subOrder.MaShipper).filter((id): id is number => typeof id === 'number'))
      );

      for (const shipperId of shipperIds) {
        const shipper = await Shipper.findByPk(shipperId);
        if (!shipper) continue;

        const totalRating = (shipper.TongDiemDanhGia || 0) + shipperRating;
        const ratingCount = (shipper.SoLuongDanhGia || 0) + 1;
        await shipper.update({
          TongDiemDanhGia: totalRating,
          SoLuongDanhGia: ratingCount,
        });
      }
    }

    return order;
  }
}