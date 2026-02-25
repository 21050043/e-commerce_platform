import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Star } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import MainLayout from '../layouts/MainLayout';
import { getAllProducts } from '../services/product.service';
import { getAllCategories } from '../services/category.service';
import type { ProductResponse } from '../services/product.service';
import type { CategoryResponse } from '../services/category.service';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { getCategoryImage } from '../utils/image';
import { getRandomRating } from '../utils/random';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const bannerVariants: any = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

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
      title: 'Vi điều khiển & Nhúng',
      description: 'Khám phá các loại Board mạch Arduino, ESP32, STM32 chính hãng',
      image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/1'
    },
    {
      id: 2,
      title: 'Cảm biến & Module',
      description: 'Đầy đủ các loại cảm biến đo đạc và module chức năng cho dự án của bạn',
      image: 'https://images.unsplash.com/photo-1591405351990-4726e33df58a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/2'
    },
    {
      id: 3,
      title: 'Phụ kiện kĩ thuật',
      description: 'Nguồn, dây cắm, linh kiện thụ động và dụng cụ thực hành',
      image: 'https://images.unsplash.com/photo-1614811568291-7649b81b7e64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      link: '/categories/5'
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

  // Danh sách các mã danh mục tiêu biểu
  const featuredCategoryIds = [1, 2, 3, 5];
  // Hàm chuyển đến danh mục ngẫu nhiên
  const handleRandomCategory = () => {
    const randomId = featuredCategoryIds[Math.floor(Math.random() * featuredCategoryIds.length)];
    navigate(`/categories/${randomId}`);
  };

  return (
    <MainLayout>
      {/* Hero Banner Slider */}
      <div className="relative h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          {banners.map((banner, index) => index === currentSlide && (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="container mx-auto px-4 h-full flex items-center">
                <motion.div
                  variants={bannerVariants}
                  initial="initial"
                  animate="animate"
                  className="max-w-lg text-white"
                >
                  <motion.h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight shadow-sm">
                    {banner.title}
                  </motion.h1>
                  <motion.p className="text-xl mb-8 opacity-90 font-medium">
                    {banner.description}
                  </motion.p>
                  <div className="flex gap-4">
                    {currentSlide === 0 ? (
                      <button
                        onClick={handleRandomCategory}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl inline-flex items-center transition-all hover:scale-105 active:scale-95 font-bold shadow-lg"
                      >
                        Khám phá ngay
                        <ChevronRight size={20} className="ml-2" />
                      </button>
                    ) : (
                      <Link
                        to={banners[currentSlide].link}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl inline-flex items-center transition-all hover:scale-105 active:scale-95 font-bold shadow-lg"
                      >
                        Khám phá ngay
                        <ChevronRight size={20} className="ml-2" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Slider controls */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Ornate Quote Section (below banner) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto bg-white shadow-xl border border-primary-100 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary-100 blur-2xl opacity-60"></div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-secondary-100 blur-2xl opacity-60"></div>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex items-center justify-center mb-4">
                <span className="h-px w-10 bg-primary-200" />
                <span className="mx-3 text-primary-600 font-semibold tracking-wider text-xs uppercase">Về chúng tôi</span>
                <span className="h-px w-10 bg-primary-200" />
              </div>
              <blockquote className="text-center">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  “Electronic Hub là nền tảng sàn thương mại điện tử hàng đầu dành cho linh kiện điện tử và nhúng,
                  kết nối các nhà cung cấp uy tín và cộng đồng kỹ thuật.
                  Chúng tôi cam kết cung cấp linh kiện chất lượng cao, độ tin cậy tuyệt đối và hỗ trợ kỹ thuật tận tâm cho mọi dự án của bạn.”
                </p>
              </blockquote>
            </div>
            <div className="border-t border-primary-100 p-4 bg-primary-50/40 text-center text-sm text-primary-700">
              Electronic Hub — IoT & Engineering Solutions
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
                  <Skeleton height={120} className="mb-3" />
                  <Skeleton height={16} width="70%" className="mx-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories.map((category) => (
                <motion.div
                  key={category.MaDanhMuc}
                  variants={itemVariants}
                >
                  <Link
                    to={`/categories/${category.MaDanhMuc}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition block"
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md p-4">
                  <Skeleton height={200} className="mb-4" />
                  <Skeleton height={12} width="40%" className="mb-2" />
                  <Skeleton height={20} className="mb-2" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton height={24} width="40%" />
                    <Skeleton variant="circle" height={36} width={36} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {featuredProducts.map((product) => {
                const rating = getRandomRating();
                return (
                  <motion.div
                    key={product.MaSanPham}
                    variants={itemVariants}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition flex flex-col h-full"
                  >
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
                    <div className="p-4 flex flex-col flex-1">
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
                      <Link to={`/products/${product.MaSanPham}`} className="block mb-1">
                        <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 h-12">{product.TenSanPham}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-2">{product.DanhMuc?.TenDanhMuc}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-bold text-primary-600">{formatCurrency(product.GiaSanPham)}</span>
                        <button
                          className="bg-primary-600 hover:bg-primary-700 text-white text-sm p-2 rounded-full transition-all active:scale-90 shadow-md"
                          onClick={(e) => addToCart(e, product)}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center px-8 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              Xem tất cả sản phẩm
              <ChevronRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* About us section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Electronic Hub</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Chúng tôi cung cấp giải pháp linh kiện điện tử toàn diện cho kỹ sư, sinh viên và cộng đồng yêu công nghệ.
              </p>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Với danh mục sản phẩm đa dạng từ vi biểu khiển đến linh kiện thụ động, chúng tôi tự hào là đối tác tin cậy cho mọi dự án sáng tạo của bạn.
              </p>
              <Link
                to="/about"
                className="bg-primary-600 text-white px-8 py-3 rounded-xl inline-flex items-center hover:bg-primary-700 transition-all shadow-lg hover:scale-105"
              >
                Tìm hiểu thêm
                <ChevronRight size={20} className="ml-2" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1260&q=80"
                alt="Cửa hàng linh kiện điện tử"
                className="rounded-2xl shadow-2xl border-4 border-white"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
