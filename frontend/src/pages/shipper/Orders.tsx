import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Eye, Package, Truck, XCircle } from 'lucide-react';
import ShipperLayout from '../../layouts/ShipperLayout';
import {
  getShipperOrders,
  getShipperOrderById,
  updateShipperOrderStatus,
  type ShipperOrderResponse,
} from '../../services/shipper-order.service';
import { formatCurrency, formatDate } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

const STATUS_OPTIONS = ['all', 'Đang giao hàng', 'Đã giao hàng'];

const STATUS_BADGES: Record<string, string> = {
  'Đang giao hàng': 'bg-orange-100 text-orange-700',
  'Đã giao hàng': 'bg-green-100 text-green-700',
};

const ShipperOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<ShipperOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Đang giao hàng');
  const [selectedOrder, setSelectedOrder] = useState<ShipperOrderResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getShipperOrders(page, 10, selectedStatus);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể tải đơn hàng shipper', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openOrder = async (orderId: number) => {
    setDetailLoading(true);
    try {
      const response = await getShipperOrderById(orderId);
      setSelectedOrder(response);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể xem chi tiết đơn hàng', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrder = () => setSelectedOrder(null);

  const markDelivered = async (orderId: number) => {
    if (!window.confirm('Xác nhận đơn hàng đã giao thành công?')) return;
    setActionLoading(true);
    try {
      await updateShipperOrderStatus(orderId, 'Đã giao hàng');
      addToast('Cập nhật trạng thái thành công', 'success');
      setSelectedOrder(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, selectedStatus, refreshKey]);

  return (
    <ShipperLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mb-2">Khu vực Shipper</p>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách đơn giao hàng</h1>
            <p className="text-sm text-gray-600 mt-2">Quản lý đơn đang giao và hoàn tất giao hàng.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedStatus === status
                  ? 'bg-secondary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'Tất cả' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-gray-600">
              Đang tải đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-gray-600">
              Không tìm thấy đơn hàng nào phù hợp.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.MaDonHangNB} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">#{order.MaDonHangNB}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[order.TrangThai] || 'bg-gray-100 text-gray-700'}`}>
                        {order.TrangThai}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">Mã hóa đơn: #{order.HoaDon?.MaHoaDon || '—'}</p>
                    <p className="text-sm text-gray-600">Ngày tạo: {order.HoaDon?.NgayLap ? formatDate(order.HoaDon.NgayLap) : '—'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(order.TongTienNB)}</span>
                    <button
                      onClick={() => openOrder(order.MaDonHangNB)}
                      className="inline-flex items-center gap-2 rounded-full bg-secondary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary-700"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              onClick={closeOrder}
              className="absolute top-4 right-4 rounded-full bg-gray-100 p-3 text-gray-500 transition hover:bg-gray-200"
            >
              <XCircle size={20} />
            </button>

            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{selectedOrder.MaDonHangNB}</h2>
                  <p className="text-sm text-gray-500">Mã hóa đơn: #{selectedOrder.HoaDon?.MaHoaDon || '—'}</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${STATUS_BADGES[selectedOrder.TrangThai] || 'bg-gray-100 text-gray-700'}`}>
                  <Clock size={16} />
                  {selectedOrder.TrangThai}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Khách hàng</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.HoaDon?.KhachHang?.TenKhachHang || '—'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.HoaDon?.KhachHang?.SoDienThoai || '—'}</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedOrder.HoaDon?.DiaChi || '—'}</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Thanh toán</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.HoaDon?.PhuongThucTT || '—'}</p>
                  <p className="text-sm text-gray-600 mt-4">Tổng đơn: {formatCurrency(selectedOrder.TongTienNB)}</p>
                  <p className="text-sm text-gray-600">Ngày: {selectedOrder.HoaDon?.NgayLap ? formatDate(selectedOrder.HoaDon.NgayLap) : '—'}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Sản phẩm</p>
                    <p className="text-sm text-gray-600">{selectedOrder.HoaDon?.ChiTietHoaDons?.length || 0} món</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{selectedOrder.HoaDon?.TongTien ? formatCurrency(selectedOrder.HoaDon.TongTien) : '—'}</span>
                </div>
                <div className="space-y-3">
                  {selectedOrder.HoaDon?.ChiTietHoaDons?.map((item) => (
                    <div key={item.MaChiTiet} className="flex items-center gap-4 rounded-3xl border border-gray-100 p-4">
                      <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                        {item.SanPham?.HinhAnh ? (
                          <img
                            src={item.SanPham.HinhAnh.startsWith('/uploads') ? `http://localhost:5000${item.SanPham.HinhAnh}` : item.SanPham.HinhAnh}
                            alt={item.SanPham.TenSanPham}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.SanPham?.TenSanPham || 'Sản phẩm'}</p>
                        <p className="text-sm text-gray-500">{item.SoLuong} × {formatCurrency(item.DonGia)}</p>
                      </div>
                      <div className="text-right font-bold text-gray-900">{formatCurrency(item.ThanhTien)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  <p className="font-semibold text-gray-900">Ghi chú</p>
                  <p>{selectedOrder.GhiChu || 'Không có ghi chú thêm'}</p>
                </div>
                {selectedOrder.TrangThai === 'Đang giao hàng' ? (
                  <button
                    onClick={() => markDelivered(selectedOrder.MaDonHangNB)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    {actionLoading ? 'Đang cập nhật...' : 'Đã giao hàng'}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
                    <Truck size={18} />
                    Đơn hàng đã hoàn thành
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ShipperLayout>
  );
};

export default ShipperOrders;
