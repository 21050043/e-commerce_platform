import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, ChevronLeft, ChevronDown, Star, ShoppingCart, Loader } from 'lucide-react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import type { ProductResponse } from '../services/product.service';
import { formatCurrency } from '../utils/format';
import { getRandomRating } from '../utils/random';

interface Product {
  MaSanPham: number;
  TenSanPham: string;
  GiaSanPham: number;
  HinhAnh: string;
  SoLuong: number;
  DanhMuc: {
    MaDanhMuc: number;
    TenDanhMuc: string;
  };
}

interface Category {
  MaDanhMuc: number;
  TenDanhMuc: string;
}

// Move priceRanges outside the component
const priceRanges = [
  { label: 'Tất cả', min: 0, max: null },
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100.000đ - 300.000đ', min: 100000, max: 300000 },
  { label: '300.000đ - 500.000đ', min: 300000, max: 500000 },
  { label: 'Trên 500.000đ', min: 500000, max: null },
];

const ProductsByCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { addToast } = useToast();
  const { addItem } = useCart();
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ label: string; min: number; max: number | null }>(priceRanges[0]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);

    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        // Fetch category info
        const categoryResponse = await api.get(API_ENDPOINTS.CATEGORY.GET_BY_ID(parseInt(categoryId || '0')));
        setCategory(categoryResponse.data);

        // Fetch products by category (no price filter at backend)
        const productsResponse = await api.get(API_ENDPOINTS.PRODUCT.GET_BY_CATEGORY(parseInt(categoryId || '0')), {
          params: {
            page,
            limit: 100, // fetch more to allow frontend filtering
          }
        });
        setProducts(productsResponse.data.products);
        setTotalPages(productsResponse.data.totalPages);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId, searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage.toString() });
  };

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    // Chuyển đổi Product thành ProductResponse để phù hợp với interface yêu cầu
    const productForCart: ProductResponse = {
      MaSanPham: product.MaSanPham,
      TenSanPham: product.TenSanPham,
      GiaSanPham: product.GiaSanPham,
      SoLuong: product.SoLuong,
      HinhAnh: product.HinhAnh,
      MaDanhMuc: product.DanhMuc.MaDanhMuc,
      DanhMuc: product.DanhMuc
    };

    // Sử dụng hàm addItem từ CartContext
    addItem(productForCart, 1);
    addToast(`Đã thêm ${product.TenSanPham} vào giỏ hàng!`, 'success');
  };

  const filteredProducts = products.filter((product) => {
    if (selectedPriceRange.min !== null && product.GiaSanPham < selectedPriceRange.min) return false;
    if (selectedPriceRange.max !== null && product.GiaSanPham >= selectedPriceRange.max) return false;
    return true;
  });

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">
              {loading ? 'Đang tải...' : category?.TenDanhMuc || 'Danh mục sản phẩm'}
            </h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <Link to="/categories" className="hover:underline">Danh Mục</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>{category?.TenDanhMuc || 'Sản phẩm'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="md:w-1/4 lg:w-1/5">
              {/* Price Filter */}
              <div className="bg-white p-5 rounded-lg shadow mb-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <h3 className="font-semibold text-lg">Lọc theo giá</h3>
                  <ChevronDown
                    className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </div>
                {showFilters && (
                  <div className="mt-4 space-y-2">
                    {priceRanges.map((range, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left px-4 py-2 rounded transition font-medium border border-gray-200 hover:bg-primary-50 focus:outline-none ${selectedPriceRange.label === range.label ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}
                        onClick={() => setSelectedPriceRange(range)}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:w-3/4 lg:w-4/5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="animate-spin h-8 w-8 text-primary-600" />
                  <span className="ml-2">Đang tải sản phẩm...</span>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
                  <span className="block sm:inline">{error}</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative text-center">
                  <span className="block sm:inline">Không có sản phẩm nào trong khoảng giá này.</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const rating = getRandomRating();
                      return (
                        <div key={product.MaSanPham} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                          <Link to={`/products/${product.MaSanPham}`} className="block">
                            <div className="relative h-64 overflow-hidden group">
                              <img
                                src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `http://localhost:5000${product.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'}
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
                            <h3 className="font-semibold text-gray-800 mb-1 hover:text-primary-600 transition-colors">
                              {product.TenSanPham}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{product.DanhMuc?.TenDanhMuc}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-primary-600">
                                {formatCurrency(product.GiaSanPham)}
                              </span>
                              <button
                                className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-3 py-1 rounded-full transition-colors"
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-10">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${currentPage === 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-primary-600 hover:text-white'
                            }`}
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-md ${currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-primary-600 hover:text-white'
                              }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-md ${currentPage === totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-primary-600 hover:text-white'
                            }`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ProductsByCategory; 