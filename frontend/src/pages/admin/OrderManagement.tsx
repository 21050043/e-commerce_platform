import { useEffect, useState } from 'react';
import { Eye, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import AdminLayout from '../../layouts/AdminLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import { getStatusColor } from '../../utils/order';
import { OrderDetailModal, UnprocessedOrdersModal } from './components/OrderModals';
import { getAllOrders, getOrderById } from '../../services/order.service';
import type { OrderResponse } from '../../services/order.service';

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [sortType, setSortType] = useState('newest');
  const [showUnprocessed, setShowUnprocessed] = useState(false);

  const location = useLocation();
  const isSellerPath = location.pathname.startsWith('/seller');
  const Layout = isSellerPath ? SellerLayout : AdminLayout;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await getAllOrders(currentPage, 10);
        setOrders(response.orders);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleShowDetail = async (order: OrderResponse) => {
    try {
      // Log dữ liệu để kiểm tra
      console.log('Chi tiết đơn hàng ban đầu:', order);

      // Tải lại chi tiết đơn hàng để đảm bảo có đầy đủ dữ liệu
      const orderDetail = await getOrderById(order.MaHoaDon);
      console.log('Chi tiết đơn hàng sau khi tải lại:', orderDetail);
      console.log('Chi tiết sản phẩm:', orderDetail.ChiTietHoaDons);

      setSelectedOrder(orderDetail);
      setShowDetail(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
      setError('Đã xảy ra lỗi khi tải chi tiết đơn hàng');
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
  };

  // handleStatusChange bị loại bỏ vì Admin không còn quyền cập nhật trạng thái đơn hàng master.
  // Mỗi đơn hàng con (sub-order) sẽ được người bán tự quản lý.

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const filterOrdersBySearch = (orders: OrderResponse[], searchTerm: string) => {
    if (!searchTerm.trim()) return orders;
    const lower = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.MaHoaDon.toString().includes(lower) ||
      (order.KhachHang?.TenKhachHang?.toLowerCase().includes(lower) ?? false) ||
      (order.KhachHang?.SoDienThoai?.includes(lower) ?? false) ||
      (order.TrangThai?.toLowerCase().includes(lower) ?? false)
    );
  };

  const filteredOrders = filterOrdersBySearch(
    selectedStatus === 'all' ? orders : orders.filter(order => order.TrangThai === selectedStatus),
    searchTerm
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortType) {
      case 'newest':
        return new Date(b.NgayLap).getTime() - new Date(a.NgayLap).getTime();
      case 'oldest':
        return new Date(a.NgayLap).getTime() - new Date(b.NgayLap).getTime();
      case 'total-asc':
        return a.TongTien - b.TongTien;
      case 'total-desc':
        return b.TongTien - a.TongTien;
      case 'status':
        return a.TrangThai.localeCompare(b.TrangThai, 'vi', { sensitivity: 'base' });
      case 'name-asc':
        return (a.KhachHang?.TenKhachHang || '').localeCompare(b.KhachHang?.TenKhachHang || '', 'vi', { sensitivity: 'base' });
      case 'name-desc':
        return (b.KhachHang?.TenKhachHang || '').localeCompare(a.KhachHang?.TenKhachHang || '', 'vi', { sensitivity: 'base' });
      default:
        return 0;
    }
  });

  const unprocessedOrders = orders.filter(o => o.TrangThai === 'Đã đặt hàng');

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý đơn hàng</h1>
            {/* Nút badge đơn hàng chưa xử lý */}
            <button
              className="relative focus:outline-none"
              onClick={() => setShowUnprocessed(true)}
              title="Xem đơn hàng chưa xử lý"
            >
              <AlertCircle className="w-7 h-7 text-primary-500" />
              {unprocessedOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {unprocessedOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm đơn hàng..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã đặt hàng">Đã đặt hàng</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
              <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                className="border rounded-md px-3 py-2"
                title="Sắp xếp"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="total-asc">Tổng tiền tăng dần</option>
                <option value="total-desc">Tổng tiền giảm dần</option>
                <option value="status">Theo trạng thái</option>
                <option value="name-asc">Tên khách hàng A-Z</option>
                <option value="name-desc">Tên khách hàng Z-A</option>
              </select>
              <button
                onClick={handleRefresh}
                className="bg-primary-50 text-primary-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Mã đơn
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Không có đơn hàng nào
                        </td>
                      </tr>
                    ) : (
                      sortedOrders.map((order) => (
                        <tr key={order.MaHoaDon} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.MaHoaDon}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.KhachHang?.TenKhachHang || 'Không có tên'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.KhachHang?.SoDienThoai || 'Không có SĐT'}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                            {order.NgayLap ? formatDate(order.NgayLap) : 'Không có'}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.TongTien)}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(order.TrangThai)}`}>{order.TrangThai}</span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleShowDetail(order)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex space-x-2" aria-label="Pagination">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-md ${currentPage === index + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {showDetail && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={handleCloseDetail}
          />
        )}

        {showUnprocessed && (
          <UnprocessedOrdersModal orders={unprocessedOrders} onClose={() => setShowUnprocessed(false)} />
        )}
      </div>
    </Layout>
  );
};

export default OrderManagement; 