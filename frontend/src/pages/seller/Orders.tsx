import { useEffect, useState, useCallback } from 'react';
import {
    Search, RefreshCw, AlertCircle, Eye, ChevronDown, ChevronUp,
    Package, Clock, CheckCircle, Truck, XCircle
} from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import {
    getSellerOrders,
    updateSellerOrderStatus,
    getSellerOrderById,
    type SellerOrderResponse,
} from '../../services/seller-order.service';
import { formatCurrency, formatDate } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    'Đã đặt hàng': { label: 'Đã đặt hàng', color: 'bg-blue-100 text-blue-700', icon: Clock },
    'Đang xử lý': { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Package },
    'Đang giao hàng': { label: 'Đang giao hàng', color: 'bg-orange-100 text-orange-700', icon: Truck },
    'Đã giao hàng': { label: 'Đã giao hàng', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'Đã hủy': { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const NEXT_STATUS: Record<string, string[]> = {
    'Đã đặt hàng': ['Đang xử lý', 'Đã hủy'],
    'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
    'Đang giao hàng': ['Đã giao hàng'],
    'Đã giao hàng': [],
    'Đã hủy': [],
};

const ALL_STATUSES = ['all', ...Object.keys(STATUS_CONFIG)];

// ─── OrderDetailPanel ─────────────────────────────────────────────────────────

interface OrderDetailPanelProps {
    order: SellerOrderResponse;
    onClose: () => void;
    onStatusChange: (id: number, status: string) => Promise<void>;
}

const OrderDetailPanel = ({ order, onClose, onStatusChange }: OrderDetailPanelProps) => {
    const [updating, setUpdating] = useState(false);
    const nextStatuses = NEXT_STATUS[order.TrangThai] ?? [];
    const kh = order.HoaDon?.KhachHang;
    const items = order.HoaDon?.ChiTietHoaDons ?? [];

    const handleStatusClick = async (status: string) => {
        setUpdating(true);
        await onStatusChange(order.MaDonHangNB, status);
        setUpdating(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Đơn hàng #{order.HoaDon?.MaHoaDon}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Sub-order #{order.MaDonHangNB} &bull; {order.HoaDon?.NgayLap ? formatDate(order.HoaDon.NgayLap) : '—'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <XCircle size={22} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Khách hàng */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Thông tin khách hàng
                        </h3>
                        <p className="font-semibold text-gray-800">{kh?.TenKhachHang || '—'}</p>
                        <p className="text-sm text-gray-600">{kh?.SoDienThoai || '—'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Địa chỉ giao:</span> {order.HoaDon?.DiaChi}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Thanh toán:</span> {order.HoaDon?.PhuongThucTT}
                        </p>
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Sản phẩm trong đơn ({items.length})
                        </h3>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.MaChiTiet} className="flex items-center gap-4 p-3 border rounded-xl">
                                    <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {item.SanPham?.HinhAnh ? (
                                            <img
                                                src={item.SanPham.HinhAnh.startsWith('/uploads')
                                                    ? `http://localhost:5000${item.SanPham.HinhAnh}`
                                                    : item.SanPham.HinhAnh}
                                                alt={item.SanPham.TenSanPham}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{item.SanPham?.TenSanPham}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatCurrency(item.DonGia)} × {item.SoLuong}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-800 shrink-0">
                                        {formatCurrency(item.ThanhTien)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tổng tiền */}
                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="font-semibold text-gray-700">Doanh thu của bạn</span>
                        <span className="text-xl font-bold text-secondary-600">
                            {formatCurrency(order.TongTienNB)}
                        </span>
                    </div>

                    {/* Cập nhật trạng thái */}
                    {nextStatuses.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Cập nhật trạng thái
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {nextStatuses.map((s) => {
                                    const cfg = STATUS_CONFIG[s];
                                    const Icon = cfg.icon;
                                    const isCancel = s === 'Đã hủy';
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusClick(s)}
                                            disabled={updating}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                        ${isCancel
                                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                                    : 'bg-secondary-50 text-secondary-700 border border-secondary-200 hover:bg-secondary-100'
                                                } disabled:opacity-50`}
                                        >
                                            <Icon size={14} />
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SellerOrders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState<SellerOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<SellerOrderResponse | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getSellerOrders(currentPage, 10, selectedStatus);
            setOrders(result.orders);
            setTotalPages(result.totalPages);
            setTotalOrders(result.total);
        } catch {
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedStatus, refreshTrigger]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleStatusChange = async (donHangNBId: number, newStatus: string) => {
        try {
            await updateSellerOrderStatus(donHangNBId, newStatus);
            showToast('Cập nhật trạng thái thành công', 'success');
            setRefreshTrigger(t => t + 1);
            // Cập nhật order trong modal
            setSelectedOrder(prev => prev && prev.MaDonHangNB === donHangNBId
                ? { ...prev, TrangThai: newStatus as any }
                : prev
            );
        } catch (err: any) {
            showToast(err?.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
        }
    };

    const handleViewDetail = async (order: SellerOrderResponse) => {
        try {
            const detail = await getSellerOrderById(order.MaDonHangNB);
            setSelectedOrder(detail);
        } catch {
            setSelectedOrder(order);
        }
    };

    // Lọc client-side theo search term
    const filteredOrders = orders.filter(o => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            o.HoaDon?.MaHoaDon?.toString().includes(term) ||
            o.HoaDon?.KhachHang?.TenKhachHang?.toLowerCase().includes(term) ||
            o.HoaDon?.KhachHang?.SoDienThoai?.includes(term) ||
            o.TrangThai.toLowerCase().includes(term)
        );
    });

    const unprocessedCount = orders.filter(o => o.TrangThai === 'Đã đặt hàng').length;

    return (
        <SellerLayout>
            <div className="p-1">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                        {unprocessedCount > 0 && (
                            <span className="relative inline-flex">
                                <AlertCircle className="w-6 h-6 text-orange-500" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                    {unprocessedCount}
                                </span>
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">Tổng {totalOrders} đơn hàng</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo mã đơn, tên khách..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300"
                            />
                        </div>
                        {/* Status filter */}
                        <select
                            value={selectedStatus}
                            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300"
                        >
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>
                                    {s === 'all' ? 'Tất cả trạng thái' : s}
                                </option>
                            ))}
                        </select>
                        {/* Refresh */}
                        <button
                            onClick={() => setRefreshTrigger(t => t + 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-600 transition"
                        >
                            <RefreshCw size={15} />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500">Không có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Doanh thu', 'Trạng thái', 'Thao tác'].map(col => (
                                            <th
                                                key={col}
                                                className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map(order => {
                                        const cfg = STATUS_CONFIG[order.TrangThai] ?? STATUS_CONFIG['Đã đặt hàng'];
                                        const Icon = cfg.icon;
                                        return (
                                            <tr key={order.MaDonHangNB} className="hover:bg-gray-50 transition">
                                                <td className="py-4 px-4">
                                                    <span className="font-medium text-gray-800">#{order.HoaDon?.MaHoaDon}</span>
                                                    <span className="text-xs text-gray-400 ml-1">(#{order.MaDonHangNB})</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="font-medium text-gray-800 text-sm">
                                                        {order.HoaDon?.KhachHang?.TenKhachHang || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {order.HoaDon?.KhachHang?.SoDienThoai || ''}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {order.HoaDon?.NgayLap ? formatDate(order.HoaDon.NgayLap) : '—'}
                                                </td>
                                                <td className="py-4 px-4 font-semibold text-gray-800 text-sm">
                                                    {formatCurrency(order.TongTienNB)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                                                        <Icon size={11} />
                                                        {order.TrangThai}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => handleViewDetail(order)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg text-xs font-medium hover:bg-secondary-100 transition"
                                                    >
                                                        <Eye size={13} />
                                                        Chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition
                  ${currentPage === i + 1
                                        ? 'bg-secondary-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailPanel
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </SellerLayout>
    );
};

export default SellerOrders;
