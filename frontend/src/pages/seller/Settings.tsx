import { useState, useEffect } from 'react';
import { Save, Loader, Store, ShieldCheck, Mail, Phone, MapPin, Palmtree, Play, AlertCircle } from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { getMyVendorProfile, updateVendorProfile } from '../../services/user.service';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';

const SellerSettings = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [vacationLoading, setVacationLoading] = useState(false);
    const [vacationMode, setVacationMode] = useState<'ACTIVE' | 'VACATION'>('ACTIVE');
    const [formData, setFormData] = useState({
        TenCuaHang: '',
        LoaiHinh: 'CA_NHAN' as 'CA_NHAN' | 'DOANH_NGHIEP',
        DiaChiKinhDoanh: '',
        EmailLienHe: '',
        SoDienThoaiLienHe: '',
    });

    const isVacation = vacationMode === 'VACATION';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getMyVendorProfile();
                if (data) {
                    setFormData({
                        TenCuaHang: data.TenCuaHang || '',
                        LoaiHinh: data.LoaiHinh,
                        DiaChiKinhDoanh: data.DiaChiKinhDoanh || '',
                        EmailLienHe: data.EmailLienHe || '',
                        SoDienThoaiLienHe: data.SoDienThoaiLienHe || '',
                    });
                    setVacationMode((data as any).TrangThaiHoatDong || 'ACTIVE');
                }
            } catch (error) {
                addToast('Không thể tải thông tin cửa hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [addToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (!formData.TenCuaHang || !formData.DiaChiKinhDoanh || !formData.SoDienThoaiLienHe) {
                addToast('Vui lòng điền đầy đủ các trường bắt buộc', 'warning');
                return;
            }
            await updateVendorProfile(formData);
            addToast('Cập nhật thiết lập cửa hàng thành công!', 'success');
        } catch (error: any) {
            addToast(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleVacationMode = async () => {
        const next: 'ACTIVE' | 'VACATION' = isVacation ? 'ACTIVE' : 'VACATION';
        setVacationLoading(true);
        try {
            const res = await api.put(API_ENDPOINTS.VENDOR.VACATION_MODE, { trangThaiHoatDong: next });
            setVacationMode(next);
            addToast(res.data.message, 'success');
        } catch (error: any) {
            addToast(error?.response?.data?.message || 'Không thể cập nhật chế độ hoạt động', 'error');
        } finally {
            setVacationLoading(false);
        }
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin h-8 w-8 text-secondary-600" />
                    <span className="ml-3 text-gray-500 font-medium">Đang tải thiết lập cửa hàng...</span>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="max-w-4xl mx-auto py-4 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600">
                        <Store size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Thiết lập cửa hàng</h1>
                        <p className="text-sm text-gray-500">Quản lý các thông tin định danh và hoạt động của shop</p>
                    </div>
                </div>

                {/* ── Vacation Mode Card ───────────────────────────────────── */}
                <div className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 ${isVacation ? 'border-amber-200' : 'border-gray-100'}`}>
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isVacation ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                {isVacation
                                    ? <Palmtree className="text-amber-600" size={28} />
                                    : <Play className="text-gray-500" size={28} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Vacation Mode (Chế độ tạm nghỉ)</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {isVacation
                                                ? 'Cửa hàng đang tạm nghỉ. Khách hàng sẽ không đặt được hàng từ shop của bạn.'
                                                : 'Bật Vacation Mode khi bạn muốn tạm dừng bán hàng (đi nghỉ, cần thời gian chuẩn bị hàng...).'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleVacationMode}
                                        disabled={vacationLoading}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isVacation
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_8px_20px_rgba(22,163,74,0.25)] hover:-translate-y-0.5'
                                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {vacationLoading ? (
                                            <Loader className="animate-spin" size={18} />
                                        ) : isVacation ? (
                                            <><Play size={18} /> Mở cửa hàng trở lại</>
                                        ) : (
                                            <><Palmtree size={18} /> Bật tạm nghỉ</>
                                        )}
                                    </button>
                                </div>

                                {isVacation && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800">
                                            <strong>Lưu ý:</strong> Cửa hàng đang ở chế độ tạm nghỉ. Các đơn hàng đã đặt trước vẫn cần được xử lý bình thường.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Shop Info & Form ────────────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Banner */}
                    <div className={`p-8 text-white relative transition-all duration-500 ${isVacation
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                        : 'bg-gradient-to-r from-secondary-500 to-secondary-700'
                        }`}>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-bold border border-white/30">
                                    {formData.TenCuaHang?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{formData.TenCuaHang || 'Cửa hàng của bạn'}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-white/80">
                                        <ShieldCheck size={16} />
                                        <span className="text-sm font-medium">Đối tác đã xác thực</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="text-right">
                                    <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Tình trạng</p>
                                    <p className="text-sm font-bold">
                                        {isVacation ? '🌴 Tạm nghỉ' : '🟢 Đang hoạt động'}
                                    </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${isVacation ? 'bg-amber-300' : 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]'}`} />
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Shop Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                    <span className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                                    Thông tin định danh
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên cửa hàng</label>
                                        <input
                                            type="text"
                                            name="TenCuaHang"
                                            value={formData.TenCuaHang}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all font-medium"
                                            placeholder="Nhập tên shop"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hình kinh doanh</label>
                                        <select
                                            name="LoaiHinh"
                                            value={formData.LoaiHinh}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="CA_NHAN">Cá nhân</option>
                                            <option value="DOANH_NGHIEP">Doanh nghiệp</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                    <span className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại liên hệ</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={18} /></div>
                                            <input
                                                type="text"
                                                name="SoDienThoaiLienHe"
                                                value={formData.SoDienThoaiLienHe}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all font-medium"
                                                placeholder="09xxx..."
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email liên hệ (tùy chọn)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></div>
                                            <input
                                                type="email"
                                                name="EmailLienHe"
                                                value={formData.EmailLienHe}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all font-medium"
                                                placeholder="shop@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                                    <span className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                                    Địa chỉ vận hành và lấy hàng
                                </h3>
                                <div className="relative">
                                    <div className="absolute left-4 top-4 text-gray-400"><MapPin size={18} /></div>
                                    <textarea
                                        name="DiaChiKinhDoanh"
                                        value={formData.DiaChiKinhDoanh}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all font-medium"
                                        placeholder="Nhập địa chỉ chi tiết nơi bạn đóng gói và gửi hàng"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 italic">* Địa chỉ này sẽ được dùng để Shipper đến lấy hàng khi bạn xác nhận đơn.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3.5 bg-secondary-600 text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:bg-secondary-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                            >
                                {submitting ? (
                                    <><Loader className="animate-spin" size={20} /> Đang lưu...</>
                                ) : (
                                    <><Save size={20} /> Lưu thiết lập cửa hàng</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerSettings;
