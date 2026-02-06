import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { cart, updateQuantity, removeItem, clearAll, totalPrice } = useCart();

  useEffect(() => {
    // Hoàn thành quá trình tải dữ liệu
    setLoading(false);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const proceedToCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      addToast('Vui lòng đăng nhập để thanh toán', 'info');
      navigate('/login', { state: { from: '/cart', message: 'Vui lòng đăng nhập để thanh toán' } });
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Giỏ Hàng</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Giỏ Hàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              <span className="ml-2">Đang tải giỏ hàng...</span>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link
                to="/categories"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-4 px-6 text-left">Sản phẩm</th>
                        <th className="py-4 px-6 text-center">Số lượng</th>
                        <th className="py-4 px-6 text-right">Giá</th>
                        <th className="py-4 px-6 text-right">Tổng</th>
                        <th className="py-4 px-6 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product.MaSanPham} className="border-b">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <img
                                src={item.product.HinhAnh ? (item.product.HinhAnh.startsWith('http')
                                  ? item.product.HinhAnh
                                  : `http://localhost:5000${item.product.HinhAnh}`)
                                  : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'}
                                alt={item.product.TenSanPham}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <Link to={`/products/${item.product.MaSanPham}`} className="ml-4 hover:text-primary-600">
                                {item.product.TenSanPham}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => updateQuantity(item.product.MaSanPham, item.quantity - 1)}
                                className="bg-gray-200 hover:bg-gray-300 rounded-l-md px-2 py-1"
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product.MaSanPham, parseInt(e.target.value) || 1)}
                                className="w-12 text-center py-1 border-t border-b"
                              />
                              <button
                                onClick={() => updateQuantity(item.product.MaSanPham, item.quantity + 1)}
                                className="bg-gray-200 hover:bg-gray-300 rounded-r-md px-2 py-1"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {formatPrice(item.price)}
                          </td>
                          <td className="py-4 px-6 text-right font-semibold">
                            {formatPrice(item.totalPrice)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => {
                                addToast(`Đã xóa ${item.product.TenSanPham} khỏi giỏ hàng`, 'success');
                                removeItem(item.product.MaSanPham);
                              }}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-between">
                  <Link
                    to="/categories"
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  >
                    Tiếp tục mua sắm
                  </Link>
                  <button
                    onClick={() => {
                      clearAll();
                      addToast('Đã xóa toàn bộ giỏ hàng', 'success');
                    }}
                    className="px-6 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition"
                  >
                    Xóa giỏ hàng
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Tạm tính</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Phí vận chuyển</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-b py-4 my-2">
                      <span>Tổng cộng</span>
                      <span className="text-primary-700">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-primary-600 text-white py-3 rounded-md mt-4 hover:bg-primary-700 transition flex items-center justify-center"
                  >
                    Thanh toán <ArrowRight className="ml-2" size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Cart; 