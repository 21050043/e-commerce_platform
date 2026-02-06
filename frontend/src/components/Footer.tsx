import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Legal Information Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Thông tin pháp lý</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/business-license" className="text-gray-300 hover:text-pink-400 transition">
                  Giấy phép kinh doanh
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-pink-400 transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="text-gray-300 hover:text-pink-400 transition">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-pink-400 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-pink-400 transition">
                  Danh mục sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-pink-400 transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-pink-400 transition">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-pink-400 transition">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">Danh mục sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categories/1" className="text-gray-300 hover:text-pink-400 transition">
                  Hoa sinh nhật
                </Link>
              </li>
              <li>
                <Link to="/categories/2" className="text-gray-300 hover:text-pink-400 transition">
                  Hoa khai trương
                </Link>
              </li>
              <li>
                <Link to="/categories/3" className="text-gray-300 hover:text-pink-400 transition">
                  Hoa cưới
                </Link>
              </li>
              <li>
                <Link to="/categories/4" className="text-gray-300 hover:text-pink-400 transition">
                  Hoa tang lễ
                </Link>
              </li>
              <li>
                <Link to="/categories/5" className="text-gray-300 hover:text-pink-400 transition">
                  Quà tặng lưu niệm
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-pink-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-pink-400" />
                <span className="text-gray-300">0938 320 498</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-pink-400" />
                <span className="text-gray-300">21050043@student.bdu.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Flower Shop. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 