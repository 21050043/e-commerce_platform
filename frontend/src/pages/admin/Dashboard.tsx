import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Users, Package, ShoppingBag, LayoutGrid, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ArrowRight, DollarSign
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { formatCurrency } from '../../utils/format';
import Skeleton from '../../components/ui/Skeleton';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

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
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/admin', message: 'Vui lòng đăng nhập để truy cập trang quản trị' } });
      return;
    }

    if (user && user.MaVaiTro !== 0 && user.MaVaiTro !== 1 && user.MaVaiTro !== 3) {
      navigate('/', { state: { message: 'Bạn không có quyền truy cập trang quản trị' } });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
        setSummary(response.data);

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

  const maxOrderStatus = Math.max(
    orderStatus.pending,
    orderStatus.processing,
    orderStatus.shipped,
    orderStatus.delivered,
    orderStatus.cancelled,
    1
  );


  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-1"
      >
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
            <p className="text-gray-500 mt-1 font-medium italic">Dashboard điều hành dành cho {(user?.MaVaiTro === 0 ? 'Quản trị viên' : 'Nhân viên')}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tổng doanh thu</p>
              <p className="text-lg font-black text-primary-600 tracking-tighter">{formatCurrency(summary.revenue)}</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
            <AlertTriangle className="shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <Skeleton variant="circle" height={48} width={48} className="mb-4" />
                <Skeleton height={14} width="40%" className="mb-2" />
                <Skeleton height={24} width="60%" />
              </div>
            ))
          ) : (
            <>
              {/* Sản phẩm - Xanh dương */}
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-200/50 transition-all group">
                <Link to="/admin/products">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Sản phẩm</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{summary.totalProducts}</h3>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>

              {/* Danh mục - Vàng */}
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-yellow-200/50 transition-all group">
                <Link to="/admin/products">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Danh mục</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{summary.totalCategories}</h3>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>

              {/* Khách hàng - Xanh lá */}
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-200/50 transition-all group">
                <Link to="/admin/users">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Khách hàng</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{summary.totalCustomers}</h3>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>

              {/* Đơn hàng - Tím */}
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-purple-200/50 transition-all group">
                <Link to="/admin/orders">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Đơn hàng</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{summary.totalOrders}</h3>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutGrid size={20} className="text-primary-500" />
              Lối tắt quản lý
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/admin/products"
                className="group p-6 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 active:scale-[0.98] transition-all"
              >
                <Package className="mb-4 opacity-80 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-black mb-2">Kho hàng</h3>
                <p className="text-sm opacity-80 font-medium mb-4 italic">Cập nhật sản phẩm & Danh mục mới nhất cho sàn.</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                  Truy cập ngay <ArrowRight size={12} />
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="group p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="mb-4 opacity-80 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-black mb-2">Đơn đặt hàng</h3>
                <p className="text-sm opacity-80 font-medium mb-4 italic">Kiểm tra & theo dõi luồng giao nhận toàn hệ thống.</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                  Truy cập ngay <ArrowRight size={12} />
                </div>
              </Link>

              {user?.MaVaiTro === 0 && (
                <Link
                  to="/admin/users"
                  className="group md:col-span-2 p-6 rounded-3xl bg-white border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                      <Users size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Quản lý định danh</h3>
                      <p className="text-sm text-gray-500 font-medium italic">Khách hàng, Nhân viên & Phê duyệt nhà bán hàng.</p>
                    </div>
                  </div>
                  {typeof summary.pendingVendors === 'number' && summary.pendingVendors > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full animate-bounce">
                      {summary.pendingVendors} yêu cầu phê duyệt
                    </span>
                  )}
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" />
              Tình trạng đơn hàng
            </h2>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-fit">
              <div className="space-y-6">
                {[
                  { label: 'Chờ xử lý', val: orderStatus.pending, color: 'bg-yellow-500', icon: Clock },
                  { label: 'Đang xử lý', val: orderStatus.processing, color: 'bg-blue-500', icon: TrendingUp },
                  { label: 'Đang giao', val: orderStatus.shipped, color: 'bg-indigo-500', icon: ShoppingBag },
                  { label: 'Thành công', val: orderStatus.delivered, color: 'bg-green-500', icon: CheckCircle },
                  { label: 'Đã hủy', val: orderStatus.cancelled, color: 'bg-red-500', icon: AlertTriangle },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <s.icon size={14} className="text-gray-400" />
                        {s.label}
                      </div>
                      <span className="text-sm font-black text-gray-900">{s.val}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.val / maxOrderStatus) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className={`h-full ${s.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default Dashboard;