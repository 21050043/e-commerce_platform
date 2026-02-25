import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/format';

interface UserDetailModalProps {
    user: any;
    orders: any[];
    loading: boolean;
    onClose: () => void;
    onDisable: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, orders, loading, onClose, onDisable }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-primary-500">
                <X className="w-8 h-8" />
            </button>
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.TenKhachHang?.[0] || user.TenNhanVien?.[0]}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.TenKhachHang || user.TenNhanVien}</h2>
                    <p className="text-gray-500">{user.SoDienThoai}</p>
                    <div className="mt-2 text-sm text-gray-600 italic">Địa chỉ cá nhân: {user.DiaChi || 'Chưa cập nhật'}</div>
                </div>
            </div>

            {user.NguoiBan && (
                <div className="mb-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                    <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Thông tin cửa hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-orange-600 font-semibold uppercase text-[10px] tracking-wider mb-1">Tên cửa hàng</p>
                            <p className="text-gray-800 font-bold text-base">{user.NguoiBan.TenCuaHang || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-orange-600 font-semibold uppercase text-[10px] tracking-wider mb-1">Loại hình</p>
                            <p className="text-gray-800 font-medium">{user.NguoiBan.LoaiHinh === 'DOANH_NGHIEP' ? 'Doanh nghiệp' : 'Cá nhân'}</p>
                        </div>
                        <div>
                            <p className="text-orange-600 font-semibold uppercase text-[10px] tracking-wider mb-1">SĐT liên hệ</p>
                            <p className="text-gray-800 font-medium">{user.NguoiBan.SoDienThoaiLienHe}</p>
                        </div>
                        <div>
                            <p className="text-orange-600 font-semibold uppercase text-[10px] tracking-wider mb-1">Email liên hệ</p>
                            <p className="text-gray-800 font-medium">{user.NguoiBan.EmailLienHe || 'Trống'}</p>
                        </div>
                        <div className="md:col-span-2 mt-1">
                            <p className="text-orange-600 font-semibold uppercase text-[10px] tracking-wider mb-1">Địa chỉ kinh doanh</p>
                            <p className="text-gray-800 font-medium leading-relaxed">{user.NguoiBan.DiaChiKinhDoanh}</p>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-bold mb-4 border-b pb-2">Lịch sử đơn hàng</h3>
            {loading ? (
                <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">Người dùng chưa có đơn hàng nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold">Mã đơn</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold">Ngày</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold">Tổng tiền</th>
                                <th className="px-4 py-2 text-center text-xs font-semibold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(o => (
                                <tr key={o.MaHoaDon}>
                                    <td className="px-4 py-2 text-sm">#{o.MaHoaDon}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{formatDate(o.NgayLap)}</td>
                                    <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(o.TongTien)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600">{o.TrangThai}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="mt-8 flex justify-end gap-3">
                <button onClick={onDisable} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">Vô hiệu hóa tài khoản</button>
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">Đóng</button>
            </div>
        </div>
    </div>
);

interface VendorAppsModalProps {
    apps: any[];
    loading: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onClose: () => void;
}

export const VendorAppsModal: React.FC<VendorAppsModalProps> = ({ apps, loading, onApprove, onReject, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-primary-500">
                <X className="w-8 h-8" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-primary-600 flex items-center gap-2">
                <CheckCircle className="w-7 h-7" /> Đăng ký người bán chờ duyệt
            </h2>
            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
            ) : apps.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-medium">Hiện không có đăng ký nào đang chờ.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Cửa hàng</th>
                                <th className="px-4 py-3 text-left">Thông tin liên hệ</th>
                                <th className="px-4 py-3 text-left">Địa chỉ kinh doanh</th>
                                <th className="px-4 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {apps.map(app => (
                                <tr key={app.MaNguoiBan} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 font-bold text-gray-800">{app.TenCuaHang}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        <p>{app.EmailLienHe}</p>
                                        <p>{app.SoDienThoaiLienHe}</p>
                                    </td>
                                    <td className="px-4 py-4 text-sm max-w-[200px] truncate" title={app.DiaChiKinhDoanh}>{app.DiaChiKinhDoanh}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => onApprove(app.MaNguoiBan)} className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition" title="Duyệt"><CheckCircle size={18} /></button>
                                            <button onClick={() => onReject(app.MaNguoiBan)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition" title="Từ chối"><XCircle size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
);
