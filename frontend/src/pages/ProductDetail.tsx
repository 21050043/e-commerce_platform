import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Star, ShoppingCart, Minus, Plus, AlertTriangle, User, Mail, Phone, ExternalLink } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import type { ProductResponse } from '../services/product.service';
import { formatCurrency } from '../utils/format';

interface Product {
  MaSanPham: number;
  TenSanPham: string;
  GiaSanPham: number;
  HinhAnh: string;
  SoLuong: number;
  MoTa: string;
  DanhMuc: {
    MaDanhMuc: number;
    TenDanhMuc: string;
  };
  NguoiBan?: {
    MaNguoiBan: number;
    TenCuaHang?: string;
    SoDienThoaiLienHe: string;
    KhachHang?: {
      TenKhachHang: string;
    };
  };
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToast } = useToast();
  const { addItem } = useCart();

  // Giả lập dữ liệu đánh giá sản phẩm
  const rating = 4;
  const reviewCount = 12;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(parseInt(productId || '0')));
        setProduct(response.data);

        // Sau khi có thông tin sản phẩm, lấy sản phẩm liên quan
        if (response.data && response.data.DanhMuc && response.data.DanhMuc.MaDanhMuc) {
          const relatedResponse = await api.get(API_ENDPOINTS.PRODUCT.GET_BY_CATEGORY(response.data.DanhMuc.MaDanhMuc), {
            params: {
              limit: 4
            }
          });
          // Lọc bỏ sản phẩm hiện tại khỏi danh sách sản phẩm liên quan
          setRelatedProducts(
            relatedResponse.data.products.filter((p: Product) => p.MaSanPham !== parseInt(productId || '0')).slice(0, 4)
          );
        }
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau!');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.SoLuong) {
      setQuantity(value);
    }
  };

  const addToCart = () => {
    if (!product) return;

    // Chuyển đổi Product thành ProductResponse để phù hợp với interface yêu cầu
    const productForCart: ProductResponse = {
      MaSanPham: product.MaSanPham,
      TenSanPham: product.TenSanPham,
      GiaSanPham: product.GiaSanPham,
      SoLuong: product.SoLuong,
      MoTa: product.MoTa,
      HinhAnh: product.HinhAnh,
      MaDanhMuc: product.DanhMuc.MaDanhMuc,
      DanhMuc: product.DanhMuc
    };

    // Sử dụng hàm addItem từ CartContext
    addItem(productForCart, quantity);
    addToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-4 mb-8">
          <div className="container mx-auto px-4">
            <Skeleton height={20} width={300} />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row -mx-4">
            <div className="md:w-1/2 px-4 mb-8">
              <Skeleton height={500} className="w-full rounded-2xl" />
            </div>
            <div className="md:w-1/2 px-4 space-y-4">
              <Skeleton height={40} width="80%" />
              <Skeleton height={60} className="w-full rounded-xl" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} variant="circle" height={16} width={16} />)}
                <Skeleton height={16} width={100} />
              </div>
              <Skeleton height={32} width={150} />
              <div className="space-y-2">
                <Skeleton height={16} width="100%" />
                <Skeleton height={16} width="100%" />
                <Skeleton height={16} width="60%" />
              </div>
              <div className="pt-6">
                <Skeleton height={50} width={200} className="rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            <AlertTriangle className="inline-block mr-2" />
            <span className="block sm:inline">{error || 'Không tìm thấy sản phẩm'}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600">
              Trang Chủ
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link to="/categories" className="text-gray-600 hover:text-primary-600">
              Danh Mục
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link
              to={`/categories/${product.DanhMuc.MaDanhMuc}`}
              className="text-gray-600 hover:text-primary-600"
            >
              {product.DanhMuc.TenDanhMuc}
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <span className="text-primary-600">{product.TenSanPham}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row -mx-4">
            {/* Product Image */}
            <div className="md:w-1/2 px-4 mb-8 md:mb-0">
              <div className="sticky top-24">
                <div className="border rounded-lg overflow-hidden bg-white p-4">
                  <img
                    src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `http://localhost:5000${product.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'}
                    alt={product.TenSanPham}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 px-4">
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{product.TenSanPham}</h1>

              {product.NguoiBan && (
                <div className="mb-6 p-5 rounded-3xl border border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary-600 shadow-sm">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cửa hàng</p>
                        <h3 className="font-bold text-gray-900 text-lg">{product.NguoiBan.TenCuaHang || 'Kênh Người Bán'}</h3>
                      </div>
                    </div>
                    <Link
                      to={`/vendor/${product.NguoiBan.MaNguoiBan}`}
                      className="p-2 rounded-xl bg-white text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm border border-primary-100"
                      title="Xem cửa hàng"
                    >
                      <ExternalLink size={20} />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500 pt-2 border-t border-gray-100/50">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {product.NguoiBan.SoDienThoaiLienHe}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {(product.NguoiBan as any).Email || 'support@ehub.vn'}
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < rating ? 'currentColor' : 'none'}
                      className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{reviewCount} đánh giá</span>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-primary-600 mb-4">
                {formatCurrency(product.GiaSanPham)}
              </div>

              {/* Description */}
              <div className="text-gray-600 mb-6">
                <p>{product.MoTa?.slice(0, 200)}...</p>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <p className="text-gray-700">
                  <span className="font-semibold">Tình trạng:</span>{' '}
                  {product.SoLuong > 0 ? (
                    <span className="text-green-600">Còn hàng ({product.SoLuong} sản phẩm)</span>
                  ) : (
                    <span className="text-red-600">Hết hàng</span>
                  )}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Danh mục:</span>{' '}
                  <Link
                    to={`/categories/${product.DanhMuc.MaDanhMuc}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    {product.DanhMuc.TenDanhMuc}
                  </Link>
                </p>
              </div>

              {/* Quantity Selector */}
              {product.SoLuong > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Số lượng</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded-l-md px-3 py-2 text-gray-700"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.SoLuong}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center py-2 border-t border-b focus:outline-none focus:border-primary-500"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded-r-md px-3 py-2 text-gray-700"
                      disabled={quantity >= product.SoLuong}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addToCart}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                  disabled={product.SoLuong === 0}
                >
                  <ShoppingCart className="mr-3" size={24} />
                  {product.SoLuong === 0 ? 'Hết hàng tạm thời' : 'Thêm vào giỏ hàng ngay'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100 px-6">
              {[
                { id: 'description', label: 'Mô tả chi tiết' },
                { id: 'reviews', label: `Đánh giá (${reviewCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-6 px-8 font-bold text-sm focus:outline-none transition-colors ${activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'description' ? (
                    <div className="prose prose-primary max-w-none">
                      <h3 className="text-2xl font-black text-gray-900 mb-6">Thông tin kỹ thuật & Tính năng</h3>
                      <div className="text-gray-700 space-y-4 text-lg leading-relaxed">
                        <p>{product.MoTa || 'Hệ thống đang cập nhật nội dung chi tiết cho sản phẩm này.'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <h3 className="text-2xl font-black text-gray-900 mb-6">Phản hồi từ cộng đồng</h3>
                      {[
                        { name: 'Khách hàng 1', text: 'Sản phẩm chất lượng vượt mong đợi, linh kiện nhúng rất ổn định. Đóng gói cực kỳ chuyên nghiệp!', rating: 5 },
                        { name: 'Khách hàng 2', text: 'Giao hàng siêu tốc. Mình dùng cho dự án IoT thấy rất tốt, sẽ tiếp tục ủng hộ Ehub.', rating: 4 }
                      ].map((rev, idx) => (
                        <div key={idx} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                {rev.name[0]}
                              </div>
                              <div className="font-bold text-gray-900">{rev.name}</div>
                            </div>
                            <div className="flex items-center text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  fill={i < rev.rating ? 'currentColor' : 'none'}
                                  className={i < rev.rating ? 'text-yellow-400' : 'text-gray-200'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed italic">"{rev.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  to={`/products/${relatedProduct.MaSanPham}`}
                  key={relatedProduct.MaSanPham}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                >
                  <div className="h-56 overflow-hidden">
                    <img
                      src={relatedProduct.HinhAnh ? (relatedProduct.HinhAnh.startsWith('http') ? relatedProduct.HinhAnh : `http://localhost:5000${relatedProduct.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'}
                      alt={relatedProduct.TenSanPham}
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                      {relatedProduct.TenSanPham}
                    </h3>
                    <p className="text-primary-600 font-bold">
                      {formatCurrency(relatedProduct.GiaSanPham)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default ProductDetail; 