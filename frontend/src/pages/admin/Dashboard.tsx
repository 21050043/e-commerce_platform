import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Users, Package, ShoppingBag, LayoutGrid, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';

interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  revenue: number;
  pendingVendors?: number;
}

interface OrderStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/admin', message: 'Vui lòng đăng nhập để truy cập trang quản trị' } });
      return;
    }

    // Kiểm tra role (admin, nhân viên và vendor mới có quyền truy cập)
    if (user && user.MaVaiTro !== 0 && user.MaVaiTro !== 1 && user.MaVaiTro !== 3) {
      navigate('/', { state: { message: 'Bạn không có quyền truy cập trang quản trị' } });
      return;
    }

    // Lấy dữ liệu tổng quan
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
        setSummary(response.data);
        
        // Giả lập dữ liệu trạng thái đơn hàng (trong thực tế sẽ lấy từ API)
        setOrderStatus({
          pending: 5,
          processing: 8,
          shipped: 12,
          delivered: 25,
          cancelled: 2
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau!');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  // Lấy số liệu trạng thái đơn hàng cao nhất để tính phần trăm
  const maxOrderStatus = Math.max(
    orderStatus.pending, 
    orderStatus.processing, 
    orderStatus.shipped, 
    orderStatus.delivered, 
    orderStatus.cancelled
  );

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-6">Tổng quan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Thống kê sản phẩm */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Sản phẩm</p>
                  <h3 className="font-semibold text-xl">{summary.totalProducts}</h3>
                </div>
              </div>
            </div>

            {/* Thống kê danh mục - chỉ hiển thị cho admin và staff */}
            {user?.MaVaiTro !== 3 && (
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <BarChart className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Danh mục</p>
                  <h3 className="font-semibold text-xl">{summary.totalCategories}</h3>
                </div>
              </div>
            </div>
            )}

            {/* Thống kê khách hàng - chỉ hiển thị cho admin và staff */}
            {user?.MaVaiTro !== 3 && (
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Khách hàng</p>
                  <h3 className="font-semibold text-xl">{summary.totalCustomers}</h3>
                </div>
              </div>
            </div>
            )}

            {/* Thống kê đơn hàng */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Đơn hàng</p>
                  <h3 className="font-semibold text-xl">{summary.totalOrders}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Phần mới: Các thẻ truy cập nhanh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>
              </div>
              <p className="mb-4 opacity-90">Thêm, sửa, xóa và quản lý sản phẩm của cửa hàng</p>
              <a 
                href="/admin/products" 
                className="inline-block bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Xem sản phẩm
              </a>
            </div>
            
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <ShoppingBag className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">Quản lý đơn hàng</h2>
              </div>
              <p className="mb-4 opacity-90">Xem và xử lý các đơn đặt hàng mới nhất từ khách hàng</p>
              <a 
                href="/admin/orders" 
                className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Xem đơn hàng
              </a>
            </div>
            
            {user?.MaVaiTro === 0 && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
              </div>
              <p className="mb-4 opacity-90 flex items-center gap-2">Quản lý tài khoản khách hàng và nhân viên của hệ thống
                {typeof summary.pendingVendors === 'number' && summary.pendingVendors > 0 && (
                  <span className="inline-flex items-center justify-center text-xs font-semibold bg-white text-blue-600 rounded-full h-6 px-2">
                    {summary.pendingVendors} đăng ký vendor mới
                  </span>
                )}
              </p>
              <a 
                href="/admin/users" 
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Xem người dùng
              </a>
            </div>
            )}
          </div>

          {/* Phần mới: Thống kê trạng thái đơn hàng */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <LayoutGrid className="h-5 w-5 mr-2 text-gray-600" /> 
              Trạng thái đơn hàng
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-700">Đang chờ xử lý</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{orderStatus.pending}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(orderStatus.pending / maxOrderStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">Đang xử lý</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{orderStatus.processing}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(orderStatus.processing / maxOrderStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 text-indigo-500 mr-2" />
                    <span className="text-sm text-gray-700">Đang giao hàng</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{orderStatus.shipped}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${(orderStatus.shipped / maxOrderStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Đã giao hàng</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{orderStatus.delivered}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(orderStatus.delivered / maxOrderStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-700">Đã hủy</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{orderStatus.cancelled}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(orderStatus.cancelled / maxOrderStatus) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard; 