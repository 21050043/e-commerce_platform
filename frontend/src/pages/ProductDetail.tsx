import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Star, ShoppingCart, Minus, Plus, Loader, AlertTriangle } from 'lucide-react';
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
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary-600" />
          <span className="ml-2">Đang tải thông tin sản phẩm...</span>
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
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{product.TenSanPham}</h1>
              {product.NguoiBan && (
                <div className="mb-3 p-3 rounded-lg border border-primary-100 bg-primary-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Người bán:</span>{' '}
                      <span className="font-medium text-gray-800">{product.NguoiBan.TenCuaHang || 'Người bán'}</span>
                      <span className="ml-2 text-sm text-gray-600">Liên hệ:</span>{' '}
                      <span className="text-sm text-gray-800">{product.NguoiBan.SoDienThoaiLienHe}</span>
                    </div>
                    <Link
                      to={`/vendor/${product.NguoiBan.MaNguoiBan}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium underline"
                    >
                      Xem cửa hàng
                    </Link>
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
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={addToCart}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-md flex items-center justify-center"
                  disabled={product.SoLuong === 0}
                >
                  <ShoppingCart className="mr-2" size={20} />
                  {product.SoLuong === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
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
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'description'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-primary-500'
                  }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'reviews'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-primary-500'
                  }`}
              >
                Đánh giá ({reviewCount})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Chi tiết sản phẩm</h3>
                  <div className="text-gray-700 space-y-4">
                    <p>{product.MoTa || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Đánh giá từ khách hàng</h3>
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="font-semibold mr-2">Khách hàng 1</div>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < 5 ? 'currentColor' : 'none'}
                            className={i < 5 ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Sản phẩm chất lượng tốt, giao hàng nhanh. Tôi rất hài lòng với dịch vụ của shop.
                    </p>
                  </div>
                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="font-semibold mr-2">Khách hàng 2</div>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < 4 ? 'currentColor' : 'none'}
                            className={i < 4 ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Sản phẩm đúng như mô tả, đóng gói cẩn thận. Tôi sẽ mua lại lần sau.
                    </p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Link
                      to={`/products/${productId}/reviews`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Xem tất cả đánh giá
                    </Link>
                  </div>
                </div>
              )}
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