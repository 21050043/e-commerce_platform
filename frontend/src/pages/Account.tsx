import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, User, Save, Loader, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getAllCategories } from '../services/category.service';
import type { CategoryResponse } from '../services/category.service';
import { applyVendor, getMyVendorProfile, updateVendorProfile, type VendorProfileResponse } from '../services/user.service';
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

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    LoaiHinh: 'CA_NHAN',
    TenCuaHang: '',
    DiaChiKinhDoanh: '',
    EmailLienHe: '',
    categories: [] as number[],
    SoDienThoaiLienHe: '',
    agreed: false,
  });
  const [vendorStatus, setVendorStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfileResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

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
          setVendorProfile(null);
        }
      } catch { }
      try {
        const cats = await getAllCategories();
        setCategories(cats);
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

      // Gửi yêu cầu cập nhật thông tin cá nhân
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

      // Nếu user là seller (role 3) và có vendor profile đã được phê duyệt, cập nhật địa chỉ kinh doanh
      if (user?.MaVaiTro === 3 && vendorProfile && vendorProfile.TrangThai === 'APPROVED' && formData.DiaChiKinhDoanh) {
        try {
          await updateVendorProfile({
            DiaChiKinhDoanh: formData.DiaChiKinhDoanh
          });
          // Refresh vendor profile
          const updatedProfile = await getMyVendorProfile();
          if (updatedProfile) {
            setVendorProfile(updatedProfile);
          }
        } catch (vendorErr: any) {
          console.error('Error updating vendor profile:', vendorErr);
          // Không throw error, chỉ log vì user profile đã được cập nhật thành công
        }
      }

      setSuccessMessage('Cập nhật thông tin thành công!');
      addToast('Cập nhật thông tin tài khoản thành công!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
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

      // Gửi yêu cầu đổi mật khẩu
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
      console.error('Error changing password:', err);
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
  const onChangeVendor = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setVendorForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const toggleCategory = (id: number) => {
    setVendorForm(prev => {
      const set = new Set(prev.categories);
      if (set.has(id)) set.delete(id); else set.add(id);
      return { ...prev, categories: Array.from(set) };
    });
  };
  const submitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!vendorForm.agreed) {
        addToast('Bạn phải đồng ý với điều khoản và chính sách hoạt động', 'warning');
        return;
      }
      if (!vendorForm.DiaChiKinhDoanh || vendorForm.categories.length === 0 || !vendorForm.SoDienThoaiLienHe) {
        addToast('Vui lòng điền đủ thông tin bắt buộc', 'error');
        return;
      }
      await applyVendor({
        LoaiHinh: vendorForm.LoaiHinh as 'CA_NHAN' | 'DOANH_NGHIEP',
        TenCuaHang: vendorForm.TenCuaHang || undefined,
        DiaChiKinhDoanh: vendorForm.DiaChiKinhDoanh,
        EmailLienHe: vendorForm.EmailLienHe || undefined,
        MaDanhMucChinh: vendorForm.categories[0],
        SoDienThoaiLienHe: vendorForm.SoDienThoaiLienHe,
        agreed: vendorForm.agreed,
      } as any);
      setVendorStatus('PENDING');
      addToast('Đã gửi hồ sơ đăng ký người bán', 'success');
      closeVendorModal();
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
      {/* Hero Section */}
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

      {/* Account Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
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

            {/* Main Content */}
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Notifications */}
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

                {/* Info Tab */}
                {activeTab === 'thongTin' && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Thông tin tài khoản</h2>
                    {/* Vendor section */}
                    {user?.MaVaiTro === 3 ? (
                      <div className="mb-6 p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Tài khoản người bán đã được phê duyệt</p>
                            <p className="text-sm text-gray-600">Bạn có thể quản lý sản phẩm tại khu vực người bán.</p>
                          </div>
                          <Link to="/admin" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Vào khu vực người bán</Link>
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
                            {vendorStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Đăng ký vendor'}
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

                        {/* Hiển thị địa chỉ kinh doanh nếu user là seller (role 3) và có vendor profile đã được phê duyệt */}
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

                {/* Password Tab */}
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
                            type="text"
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
                            type="text"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button onClick={closeVendorModal} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600">×</button>
            <h3 className="text-xl font-semibold mb-4">Đăng ký người bán (Vendor)</h3>
            <form onSubmit={submitVendor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Loại hình</label>
                  <select name="LoaiHinh" value={vendorForm.LoaiHinh} onChange={onChangeVendor} className="w-full border rounded px-3 py-2">
                    <option value="CA_NHAN">Cá nhân</option>
                    <option value="DOANH_NGHIEP">Doanh nghiệp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tên cửa hàng (không bắt buộc)</label>
                  <input name="TenCuaHang" value={vendorForm.TenCuaHang} onChange={onChangeVendor} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Địa chỉ kinh doanh</label>
                  <input name="DiaChiKinhDoanh" value={vendorForm.DiaChiKinhDoanh} onChange={onChangeVendor} required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email liên hệ (không bắt buộc)</label>
                  <input type="email" name="EmailLienHe" value={vendorForm.EmailLienHe} onChange={onChangeVendor} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Danh mục kinh doanh (chọn nhiều)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map(c => (
                      <label key={c.MaDanhMuc} className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${vendorForm.categories.includes(c.MaDanhMuc) ? 'bg-primary-50 border-primary-300' : ''}`}>
                        <input type="checkbox" checked={vendorForm.categories.includes(c.MaDanhMuc)} onChange={() => toggleCategory(c.MaDanhMuc)} />
                        <span className="text-sm">{c.TenDanhMuc}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input name="SoDienThoaiLienHe" value={vendorForm.SoDienThoaiLienHe} onChange={onChangeVendor} required className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="agreed" checked={vendorForm.agreed} onChange={onChangeVendor} />
                Tôi đồng ý với điều khoản và chính sách hoạt động
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeVendorModal} className="px-4 py-2 bg-gray-100 rounded-md">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Gửi đăng ký</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Account; 