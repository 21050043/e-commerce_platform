import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, User, Save, Loader, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMyVendorProfile, updateVendorProfile, applyShipper, type VendorProfileResponse } from '../services/user.service';

import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';

interface ProfileForm {
  TenKhachHang: string;
  SoDienThoai: string;
  DiaChi: string;
  DiaChiKinhDoanh?: string;
  MatKhauCu?: string;
  MatKhauMoi?: string;
  XacNhanMatKhau?: string;
}

const Account = () => {
  const [formData, setFormData] = useState<ProfileForm>({
    TenKhachHang: '',
    SoDienThoai: '',
    DiaChi: '',
    MatKhauCu: '',
    MatKhauMoi: '',
    XacNhanMatKhau: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'thongTin' | 'matKhau'>('thongTin');

  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfileResponse | null>(null);

  const [activeVendorTab, setActiveVendorTab] = useState<'privacy' | 'terms'>('privacy');

  // Shipper states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyType, setApplyType] = useState<'vendor' | 'shipper'>('vendor');
  const [applyAgreed, setApplyAgreed] = useState(false);
  const [shipperDiaChiHoatDong, setShipperDiaChiHoatDong] = useState('');
  const [shipperLoaiXe, setShipperLoaiXe] = useState('Xe máy');
  const [shipperHangGPLX, setShipperHangGPLX] = useState('A1');
  const [shipperHeDieuHanh, setShipperHeDieuHanh] = useState('Android');
  const [shipperEmailLienHe, setShipperEmailLienHe] = useState('');

  // Location states for Shipper Application
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [searchProvince, setSearchProvince] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchWard, setSearchWard] = useState('');
  const [focusProvince, setFocusProvince] = useState(false);
  const [focusDistrict, setFocusDistrict] = useState(false);
  const [focusWard, setFocusWard] = useState(false);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Error fetching provinces:', err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []))
        .catch(err => console.error('Error fetching districts:', err));
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      setSearchDistrict('');
      setSearchWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []))
        .catch(err => console.error('Error fetching wards:', err));
      setSelectedWard(null);
      setSearchWard('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/account', message: 'Vui lòng đăng nhập để xem tài khoản' } });
      return;
    }

    if (user) {
      setFormData({
        TenKhachHang: user.TenKhachHang || user.TenNhanVien || '',
        SoDienThoai: user.SoDienThoai || '',
        DiaChi: user.DiaChi || '',
        MatKhauCu: '',
        MatKhauMoi: '',
        XacNhanMatKhau: '',
      });
      setLoading(false);
    }
    (async () => {
      try {
        const profile = await getMyVendorProfile();
        if (profile) {
          setVendorStatus(profile.TrangThai);
          setVendorProfile(profile);
          // Nếu user là seller (role 3) và có vendor profile, thêm DiaChiKinhDoanh vào formData
          if (user?.MaVaiTro === 3 && profile.TrangThai === 'APPROVED') {
            setFormData(prev => ({
              ...prev,
              DiaChiKinhDoanh: profile.DiaChiKinhDoanh || ''
            }));
          }
        } else {
          setVendorStatus(null);
        }
      } catch { }
    })();
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);
      setSubmitting(true);

      const payload: any = {
        SoDienThoai: formData.SoDienThoai,
        DiaChi: formData.DiaChi,
      };
      if (user?.MaVaiTro === 2 || user?.MaVaiTro === 3) {
        payload['TenKhachHang'] = formData.TenKhachHang;
      } else {
        payload['TenNhanVien'] = formData.TenKhachHang;
      }
      await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, payload);

      if (user?.MaVaiTro === 3 && vendorProfile && vendorProfile.TrangThai === 'APPROVED' && formData.DiaChiKinhDoanh) {
        try {
          await updateVendorProfile({
            DiaChiKinhDoanh: formData.DiaChiKinhDoanh
          });
          const updatedProfile = await getMyVendorProfile();
          if (updatedProfile) {
            setVendorProfile(updatedProfile);
          }
        } catch (vendorErr) {
          console.error('Error updating vendor profile:', vendorErr);
        }
      }

      setSuccessMessage('Cập nhật thông tin thành công!');
      addToast('Cập nhật thông tin tài khoản thành công!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.MatKhauMoi !== formData.XacNhanMatKhau) {
      setError('Xác nhận mật khẩu không khớp');
      addToast('Xác nhận mật khẩu không khớp', 'error');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setSubmitting(true);

      await api.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        MatKhauCu: formData.MatKhauCu,
        MatKhauMoi: formData.MatKhauMoi,
      });

      setSuccessMessage('Đổi mật khẩu thành công!');
      addToast('Đổi mật khẩu thành công!', 'success');
      setFormData(prev => ({
        ...prev,
        MatKhauCu: '',
        MatKhauMoi: '',
        XacNhanMatKhau: '',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Đăng xuất thành công!', 'success');
      navigate('/login');
    } catch (error) {
      addToast('Có lỗi xảy ra khi đăng xuất.', 'error');
    }
  };

  const openVendorModal = () => setShowVendorModal(true);
  const closeVendorModal = () => setShowVendorModal(false);

  const [vendorAgreed, setVendorAgreed] = useState(false);

  const submitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!vendorAgreed) {
        addToast('Bạn phải đồng ý với điều khoản và chính sách hoạt động', 'warning');
        return;
      }

      const response = await api.post('/vendor/apply', {
        agreed: vendorAgreed,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        await refreshUser();
      }

      setVendorStatus('APPROVED');
      addToast('Đăng ký người bán thành công! Chào mừng bạn đến với Kênh Người Bán.', 'success');
      closeVendorModal();
      navigate('/seller/settings');
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Không thể gửi hồ sơ', 'error');
    }
  };

  const openApplyModal = (type: 'vendor' | 'shipper') => {
    setApplyType(type);
    setShowApplyModal(true);
    setApplyAgreed(false);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplyAgreed(false);
    setShipperDiaChiHoatDong('');
    setShipperLoaiXe('Xe máy');
    setShipperHangGPLX('A1');
    setShipperHeDieuHanh('Android');
    setShipperEmailLienHe('');
    // Reset location states
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setSearchProvince('');
    setSearchDistrict('');
    setSearchWard('');
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!applyAgreed) {
        addToast('Bạn phải đồng ý với điều khoản và chính sách', 'warning');
        return;
      }

      if (applyType === 'shipper') {
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
          addToast('Vui lòng chọn đầy đủ khu vực hoạt động', 'error');
          return;
        }

        const fullLocation = `${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

        const response = await applyShipper({
          agreed: true,
          diaChiHoatDong: fullLocation,
          loaiXe: shipperLoaiXe,
          hangGPLX: shipperHangGPLX,
          heDieuHanh: shipperHeDieuHanh,
          emailLienHe: shipperEmailLienHe,
        });

        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          await refreshUser();
        }

        addToast('Đăng ký Shipper thành công! Chào mừng bạn đến với Dịch vụ Giao hàng.', 'success');
        closeApplyModal();
        navigate('/shipper');
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Không thể gửi hồ sơ', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary-600" />
          <span className="ml-2">Đang tải thông tin tài khoản...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Tài Khoản</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Tài Khoản</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{formData.TenKhachHang}</p>
                    <p className="text-gray-600">{formData.SoDienThoai}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'thongTin'
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveTab('thongTin')}
                  >
                    Thông tin tài khoản
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md transition ${activeTab === 'matKhau'
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100'
                      }`}
                    onClick={() => setActiveTab('matKhau')}
                  >
                    Đổi mật khẩu
                  </button>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 rounded-md hover:bg-gray-100 transition"
                  >
                    Đơn hàng của bạn
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 rounded-md text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </button>
                </nav>
              </div>
            </div>

            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                  </div>
                )}

                {activeTab === 'thongTin' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Thông tin tài khoản</h2>
                    {user?.MaVaiTro === 3 ? (
                      <div className="mb-6 p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Tài khoản của bạn đủ điều kiện để trở thành người bán hàng</p>
                            <p className="text-sm text-gray-600">Bạn có thể quản lý sản phẩm tại khu vực bán hàng.</p>
                          </div>
                          <Link to="/seller" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Vào khu vực bán hàng</Link>
                        </div>
                      </div>
                    ) : user?.MaVaiTro === 4 ? (
                      <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Tài khoản của bạn đủ điều kiện làm Shipper</p>
                            <p className="text-sm text-gray-600">Quản lý các đơn giao hàng và theo dõi thu nhập tại khu vực Shipper.</p>
                          </div>
                          <Link to="/shipper/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Vào khu vực Shipper</Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        <div className="p-4 border rounded-lg bg-primary-50/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">Bạn là người bán?</p>
                              <p className="text-sm text-gray-600">{vendorStatus === 'PENDING' ? 'Hồ sơ của bạn đang chờ phê duyệt. Vui lòng đợi email/SMS thông báo.' : 'Đăng ký trở thành vendor để quản lý sản phẩm của bạn.'}
                                {vendorStatus && (
                                  <span className="ml-2 px-2 py-0.5 rounded text-xs bg-primary-100 text-primary-700">
                                    Trạng thái: {vendorStatus}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={openVendorModal}
                              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                              disabled={vendorStatus === 'PENDING'}
                            >
                              {vendorStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Đăng ký bán hàng'}
                            </button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-blue-50/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">Bạn muốn làm Shipper?</p>
                              <p className="text-sm text-gray-600">Đăng ký làm shipper để nhận các đơn giao hàng và kiếm thêm thu nhập.</p>
                            </div>
                            <button
                              onClick={() => openApplyModal('shipper')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                            >
                              Đăng ký Shipper
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-gray-700 mb-2">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            name="TenKhachHang"
                            value={formData.TenKhachHang}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="SoDienThoai"
                            value={formData.SoDienThoai}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2">
                            Địa chỉ nhận hàng
                          </label>
                          <textarea
                            name="DiaChi"
                            value={formData.DiaChi}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                            required
                          ></textarea>
                        </div>

                        {user?.MaVaiTro === 3 && vendorProfile && vendorProfile.TrangThai === 'APPROVED' && (
                          <div>
                            <label className="block text-gray-700 mb-2">
                              Địa chỉ kinh doanh
                            </label>
                            <textarea
                              name="DiaChiKinhDoanh"
                              value={formData.DiaChiKinhDoanh || ''}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              rows={3}
                              required
                            ></textarea>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center px-6 py-2 rounded-md text-white transition ${submitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                          }`}
                      >
                        {submitting ? (
                          <>
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Lưu thông tin
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}

                {activeTab === 'matKhau' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Đổi mật khẩu</h2>

                    <form onSubmit={handleUpdatePassword}>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-gray-700 mb-2">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            name="MatKhauCu"
                            value={formData.MatKhauCu}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            name="MatKhauMoi"
                            value={formData.MatKhauMoi}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            name="XacNhanMatKhau"
                            value={formData.XacNhanMatKhau}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center px-6 py-2 rounded-md text-white transition ${submitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                          }`}
                      >
                        {submitting ? (
                          <>
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Lưu mật khẩu
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={closeVendorModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
            >
              ×
            </button>

            <div className="flex flex-col h-[80vh] md:h-[600px]">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <h3 className="text-2xl font-bold">Đăng ký trở thành Người bán</h3>
                <p className="opacity-80 text-sm mt-1">Vui lòng đọc kỹ các điều khoản và chính sách trước khi tham gia</p>
              </div>

              <div className="flex border-b">
                <button
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeVendorTab === 'privacy' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveVendorTab('privacy')}
                >
                  1. Chính sách bảo mật
                </button>
                <button
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeVendorTab === 'terms' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveVendorTab('terms')}
                >
                  2. Điều khoản sử dụng
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {activeVendorTab === 'privacy' ? (
                  <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                    <h4 className="text-gray-900 font-bold text-xl mb-4">Chính sách bảo mật thông tin người bán</h4>
                    <p>Chúng tôi cam kết bảo mật tuyệt đối các thông tin kinh doanh của bạn. Khi đăng ký, bạn đồng ý cung cấp các thông tin liên hệ và địa chỉ kinh doanh chính xác để hệ thống vận hành.</p>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">1. Thu Thập Thông Tin</h5>
                      <p className="mb-2">Chúng tôi thu thập thông tin cá nhân của bạn khi bạn:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Đăng ký tài khoản trên website</li>
                        <li>Đặt hàng và thanh toán</li>
                        <li>Liên hệ với chúng tôi qua email hoặc điện thoại</li>
                        <li>Sử dụng các dịch vụ của chúng tôi</li>
                      </ul>
                      <p className="mt-2">Thông tin thu thập bao gồm: họ tên, số điện thoại, địa chỉ email, địa chỉ giao hàng, và thông tin thanh toán (nếu có).</p>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">2. Sử Dụng Thông Tin</h5>
                      <p className="mb-2">Chúng tôi sử dụng thông tin cá nhân của bạn để:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Xử lý đơn hàng và giao hàng</li>
                        <li>Liên hệ với bạn về đơn hàng và dịch vụ</li>
                        <li>Cải thiện chất lượng dịch vụ</li>
                        <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
                        <li>Tuân thủ các yêu cầu pháp lý</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">3. Bảo Mật Thông Tin</h5>
                      <p className="mb-2">Chúng tôi cam kết bảo mật thông tin cá nhân của bạn bằng các biện pháp:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Mã hóa mật khẩu bằng thuật toán bcrypt</li>
                        <li>Sử dụng HTTPS để bảo vệ dữ liệu truyền tải</li>
                        <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên có thẩm quyền</li>
                        <li>Thường xuyên cập nhật và kiểm tra hệ thống bảo mật</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">4. Chia Sẻ Thông Tin</h5>
                      <p className="mb-2">Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ các trường hợp:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                        <li>Với các đối tác vận chuyển để giao hàng (chỉ thông tin cần thiết)</li>
                        <li>Khi bạn đồng ý chia sẻ</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">5. Quyền Của Bạn</h5>
                      <p className="mb-2">Bạn có quyền:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Truy cập và xem thông tin cá nhân của mình</li>
                        <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
                        <li>Từ chối nhận thông tin khuyến mãi</li>
                        <li>Khiếu nại về việc xử lý thông tin cá nhân</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">6. Liên Hệ</h5>
                      <ul className="space-y-1 ml-4">
                        <li><strong>Email:</strong> 21050043@student.bdu.edu.vn</li>
                        <li><strong>Điện thoại:</strong> 0938 320 498</li>
                        <li><strong>Địa chỉ:</strong> Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</li>
                      </ul>
                    </section>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
                    <h4 className="text-gray-900 font-bold text-xl mb-4">Điều khoản vận hành và sử dụng dịch vụ</h4>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">1. Chấp Nhận Điều Khoản</h5>
                      <p>Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng. Nếu bạn không đồng ý với bất kỳ phần nào, bạn không nên sử dụng website.</p>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">2. Đăng Ký Tài Khoản</h5>
                      <p className="mb-2">Khi đăng ký tài khoản, bạn cam kết:</p>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                        <li>Bảo mật thông tin đăng nhập của bạn</li>
                        <li>Chịu trách nhiệm cho mọi hoạt động dưới tài khoản của bạn</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">3. Đặt Hàng và Thanh Toán</h5>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Cung cấp thông tin giao hàng chính xác</li>
                        <li>Thanh toán đầy đủ theo giá đã công bố</li>
                        <li>Chấp nhận các điều kiện về vận chuyển và giao hàng</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">4. Quyền Sở Hữu Trí Tuệ</h5>
                      <p>Tất cả nội dung trên website đều thuộc quyền sở hữu của chúng tôi. Bạn không được sao chép, phân phối cho mục đích thương mại mà không có sự đồng ý.</p>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">5. Hành Vi Bị Cấm</h5>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Sử dụng website cho mục đích bất hợp pháp</li>
                        <li>Gây nhiễu hoặc làm gián đoạn hoạt động của website</li>
                        <li>Giả mạo danh tính hoặc thông tin cá nhân</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">6. Trách Nhiệm</h5>
                      <p>Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp hoặc lỗi kỹ thuật ngoài tầm kiểm soát.</p>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">7. Hoàn Trả và Đổi Trả</h5>
                      <ul className="space-y-1 list-disc list-inside ml-4">
                        <li>Hàng hóa bị lỗi hoặc không đúng mô tả sẽ được đổi trả miễn phí</li>
                        <li>Yêu cầu đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                        <li>Hàng hóa phải còn nguyên vẹn, chưa sử dụng</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">8. Thay Đổi Điều Khoản</h5>
                      <p>Chúng tôi có quyền thay đổi các điều khoản bất cứ lúc nào. Việc tiếp tục sử dụng website sau khi có thay đổi được xem như đã chấp nhận các điều khoản mới.</p>
                    </section>

                    <section>
                      <h5 className="font-bold text-gray-900 text-lg mb-2">9. Liên Hệ</h5>
                      <ul className="space-y-1 ml-4">
                        <li><strong>Email:</strong> 21050043@student.bdu.edu.vn</li>
                        <li><strong>Điện thoại:</strong> 0938 320 498</li>
                      </ul>
                    </section>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-white">
                <form onSubmit={submitVendor} className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={vendorAgreed}
                      onChange={(e) => setVendorAgreed(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 leading-tight">Tôi đã đọc kỹ và hoàn toàn đồng ý với các <strong>chính sách bảo mật</strong> và <strong>điều khoản sử dụng</strong> nêu trên.</span>
                  </label>


                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeVendorModal}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Để sau
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-white transition-all shadow-lg ${vendorAgreed ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                      disabled={!vendorAgreed}
                    >
                      Đăng ký
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={closeApplyModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
            >
              ×
            </button>

            <div className="flex flex-col h-[90vh] md:h-[750px]">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white shrink-0">
                <h3 className="text-2xl font-bold">Đăng ký trở thành {applyType === 'vendor' ? 'Người bán' : 'Shipper'}</h3>
                <p className="opacity-80 text-sm mt-1">Vui lòng đọc kỹ các điều khoản và chính sách trước khi tham gia</p>
              </div>

              <div className="flex border-b shrink-0 bg-white">
                <button
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeVendorTab === 'privacy' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveVendorTab('privacy')}
                >
                  1. Chính sách bảo mật
                </button>
                <button
                  className={`flex-1 py-4 text-sm font-bold transition-all ${activeVendorTab === 'terms' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setActiveVendorTab('terms')}
                >
                  2. Điều khoản sử dụng
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
                <div className="p-6 prose prose-sm max-w-none text-gray-700 space-y-6">
                  {activeVendorTab === 'privacy' ? (
                    <div className="space-y-6">
                      {applyType === 'shipper' ? (
                        <>
                          <h4 className="text-gray-900 font-bold text-xl mb-4">Chính sách bảo mật thông tin Shipper</h4>
                          <p>Chúng tôi cam kết bảo mật thông tin cá nhân và hoạt động giao hàng của bạn. Khi đăng ký làm Shipper, bạn đồng ý cung cấp các thông tin cần thiết để quản lý đơn giao hàng hiệu quả.</p>

                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">1. Thông Tin Thu Thập</h5>
                            <p className="mb-2">Chúng tôi thu thập thông tin từ Shipper bao gồm:</p>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Họ tên, số điện thoại, địa chỉ hoạt động</li>
                              <li>Loại phương tiện vận chuyển</li>
                              <li>Thông tin về đơn hàng được giao</li>
                              <li>Lịch sử giao hàng và đánh giá hiệu suất</li>
                            </ul>
                          </section>

                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">2. Sử Dụng Thông Tin</h5>
                            <p className="mb-2">Thông tin được sử dụng để:</p>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Gán và quản lý đơn giao hàng</li>
                              <li>Tính toán hoa hồng và lương thưởng</li>
                              <li>Liên lạc về tình trạng đơn hàng</li>
                              <li>Đánh giá hiệu suất làm việc</li>
                              <li>Xử lý tranh chấp và khiếu nại</li>
                            </ul>
                          </section>

                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">3. Phân Công Giao Hàng Theo Vị Trí</h5>
                            <p>Hệ thống tự động kết nối bạn với các đơn giao hàng dựa trên khu vực hoạt động chính mà bạn đã khai báo. Bạn sẽ nhận được những đơn hàng gần vị trí này. Việc này giúp tối ưu hóa hiệu suất, giảm thời gian giao hàng, và tăng chất lượng dịch vụ.</p>
                          </section>

                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">4. Bảo Mật Dữ Liệu</h5>
                            <p className="mb-2">Chúng tôi bảo vệ thông tin bằng:</p>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Mã hóa dữ liệu nhạy cảm</li>
                              <li>Kiểm soát quyền truy cập</li>
                              <li>Giám sát hệ thống liên tục</li>
                              <li>Cập nhật bảo mật định kỳ</li>
                            </ul>
                          </section>

                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">5. Quyền Của Bạn</h5>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Truy cập và xem thông tin cá nhân</li>
                              <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin</li>
                              <li>Yêu cầu tạm dừng hoạt động từ tài khoản</li>
                              <li>Khiếu nại về xử lý bất công</li>
                            </ul>
                          </section>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <p>Vendor privacy policy content...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {applyType === 'shipper' ? (
                        <>
                          <h4 className="text-gray-900 font-bold text-xl mb-4">Điều Khoản Và Điều Kiện Làm Shipper</h4>
                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">1. Quyền và Trách Nhiệm</h5>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Bạn chịu trách nhiệm giao hàng đúng hạn và an toàn</li>
                              <li>Tuân thủ tất cả luật pháp giao thông</li>
                              <li>Duy trì phương tiện giao thông trong tình trạng tốt</li>
                              <li>Cung cấp dịch vụ khách hàng chuyên nghiệp</li>
                            </ul>
                          </section>
                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">2. Thanh Toán và Lương Thưởng</h5>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Hoa hồng được tính dựa trên số đơn giao thành công</li>
                              <li>Thanh toán hàng tuần vào tài khoản ngân hàng</li>
                              <li>Có thể bị khấu lương vì vi phạm hoặc khiếu nại khách</li>
                            </ul>
                          </section>
                          <section>
                            <h5 className="font-bold text-gray-900 text-lg mb-2">3. Hủy Và Chấm Dứt</h5>
                            <ul className="space-y-1 list-disc list-inside ml-4">
                              <li>Có thể hủy bất cứ lúc nào với thông báo trước</li>
                              <li>Chúng tôi có quyền chấm dứt vì vi phạm hợp đồng</li>
                              <li>Sẽ thanh toán đủ cho các đơn hàng đã hoàn thành</li>
                            </ul>
                          </section>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <p>Vendor terms content...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {applyType === 'shipper' && (
                  <div className="p-8 bg-white border-y shadow-inner space-y-10">
                    {/* Mục 1: Hồ sơ pháp lý và cá nhân */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">3</span>
                        1. Hồ sơ pháp lý và cá nhân
                      </h4>
                      
                      <div className="space-y-6 ml-11">
                        {/* CCCD (Simulation) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <label className="block text-gray-700 font-bold mb-1">Căn cước công dân (CCCD)</label>
                          <p className="text-sm text-primary-600 font-medium italic">"Đây là dự án mô phỏng, không cần cung cấp thông tin này"</p>
                        </div>

                        {/* Loại xe */}
                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            Loại xe <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={shipperLoaiXe}
                              onChange={(e) => {
                                const val = e.target.value;
                                setShipperLoaiXe(val);
                                // Reset rank default based on vehicle
                                if (val === 'Xe máy') setShipperHangGPLX('A1');
                                else if (val === 'Ô tô' || val === 'Xe tải') setShipperHangGPLX('B1');
                                else setShipperHangGPLX('');
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-gray-50 focus:bg-white transition-all cursor-pointer"
                              required
                            >
                              <option value="Xe máy">🛵 Xe máy</option>
                              <option value="Ô tô">🚗 Ô tô</option>
                              <option value="Xe tải">🚚 Xe tải</option>
                              <option value="Xe khác">🚲 Xe khác</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              ▼
                            </div>
                          </div>
                        </div>

                        {/* GPLX */}
                        {(shipperLoaiXe === 'Xe máy' || shipperLoaiXe === 'Ô tô' || shipperLoaiXe === 'Xe tải') && (
                          <div>
                            <label className="block text-gray-700 font-bold mb-3">
                              Giấy phép lái xe (GPLX) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                              {(shipperLoaiXe === 'Xe máy' 
                                ? ['A1', 'A2'] 
                                : ['B1', 'B2', 'C']
                              ).map((rank) => (
                                <label key={rank} className={`flex items-center px-4 py-2 border rounded-xl cursor-pointer transition-all ${shipperHangGPLX === rank ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                                  <input
                                    type="radio"
                                    name="hangGPLX"
                                    className="hidden"
                                    value={rank}
                                    checked={shipperHangGPLX === rank}
                                    onChange={(e) => setShipperHangGPLX(e.target.value)}
                                  />
                                  <span className="font-bold">Hạng {rank}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cà-vẹt (Simulation) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <label className="block text-gray-700 font-bold mb-1">Giấy đăng ký xe (Cà-vẹt xe)</label>
                          <p className="text-sm text-primary-600 font-medium italic">"Đây là dự án mô phỏng, không cần cung cấp thông tin này"</p>
                        </div>

                        {/* Lý lịch tư pháp (Simulation) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <label className="block text-gray-700 font-bold mb-1">Lý lịch tư pháp (Bản gốc - Mẫu số 1)</label>
                          <p className="text-sm text-gray-500 mb-1">Thời hạn cấp thường yêu cầu trong vòng 10-12 tháng gần nhất.</p>
                          <p className="text-sm text-primary-600 font-medium italic">"Đây là dự án mô phỏng, không cần cung cấp thông tin này"</p>
                        </div>

                        {/* Khu vực hoạt động */}
                        <div>
                          <label className="block text-gray-700 font-bold mb-4">
                            Khu vực hoạt động chính <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Province */}
                            <div className="relative">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Tỉnh / Thành</label>
                              <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                placeholder="Chọn..."
                                value={searchProvince}
                                onChange={e => setSearchProvince(e.target.value)}
                                onFocus={() => setFocusProvince(true)}
                                onBlur={() => setTimeout(() => setFocusProvince(false), 200)}
                              />
                              {focusProvince && (
                                <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                  {provinces.filter(p => p.name.toLowerCase().includes(searchProvince.toLowerCase())).map(p => (
                                    <li
                                      key={p.code}
                                      onMouseDown={() => { setSelectedProvince(p); setSearchProvince(p.name); }}
                                      className="px-4 py-2 rounded-lg hover:bg-primary-50 cursor-pointer font-bold text-gray-700 text-sm transition-colors"
                                    >
                                      {p.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* District */}
                            <div className="relative">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Quận / Huyện</label>
                              <input
                                type="text"
                                disabled={!selectedProvince}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none disabled:opacity-40"
                                placeholder="Chọn..."
                                value={searchDistrict}
                                onChange={e => setSearchDistrict(e.target.value)}
                                onFocus={() => setFocusDistrict(true)}
                                onBlur={() => setTimeout(() => setFocusDistrict(false), 200)}
                              />
                              {focusDistrict && selectedProvince && (
                                <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                  {districts.filter(d => d.name.toLowerCase().includes(searchDistrict.toLowerCase())).map(d => (
                                    <li
                                      key={d.code}
                                      onMouseDown={() => { setSelectedDistrict(d); setSearchDistrict(d.name); }}
                                      className="px-4 py-2 rounded-lg hover:bg-primary-50 cursor-pointer font-bold text-gray-700 text-sm transition-colors"
                                    >
                                      {d.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Ward */}
                            <div className="relative">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Phường / Xã</label>
                              <input
                                type="text"
                                disabled={!selectedDistrict}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none disabled:opacity-40"
                                placeholder="Chọn..."
                                value={searchWard}
                                onChange={e => setSearchWard(e.target.value)}
                                onFocus={() => setFocusWard(true)}
                                onBlur={() => setTimeout(() => setFocusWard(false), 200)}
                              />
                              {focusWard && selectedDistrict && (
                                <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                  {wards.filter(w => w.name.toLowerCase().includes(searchWard.toLowerCase())).map(w => (
                                    <li
                                      key={w.code}
                                      onMouseDown={() => { setSelectedWard(w); setSearchWard(w.name); }}
                                      className="px-4 py-2 rounded-lg hover:bg-primary-50 cursor-pointer font-bold text-gray-700 text-sm transition-colors"
                                    >
                                      {w.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-3 italic flex items-center font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3 mr-1 text-primary-500" />
                            Hệ thống sẽ kết nối bạn với các đơn hàng gần khu vực này.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mục 2: Công cụ và Tài chính điện tử */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm">4</span>
                        2. Công cụ và Tài chính điện tử
                      </h4>
                      
                      <div className="space-y-6 ml-11">
                        {/* Smartphone */}
                        <div>
                          <label className="block text-gray-700 font-bold mb-3">
                            Điện thoại thông minh <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-4">
                            {['Android', 'iOS'].map((os) => (
                              <label key={os} className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all ${shipperHeDieuHanh === os ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                                <input
                                  type="radio"
                                  name="heDieuHanh"
                                  className="hidden"
                                  value={os}
                                  checked={shipperHeDieuHanh === os}
                                  onChange={(e) => setShipperHeDieuHanh(e.target.value)}
                                />
                                <span className="font-bold">{os}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* ShopeePay (Simulation) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <label className="block text-gray-700 font-bold mb-1">Ví điện tử ShopeePay</label>
                          <p className="text-sm text-gray-500 mb-1">Xác thực và liên kết với tài khoản ngân hàng chính chủ để nhận thu nhập.</p>
                          <p className="text-sm text-primary-600 font-medium italic">"Đây là dự án mô phỏng, không cần cung cấp thông tin này"</p>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-gray-700 font-bold mb-2">
                            Email cá nhân <span className="text-gray-400 font-normal ml-1">(Không bắt buộc)</span>
                          </label>
                          <input
                            type="email"
                            value={shipperEmailLienHe}
                            onChange={(e) => setShipperEmailLienHe(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="Email nhận hợp đồng điện tử..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t shrink-0">
                <form onSubmit={submitApplication} className="space-y-6">
                  <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        className="w-6 h-6 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all"
                        checked={applyAgreed}
                        onChange={(e) => setApplyAgreed(e.target.checked)}
                      />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      Tôi đã đọc kỹ, hiểu rõ và hoàn toàn đồng ý thỏa thuận với các
                      <strong className="text-primary-700 mx-1 hover:underline">chính sách bảo mật</strong> và
                      <strong className="text-primary-700 mx-1 hover:underline">điều khoản sử dụng</strong> dành cho Shipper.
                    </span>
                  </label>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={closeApplyModal}
                      className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${applyAgreed ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30 hover:shadow-primary-500/40' : 'bg-gray-300 cursor-not-allowed shadow-none opacity-50'}`}
                      disabled={!applyAgreed}
                    >
                      Xác nhận đăng ký
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Account;