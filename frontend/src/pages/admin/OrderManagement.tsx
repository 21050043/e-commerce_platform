import { useEffect, useState } from 'react';
import { Eye, Search, RefreshCw, AlertCircle, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllOrders, updateOrderStatus, getOrderById } from '../../services/order.service';
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

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateOrderStatus(id, status);
      handleRefresh();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      setError('Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại sau.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã đặt hàng':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800';
      case 'Đang giao hàng':
        return 'bg-indigo-100 text-indigo-800';
      case 'Đã giao hàng':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
    <AdminLayout>
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
              <AlertCircle className="w-7 h-7 text-red-500" />
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
                className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                        className={`px-4 py-2 rounded-md ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
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

        {/* Chi tiết đơn hàng */}
        {showDetail && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-fade-in relative">
              {/* Header */}
              <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl font-bold shadow">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Đơn hàng #{selectedOrder.MaHoaDon}</h2>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.TrangThai)}`}>{selectedOrder.TrangThai}</span>
                  </div>
                </div>
                  <button
                    onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-pink-500 transition absolute top-4 right-4 md:static md:top-auto md:right-auto"
                  title="Đóng"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
              </div>
              {/* Thông tin đơn hàng */}
              <div className="p-6 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Thông tin khách hàng
                    </h3>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">Tên:</span> {selectedOrder.KhachHang?.TenKhachHang || 'Không có'}</div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">SĐT:</span> {selectedOrder.KhachHang?.SoDienThoai || 'Không có'}</div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">Địa chỉ giao hàng:</span> {selectedOrder.DiaChi || 'Không có'}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" /></svg>
                      Thông tin đơn hàng
                    </h3>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">Mã đơn:</span> #{selectedOrder.MaHoaDon}</div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">Ngày đặt:</span> {formatDate(selectedOrder.NgayLap)}</div>
                    <div className="flex items-center gap-2 mb-1 text-gray-700"><span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.PhuongThucTT}</div>
                  </div>
                </div>
              </div>
              {/* Bảng sản phẩm */}
              <div className="p-6 pt-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                  Chi tiết sản phẩm
                </h3>
                <div className="overflow-x-auto rounded-lg shadow mt-2">
                  <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {selectedOrder.ChiTietHoaDons && selectedOrder.ChiTietHoaDons.length > 0 ? (
                        selectedOrder.ChiTietHoaDons.map((item, index) => (
                          <tr key={item.MaChiTiet || `${item.MaSanPham}-${index}`} className="hover:bg-pink-50 transition">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-14 w-14">
                                  <img 
                                    className="h-14 w-14 rounded-lg object-cover border border-gray-200 shadow-sm" 
                                    src={item.SanPham?.HinhAnh 
                                      ? (item.SanPham.HinhAnh.startsWith('/uploads') 
                                          ? `http://localhost:5000${item.SanPham.HinhAnh}`
                                          : item.SanPham.HinhAnh)
                                      : "https://via.placeholder.com/56x56?text=SP"
                                    } 
                                    alt={item.SanPham?.TenSanPham || "Sản phẩm"}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "https://via.placeholder.com/56x56?text=SP";
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="text-base font-semibold text-gray-900">
                                    {item.SanPham?.TenSanPham || 'Sản phẩm không xác định'}
                                  </div>
                                  <div className="text-xs text-gray-500">Mã: {item.MaSanPham}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">{item.SoLuong}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">{formatCurrency(item.DonGia)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-base font-bold text-pink-600">{formatCurrency(item.ThanhTien)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                            Không có thông tin chi tiết sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right text-base font-semibold text-gray-700">Tổng tiền:</td>
                        <td className="px-4 py-4 text-right text-xl font-bold text-pink-600">{formatCurrency(selectedOrder.TongTien)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              {/* Footer */}
              <div className="p-6 border-t bg-gray-50 flex flex-col md:flex-row md:justify-end gap-3">
                {/* Nếu trạng thái là Đã đặt hàng: Hiện nút Duyệt đơn và Huỷ đơn */}
                {selectedOrder.TrangThai === 'Đã đặt hàng' && (
                  <>
                    <button
                      onClick={async () => { await handleStatusChange(selectedOrder.MaHoaDon, 'Đang xử lý'); handleCloseDetail(); }}
                      className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition"
                    >
                      Duyệt đơn
                    </button>
                    <button
                      onClick={async () => { await handleStatusChange(selectedOrder.MaHoaDon, 'Đã hủy'); handleCloseDetail(); }}
                      className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition"
                    >
                      Huỷ đơn
                    </button>
                  </>
                )}
                {/* Nếu trạng thái là Đang xử lý: Hiện nút Giao hàng */}
                {selectedOrder.TrangThai === 'Đang xử lý' && (
                  <button
                    onClick={async () => { await handleStatusChange(selectedOrder.MaHoaDon, 'Đang giao hàng'); handleCloseDetail(); }}
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
                  >
                    Giao hàng
                  </button>
                )}
                {/* Nếu trạng thái là Đang giao hàng: Hiện nút Đã giao hàng */}
                {selectedOrder.TrangThai === 'Đang giao hàng' && (
                  <button
                    onClick={async () => { await handleStatusChange(selectedOrder.MaHoaDon, 'Đã giao hàng'); handleCloseDetail(); }}
                    className="px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition"
                  >
                    Đã giao hàng
                  </button>
                )}
                {/* Nếu trạng thái là Đã giao hàng hoặc Đã hủy: chỉ hiện nút Đóng */}
                <button
                  onClick={handleCloseDetail}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-pink-100 hover:text-pink-600 font-medium transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnprocessed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in">
              <button onClick={() => setShowUnprocessed(false)} className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 transition">
                <X className="w-7 h-7" />
              </button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" /> Đơn hàng chưa xử lý ({unprocessedOrders.length})
              </h2>
              {unprocessedOrders.length === 0 ? (
                <div className="text-gray-500 italic">Không có đơn hàng nào chưa xử lý.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow mt-2">
                  <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đặt</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {unprocessedOrders.map(order => (
                        <tr key={order.MaHoaDon} className="hover:bg-pink-50 transition">
                          <td className="px-4 py-2 font-medium text-gray-800">#{order.MaHoaDon}</td>
                          <td className="px-4 py-2 text-gray-600">{order.KhachHang?.TenKhachHang || 'Không có tên'}</td>
                          <td className="px-4 py-2 text-gray-600">{order.NgayLap ? formatDate(order.NgayLap) : 'Không có'}</td>
                          <td className="px-4 py-2 text-right text-pink-600 font-semibold">{formatCurrency(order.TongTien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement; 