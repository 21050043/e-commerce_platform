import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, RefreshCw, AlertCircle, X, Eye, Edit, Trash, Shield, ShieldOff } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllProducts, searchProducts, getVendorProducts, suspendProduct, unsuspendProduct } from '../../services/product.service';
import type { ProductResponse, ProductListResponse } from '../../services/product.service';
import { getAllCategories } from '../../services/category.service';
import type { CategoryResponse } from '../../services/category.service';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { addToast } = useToast();
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const outOfStockProducts = products.filter(p => p.SoLuong === 0);
  const { user } = useAuth();
  const isVendor = user?.MaVaiTro === 3;
  const isAdmin = user?.MaVaiTro === 0;
  const isStaff = user?.MaVaiTro === 1;
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [sortType, setSortType] = useState('newest');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [productToSuspend, setProductToSuspend] = useState<ProductResponse | null>(null);
  const [isAdminOrStaff, setIsAdminOrStaff] = useState(false);

  useEffect(() => {
    setIsAdminOrStaff(isAdmin || isStaff);
  }, [isAdmin, isStaff]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách danh mục
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);

        let productsData: ProductListResponse;
        if (isVendor) {
          // Vendor chỉ thấy sản phẩm của mình
          productsData = await getVendorProducts(currentPage, 10);
        } else if (searchTerm.trim()) {
          productsData = await searchProducts(searchTerm, currentPage, 10);
        } else {
          productsData = await getAllProducts(currentPage, 10);
        }
        let filteredProducts = productsData.products;
        // Nếu có chọn danh mục, lọc tiếp trên frontend
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(p => p.MaDanhMuc === selectedCategory);
        }
        setProducts(filteredProducts);
        setTotalPages(productsData.totalPages);
        
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, refreshTrigger, searchTerm, selectedCategory]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: number, product?: ProductResponse) => {
    const isSuspended = product?.TrangThaiKiemDuyet === 'SUSPENDED';
    const confirmMessage = isSuspended 
      ? 'Bạn có chắc chắn muốn xóa sản phẩm đã bị tạm dừng này? Hành động này không thể hoàn tác.'
      : 'Bạn có chắc chắn muốn xóa sản phẩm này?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(API_ENDPOINTS.VENDOR.PRODUCTS.DELETE(id), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          addToast(
            isSuspended ? 'Xóa sản phẩm bị tạm dừng thành công' : 'Xóa sản phẩm thành công', 
            'success'
          );
          setRefreshTrigger(prev => prev + 1);
        } else {
          const error = await response.json();
          addToast(error.message || 'Không thể xóa sản phẩm', 'error');
        }
      } catch (error) {
        addToast('Có lỗi xảy ra khi xóa sản phẩm', 'error');
      }
    }
  };

  // Admin/Staff are read-only; deletion is disabled

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSuspendProduct = (product: ProductResponse) => {
    setProductToSuspend(product);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const handleUnsuspendProduct = async (product: ProductResponse) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy tạm dừng sản phẩm "${product.TenSanPham}"?`)) {
      try {
        await unsuspendProduct(product.MaSanPham);
        addToast('Hủy tạm dừng sản phẩm thành công', 'success');
        setRefreshTrigger(prev => prev + 1);
      } catch (error: any) {
        addToast(error.response?.data?.message || 'Không thể hủy tạm dừng sản phẩm', 'error');
      }
    }
  };

  const handleConfirmSuspend = async () => {
    if (!productToSuspend || !suspendReason.trim()) {
      addToast('Vui lòng nhập lý do tạm dừng', 'error');
      return;
    }

    try {
      await suspendProduct(productToSuspend.MaSanPham, suspendReason.trim());
      addToast('Tạm dừng sản phẩm thành công', 'success');
      setShowSuspendModal(false);
      setProductToSuspend(null);
      setSuspendReason('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Không thể tạm dừng sản phẩm', 'error');
    }
  };

  const handleCancelSuspend = () => {
    setShowSuspendModal(false);
    setProductToSuspend(null);
    setSuspendReason('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Sắp xếp products trước khi render
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortType) {
      case 'newest':
        return b.MaSanPham - a.MaSanPham;
      case 'oldest':
        return a.MaSanPham - b.MaSanPham;
      case 'price-asc':
        return a.GiaSanPham - b.GiaSanPham;
      case 'price-desc':
        return b.GiaSanPham - a.GiaSanPham;
      case 'qty-asc':
        return a.SoLuong - b.SoLuong;
      case 'qty-desc':
        return b.SoLuong - a.SoLuong;
      case 'name-asc':
        return a.TenSanPham.localeCompare(b.TenSanPham, 'vi', { sensitivity: 'base' });
      case 'name-desc':
        return b.TenSanPham.localeCompare(a.TenSanPham, 'vi', { sensitivity: 'base' });
      default:
        return 0;
    }
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý sản phẩm</h1>
            <button
              className="relative focus:outline-none"
              onClick={() => setShowOutOfStock(true)}
              title="Xem sản phẩm hết hàng"
            >
              <AlertCircle className="w-7 h-7 text-red-500" />
              {outOfStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {outOfStockProducts.length}
                </span>
              )}
            </button>
          </div>
          {isVendor ? (
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={18} />
              <span>Thêm sản phẩm</span>
            </Link>
          ) : (
            <button
              className="flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
              title="Chỉ người bán (Vendor) mới có thể thêm sản phẩm"
            >
              <PlusCircle size={18} />
              <span>Thêm sản phẩm (Vendor)</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                    {category.TenDanhMuc}
                  </option>
                ))}
              </select>
              {/* Dropdown sắp xếp */}
              <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                className="border rounded-md px-3 py-2"
                title="Sắp xếp"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="qty-asc">Số lượng tăng dần</option>
                <option value="qty-desc">Số lượng giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
              <button
                onClick={handleRefresh}
                className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Hình ảnh
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Tên sản phẩm
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          Không có sản phẩm nào
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => (
                        <tr key={product.MaSanPham} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="w-16 h-16 rounded-md overflow-hidden">
                              {product.HinhAnh ? (
                                <img
                                  src={product.HinhAnh ? (product.HinhAnh.startsWith('http') ? product.HinhAnh : `${API_BASE_URL}${product.HinhAnh}`) : ''}
                                  alt={product.TenSanPham}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">Không có ảnh</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.TenSanPham}</div>
                            <div className="text-xs text-gray-500">Mã: {product.MaSanPham}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                              {product.DanhMuc?.TenDanhMuc || 'Không có danh mục'}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(product.GiaSanPham)}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              product.SoLuong > 10
                                ? 'bg-green-100 text-green-800'
                                : product.SoLuong > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.SoLuong}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            {product.TrangThaiKiemDuyet === 'SUSPENDED' ? (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
                                TẠM DỪNG
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                                HOẠT ĐỘNG
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                title="Xem chi tiết sản phẩm"
                                onClick={() => { setSelectedProduct(product); setShowDetail(true); }}
                              >
                                <Eye size={16} />
                              </button>
                              {isVendor && (
                                <>
                                  {product.TrangThaiKiemDuyet === 'SUSPENDED' ? (
                                    <button
                                      className="p-2 bg-gray-50 text-gray-400 rounded-md cursor-not-allowed"
                                      title="Không thể chỉnh sửa sản phẩm đã bị tạm dừng"
                                      disabled
                                    >
                                      <Edit size={16} />
                                    </button>
                                  ) : (
                                    <Link
                                      to={`/admin/products/edit/${product.MaSanPham}`}
                                      className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                      title="Chỉnh sửa sản phẩm"
                                    >
                                      <Edit size={16} />
                                    </Link>
                                  )}
                                  <button
                                    className={`p-2 rounded-md transition-colors ${
                                      product.TrangThaiKiemDuyet === 'SUSPENDED'
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                                    title={
                                      product.TrangThaiKiemDuyet === 'SUSPENDED'
                                        ? 'Xóa sản phẩm bị tạm dừng'
                                        : 'Xóa sản phẩm'
                                    }
                                    onClick={() => handleDelete(product.MaSanPham, product)}
                                  >
                                    <Trash size={16} />
                                  </button>
                                </>
                              )}
                              {isAdminOrStaff && (
                                <>
                                  {product.TrangThaiKiemDuyet === 'SUSPENDED' ? (
                                    <button
                                      className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                      title="Hủy tạm dừng sản phẩm"
                                      onClick={() => handleUnsuspendProduct(product)}
                                    >
                                      <ShieldOff size={16} />
                                    </button>
                                  ) : (
                                    <button
                                      className="p-2 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
                                      title="Tạm dừng sản phẩm"
                                      onClick={() => handleSuspendProduct(product)}
                                    >
                                      <Shield size={16} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex space-x-2" aria-label="Pagination">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {showOutOfStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in">
              <button onClick={() => setShowOutOfStock(false)} className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 transition">
                <X className="w-7 h-7" />
              </button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" /> Sản phẩm hết hàng ({outOfStockProducts.length})
              </h2>
              {outOfStockProducts.length === 0 ? (
                <div className="text-gray-500 italic">Không có sản phẩm nào hết hàng.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow mt-2">
                  <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Hình ảnh</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Tên sản phẩm</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {outOfStockProducts.map(product => (
                        <tr key={product.MaSanPham} className="hover:bg-pink-50 transition">
                          <td className="px-4 py-2">
                            <div className="w-12 h-12 rounded-md overflow-hidden">
                              {product.HinhAnh ? (
                                <img
                                  src={product.HinhAnh.startsWith('http') ? product.HinhAnh : `${API_BASE_URL}${product.HinhAnh}`}
                                  alt={product.TenSanPham}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">Không có ảnh</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-800">{product.TenSanPham}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                              {product.DanhMuc?.TenDanhMuc || 'Không có danh mục'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right text-pink-600 font-semibold">{formatCurrency(product.GiaSanPham)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {showDetail && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative animate-fade-in">
              <button onClick={() => setShowDetail(false)} className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 transition">
                <X className="w-7 h-7" />
              </button>
              <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-pink-100 shadow">
                    {selectedProduct.HinhAnh ? (
                      <img
                        src={selectedProduct.HinhAnh.startsWith('http') ? selectedProduct.HinhAnh : `${API_BASE_URL}${selectedProduct.HinhAnh}`}
                        alt={selectedProduct.TenSanPham}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400">Không có ảnh</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.TenSanPham}</h2>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Mã sản phẩm:</span>
                    <span>{selectedProduct.MaSanPham}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Danh mục:</span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                      {selectedProduct.DanhMuc?.TenDanhMuc || 'Không có danh mục'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Giá:</span>
                    <span className="text-pink-600 font-bold text-lg">{formatCurrency(selectedProduct.GiaSanPham)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Số lượng tồn kho:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${selectedProduct.SoLuong > 10 ? 'bg-green-100 text-green-800' : selectedProduct.SoLuong > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{selectedProduct.SoLuong}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Trạng thái:</span>
                    {selectedProduct.TrangThaiKiemDuyet === 'SUSPENDED' ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
                        TẠM DỪNG
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                        HOẠT ĐỘNG
                      </span>
                    )}
                  </div>
                  {selectedProduct.TrangThaiKiemDuyet === 'SUSPENDED' && selectedProduct.LyDoTamDung && (
                    <div>
                      <span className="font-semibold text-gray-700">Lý do tạm dừng:</span>
                      <div className="text-red-600 mt-1 p-2 bg-red-50 rounded-md">{selectedProduct.LyDoTamDung}</div>
                    </div>
                  )}
                  {selectedProduct.TrangThaiKiemDuyet === 'SUSPENDED' && isVendor && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-orange-800">
                            Thông tin cho người bán
                          </h3>
                          <div className="mt-1 text-sm text-orange-700">
                            <p>Sản phẩm này đã bị tạm dừng bởi quản trị viên. Bạn có thể xóa sản phẩm này nếu không muốn giữ lại.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">Mô tả:</span>
                    <div className="text-gray-600 mt-1 whitespace-pre-line">{selectedProduct.MoTa || 'Không có mô tả.'}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setShowDetail(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-pink-100 hover:text-pink-600 font-medium transition">Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Suspension Modal */}
        {showSuspendModal && productToSuspend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
              <button 
                onClick={handleCancelSuspend} 
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-orange-500" />
                  Tạm dừng sản phẩm
                </h2>
                <p className="text-gray-600">
                  Bạn đang tạm dừng sản phẩm: <span className="font-semibold">{productToSuspend.TenSanPham}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do tạm dừng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Nhập lý do tạm dừng sản phẩm (tối thiểu 10 ký tự)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {suspendReason.length}/500 ký tự
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelSuspend}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmSuspend}
                  disabled={suspendReason.trim().length < 10}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Tạm dừng sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductManagement; 