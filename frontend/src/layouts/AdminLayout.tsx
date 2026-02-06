import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Package, Users, ShoppingBag, Settings, LogOut, Menu, X, ChevronDown,
  User, Store, ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // Đóng dropdown khi click ra ngoài
  useClickOutside<HTMLDivElement>(dropdownRef, () => setDropdownOpen(false));

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Đăng xuất thành công!', 'success');
      navigate('/login');
    } catch (error) {
      addToast('Có lỗi xảy ra khi đăng xuất.', 'error');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-pink-600 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mr-2"
            >
              <Menu size={24} />
            </button>
            <Link to="/admin" className="font-semibold text-xl">
              {user?.MaVaiTro === 3 ? 'Khu vực người bán' : 'Flower Shop Admin'}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Link quay về cửa hàng */}
            <Link
              to="/"
              className="flex items-center px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition"
            >
              <Store className="h-4 w-4 mr-1" />
              <span>Về cửa hàng</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>

            {/* Dropdown tài khoản */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2"
              >
                <div className="mr-2">
                  <div className="text-sm">{user?.TenKhachHang || user?.TenNhanVien}</div>
                  <div className="text-xs opacity-75 text-right">
                    {user?.MaVaiTro === 0 ? 'Quản trị viên' : 
                     user?.MaVaiTro === 1 ? 'Nhân viên' : 
                     user?.MaVaiTro === 3 ? 'Người bán' : 'Khách hàng'}
                  </div>
                </div>
                
                <div className="h-9 w-9 bg-pink-700 rounded-full flex items-center justify-center">
                  {user?.TenKhachHang?.[0] || user?.TenNhanVien?.[0] || 'A'}
                </div>
                
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link 
                    to="/account" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Thông tin tài khoản
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="font-semibold text-xl">Menu</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <nav className="p-4 space-y-2">
                <SidebarContent isActive={isActive} />
              </nav>
            </div>
          </div>
        )}

        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow-md">
          <div className="p-6">
            <nav className="space-y-2">
              <SidebarContent isActive={isActive} />
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-auto pt-8 pb-4">
            <div className="container mx-auto px-4">
              <div className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Flower Shop Admin. Bản quyền thuộc về 21050043@student.bdu.edu.vn.
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

// Component sidebar content để tái sử dụng cho cả mobile và desktop
function SidebarContent({ isActive }: { isActive: (path: string) => boolean }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.MaVaiTro === 0;
  const isVendor = user?.MaVaiTro === 3;
  
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // Tự động mở dropdown nếu đang ở trang /admin/users
    if (location.pathname === '/admin/users') {
      setUserManagementOpen(true);
    }
  }, [location.pathname]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Đăng xuất thành công!', 'success');
      navigate('/login');
    } catch (error) {
      addToast('Có lỗi xảy ra khi đăng xuất.', 'error');
    }
  };

  return (
    <>
      <Link
        to="/admin"
        className={`flex items-center px-4 py-2 rounded-md ${
          isActive('/admin')
            ? 'bg-pink-100 text-pink-600'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
        }`}
      >
        <Home className="h-5 w-5 mr-3" />
        <span>Tổng quan</span>
      </Link>

      <Link
        to="/admin/products"
        className={`flex items-center px-4 py-2 rounded-md ${
          isActive('/admin/products')
            ? 'bg-pink-100 text-pink-600'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
        }`}
      >
        <Package className="h-5 w-5 mr-3" />
        <span>Sản phẩm</span>
      </Link>

      <Link
        to="/admin/orders"
        className={`flex items-center px-4 py-2 rounded-md ${
          isActive('/admin/orders')
            ? 'bg-pink-100 text-pink-600'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
        }`}
      >
        <ShoppingBag className="h-5 w-5 mr-3" />
        <span>Đơn hàng</span>
      </Link>

      {/* Quản lý người dùng - chỉ admin */}
      {isAdmin && !isVendor && (
        <div>
          <button
            className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-pink-600`}
            onClick={() => setUserManagementOpen(!userManagementOpen)}
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3" />
              <span>Quản lý người dùng</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${userManagementOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {userManagementOpen && (
            <div className="ml-9 mt-2 space-y-1">
              <Link
                to={{ pathname: '/admin/users', search: '?tab=customers' }}
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === '/admin/users' && new URLSearchParams(location.search).get('tab') === 'customers'
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                Khách hàng
              </Link>
              <Link
                to={{ pathname: '/admin/users', search: '?tab=vendors' }}
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === '/admin/users' && new URLSearchParams(location.search).get('tab') === 'vendors'
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                Người bán
              </Link>
              <Link
                to={{ pathname: '/admin/users', search: '?tab=staff' }}
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === '/admin/users' && new URLSearchParams(location.search).get('tab') === 'staff'
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                Nhân viên
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => addToast('Chức năng Cài đặt sẽ được xây dựng trong tương lai!', 'info')}
        className={`flex items-center w-full px-4 py-2 rounded-md focus:outline-none transition ${
          isActive('/admin/settings')
            ? 'bg-pink-100 text-pink-600'
            : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
        }`}
      >
        <Settings className="h-5 w-5 mr-3" />
        <span>Cài đặt</span>
      </button>

      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-2 rounded-md text-red-500 hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 mr-3" />
        <span>Đăng xuất</span>
      </button>
    </>
  );
}

export default AdminLayout; 