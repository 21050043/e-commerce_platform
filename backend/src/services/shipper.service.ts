import { Op } from 'sequelize';
import DonHangNguoiBan from '../models/DonHangNguoiBan.model';
import HoaDon from '../models/HoaDon.model';
import KhachHang from '../models/KhachHang.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import VaiTro from '../models/VaiTro.model';
import Shipper from '../models/Shipper.model';
import NguoiBan from '../models/NguoiBan.model';

const SHIPPING_STATUSES = ['Chờ vận chuyển', 'Đã nhận hàng', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'];
const DISCOVERABLE_STATUSES = [...SHIPPING_STATUSES];
const VALID_SHIPPER_UPDATES: Record<string, string[]> = {
  'Chờ vận chuyển': ['Đã nhận hàng'],
  'Đã nhận hàng': ['Đang giao hàng'],
  'Đang giao hàng': ['Đã giao hàng'],
};

export interface ShipperApplicationData {
  diaChiHoatDong: string;
  loaiXe: string;
  emailLienHe?: string;
  hangGPLX?: string;
  heDieuHanh?: string;
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
      EmailLienHe: data.emailLienHe,
      HangGPLX: data.hangGPLX,
      HeDieuHanh: data.heDieuHanh,
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
    trangThai: string = 'all'
  ) {
    const offset = (page - 1) * limit;

    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    const where: any = {};
    if (trangThai && trangThai !== 'all') {
      if (!SHIPPING_STATUSES.includes(trangThai) && trangThai !== 'all') {
        throw new Error('Trạng thái không hợp lệ');
      }
      where.TrangThai = trangThai;
      // Nếu trạng thái đã assign (không phải 'Chờ vận chuyển'), filter theo MaShipper
      if (trangThai !== 'Chờ vận chuyển') {
        where.MaShipper = shipper.MaShipper;
      }
    } else {
      // Cho 'all', chỉ lấy đơn đã assign của shipper
      where.MaShipper = shipper.MaShipper;
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
      limit,
      offset,
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders: rows,
    };
  }

  public async getShippingOrderById(khachHangId: number, orderId: number) {
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

    return subOrder;
  }

  public async updateShippingOrderStatus(
    khachHangId: number,
    orderId: number,
    newStatus: 'Đã nhận hàng' | 'Đang giao hàng' | 'Đã giao hàng'
  ) {
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

    const allowedNext = VALID_SHIPPER_UPDATES[subOrder.TrangThai] ?? [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(`Không thể chuyển trạng thái từ "${subOrder.TrangThai}" sang "${newStatus}"`);
    }

    // Nếu chuyển từ 'Chờ vận chuyển' sang 'Đã nhận hàng', gán MaShipper
    const updateData: any = { TrangThai: newStatus, NgayCapNhat: new Date() as any };
    if (subOrder.TrangThai === 'Chờ vận chuyển' && newStatus === 'Đã nhận hàng') {
      updateData.MaShipper = shipper.MaShipper;
    }

    await subOrder.update(updateData);

    if (newStatus === 'Đang giao hàng' || newStatus === 'Đã giao hàng') {
      const relatedSubOrders = await DonHangNguoiBan.findAll({ where: { MaHoaDon: subOrder.MaHoaDon } });
      const hoaDon = await HoaDon.findByPk(subOrder.MaHoaDon);
      if (hoaDon) {
        if (relatedSubOrders.every((o) => o.TrangThai === 'Đã giao hàng')) {
          await hoaDon.update({ TrangThai: 'Chờ xác nhận' });
        } else {
          await hoaDon.update({ TrangThai: 'Đang giao hàng' });
        }
      }
    }

    return subOrder;
  }

  public async getDeliveredOrders(
    khachHangId: number,
    page = 1,
    limit = 10
  ) {
    const offset = (page - 1) * limit;

    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    const { count, rows } = await DonHangNguoiBan.findAndCountAll({
      where: { MaShipper: shipper.MaShipper, TrangThai: 'Đã giao hàng' },
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
      limit,
      offset,
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders: rows,
    };
  }

  public async getShipperStats(khachHangId: number) {
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
      include: [{ model: KhachHang, as: 'KhachHang' }],
    });

    if (!shipper) {
      throw new Error('Không tìm thấy thông tin shipper');
    }

    // Tính tổng đơn hàng của shipper
    const totalOrders = await DonHangNguoiBan.count({
      where: { MaShipper: shipper.MaShipper },
    });

    // Tính đơn giao thành công của shipper
    const completedOrders = await DonHangNguoiBan.count({
      where: {
        MaShipper: shipper.MaShipper,
        TrangThai: { [Op.in]: ['Đã giao hàng', 'Hoàn tất'] },
      },
    });

    // Tính đơn đang giao của shipper
    const pendingOrders = await DonHangNguoiBan.count({
      where: {
        MaShipper: shipper.MaShipper,
        TrangThai: { [Op.in]: ['Đang giao hàng', 'Đã nhận hàng'] },
      },
    });

    // Tính tổng thu nhập (tạm tính dựa trên số đơn giao thành công * 20k/đơn)
    const totalEarnings = completedOrders * 20000;

    // Tính đánh giá trung bình
    const averageRating = shipper.SoLuongDanhGia && shipper.SoLuongDanhGia > 0
      ? Number(((shipper.TongDiemDanhGia || 0) / shipper.SoLuongDanhGia).toFixed(2))
      : 0;

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
        trangThaiHoatDong: shipper.TrangThaiHoatDong,
      }
    };
  }

  public async getShipperProfile(khachHangId: number) {
    const shipper = await Shipper.findOne({
      where: { MaKhachHang: khachHangId },
      include: [{ model: KhachHang, as: 'KhachHang' }],
    });

    if (!shipper) throw new Error('Không tìm thấy thông tin shipper');

    return {
      MaShipper: shipper.MaShipper,
      DiaChiHoatDong: shipper.DiaChiHoatDong,
      LoaiXe: shipper.LoaiXe,
      EmailLienHe: shipper.EmailLienHe,
      HangGPLX: shipper.HangGPLX,
      HeDieuHanh: shipper.HeDieuHanh,
      TrangThai: shipper.TrangThai,
      TrangThaiHoatDong: shipper.TrangThaiHoatDong,
      NgayDangKy: shipper.NgayDangKy,
      TenKhachHang: (shipper as any).KhachHang?.TenKhachHang,
      SoDienThoai: (shipper as any).KhachHang?.SoDienThoai,
    };
  }

  public async updateVacationMode(khachHangId: number, trangThaiHoatDong: 'ACTIVE' | 'VACATION') {
    const shipper = await Shipper.findOne({ where: { MaKhachHang: khachHangId } });
    if (!shipper) throw new Error('Không tìm thấy thông tin shipper');
    if (shipper.TrangThai !== 'ACTIVE') {
      throw new Error('Tài khoản shipper không được phép thay đổi trạng thái');
    }
    await shipper.update({ TrangThaiHoatDong: trangThaiHoatDong });
    return shipper;
  }
}
