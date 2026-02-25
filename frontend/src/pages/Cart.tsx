import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import Skeleton from '../components/ui/Skeleton';

const Cart = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { cart, updateQuantity, removeItem, clearAll, totalPrice } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Premium Header */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 scale-110 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Túi hàng của bạn</h1>
            <div className="flex items-center justify-center gap-2 text-primary-400 font-bold uppercase tracking-widest text-xs">
              <Link to="/" className="hover:text-white transition-colors">Trang Chủ</Link>
              <ChevronRight size={14} />
              <span className="text-gray-400">Thanh toán an toàn</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-gray-50 min-h-[600px]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton height={200} className="w-full rounded-3xl" />
              <Skeleton height={200} className="w-full rounded-3xl" />
            </div>
          ) : cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10"
            >
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Trống trải quá...</h2>
              <p className="text-gray-500 mb-8 font-medium italic">Có vẻ như bạn chưa chọn được món đồ ưng ý nào cho dự án của mình.</p>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-700 transition shadow-lg shadow-primary-200 active:scale-95"
              >
                Khám phá ngay <ArrowRight size={20} />
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Cart Items List */}
              <div className="lg:w-2/3 space-y-6">
                <div className="flex items-center justify-between px-4 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Sản phẩm ({cart.length})
                  </h2>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn làm trống giỏ hàng?')) {
                        clearAll();
                        addToast('Đã dọn dẹp giỏ hàng', 'success');
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.MaSanPham}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all flex flex-col sm:flex-row gap-6 items-center"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-50">
                          <img
                            src={item.product.HinhAnh ? (item.product.HinhAnh.startsWith('http')
                              ? item.product.HinhAnh
                              : `http://localhost:5000${item.product.HinhAnh}`)
                              : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                            alt={item.product.TenSanPham}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <Link
                            to={`/products/${item.product.MaSanPham}`}
                            className="text-xl font-black text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1"
                          >
                            {item.product.TenSanPham}
                          </Link>
                          <p className="text-sm text-gray-400 font-medium mb-4">Đơn giá: {formatCurrency(item.price)}</p>

                          <div className="flex items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                              <button
                                onClick={() => updateQuantity(item.product.MaSanPham, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all disabled:opacity-30"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product.MaSanPham, parseInt(e.target.value) || 1)}
                                className="w-10 text-center bg-transparent font-bold text-gray-900 focus:outline-none"
                              />
                              <button
                                onClick={() => updateQuantity(item.product.MaSanPham, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="font-black text-primary-600">{formatCurrency(item.totalPrice)}</div>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => {
                            removeItem(item.product.MaSanPham);
                            addToast(`Đã gỡ ${item.product.TenSanPham}`, 'success');
                          }}
                          className="sm:opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 size={24} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Order Summary Checkout */}
              <div className="lg:w-1/3">
                <div className="sticky top-24 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl" />
                    <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight relative">Tóm tắt đơn hàng</h3>

                    <div className="space-y-4 border-b border-dashed border-gray-100 pb-6 relative">
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Tạm tính</span>
                        <span className="text-gray-900">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Vận chuyển</span>
                        <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest mt-1">Miễn phí</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Mã giảm giá</span>
                        <span className="text-gray-300 italic">Chưa áp dụng</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-8 relative">
                      <span className="text-lg font-bold text-gray-900">Thành tiền</span>
                      <span className="text-3xl font-black text-primary-600 tracking-tighter">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={proceedToCheckout}
                      className="w-full bg-primary-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition flex items-center justify-center gap-3"
                    >
                      Tiến hành đặt hàng <ArrowRight size={24} />
                    </motion.button>

                    <div className="mt-8 flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <ShieldCheck className="text-green-500" size={16} /> Bảo mật thanh toán SSL
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <Truck className="text-blue-500" size={16} /> Giao hàng siêu tốc 2H
                      </div>
                    </div>
                  </motion.div>

                  {/* Why Ehub? */}
                  <div className="bg-primary-600/5 rounded-3xl p-6 border border-primary-100">
                    <h4 className="font-black text-primary-700 text-sm italic mb-3">#EhubCamKet</h4>
                    <div className="flex items-center gap-3 text-primary-600">
                      <RotateCcw size={20} />
                      <p className="text-sm font-bold">Hoàn tiền 100% nếu sản phẩm lỗi kỹ thuật trong 7 ngày đầu.</p>
                    </div>
                  </div>
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