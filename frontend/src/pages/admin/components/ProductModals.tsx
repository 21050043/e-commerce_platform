import React from 'react';
import { X, AlertCircle, Shield, Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import { API_BASE_URL } from '../../../constants/api';
import type { ProductResponse } from '../../../services/product.service';

interface DetailModalProps {
    product: ProductResponse;
    onClose: () => void;
    isVendor: boolean;
}

export const ProductDetailModal: React.FC<DetailModalProps> = ({ product, onClose, isVendor }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative animate-fade-in">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-500 transition">
                <X className="w-7 h-7" />
            </button>
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-primary-100 shadow">
                        {product.HinhAnh ? (
                            <img
                                src={product.HinhAnh.startsWith('http') ? product.HinhAnh : `${API_BASE_URL}${product.HinhAnh}`}
                                alt={product.TenSanPham}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">Không có ảnh</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.TenSanPham}</h2>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Mã sản phẩm:</span>
                        <span>{product.MaSanPham}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Giá:</span>
                        <span className="text-primary-600 font-bold text-lg">{formatCurrency(product.GiaSanPham)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Số lượng:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${product.SoLuong > 10 ? 'bg-green-100 text-green-800' : product.SoLuong > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{product.SoLuong}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Trạng thái:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${product.TrangThaiKiemDuyet === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {product.TrangThaiKiemDuyet === 'SUSPENDED' ? 'TẠM DỪNG' : 'HOẠT ĐỘNG'}
                        </span>
                    </div>
                    {product.TrangThaiKiemDuyet === 'SUSPENDED' && product.LyDoTamDung && (
                        <div>
                            <span className="font-semibold text-gray-700">Lý do:</span>
                            <div className="text-red-600 mt-1 p-2 bg-red-50 rounded-md text-sm">{product.LyDoTamDung}</div>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <span className="font-semibold text-gray-700">Mô tả:</span>
                <div className="text-gray-600 mt-1 whitespace-pre-line text-sm max-h-32 overflow-y-auto">{product.MoTa || 'Không có mô tả.'}</div>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 font-medium transition">Đóng</button>
            </div>
        </div>
    </div>
);

interface SuspendModalProps {
    product: ProductResponse;
    reason: string;
    setReason: (reason: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const SuspendModal: React.FC<SuspendModalProps> = ({ product, reason, setReason, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            <button onClick={onCancel} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
                <X className="w-6 h-6" />
            </button>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-orange-500" />
                    Tạm dừng sản phẩm
                </h2>
                <p className="text-gray-600">Sản phẩm: <span className="font-semibold">{product.TenSanPham}</span></p>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lý do tạm dừng <span className="text-red-500">*</span></label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do tạm dừng sản phẩm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Hủy</button>
                <button onClick={onConfirm} disabled={reason.trim().length < 10} className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-gray-300">Xác nhận</button>
            </div>
        </div>
    </div>
);

interface OutOfStockModalProps {
    products: ProductResponse[];
    onClose: () => void;
}

export const OutOfStockModal: React.FC<OutOfStockModalProps> = ({ products, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in text-center">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary-500 transition">
                <X className="w-7 h-7" />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" /> Sản phẩm hết hàng ({products.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm max-h-96">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Giá</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(p => (
                            <tr key={p.MaSanPham} className="hover:bg-red-50 transition-colors">
                                <td className="px-4 py-3 text-left font-medium text-gray-800">{p.TenSanPham}</td>
                                <td className="px-4 py-3 text-right text-red-600 font-bold">{formatCurrency(p.GiaSanPham)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={onClose} className="mt-8 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium">Đóng bảng cảnh báo</button>
        </div>
    </div>
);
