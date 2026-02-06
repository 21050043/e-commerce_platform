import type { ProductResponse } from './product.service';

export interface CartItem {
  product: ProductResponse;
  quantity: number;
  price: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'shop_app_cart';

/**
 * Lấy danh sách sản phẩm trong giỏ hàng từ localStorage
 */
export const getCart = (): CartItem[] => {
  const cartItems = localStorage.getItem(CART_STORAGE_KEY);
  return cartItems ? JSON.parse(cartItems) : [];
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addToCart = (product: ProductResponse, quantity: number = 1): void => {
  const cart = getCart();
  
  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const existingItemIndex = cart.findIndex(item => item.product.MaSanPham === product.MaSanPham);
  
  if (existingItemIndex !== -1) {
    // Nếu đã có, tăng số lượng
    cart[existingItemIndex].quantity += quantity;
    cart[existingItemIndex].totalPrice = cart[existingItemIndex].quantity * cart[existingItemIndex].price;
  } else {
    // Nếu chưa có, thêm mới
    cart.push({
      product,
      quantity,
      price: product.GiaSanPham,
      totalPrice: product.GiaSanPham * quantity
    });
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateCartItemQuantity = (productId: number, quantity: number): void => {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.product.MaSanPham === productId);
  
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = quantity;
    cart[itemIndex].totalPrice = cart[itemIndex].price * quantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeFromCart = (productId: number): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.product.MaSanPham !== productId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Tính tổng tiền giỏ hàng
 */
export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.totalPrice, 0);
};

/**
 * Tính tổng số sản phẩm trong giỏ hàng
 */
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}; 