import { API_ROOT_URL } from '../constants/api';

export const defaultImage = 'https://images.pexels.com/photos/28216688/pexels-photo-28216688.png';

export function getCategoryImage(category: { HinhAnh?: string }) {
  if (!category.HinhAnh) return defaultImage;
  return category.HinhAnh.startsWith('http') ? category.HinhAnh : `${API_ROOT_URL}${category.HinhAnh}`;
}