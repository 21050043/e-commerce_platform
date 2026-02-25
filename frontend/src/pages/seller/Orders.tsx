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

// ─── Action labels for decisions ─────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; description: string; color: string; icon: React.ElementType }> = {
    'Đang xử lý': {
        label: 'Xác nhận & Chuẩn bị hàng',
        description: 'Bắt đầu quy trình đóng gói sản phẩm cho khách',
        color: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100',
        icon: Package
    },
    'Đang giao hàng': {
        label: 'Giao cho đơn vị vận chuyển',
        description: 'Đơn hàng đã sẵn sàng và được gởi cho nhân viên giao hàng',
        color: 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100',
        icon: Truck
    },
    'Đã giao hàng': {
        label: 'Xác nhận đã giao thành công',
        description: 'Đánh dấu đơn hàng đã đến tay khách hàng an toàn',
        color: 'bg-green-600 text-white hover:bg-green-700 shadow-green-100',
        icon: CheckCircle
    },
    'Đã hủy': {
        label: 'Hủy đơn hàng này',
        description: 'Ngừng xử lý đơn hàng (hết hàng, khách đổi ý, v.v.)',
        color: 'bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 shadow-none',
        icon: XCircle
    },
};

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
        if (status === 'Đã hủy' && !window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
        setUpdating(true);
        await onStatusChange(order.MaDonHangNB, status);
        setUpdating(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Chi tiết đơn hàng
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[order.TrangThai]?.color || 'bg-gray-100'}`}>
                                {order.TrangThai}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                            Mã hóa đơn: <span className="text-gray-600">#{order.HoaDon?.MaHoaDon}</span> &bull; {order.HoaDon?.NgayLap ? formatDate(order.HoaDon.NgayLap) : '—'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 active:scale-90"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Tiến trình quyết định (Action Section) - Đưa lên đầu để nổi bật */}
                    {nextStatuses.length > 0 && (
                        <div className="bg-gradient-to-br from-secondary-50 to-white border border-secondary-100 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-xs font-black text-secondary-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                                Quyết định của bạn
                            </h3>
                            <div className="grid gap-3">
                                {nextStatuses.map((s) => {
                                    const action = ACTION_CONFIG[s];
                                    if (!action) return null;
                                    const Icon = action.icon;
                                    const isCancel = s === 'Đã hủy';

                                    return (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusClick(s)}
                                            disabled={updating}
                                            className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 ${action.color}`}
                                        >
                                            <div className={`p-3 rounded-xl ${isCancel ? 'bg-red-50 text-red-500' : 'bg-white/20 text-white'} transition-colors`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm leading-tight">{action.label}</p>
                                                <p className={`text-[11px] mt-0.5 opacity-80 ${isCancel ? 'text-gray-500' : 'text-white/80'}`}>
                                                    {action.description}
                                                </p>
                                            </div>
                                            {!isCancel && (
                                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CheckCircle size={18} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Khách hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Khách hàng & Liên hệ
                            </h3>
                            <div className="space-y-2">
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">
                                        {(kh?.TenKhachHang || 'K')[0]}
                                    </span>
                                    {kh?.TenKhachHang || '—'}
                                </p>
                                <p className="text-sm text-gray-600 pl-10 font-medium">{kh?.SoDienThoai || '—'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Vận chuyển & Thanh toán
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Địa chỉ</span>
                                    {order.HoaDon?.DiaChi}
                                </p>
                                <div className="flex items-center gap-2 text-gray-600 font-medium mt-3">
                                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-100 text-[10px] shadow-sm">
                                        {order.HoaDon?.PhuongThucTT}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            Danh sách sản phẩm
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px]">{items.length} món</span>
                        </h3>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.MaChiTiet} className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-secondary-200 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-50 group-hover:scale-105 transition-transform duration-300">
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
                                                <Package size={24} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 group-hover:text-secondary-600 transition-colors truncate">{item.SanPham?.TenSanPham}</p>
                                        <p className="text-xs text-gray-400 mt-1 font-semibold tracking-wide">
                                            {formatCurrency(item.DonGia)} × {item.SoLuong}
                                        </p>
                                    </div>
                                    <p className="font-black text-gray-900 tracking-tight shrink-0">
                                        {formatCurrency(item.ThanhTien)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tổng tiền */}
                    <div className="bg-gray-900 rounded-3xl p-6 text-white flex justify-between items-center shadow-lg shadow-gray-200">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Doanh thu dự kiến</p>
                            <p className="text-xs text-gray-500 italic">Áp dụng cho đơn hàng con #{order.MaDonHangNB}</p>
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-secondary-400">
                            {formatCurrency(order.TongTienNB)}
                        </span>
                    </div>
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
