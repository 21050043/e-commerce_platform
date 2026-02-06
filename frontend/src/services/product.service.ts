import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface ProductResponse {
  MaSanPham: number;
  TenSanPham: string;
  MaDanhMuc: number;
  MoTa?: string;
  SoLuong: number;
  GiaSanPham: number;
  HinhAnh?: string;
  Ngaytao?: string;
  NgayCapNhat?: string;
  TrangThaiKiemDuyet?: 'ACTIVE' | 'SUSPENDED';
  LyDoTamDung?: string | null;
  NgayTamDung?: string | null;
  NguoiTamDung?: number | null;
  DanhMuc?: {
    MaDanhMuc: number;
    TenDanhMuc: string;
  };
}

export interface ProductListResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  products: ProductResponse[];
}

export const getAllProducts = async (page = 1, limit = 10): Promise<ProductListResponse> => {
  const response = await api.get(`${API_ENDPOINTS.PRODUCT.GET_ALL}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getVendorProducts = async (page = 1, limit = 10): Promise<ProductListResponse> => {
  const response = await api.get(API_ENDPOINTS.VENDOR.PRODUCTS.LIST, {
    params: { page, limit }
  });
  return response.data;
};

export const getProductById = async (id: number): Promise<ProductResponse> => {
  const response = await api.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(id));
  return response.data;
};

export const getProductsByCategory = async (categoryId: number, page = 1, limit = 10): Promise<ProductListResponse> => {
  const response = await api.get(`${API_ENDPOINTS.PRODUCT.GET_BY_CATEGORY(categoryId)}?page=${page}&limit=${limit}`);
  return response.data;
};

export const searchProducts = async (query: string, page = 1, limit = 10): Promise<ProductListResponse> => {
  const response = await api.get(`${API_ENDPOINTS.PRODUCT.SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return response.data;
};

// Vendor-scoped functions
export const vendorCreateProduct = async (productData: FormData): Promise<ProductResponse> => {
  const response = await api.post(API_ENDPOINTS.VENDOR.PRODUCTS.CREATE, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.product || response.data;
};

export const vendorUpdateProduct = async (id: number, productData: FormData): Promise<ProductResponse> => {
  const response = await api.put(API_ENDPOINTS.VENDOR.PRODUCTS.UPDATE(id), productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.product || response.data;
};

export const vendorDeleteProduct = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.VENDOR.PRODUCTS.DELETE(id));
};

export const suspendProduct = async (id: number, reason: string): Promise<ProductResponse> => {
  const response = await api.put(API_ENDPOINTS.ADMIN.PRODUCTS.SUSPEND(id), {
    lyDoTamDung: reason
  });
  return response.data.product;
};

export const unsuspendProduct = async (id: number): Promise<ProductResponse> => {
  const response = await api.put(API_ENDPOINTS.ADMIN.PRODUCTS.UNSUSPEND(id));
  return response.data.product;
};

export interface VendorShopResponse {
  vendor: {
    MaNguoiBan: number;
    TenCuaHang: string;
    DiaChiKinhDoanh: string;
    SoDienThoaiLienHe: string;
    KhachHang?: {
      TenKhachHang: string;
    };
  };
  stats: {
    productCount: number;
    averageRating: number;
  };
  products: ProductResponse[];
}

export const getVendorShop = async (vendorId: number): Promise<VendorShopResponse> => {
  const response = await api.get(API_ENDPOINTS.PRODUCT.GET_VENDOR_SHOP(vendorId));
  return response.data;
};
