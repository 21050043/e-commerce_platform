import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, User, Save, Loader, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMyVendorProfile, updateVendorProfile, type VendorProfileResponse } from '../services/user.service';

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
                    ) : (
                      <div className="mb-6 p-4 border rounded-lg bg-primary-50/50">
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
                            Địa chỉ giao hàng
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
    </MainLayout>
  );
};

export default Account;