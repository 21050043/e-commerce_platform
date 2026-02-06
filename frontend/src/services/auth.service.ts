import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface LoginRequest {
  SoDienThoai: string;
  MatKhau: string;
}

export interface RegisterRequest {
  TenKhachHang: string;
  SoDienThoai: string;
  MatKhau: string;
  DiaChi?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  expiresIn: number;
  user: any;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
  
  // Lưu accessToken vào localStorage
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  
  // Lưu accessToken vào localStorage
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    // Gọi API logout để xóa refresh token cookie
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
  } finally {
    // Xóa dữ liệu trong localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const refreshToken = async (): Promise<{ accessToken: string; expiresIn: number }> => {
  const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
  localStorage.setItem('accessToken', response.data.accessToken);
  return {
    accessToken: response.data.accessToken,
    expiresIn: response.data.expiresIn
  };
};

export const getCurrentUser = (): any => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

 