import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Star, Loader, AlertTriangle, Store, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { formatPrice } from '../utils/format';

interface VendorShopData {
  vendor: {
    MaNguoiBan: number;
    TenCuaHang: string;
    DiaChiKinhDoanh: string;
    SoDienThoaiLienHe: string;
    KhachHang?: {
      TenKhachHang: string;
    };
  };
  stats: {
    productCount: number;
    averageRating: number;
  };
  products: Array<{
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
  }>;
}

const VendorShop = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [shopData, setShopData] = useState<VendorShopData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorShop = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.PRODUCT.GET_VENDOR_SHOP(parseInt(vendorId || '0')));
        setShopData(response.data);
      } catch (err) {
        setError('Không thể tải thông tin cửa hàng. Vui lòng thử lại sau!');
        console.error('Error fetching vendor shop:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorShop();
  }, [vendorId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary-600" />
          <span className="ml-2">Đang tải thông tin cửa hàng...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !shopData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            <AlertTriangle className="inline-block mr-2" />
            <span className="block sm:inline">{error || 'Không tìm thấy cửa hàng'}</span>
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
            <span className="text-primary-600">Cửa hàng: {shopData.vendor.TenCuaHang}</span>
          </div>
        </div>
      </div>

      {/* Vendor Header */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-lg p-8 border border-primary-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Vendor Avatar/Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                  <Store className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Vendor Info */}
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{shopData.vendor.TenCuaHang}</h1>
                {shopData.vendor.KhachHang && (
                  <p className="text-gray-600 mb-3">Chủ cửa hàng: {shopData.vendor.KhachHang.TenKhachHang}</p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary-600" />
                    <span>{shopData.vendor.SoDienThoaiLienHe}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                    <span>{shopData.vendor.DiaChiKinhDoanh}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{shopData.stats.productCount}</div>
                    <div className="text-sm text-gray-600">Sản phẩm</div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(shopData.stats.averageRating) ? 'currentColor' : 'none'}
                          className={i < Math.floor(shopData.stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{shopData.stats.averageRating.toFixed(1)} đánh giá</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm của cửa hàng</h2>
            <span className="text-gray-600">{shopData.products.length} sản phẩm</span>
          </div>

          {shopData.products.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Cửa hàng chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopData.products.map((product) => (
                <Link
                  to={`/products/${product.MaSanPham}`}
                  key={product.MaSanPham}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                >
                  <div className="h-56 overflow-hidden">
                    <img
                      src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `http://localhost:5000${product.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'}
                      alt={product.TenSanPham}
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                      {product.TenSanPham}
                    </h3>
                    <p className="text-primary-700 font-bold text-lg">
                      {formatPrice(product.GiaSanPham)}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                        {product.DanhMuc.TenDanhMuc}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      {product.SoLuong > 0 ? (
                        <span className="text-green-600">Còn {product.SoLuong} sản phẩm</span>
                      ) : (
                        <span className="text-red-600">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default VendorShop;
