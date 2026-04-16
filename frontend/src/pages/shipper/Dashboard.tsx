import { useEffect, useState } from 'react';
import { TrendingUp, Truck, CheckCircle, DollarSign, Star, Calendar } from 'lucide-react';
import ShipperLayout from '../../layouts/ShipperLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface ShipperStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  averageRating: number;
  joinDate: string;
  shipperInfo?: {
    name: string;
    phone: string;
    area: string;
    vehicle: string;
    status: string;
  }
}

const ShipperDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<ShipperStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/shipper/stats');
      setStats(response.data);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể tải thống kê', 'error');
      // Fallback mock data nếu lỗi
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        averageRating: 0,
        joinDate: new Date().toLocaleDateString('vi-VN'),
      });
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = 'bg-white p-4 rounded-lg shadow hover:shadow-md transition';
  const statValue = 'text-3xl font-bold text-primary-600';
  const statLabel = 'text-gray-600 text-sm mt-2';

  if (loading) {
    return (
      <ShipperLayout>
        <div className="py-8 flex justify-center items-center">
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </ShipperLayout>
    );
  }

  if (!stats) {
    return (
      <ShipperLayout>
        <div className="py-8 flex justify-center items-center">
          <p className="text-gray-600">Không thể tải thống kê. Vui lòng thử lại.</p>
        </div>
      </ShipperLayout>
    );
  }

  return (
    <ShipperLayout>
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điều Khiển Shipper</h1>
            <p className="text-gray-600">Chào mừng, {user?.TenKhachHang} 👋</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Tổng Đơn Hàng */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Tổng Đơn Hàng</p>
                  <p className={statValue}>{stats.totalOrders}</p>
                </div>
                <Truck className="h-10 w-10 text-blue-500 opacity-80" />
              </div>
            </div>

            {/* Đã Giao */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Đơn Giao Thành Công</p>
                  <p className={statValue}>{stats.completedOrders}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500 opacity-80" />
              </div>
            </div>

            {/* Đang Giao */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Đang Giao</p>
                  <p className={statValue}>{stats.pendingOrders}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-500 opacity-80" />
              </div>
            </div>

            {/* Tổng Thu Nhập */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Tổng Thu Nhập</p>
                  <p className={statValue}>{(stats.totalEarnings / 1000000).toFixed(1)}M₫</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600 opacity-80" />
              </div>
            </div>

            {/* Đánh Giá Trung Bình */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Đánh Giá</p>
                  <div className="flex items-center gap-1 mt-2">
                    <p className={statValue}>{stats.averageRating}</p>
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <Star className="h-10 w-10 text-yellow-400 opacity-80" />
              </div>
            </div>

            {/* Ngày Tham Gia */}
            <div className={containerClasses}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabel}>Tham Gia Từ</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{stats.joinDate}</p>
                </div>
                <Calendar className="h-10 w-10 text-purple-500 opacity-80" />
              </div>
            </div>
          </div>

          {/* Info Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thống Kê Chi Tiết</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Chỉ Số</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Giá Trị</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Mô Tả</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Tổng Đơn Hàng</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{stats.totalOrders}</td>
                    <td className="px-4 py-3 text-gray-600">Tổng số đơn hàng nhận được</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Đơn Giao Thành Công</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{stats.completedOrders}</td>
                    <td className="px-4 py-3 text-gray-600">Số đơn hàng đã giao thành công</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Tỷ Lệ Thành Công</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">Phần trăm đơn giao thành công</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Đang Giao</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">{stats.pendingOrders}</td>
                    <td className="px-4 py-3 text-gray-600">Số đơn hàng đang thực hiện</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Tổng Thu Nhập</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">
                      {stats.totalEarnings.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3 text-gray-600">Tổng hoa hồng nhận được</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Thu Nhập Trung Bình</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {Math.round(stats.totalEarnings / stats.totalOrders).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3 text-gray-600">Trung bình mỗi đơn hàng</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">Đánh Giá Trung Bình</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 font-semibold">{stats.averageRating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">Điểm đánh giá từ khách hàng</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">💡 Mẹo Tăng Thu Nhập</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✅ Giao hàng đúng hạn để duy trì điểm đánh giá cao</li>
              <li>✅ Cập nhật thường xuyên tình trạng đơn hàng</li>
              <li>✅ Liên hệ khách hàng khi có vấn đề</li>
              <li>✅ Chụp ảnh xác nhận khi giao hàng</li>
              <li>✅ Giữ phương tiện trong tình trạng tốt và an toàn</li>
            </ul>
          </div>
        </div>
      </div>
    </ShipperLayout>
  );
};

export default ShipperDashboard;
