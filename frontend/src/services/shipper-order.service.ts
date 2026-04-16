import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface ShipperOrderItem {
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

export interface ShipperOrderResponse {
  MaDonHangNB: number;
  MaHoaDon: number;
  MaNguoiBan: number;
  TrangThai: 'Đang giao hàng' | 'Đã giao hàng';
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
    ChiTietHoaDons?: ShipperOrderItem[];
  };
}

export interface ShipperOrdersResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  orders: ShipperOrderResponse[];
}

export const getShipperOrders = async (
  page = 1,
  limit = 10,
  trangThai = 'all'
): Promise<ShipperOrdersResponse> => {
  const query = `${API_ENDPOINTS.SHIPPER.ORDERS}?page=${page}&limit=${limit}${trangThai && trangThai !== 'all' ? `&trangThai=${encodeURIComponent(trangThai)}` : ''}`;
  const response = await api.get(query);
  return response.data;
};

export const getShipperOrderById = async (id: number): Promise<ShipperOrderResponse> => {
  const response = await api.get(API_ENDPOINTS.SHIPPER.ORDER_BY_ID(id));
  return response.data;
};

export const updateShipperOrderStatus = async (
  id: number,
  trangThai: string
): Promise<ShipperOrderResponse> => {
  const response = await api.put(API_ENDPOINTS.SHIPPER.UPDATE_STATUS(id), { trangThai });
  return response.data;
};
