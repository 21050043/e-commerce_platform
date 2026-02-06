import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../layouts/MainLayout';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Kiểm tra nếu đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        SoDienThoai: phoneNumber,
        MatKhau: password
      });
      
      // Thông báo đăng nhập thành công
      addToast('Đăng nhập thành công!', 'success');
      
      // Chuyển hướng về trang trước đó hoặc trang mặc định dựa vào vai trò
      const from = location.state?.from;
      if (from) {
        navigate(from);
      } else {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.MaVaiTro === 0 || user.MaVaiTro === 1) {
            // Admin hoặc nhân viên
            navigate('/admin');
          } else {
            // Khách hàng
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-8 text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
              <p>Đăng nhập để tiếp tục mua sắm</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <User size={20} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-2 focus:outline-none"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
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
                      <LogIn size={20} className="mr-2" />
                      Đăng nhập
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-pink-500 hover:text-pink-700">
                    Đăng ký ngay
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

export default Login; 