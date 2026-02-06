import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, Loader } from 'lucide-react';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { getCategoryImage } from '../utils/image';

interface Category {
  MaDanhMuc: number;
  TenDanhMuc: string;
  HinhAnh?: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.CATEGORY.GET_ALL);
        setCategories(response.data);
      } catch (err) {
        setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau!');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Danh Mục Sản Phẩm</h1>
            <p className="text-lg max-w-2xl text-center mb-4">
              Khám phá các danh mục sản phẩm đa dạng của chúng tôi
            </p>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Danh Mục</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-primary-600" />
              <span className="ml-2">Đang tải danh mục...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  to={`/categories/${category.MaDanhMuc}`}
                  key={category.MaDanhMuc}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.TenDanhMuc}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600 transition">
                      {category.TenDanhMuc}
                    </h2>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Xem sản phẩm</span>
                      <ChevronRight className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Categories; 