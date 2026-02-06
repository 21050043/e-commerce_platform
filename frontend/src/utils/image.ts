export const defaultImage = 'https://images.pexels.com/photos/28216688/pexels-photo-28216688.png';

export function getCategoryImage(category: { HinhAnh?: string }) {
  return category.HinhAnh || defaultImage;
} 