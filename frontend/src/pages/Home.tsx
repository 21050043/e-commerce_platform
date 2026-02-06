import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Star, Loader } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getAllProducts } from '../services/product.service';
import { getAllCategories } from '../services/category.service';
import type { ProductResponse } from '../services/product.service';
import type { CategoryResponse } from '../services/category.service';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import { getCategoryImage } from '../utils/image';
import { getRandomRating } from '../utils/random';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const banners = [
    {
      id: 1,
      title: 'Bộ sưu tập hoa tươi mới nhất',
      description: 'Khám phá các loại hoa tươi đẹp nhất cho mọi dịp đặc biệt',
      image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/1'
    },
    {
      id: 2,
      title: 'Quà tặng cho người thân yêu',
      description: 'Những món quà ý nghĩa cho những người thân yêu của bạn',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/5'
    },
    {
      id: 3,
      title: 'Gấu bông đáng yêu',
      description: 'Bộ sưu tập gấu bông đáng yêu cho mọi lứa tuổi',
      image: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/6'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách danh mục từ API
        const categoriesResponse = await getAllCategories();
        setCategories(categoriesResponse);
        
        // Lấy danh sách sản phẩm nổi bật từ API
        const productsResponse = await getAllProducts(1, 4); // Giới hạn 4 sản phẩm
        setFeaturedProducts(productsResponse.products);
        
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (e: React.MouseEvent, product: ProductResponse) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Sử dụng hàm addItem từ CartContext
    addItem(product, 1);
    addToast(`Đã thêm ${product.TenSanPham} vào giỏ hàng!`, 'success');
  };

  // Danh sách các mã danh mục hoa
  const flowerCategoryIds = [1, 2, 3, 4];
  // Hàm random danh mục hoa
  const handleRandomFlowerCategory = () => {
    const randomId = flowerCategoryIds[Math.floor(Math.random() * flowerCategoryIds.length)];
    navigate(`/categories/${randomId}`);
  };

  return (
    <MainLayout>
      {/* Hero Banner Slider */}
      <div className="relative h-[500px] overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-lg text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{banner.title}</h1>
                <p className="text-lg mb-8">{banner.description}</p>
                {currentSlide === 0 ? (
                  <button
                    onClick={handleRandomFlowerCategory}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition"
                  >
                    Khám phá ngay
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                ) : (
                  <Link
                    to={banners[currentSlide].link}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition"
                  >
                    Khám phá ngay
                    <ChevronRight size={20} className="ml-2" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Slider controls */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Ornate Quote Section (below banner) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto bg-white shadow-xl border border-rose-100 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-rose-100 blur-2xl opacity-60"></div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-pink-100 blur-2xl opacity-60"></div>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-center mb-4">
                <span className="h-px w-10 bg-rose-200" />
                <span className="mx-3 text-rose-600 font-semibold tracking-wider text-xs uppercase">Về chúng tôi</span>
                <span className="h-px w-10 bg-rose-200" />
              </div>
              <blockquote className="text-center">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  “Florist's D.E.P là nền tảng sàn thương mại điện tử dành cho các đối tác và cửa hàng hoa,
                  kết nối người bán và khách hàng qua trải nghiệm mua sắm đơn giản, giao hàng nhanh chóng.
                  Tạo điều kiện để người bán phát triển thương hiệu, còn khách hàng tận hưởng những bó hoa được cá nhân hoá với chất lượng vượt trội.”
                </p>
              </blockquote>
            </div>
            <div className="border-t border-rose-100 p-4 bg-rose-50/40 text-center text-sm text-rose-700">
              Florist's D.E.P — Florist's delivery e-commerce platform
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-pink-500" />
              <span className="ml-2">Đang tải danh mục...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.MaDanhMuc}
                  to={`/categories/${category.MaDanhMuc}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.TenDanhMuc}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800">{category.TenDanhMuc}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-pink-500" />
              <span className="ml-2">Đang tải sản phẩm...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const rating = getRandomRating();
                return (
                  <div key={product.MaSanPham} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                    <Link to={`/products/${product.MaSanPham}`} className="block">
                      <div className="relative h-64 overflow-hidden group">
                        <img
                          src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `http://localhost:5000${product.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                          alt={product.TenSanPham}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>
                    <Link to={`/products/${product.MaSanPham}`} className="block p-4">
                      <div className="flex items-center text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < rating ? 'currentColor' : 'none'}
                            className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 hover:text-pink-600 transition-colors">{product.TenSanPham}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.DanhMuc?.TenDanhMuc}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-pink-600">{formatPrice(product.GiaSanPham)}</span>
                        <button 
                          className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-3 py-1 rounded-full transition-colors"
                          onClick={(e) => addToCart(e, product)}
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3 border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white rounded-lg transition"
            >
              Xem tất cả sản phẩm
              <ChevronRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* About us section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-4">Shop Hoa & Quà Tặng</h2>
              <p className="text-gray-600 mb-4">
                Chúng tôi cung cấp các loại hoa tươi và quà tặng chất lượng cao cho mọi dịp đặc biệt trong cuộc sống của bạn.
              </p>
              <p className="text-gray-600 mb-6">
                Với nhiều sản phẩm chất lượng, chúng tôi tự hào mang đến những sản phẩm đẹp nhất, dịch vụ tốt nhất và giá cả hợp lý nhất.
              </p>
              <Link
                to="/about"
                className="bg-pink-500 text-white px-6 py-3 rounded-lg inline-flex items-center hover:bg-pink-600 transition"
              >
                Tìm hiểu thêm
                <ChevronRight size={20} className="ml-2" />
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.pexels.com/photos/31098426/pexels-photo-31098426/free-photo-of-vibrant-spring-flowers-in-rustic-wooden-box.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Cửa hàng hoa"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
