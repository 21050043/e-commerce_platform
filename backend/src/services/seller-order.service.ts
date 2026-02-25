import { Op } from 'sequelize';
import DonHangNguoiBan from '../models/DonHangNguoiBan.model';
import HoaDon from '../models/HoaDon.model';
import ChiTietHoaDon from '../models/ChiTietHoaDon.model';
import SanPham from '../models/SanPham.model';
import KhachHang from '../models/KhachHang.model';
import NguoiBan from '../models/NguoiBan.model';

// Luồng chuyển trạng thái hợp lệ theo mô hình platform.
// Người bán chịu trách nhiệm từ "Đang xử lý" → "Đang giao hàng" → "Đã giao hàng".
const VALID_TRANSITIONS: Record<string, string[]> = {
    'Đã đặt hàng': ['Đang xử lý', 'Đã hủy'],
    'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
    'Đang giao hàng': ['Đã giao hàng'],
    'Đã giao hàng': [],
    'Đã hủy': [],
};

export default class SellerOrderService {
    /**
     * Lấy danh sách sub-orders của người bán (phân trang + lọc trạng thái).
     */
    public async getSellerOrders(
        vendorId: number,
        page = 1,
        limit = 10,
        trangThai?: string
    ) {
        const offset = (page - 1) * limit;
        const where: any = { MaNguoiBan: vendorId };
        if (trangThai && trangThai !== 'all') where.TrangThai = trangThai;

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

    /**
     * Xem chi tiết 1 sub-order (kiểm tra quyền sở hữu).
     */
    public async getSellerOrderById(vendorId: number, donHangNBId: number) {
        const subOrder = await DonHangNguoiBan.findOne({
            where: { MaDonHangNB: donHangNBId, MaNguoiBan: vendorId },
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
            throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập');
        }

        return subOrder;
    }

    /**
     * Cập nhật trạng thái sub-order.
     * Chỉ người bán sở hữu sub-order mới được cập nhật.
     */
    public async updateSellerOrderStatus(
        vendorId: number,
        donHangNBId: number,
        newStatus: string
    ) {
        const subOrder = await DonHangNguoiBan.findOne({
            where: { MaDonHangNB: donHangNBId, MaNguoiBan: vendorId },
        });

        if (!subOrder) {
            throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật');
        }

        const currentStatus = subOrder.TrangThai;
        const allowedNext = VALID_TRANSITIONS[currentStatus] ?? [];

        if (!allowedNext.includes(newStatus)) {
            throw new Error(
                `Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"`
            );
        }

        await subOrder.update({ TrangThai: newStatus as any });
        return subOrder;
    }

    /**
     * Thống kê tổng quan cho Seller Dashboard.
     */
    public async getSellerStats(vendorId: number) {
        const allOrders = await DonHangNguoiBan.findAll({
            where: { MaNguoiBan: vendorId },
        });

        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter((o) => o.TrangThai === 'Đã đặt hàng').length;
        const processingOrders = allOrders.filter((o) => o.TrangThai === 'Đang xử lý').length;
        const totalRevenue = allOrders
            .filter((o) => o.TrangThai === 'Đã giao hàng')
            .reduce((sum, o) => sum + Number(o.TongTienNB), 0);

        const vendor = await NguoiBan.findOne({ where: { MaNguoiBan: vendorId } });
        const totalProducts = await SanPham.count({ where: { MaNguoiBan: vendorId } });

        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            newOrders: pendingOrders + processingOrders,
            totalRevenue,
            totalProducts,
        };
    }
}
