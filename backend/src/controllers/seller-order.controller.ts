import { Request, Response } from 'express';
import SellerOrderService from '../services/seller-order.service';
import NguoiBan from '../models/NguoiBan.model';

/**
 * Controller đơn hàng cho phía Người bán.
 * Người bán (role 3) quản lý sub-orders (DonHangNguoiBan) của mình.
 */
export default class SellerOrderController {
    constructor(private sellerOrderService = new SellerOrderService()) { }

    /**
     * Helper: lấy MaNguoiBan từ MaKhachHang (trong JWT token).
     */
    private async getVendorId(khachHangId: number): Promise<number> {
        const vendor = await NguoiBan.findOne({
            where: { MaKhachHang: khachHangId, TrangThai: 'APPROVED' },
        });
        if (!vendor) {
            throw new Error('Không tìm thấy hồ sơ người bán hoặc hồ sơ chưa được kích hoạt');
        }
        return vendor.MaNguoiBan!;
    }

    /** Lấy danh sách sub-orders của người bán (có phân trang + lọc trạng thái). */
    public getMyOrders = async (req: Request, res: Response): Promise<Response> => {
        try {
            const vendorId = await this.getVendorId(req.user!.id);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const trangThai = req.query.trangThai as string | undefined;

            const result = await this.sellerOrderService.getSellerOrders(vendorId, page, limit, trangThai);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách đơn hàng' });
        }
    };

    /** Xem chi tiết 1 sub-order. */
    public getOrderDetail = async (req: Request, res: Response): Promise<Response> => {
        try {
            const vendorId = await this.getVendorId(req.user!.id);
            const donHangNBId = parseInt(req.params.id);

            const order = await this.sellerOrderService.getSellerOrderById(vendorId, donHangNBId);
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(404).json({ message: error.message });
        }
    };

    /** Cập nhật trạng thái sub-order. */
    public updateStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const vendorId = await this.getVendorId(req.user!.id);
            const donHangNBId = parseInt(req.params.id);
            const { trangThai } = req.body;

            if (!trangThai) {
                return res.status(400).json({ message: 'Trạng thái không được để trống' });
            }

            const updated = await this.sellerOrderService.updateSellerOrderStatus(
                vendorId,
                donHangNBId,
                trangThai
            );
            return res.status(200).json({
                message: 'Cập nhật trạng thái đơn hàng thành công',
                order: updated,
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };

    /** Thống kê tổng quan cho Seller Dashboard. */
    public getStats = async (req: Request, res: Response): Promise<Response> => {
        try {
            const vendorId = await this.getVendorId(req.user!.id);
            const stats = await this.sellerOrderService.getSellerStats(vendorId);
            return res.status(200).json(stats);
        } catch (error: any) {
            return res.status(500).json({ message: error.message || 'Lỗi khi lấy thống kê' });
        }
    };
}
