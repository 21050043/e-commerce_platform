import api from './api';
import { API_ENDPOINTS } from '../constants/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerOrderItem {
    MaChiTiet: number;
    MaHoaDon: number;
    MaSanPham: number;
    SoLuong: number;
    DonGia: number;
    ThanhTien: number;
    SanPham?: {
        MaSanPham: number;
        TenSanPham: string;
        GiaSanPham: number;
        HinhAnh?: string;
    };
}

export interface SellerOrderResponse {
    MaDonHangNB: number;
    MaHoaDon: number;
    MaNguoiBan: number;
    TrangThai: 'Đã đặt hàng' | 'Đang xử lý' | 'Đang giao hàng' | 'Đã giao hàng' | 'Đã hủy';
    TongTienNB: number;
    GhiChu?: string;
    NgayCapNhat?: string;
    HoaDon?: {
        MaHoaDon: number;
        NgayLap: string;
        TongTien: number;
        PhuongThucTT: string;
        DiaChi: string;
        TrangThai: string;
        KhachHang?: {
            MaKhachHang: number;
            TenKhachHang: string;
            SoDienThoai: string;
            DiaChi?: string;
        };
        ChiTietHoaDons?: SellerOrderItem[];
    };
}

export interface SellerOrdersResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    orders: SellerOrderResponse[];
}

export interface SellerStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    newOrders: number;
    totalRevenue: number;
    totalProducts: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Lấy thống kê tổng quan cho Seller Dashboard. */
export const getSellerStats = async (): Promise<SellerStats> => {
    const response = await api.get(API_ENDPOINTS.SELLER_ORDER.STATS);
    return response.data;
};

/** Lấy danh sách sub-orders của người bán (phân trang + lọc trạng thái). */
export const getSellerOrders = async (
    page = 1,
    limit = 10,
    trangThai?: string
): Promise<SellerOrdersResponse> => {
    const url = API_ENDPOINTS.SELLER_ORDER.GET_ALL(page, limit, trangThai);
    const response = await api.get(url);
    return response.data;
};

/** Xem chi tiết 1 sub-order. */
export const getSellerOrderById = async (id: number): Promise<SellerOrderResponse> => {
    const response = await api.get(API_ENDPOINTS.SELLER_ORDER.GET_BY_ID(id));
    return response.data;
};

/** Cập nhật trạng thái sub-order. */
export const updateSellerOrderStatus = async (
    id: number,
    trangThai: string
): Promise<SellerOrderResponse> => {
    const response = await api.put(API_ENDPOINTS.SELLER_ORDER.UPDATE_STATUS(id), { trangThai });
    return response.data;
};
