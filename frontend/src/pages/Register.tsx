import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../layouts/MainLayout';

const Register = () => {
  const [form, setForm] = useState({
    TenKhachHang: '',
    SoDienThoai: '',
    MatKhau: '',
    MatKhauNhapLai: '',
    DiaChi: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.TenKhachHang || !form.SoDienThoai || !form.MatKhau || !form.MatKhauNhapLai || !form.DiaChi) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (!/^[0-9]{10}$/.test(form.SoDienThoai)) {
      setError('Số điện thoại phải có 10 chữ số.');
      return;
    }
    if (form.MatKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.MatKhau !== form.MatKhauNhapLai) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        TenKhachHang: form.TenKhachHang,
        SoDienThoai: form.SoDienThoai,
        MatKhau: form.MatKhau,
        DiaChi: form.DiaChi
      });
      setSuccess('Đăng ký thành công!');
      setForm({ TenKhachHang: '', SoDienThoai: '', MatKhau: '', MatKhauNhapLai: '', DiaChi: '' });
    } catch (err: any) {
      if (err.response?.data?.message?.includes('Số điện thoại đã được sử dụng')) {
        setError('Số điện thoại đã được sử dụng. Vui lòng nhập số khác.');
      } else {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-8 text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
              <p>Tạo tài khoản để mua sắm dễ dàng hơn</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Họ và tên
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <User size={20} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập họ và tên"
                      name="TenKhachHang"
                      value={form.TenKhachHang}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập số điện thoại"
                      name="SoDienThoai"
                      value={form.SoDienThoai}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      id="password"
                      type="text"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập mật khẩu"
                      name="MatKhau"
                      value={form.MatKhau}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Nhập lại mật khẩu
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập lại mật khẩu"
                      name="MatKhauNhapLai"
                      value={form.MatKhauNhapLai}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Địa chỉ
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <input
                      id="address"
                      type="text"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập địa chỉ (không bắt buộc)"
                      name="DiaChi"
                      value={form.DiaChi}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      <UserPlus size={20} className="mr-2" />
                      Đăng ký
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-pink-500 hover:text-pink-700">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register; 