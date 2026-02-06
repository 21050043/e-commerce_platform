import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';
import { getStatusColor } from '../../../utils/order';

interface OrderDetailModalProps {
    order: any;
    onClose: () => void;
    onStatusChange: (id: number, status: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onStatusChange }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-fade-in relative">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-bold shadow">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                    </span>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Đơn hàng #{order.MaHoaDon}</h2>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.TrangThai)}`}>{order.TrangThai}</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-primary-500 transition absolute top-4 right-4 md:static">
                    <X className="w-7 h-7" />
                </button>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span> Thông tin khách hàng
                        </h3>
                        <p className="text-gray-700"><span className="font-medium">Tên:</span> {order.KhachHang?.TenKhachHang || 'N/A'}</p>
                        <p className="text-gray-700"><span className="font-medium">SĐT:</span> {order.KhachHang?.SoDienThoai || 'N/A'}</p>
                        <p className="text-gray-700"><span className="font-medium">Địa chỉ:</span> {order.DiaChi || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Chi tiết đơn hàng
                        </h3>
                        <p className="text-gray-700"><span className="font-medium">Ngày đặt:</span> {formatDate(order.NgayLap)}</p>
                        <p className="text-gray-700"><span className="font-medium">Thanh toán:</span> {order.PhuongThucTT}</p>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-100 mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Số lượng</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {order.ChiTietHoaDons?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.SanPham?.TenSanPham}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700">{item.SoLuong}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(item.DonGia)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{formatCurrency(item.ThanhTien)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold">
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-right">Tổng cộng:</td>
                                <td className="px-4 py-4 text-right text-xl text-primary-700">{formatCurrency(order.TongTien)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                {order.TrangThai === 'Đã đặt hàng' && (
                    <>
                        <button onClick={() => { onStatusChange(order.MaHoaDon, 'Đang xử lý'); onClose(); }} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Duyệt đơn</button>
                        <button onClick={() => { onStatusChange(order.MaHoaDon, 'Đã hủy'); onClose(); }} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Hủy đơn</button>
                    </>
                )}
                {order.TrangThai === 'Đang xử lý' && (
                    <button onClick={() => { onStatusChange(order.MaHoaDon, 'Đang giao hàng'); onClose(); }} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Giao hàng</button>
                )}
                {order.TrangThai === 'Đang giao hàng' && (
                    <button onClick={() => { onStatusChange(order.MaHoaDon, 'Đã giao hàng'); onClose(); }} className="px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Đã giao hàng</button>
                )}
                <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg">Đóng</button>
            </div>
        </div>
    </div>
);

interface UnprocessedOrdersModalProps {
    orders: any[];
    onClose: () => void;
}

export const UnprocessedOrdersModal: React.FC<UnprocessedOrdersModalProps> = ({ orders, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in text-center">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-500 transition">
                <X className="w-7 h-7" />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-primary-600">
                <AlertCircle className="w-6 h-6" /> Đơn hàng chưa xử lý ({orders.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Giá trị</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(o => (
                            <tr key={o.MaHoaDon} className="hover:bg-primary-50 transition-colors">
                                <td className="px-4 py-3 text-left font-medium">#{o.MaHoaDon}</td>
                                <td className="px-4 py-3 text-left text-gray-600">{o.KhachHang?.TenKhachHang}</td>
                                <td className="px-4 py-3 text-right text-primary-600 font-bold">{formatCurrency(o.TongTien)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={onClose} className="mt-8 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Đóng</button>
        </div>
    </div>
);
