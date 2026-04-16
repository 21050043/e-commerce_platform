import DonHangNguoiBan from '../models/DonHangNguoiBan.model';
import HoaDon from '../models/HoaDon.model';
import KhachHang from '../models/KhachHang.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import VaiTro from '../models/VaiTro.model';
import Shipper from '../models/Shipper.model';
import NguoiBan from '../models/NguoiBan.model';

const DEFAULT_STATUS = 'Đang giao hàng';
const VALID_STATUS = ['Đang giao hàng', 'Đã giao hàng'];

export interface ShipperApplicationData {
  diaChiHoatDong: string;
  loaiXe: string;
}

export default class ShipperService {
  // Hàm giúp trích xuất khu vực từ địa chỉ (đơn giản: lấy 2-3 từ cuối)
  private extractLocationKeyword(address: string): string {
    const parts = address.trim().split(',').filter(p => p.length > 0);
    if (parts.length === 0) return '';
    // Lấy 1-2 từ cuối của địa chỉ (thường là quận/huyện, tỉnh)
    return parts.slice(-2).join(',').toLowerCase().trim();
  }

  // Hàm kiểm tra nếu shipper tại địa chỉ gần đơn hàng (đơn giản theo từ khóa vị trí)
  private isNearby(shipperAddress: string, deliveryAddress: string): boolean {
    const shipperLocation = this.extractLocationKeyword(shipperAddress);
    const deliveryLocation = this.extractLocationKeyword(deliveryAddress);

    if (!shipperLocation || !deliveryLocation) {
      return true; // Nếu không thể trích xuất, chấp nhận để tránh không có đơn
    }

    // Kiểm tra xem có từ khóa chung không (đơn giản)
    const shipperWords = shipperLocation.split(/[\s,]+/);
    const deliveryWords = deliveryLocation.split(/[\s,]+/);

    // Nếu chia sẻ bất kỳ từ nào (ví dụ "Quận 1" với "TP. HCM, Quận 1")
    return shipperWords.some(word => 
      word.length > 0 && deliveryWords.some(dword => 
        dword.includes(word) || word.includes(dword)
      )
    );
  }

  public async applyShipper(khachHangId: number, data: ShipperApplicationData) {
    const customer = await KhachHang.findByPk(khachHangId);
    if (!customer) {
      throw new Error('Khách hàng không tồn tại');
    }

    if (customer.MaVaiTro === 4) {
      throw new Error('Bạn đã là shipper rồi');
    }

    if (customer.MaVaiTro !== 2) {
      throw new Error('Chỉ khách hàng mới có thể đăng ký làm shipper');
    }

    const shipperRole = await VaiTro.findByPk(4);
    if (!shipperRole) {
      await VaiTro.create({ MaVaiTro: 4, TenVaiTro: 'Shipper' } as any);
    }

    // Lưu thông tin shipper (không gán cụ thể vào shop nào)
    await Shipper.create({
      MaKhachHang: khachHangId,
      DiaChiHoatDong: data.diaChiHoatDong,
      LoaiXe: data.loaiXe,
      TrangThai: 'ACTIVE',
    } as any);

    // Cập nhật role khách hàng
    await customer.update({ MaVaiTro: 4 });
    return customer;
  }
  public async getShippingOrders(
    khachHangId: number,
    page = 1,
    limit = 10,
    trangThai: string = DEFAULT_STATUS
  ) {
    const offset = (page - 1) * limit;
    
    // Lấy thông tin shipper để xác định khu vực hoạt động
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    // Lấy tất cả đơn hàng có trạng thái phù hợp
    const where: any = {};

    if (trangThai && trangThai !== 'all') {
      if (!VALID_STATUS.includes(trangThai) && trangThai !== 'all') {
        throw new Error('Trạng thái không hợp lệ');
      }
      where.TrangThai = trangThai;
    }

    const { count, rows } = await DonHangNguoiBan.findAndCountAll({
      where,
      include: [
        {
          model: HoaDon,
          as: 'HoaDon',
          include: [
            { model: KhachHang, as: 'KhachHang' },
            {
              model: ChiTietHoaDon,
              as: 'ChiTietHoaDons',
              include: [{ model: SanPham, as: 'SanPham' }],
            },
          ],
        },
      ],
      order: [['MaDonHangNB', 'DESC']],
      limit: limit * 2, // Lấy nhiều hơn để lọc theo vị trí
      offset: 0,
    });

    // Lọc theo vị trí: chỉ lấy đơn hàng gần shipper
    const nearbyOrders = rows.filter(order =>
      this.isNearby(shipper.DiaChiHoatDong, (order as any).HoaDon?.DiaChi || '')
    );

    // Áp dụng phân trang sau khi lọc
    const paginatedOrders = nearbyOrders.slice(offset, offset + limit);

    return {
      total: nearbyOrders.length,
      totalPages: Math.ceil(nearbyOrders.length / limit),
      currentPage: page,
      orders: paginatedOrders,
    };
  }

  public async getShippingOrderById(khachHangId: number, orderId: number) {
    // Lấy thông tin shipper
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    const subOrder = await DonHangNguoiBan.findOne({
      where: { MaDonHangNB: orderId },
      include: [
        {
          model: HoaDon,
          as: 'HoaDon',
          include: [
            { model: KhachHang, as: 'KhachHang' },
            {
              model: ChiTietHoaDon,
              as: 'ChiTietHoaDons',
              include: [{ model: SanPham, as: 'SanPham' }],
            },
          ],
        },
      ],
    });

    if (!subOrder) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Kiểm tra nếu đơn hàng gần shipper
    if (!this.isNearby(shipper.DiaChiHoatDong, (subOrder as any).HoaDon?.DiaChi || '')) {
      throw new Error('Đơn hàng này không nằm trong khu vực hoạt động của bạn');
    }

    return subOrder;
  }

  public async updateShippingOrderStatus(khachHangId: number, orderId: number, newStatus: string) {
    // Lấy thông tin shipper
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    const subOrder = await DonHangNguoiBan.findByPk(orderId, {
      include: [{ model: HoaDon, as: 'HoaDon' }],
    });

    if (!subOrder) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Kiểm tra nếu đơn hàng gần shipper
    if (!this.isNearby(shipper.DiaChiHoatDong, (subOrder as any).HoaDon?.DiaChi || '')) {
      throw new Error('Đơn hàng này không nằm trong khu vực hoạt động của bạn');
    }

    if (subOrder.TrangThai !== DEFAULT_STATUS) {
      throw new Error('Chỉ đơn hàng đang giao hàng mới có thể được cập nhật bởi shipper');
    }

    if (newStatus !== 'Đã giao hàng') {
      throw new Error('Shipper chỉ có thể cập nhật trạng thái sang Đã giao hàng');
    }

    await subOrder.update({ TrangThai: newStatus, NgayCapNhat: new Date() as any });
    return subOrder;
  }

  public async getShipperStats(khachHangId: number) {
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
      include: [{ model: KhachHang, as: 'KhachHang' }],
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    // Tính tổng đơn hàng
    const totalOrders = await DonHangNguoiBan.count();

    // Tính đơn giao thành công
    const completedOrders = await DonHangNguoiBan.count({
      where: { TrangThai: 'Đã giao hàng' },
    });

    // Tính đơn đang giao
    const pendingOrders = await DonHangNguoiBan.count({
      where: { TrangThai: 'Đang giao hàng' },
    });

    // Tính tổng thu nhập (tạm tính dựa trên số đơn giao thành công * 50k/đơn)
    const totalEarnings = completedOrders * 50000;

    // Tính đánh giá trung bình (tạm tính)
    const averageRating = 4.5;

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalEarnings,
      averageRating,
      joinDate: shipper.NgayDangKy ? new Date(shipper.NgayDangKy).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      shipperInfo: {
        name: (shipper as any).KhachHang?.TenKhachHang,
        phone: (shipper as any).KhachHang?.SoDienThoai,
        area: shipper.DiaChiHoatDong,
        vehicle: shipper.LoaiXe,
        status: shipper.TrangThai,
      }
    };
  }
}
