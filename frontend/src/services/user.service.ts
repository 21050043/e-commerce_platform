import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface ProfileUpdateRequest {
  TenKhachHang?: string;
  TenNhanVien?: string;
  SoDienThoai?: string;
  DiaChi?: string;
}

export interface PasswordChangeRequest {
  MatKhauCu: string;
  MatKhauMoi: string;
  XacNhanMatKhau: string;
}

export interface UserResponse {
  MaKhachHang?: number;
  MaNhanVien?: number;
  TenKhachHang?: string;
  TenNhanVien?: string;
  SoDienThoai: string;
  DiaChi?: string;
  MaVaiTro: number;
  VaiTro?: {
    MaVaiTro: number;
    TenVaiTro: string;
  };
  NguoiBan?: VendorProfileResponse;
}

export interface VendorApplicationRequest {
  LoaiHinh: 'CA_NHAN' | 'DOANH_NGHIEP';
  TenCuaHang?: string;
  DiaChiKinhDoanh: string;
  EmailLienHe?: string;
  MaDanhMucChinh: number;
  SoDienThoaiLienHe: string;
  agreed: boolean;
}

export interface VendorProfileResponse {
  MaNguoiBan: number;
  MaKhachHang: number;
  LoaiHinh: 'CA_NHAN' | 'DOANH_NGHIEP';
  TenCuaHang?: string;
  DiaChiKinhDoanh: string;
  EmailLienHe?: string;
  MaDanhMucChinh: number;
  SoDienThoaiLienHe: string;
  TrangThai: 'PENDING' | 'APPROVED' | 'REJECTED';
  LyDoTuChoi?: string;
  NgayDuyet?: string | null;
}

export interface VendorProfileUpdateRequest {
  DiaChiKinhDoanh?: string;
  TenCuaHang?: string;
  EmailLienHe?: string;
  SoDienThoaiLienHe?: string;
}

export const getUserProfile = async (): Promise<UserResponse> => {
  const response = await api.get(API_ENDPOINTS.USER.GET_PROFILE);
  return response.data;
};

export const updateUserProfile = async (profileData: ProfileUpdateRequest): Promise<UserResponse> => {
  const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  return response.data;
};

export const changePassword = async (passwordData: PasswordChangeRequest): Promise<{ message: string }> => {
  const response = await api.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
  return response.data;
};

// Vendor APIs
export const applyVendor = async (data: VendorApplicationRequest): Promise<{ message: string; application: VendorProfileResponse }> => {
  const response = await api.post(API_ENDPOINTS.VENDOR.APPLY, data);
  return response.data;
};

export const getMyVendorProfile = async (): Promise<VendorProfileResponse | null> => {
  const response = await api.get(API_ENDPOINTS.VENDOR.ME);
  return response.data;
};

export const updateVendorProfile = async (data: VendorProfileUpdateRequest): Promise<{ message: string; profile: VendorProfileResponse }> => {
  const response = await api.put(API_ENDPOINTS.VENDOR.UPDATE, data);
  return response.data;
};

// Admin functions related to vendor applications (list, approve, reject) removed due to auto-approval.

// Admin functions
export const getAllCustomers = async (page = 1, limit = 10): Promise<{
  total: number;
  totalPages: number;
  currentPage: number;
  users: UserResponse[];
}> => {
  const response = await api.get(`${API_ENDPOINTS.ADMIN.USERS.GET_ALL_CUSTOMERS}?page=${page}&limit=${limit}`);
  return { ...response.data, users: response.data.customers };
};

export const getAllStaff = async (page = 1, limit = 10): Promise<{
  total: number;
  totalPages: number;
  currentPage: number;
  users: UserResponse[];
}> => {
  const response = await api.get(`${API_ENDPOINTS.ADMIN.USERS.GET_ALL_STAFF}?page=${page}&limit=${limit}`);
  return { ...response.data, users: response.data.staff };
};

export const getAllVendors = async (page = 1, limit = 10): Promise<{
  total: number;
  totalPages: number;
  currentPage: number;
  users: UserResponse[];
}> => {
  const response = await api.get(`${API_ENDPOINTS.ADMIN.USERS.GET_ALL_CUSTOMERS.replace('/customers', '/vendors')}?page=${page}&limit=${limit}`);
  return { ...response.data, users: response.data.users };
};

export const getUserById = async (id: number): Promise<UserResponse> => {
  const response = await api.get(API_ENDPOINTS.ADMIN.USERS.GET_BY_ID(id));
  return response.data;
};

export const createUser = async (userData: {
  TenKhachHang?: string;
  TenNhanVien?: string;
  SoDienThoai: string;
  MatKhau: string;
  DiaChi?: string;
  MaVaiTro: number;
}): Promise<UserResponse> => {
  const response = await api.post(API_ENDPOINTS.ADMIN.USERS.CREATE, userData);
  return response.data;
};

export const updateUser = async (id: number, userData: {
  TenKhachHang?: string;
  TenNhanVien?: string;
  SoDienThoai?: string;
  DiaChi?: string;
}): Promise<UserResponse> => {
  const response = await api.put(API_ENDPOINTS.ADMIN.USERS.UPDATE(id), userData);
  return response.data;
};

// export const deleteUser = async (id: number): Promise<void> => {
//   await api.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(id));
// };

// export const changeUserRole = async (id: number, roleId: number): Promise<UserResponse> => {
//   const response = await api.put(API_ENDPOINTS.ADMIN.USERS.CHANGE_ROLE(id), { MaVaiTro: roleId });
//   return response.data;
// }; 