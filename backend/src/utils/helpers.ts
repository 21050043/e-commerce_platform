/**
 * Các hàm tiện ích cho ứng dụng
 */

/**
 * Định dạng số tiền thành chuỗi VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

/**
 * Tạo mã ngẫu nhiên với độ dài xác định
 */
export const generateRandomCode = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Tạo slug từ chuỗi
 */
export const slugify = (text: string): string => {
  const vietnamese = 'àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ';
  const latin = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyyyyyyyyyyyyyyyyyaaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiioooooooooooooooooouuuuuuuuuuuyyyyyyy';
  let str = text.toLowerCase();
  for (let i = 0; i < vietnamese.length; i++) {
    str = str.replace(new RegExp(vietnamese[i], 'g'), latin[i]);
  }
  return str
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Lấy ngày hiện tại theo định dạng YYYY-MM-DD
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Kiểm tra chuỗi có phải là số điện thoại hợp lệ
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^[0-9]{10}$/.test(phone);
};

/**
 * Kiểm tra mật khẩu an toàn
 */
export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Định dạng ngày tháng phù hợp với SQL Server
 * Trả về chuỗi định dạng YYYY-MM-DD HH:MM:SS
 */
// Removed SQL Server-specific date formatter; MySQL can use JS Date directly