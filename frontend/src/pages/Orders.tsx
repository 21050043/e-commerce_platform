import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Loader, Package, Calendar, CreditCard, Clock, ChevronDown, AlertTriangle, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { formatPrice, formatDate } from '../utils/format';
import { getStatusColor } from '../utils/order';

interface OrderDetail {
  MaSanPham: number;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
  SanPham: {
    MaSanPham: number;
    TenSanPham: string;
    HinhAnh: string;
  };
}

interface Order {
  MaHoaDon: number;
  NgayLap: string;
  TongTien: number;
  PhuongThucTT: string;
  DiaChi: string;
  TrangThai: string;
  ChiTietHoaDons: OrderDetail[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders', message: 'Vui lòng đăng nhập để xem đơn hàng' } });
      return;
    }

    // Kiểm tra vai trò người dùng, cho phép khách hàng (role = 2) và người bán (role = 3) xem đơn hàng
    if (user && (user.MaVaiTro === 2 || user.MaVaiTro === 3)) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);

          console.log('Đang tải đơn hàng của khách hàng/người bán');
          const response = await api.get(API_ENDPOINTS.ORDER.GET_MY_ORDERS);

          // Kiểm tra dữ liệu trả về
          if (Array.isArray(response.data)) {
            console.log(`Đã tải ${response.data.length} đơn hàng`);
            setOrders(response.data);
          } else {
            console.error('Định dạng dữ liệu không hợp lệ:', response.data);
            setOrders([]);
            setError('Không thể tải đơn hàng do định dạng dữ liệu không hợp lệ');
          }
        } catch (err: any) {
          console.error('Lỗi khi tải đơn hàng:', err);
          setOrders([]);
          setError(err.response?.data?.message || 'Không thể tải đơn hàng. Vui lòng thử lại sau!');
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    } else if (user && (user.MaVaiTro === 0 || user.MaVaiTro === 1)) {
      // Admin hoặc nhân viên
      setLoading(false);
      setError('Chỉ tài khoản khách hàng và người bán mới có thể xem đơn hàng của họ, Admin và nhân viên vui lòng sử dụng trang quản lý đơn hàng');
    }
  }, [isAuthenticated, navigate, user]);

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Đơn Hàng Của Bạn</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Đơn Hàng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-primary-600" />
              <span className="ml-2">Đang tải đơn hàng...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
              <AlertTriangle className="inline-block mr-2" />
              <span className="block sm:inline">{error}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Bạn chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Hãy mua sắm và đặt hàng ngay để xem lịch sử đơn hàng tại đây.</p>
              <Link
                to="/categories"
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.MaHoaDon} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="font-semibold text-lg mb-1">
                          Đơn hàng #{order.MaHoaDon}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 sm:gap-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(order.NgayLap)}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            <span>{order.PhuongThucTT}</span>
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            <span className="font-medium">{formatPrice(order.TongTien)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.TrangThai)}`}>
                          {order.TrangThai}
                        </span>
                        <button
                          onClick={() => toggleOrderDetails(order.MaHoaDon)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transform transition-transform ${expandedOrder === order.MaHoaDon ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {expandedOrder === order.MaHoaDon && (
                    <div className="p-6">
                      <h4 className="font-medium mb-4">Chi tiết đơn hàng</h4>

                      {/* Products */}
                      <div className="space-y-4 mb-6">
                        {order.ChiTietHoaDons?.map((item) => (
                          <div key={item.MaSanPham} className="flex items-center gap-4 p-3 border rounded-md">
                            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                              {item.SanPham.HinhAnh ? (
                                <img
                                  src={item.SanPham.HinhAnh.startsWith('/uploads')
                                    ? `http://localhost:5000${item.SanPham.HinhAnh}`
                                    : item.SanPham.HinhAnh}
                                  alt={item.SanPham.TenSanPham}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback khi ảnh lỗi
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>';
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Image className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Link
                                to={`/products/${item.MaSanPham}`}
                                className="font-medium hover:text-primary-600"
                              >
                                {item.SanPham.TenSanPham}
                              </Link>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.DonGia)} x {item.SoLuong}
                              </p>
                            </div>
                            <div className="font-medium text-right">
                              {formatPrice(item.ThanhTien)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Tổng tiền sản phẩm</span>
                          <span>{formatPrice(order.TongTien)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Phí vận chuyển</span>
                          <span>Miễn phí</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
                          <span>Tổng cộng</span>
                          <span className="text-primary-700">{formatPrice(order.TongTien)}</span>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="mt-6 bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                        <p className="text-gray-700">
                          <span className="font-semibold">Địa chỉ:</span> {order.DiaChi}
                        </p>
                        <div className="flex items-center mt-2 text-gray-700">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {order.TrangThai === 'Đã giao hàng'
                              ? 'Đã giao thành công'
                              : order.TrangThai === 'Đã hủy'
                                ? 'Đơn hàng đã bị hủy'
                                : 'Dự kiến giao trong 2-3 ngày làm việc'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Orders; 