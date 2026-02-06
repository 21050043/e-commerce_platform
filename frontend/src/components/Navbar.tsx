import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, Home, Info, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { searchProducts } from '../services/product.service';
import type { ProductResponse as Product } from '../services/product.service';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStaff, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const { itemCount } = useCart();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Xử lý click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý tìm kiếm gợi ý
  const fetchSuggestions = useCallback(async (query: string) => {
    try {
      const res = await searchProducts(query, 1, 5);
      setSuggestions(res.products || []);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = window.setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, fetchSuggestions]);

  const handleSuggestionClick = (productId: number) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      addToast('Đăng xuất thành công!', 'success');
    } catch (error) {
      addToast('Có lỗi xảy ra khi đăng xuất.', 'error');
    }
  };

  // Render dropdown user
  const renderUserDropdown = () => (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 transition-all duration-300 transform origin-top-right">
      <div className="py-2">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.TenKhachHang || user?.TenNhanVien}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.Email || 'Chưa có email'}
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <Link
            to="/admin"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Package size={16} className="mr-3 text-primary-600" />
            <span>Quản trị</span>
          </Link>
        )}
        {user?.MaVaiTro === 3 && (
          <Link
            to="/admin"
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Package size={16} className="mr-3 text-primary-600" />
            <span>Khu vực người bán</span>
          </Link>
        )}

        <Link
          to="/account"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
          onClick={() => setIsDropdownOpen(false)}
        >
          <User size={16} className="mr-3 text-primary-600" />
          <span>Tài khoản</span>
        </Link>

        <Link
          to="/orders"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
          onClick={() => setIsDropdownOpen(false)}
        >
          <ShoppingCart size={16} className="mr-3 text-primary-600" />
          <span>Đơn hàng</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
        >
          <LogOut size={16} className="mr-3 text-primary-600" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  // Render mobile menu
  const renderMobileMenu = () => (
    <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'}`}>
      <div className="border-t border-primary-400 pt-4">
        <div className="mb-6 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="px-4 py-3 rounded-lg text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 p-2 rounded-full hover:bg-primary-700 transition"
            >
              <Search size={18} className="text-white" />
            </button>
          </form>

          {showSuggestions && searchQuery.trim() && (
            <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-b-xl z-30 border border-gray-200 mt-1 max-h-60 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <button
                    key={item.MaSanPham}
                    type="button"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors w-full text-left"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      handleSuggestionClick(item.MaSanPham);
                    }}
                  >
                    {item.HinhAnh ? (
                      <img
                        src={item.HinhAnh}
                        alt={item.TenSanPham}
                        className="w-12 h-12 object-cover rounded-xl border"
                        onError={e => (e.currentTarget.src = '/vite.svg')}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.TenSanPham}</p>
                      <p className="text-xs text-primary-600 font-semibold">
                        {item.GiaSanPham?.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không tìm thấy sản phẩm
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={toggleMenu}
          >
            <Home size={20} className="mr-3 text-primary-600" />
            <span className="font-medium">Trang chủ</span>
          </Link>

          <Link
            to="/categories"
            className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={toggleMenu}
          >
            <Package size={20} className="mr-3 text-primary-600" />
            <span className="font-medium">Danh mục</span>
          </Link>

          <Link
            to="/about"
            className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={toggleMenu}
          >
            <Info size={20} className="mr-3 text-primary-600" />
            <span className="font-medium">Về chúng tôi</span>
          </Link>

          <Link
            to="/cart"
            className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={toggleMenu}
          >
            <div className="relative mr-3">
              <ShoppingCart size={20} className="text-primary-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="font-medium">Giỏ hàng</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                onClick={toggleMenu}
              >
                <User size={20} className="mr-3 text-primary-600" />
                <span className="font-medium">Tài khoản</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <LogOut size={20} className="mr-3 text-primary-600" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block w-full text-center bg-white text-primary-600 px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium border border-primary-200"
              onClick={toggleMenu}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" aria-label="Trang chủ">
            <div className="bg-white p-2 rounded-full">
              <Package size={24} className="text-primary-600" />
            </div>
            <span className="text-xl font-bold tracking-tight">Electronic Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" icon={<Home size={18} />} label="Trang chủ" />
            <NavLink to="/categories" icon={<Package size={18} />} label="Danh mục" />
            {/* <NavLink to="/about" icon={<Info size={18} />} label="Về chúng tôi" /> */}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex relative w-96" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="px-4 py-2.5 rounded-l-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 w-full shadow-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-primary-700 px-5 rounded-r-xl hover:bg-primary-800 transition-colors shadow-sm"
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>
            </form>

            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl z-30 border border-gray-200 mt-1 max-h-60 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button
                      key={item.MaSanPham}
                      type="button"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors w-full text-left"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation();
                        handleSuggestionClick(item.MaSanPham);
                      }}
                    >
                      {item.HinhAnh ? (
                        <img
                          src={item.HinhAnh}
                          alt={item.TenSanPham}
                          className="w-12 h-12 object-cover rounded-xl border"
                          onError={e => (e.currentTarget.src = '/vite.svg')}
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center text-gray-400">
                          <Package size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.TenSanPham}</p>
                        <p className="text-xs text-primary-600 font-semibold">
                          {item.GiaSanPham?.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <Link
              to="/cart"
              className="relative hover:text-primary-200 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-1 hover:text-primary-200 focus:outline-none transition-colors group"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="bg-primary-500 p-1 rounded-full">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.TenKhachHang || user?.TenNhanVien}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen && renderUserDropdown()}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-primary-600 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors font-medium shadow-sm border border-primary-200"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMenu}
              className="focus:outline-none"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {renderMobileMenu()}
      </div>
    </nav>
  );
};

// Component phụ cho navigation link
const NavLink = ({
  to,
  icon,
  label
}: {
  to: string;
  icon: React.ReactNode;
  label: string
}) => (
  <Link
    to={to}
    className="flex items-center space-x-1.5 group transition-colors"
    aria-label={label}
  >
    <span className="text-primary-100 group-hover:text-white transition-colors">
      {icon}
    </span>
    <span className="font-medium group-hover:text-primary-100 transition-colors">
      {label}
    </span>
  </Link>
);

export default Navbar;