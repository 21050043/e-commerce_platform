import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } from '../services/cart.service';
import type { ProductResponse } from '../services/product.service';

interface CartItem {
  product: ProductResponse;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (product: ProductResponse, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearAll: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Cập nhật dữ liệu giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    updateCartState();
    
    // Lắng nghe sự kiện storage để cập nhật khi giỏ hàng thay đổi ở tab khác
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shop_app_cart') {
        updateCartState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cập nhật state từ localStorage
  const updateCartState = () => {
    const cartData = getCart();
    setCart(cartData);
    setItemCount(getCartItemCount());
    setTotalPrice(getCartTotal());
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItem = (product: ProductResponse, quantity: number = 1) => {
    addToCart(product, quantity);
    updateCartState();
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId: number, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
    updateCartState();
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (productId: number) => {
    removeFromCart(productId);
    updateCartState();
  };

  // Xóa toàn bộ giỏ hàng
  const clearAll = () => {
    clearCart();
    updateCartState();
  };

  const value = {
    cart,
    itemCount,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearAll
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 