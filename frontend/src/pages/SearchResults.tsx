import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Loader, Search } from 'lucide-react';
import { searchProducts } from '../services/product.service';
import { useQuery } from '../hooks/useQuery';
import { formatCurrency } from '../utils/format';

const SearchResults = () => {
  const query = useQuery().get('q') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    searchProducts(query, 1, 20)
      .then(res => {
        setProducts(res.products || []);
      })
      .catch(() => {
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau!');
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <MainLayout>
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2 flex justify-center items-center gap-2">
            <Search size={32} />
            Kết quả tìm kiếm
          </h1>
          <p className="text-lg">Từ khóa: <span className="font-semibold">{query}</span></p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-primary-600" />
              <span className="ml-2">Đang tìm kiếm sản phẩm...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="No results" className="mx-auto mb-4 w-24 h-24 opacity-60" />
              <h2 className="text-2xl font-semibold mb-2">Không tìm thấy sản phẩm phù hợp</h2>
              <p className="text-gray-600 mb-6">Hãy thử từ khóa khác hoặc kiểm tra lại chính tả.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <Link
                  to={`/products/${product.MaSanPham}`}
                  key={product.MaSanPham}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition flex flex-col"
                >
                  <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                    <img
                      src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `http://localhost:5000${product.HinhAnh}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                      alt={product.TenSanPham}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.TenSanPham}</h3>
                    <p className="text-primary-700 font-bold text-lg">{formatCurrency(product.GiaSanPham)}</p>
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

export default SearchResults; 