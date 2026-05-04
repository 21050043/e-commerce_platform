import { useState, useEffect } from 'react';
import {
  Loader, Truck, Phone, Mail, MapPin, Shield, Settings,
  BriefcaseIcon, Palmtree, Play, AlertCircle
} from 'lucide-react';
import ShipperLayout from '../../layouts/ShipperLayout';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';

interface ShipperProfile {
  MaShipper: number;
  DiaChiHoatDong: string;
  LoaiXe: string;
  EmailLienHe?: string;
  HangGPLX?: string;
  HeDieuHanh?: string;
  TrangThai: 'ACTIVE' | 'INACTIVE';
  TrangThaiHoatDong: 'ACTIVE' | 'VACATION';
  NgayDangKy: string;
  TenKhachHang: string;
  SoDienThoai: string;
}

const ShipperSettings = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<ShipperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [vacationLoading, setVacationLoading] = useState(false);

  const isVacation = profile?.TrangThaiHoatDong === 'VACATION';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.SHIPPER.PROFILE);
      setProfile(res.data);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể tải thông tin Shipper', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVacationMode = async () => {
    if (!profile) return;
    const next = isVacation ? 'ACTIVE' : 'VACATION';
    setVacationLoading(true);
    try {
      const res = await api.put(API_ENDPOINTS.SHIPPER.VACATION_MODE, { trangThaiHoatDong: next });
      addToast(res.data.message, 'success');
      setProfile(prev => prev ? { ...prev, TrangThaiHoatDong: next } : prev);
    } catch (error: any) {
      addToast(error?.response?.data?.message || 'Không thể cập nhật chế độ hoạt động', 'error');
    } finally {
      setVacationLoading(false);
    }
  };

  if (loading) {
    return (
      <ShipperLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-secondary-600" />
          <span className="ml-3 text-gray-500 font-medium">Đang tải thông tin Shipper...</span>
        </div>
      </ShipperLayout>
    );
  }

  if (!profile) {
    return (
      <ShipperLayout>
        <div className="flex items-center justify-center py-20 text-gray-500">
          Không thể tải thông tin. Vui lòng thử lại.
        </div>
      </ShipperLayout>
    );
  }

  return (
    <ShipperLayout>
      <div className="max-w-4xl mx-auto py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600">
            <Settings size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt Shipper</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin và chế độ hoạt động của bạn</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className={`p-8 text-white relative transition-all duration-500 ${isVacation
            ? 'bg-gradient-to-r from-amber-500 to-orange-600'
            : 'bg-gradient-to-r from-secondary-500 to-secondary-700'
            }`}>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-bold border border-white/30">
                  {profile.TenKhachHang?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.TenKhachHang}</h2>
                  <div className="flex items-center gap-2 mt-1 text-white/80">
                    <Truck size={16} />
                    <span className="text-sm font-medium">{profile.LoaiXe}</span>
                  </div>
                </div>
              </div>

              {/* Vacation Mode Badge */}
              <div className={`flex items-center gap-4 bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10`}>
                <div className="text-right">
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Chế độ</p>
                  <p className="text-sm font-bold">
                    {isVacation ? '🌴 Tạm nghỉ' : '🟢 Đang hoạt động'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isVacation ? 'bg-amber-300' : 'bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]'}`} />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <span className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                Thông tin cá nhân
              </h3>
              <InfoRow icon={<Phone size={16} />} label="Số điện thoại" value={profile.SoDienThoai} />
              {profile.EmailLienHe && (
                <InfoRow icon={<Mail size={16} />} label="Email liên hệ" value={profile.EmailLienHe} />
              )}
              <InfoRow icon={<MapPin size={16} />} label="Khu vực hoạt động" value={profile.DiaChiHoatDong} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <span className="w-1.5 h-6 bg-secondary-500 rounded-full" />
                Thông tin vận hành
              </h3>
              <InfoRow icon={<Truck size={16} />} label="Loại phương tiện" value={profile.LoaiXe} />
              {profile.HangGPLX && (
                <InfoRow icon={<Shield size={16} />} label="Hạng GPLX" value={profile.HangGPLX} />
              )}
              {profile.HeDieuHanh && (
                <InfoRow icon={<BriefcaseIcon size={16} />} label="Hệ điều hành" value={profile.HeDieuHanh} />
              )}
              <InfoRow
                icon={<Shield size={16} />}
                label="Trạng thái tài khoản"
                value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profile.TrangThai === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {profile.TrangThai === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* Vacation Mode Card */}
        <div className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 ${isVacation ? 'border-amber-200' : 'border-gray-100'}`}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isVacation ? 'bg-amber-100' : 'bg-gray-100'}`}>
                {isVacation ? <Palmtree className="text-amber-600" size={28} /> : <Play className="text-gray-500" size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Vacation Mode (Chế độ tạm nghỉ)</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isVacation
                        ? 'Bạn đang tạm nghỉ. Hệ thống sẽ không phân công đơn hàng mới cho bạn trong thời gian này.'
                        : 'Bật Vacation Mode khi bạn muốn tạm thời dừng nhận đơn hàng (nghỉ lễ, ốm, nghỉ phép...).'
                      }
                    </p>
                  </div>
                  <button
                    onClick={toggleVacationMode}
                    disabled={vacationLoading || profile.TrangThai !== 'ACTIVE'}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isVacation
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_8px_20px_rgba(22,163,74,0.25)] hover:-translate-y-0.5'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5'
                      }`}
                  >
                    {vacationLoading ? (
                      <Loader className="animate-spin" size={18} />
                    ) : isVacation ? (
                      <><Play size={18} /> Hoạt động trở lại</>
                    ) : (
                      <><Palmtree size={18} /> Bật tạm nghỉ</>
                    )}
                  </button>
                </div>

                {isVacation && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Lưu ý:</strong> Các đơn hàng bạn đang giao dở sẽ không bị ảnh hưởng. Vacation Mode chỉ ngăn hệ thống giao đơn mới.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Join Date Info */}
        <p className="text-center text-xs text-gray-400">
          Ngày tham gia Shipper: {profile.NgayDangKy ? new Date(profile.NgayDangKy).toLocaleDateString('vi-VN') : '—'}
        </p>
      </div>
    </ShipperLayout>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

export default ShipperSettings;
