import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export interface CategoryResponse {
  MaDanhMuc: number;
  TenDanhMuc: string;
  HinhAnh?: string;
}

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const response = await api.get(API_ENDPOINTS.CATEGORY.GET_ALL);
  return response.data;
};

export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  const response = await api.get(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));
  return response.data;
};

// Admin functions
export const createCategory = async (categoryData: { TenDanhMuc: string, HinhAnh?: string }): Promise<CategoryResponse> => {
  const response = await api.post(API_ENDPOINTS.CATEGORY.CREATE, categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: { TenDanhMuc: string, HinhAnh?: string }): Promise<CategoryResponse> => {
  const response = await api.put(API_ENDPOINTS.CATEGORY.UPDATE(id), categoryData);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
}; 