import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Trash } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { getProductById } from '../../services/product.service';
import { getAllCategories } from '../../services/category.service';
// import type { ProductResponse } from '../../services/product.service';
import type { CategoryResponse } from '../../services/category.service';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants/api';
// import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductForm = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!productId;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    TenSanPham: string;
    MaDanhMuc: string;
    MoTa: string;
    SoLuong: string;
    GiaSanPham: string;
    imageFile: File | null;
  }>({
    TenSanPham: '',
    MaDanhMuc: '',
    MoTa: '',
    SoLuong: '0',
    GiaSanPham: '0',
    imageFile: null,
  });

  const { addToast } = useToast();
  const { user } = useAuth();
  const isVendor = user?.MaVaiTro === 3;
  const [productSuspended, setProductSuspended] = useState<boolean>(false);

  // Role-based access check
  useEffect(() => {
    if (user && !isVendor) {
      addToast('Chỉ người bán mới có thể tạo/cập nhật sản phẩm', 'error');
      navigate('/admin/products');
    }
  }, [user, isVendor, navigate, addToast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách danh mục
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // Nếu là chế độ chỉnh sửa, lấy thông tin sản phẩm
        if (isEditMode && productId) {
          const product = await getProductById(parseInt(productId));
          
          // Check if product is suspended
          if (product.TrangThaiKiemDuyet === 'SUSPENDED') {
            setProductSuspended(true);
            addToast('Sản phẩm này đã bị tạm dừng. Bạn không thể chỉnh sửa.', 'error');
            navigate('/admin/products');
            return;
          }
          
          setFormData({
            TenSanPham: product.TenSanPham,
            MaDanhMuc: product.MaDanhMuc.toString(),
            MoTa: product.MoTa || '',
            SoLuong: product.SoLuong.toString(),
            GiaSanPham: product.GiaSanPham.toString(),
            imageFile: null,
          });
          
          if (product.HinhAnh) {
            setImagePreview(product.HinhAnh.startsWith('http') ? product.HinhAnh : `${API_BASE_URL}${product.HinhAnh}`);
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, isEditMode]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Tạo URL xem trước
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('TenSanPham', formData.TenSanPham);
      formDataToSend.append('MaDanhMuc', formData.MaDanhMuc);
      formDataToSend.append('MoTa', formData.MoTa);
      formDataToSend.append('SoLuong', formData.SoLuong);
      formDataToSend.append('GiaSanPham', formData.GiaSanPham);
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }
      
      const url = isEditMode 
        ? API_ENDPOINTS.VENDOR.PRODUCTS.UPDATE(parseInt(productId!))
        : API_ENDPOINTS.VENDOR.PRODUCTS.CREATE;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu sản phẩm');
      }
      
      addToast(isEditMode ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công', 'success');
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      addToast(error.message || 'Có lỗi xảy ra khi lưu sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">
              {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {productSuspended && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Sản phẩm đã bị tạm dừng
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Sản phẩm này đã bị tạm dừng bởi quản trị viên. Bạn không thể chỉnh sửa sản phẩm đã bị tạm dừng.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loading && !error ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="TenSanPham" className="block text-sm font-medium text-gray-700 mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="TenSanPham"
                      name="TenSanPham"
                      value={formData.TenSanPham}
                      onChange={handleInputChange}
                      required
                      disabled={productSuspended}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${productSuspended ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="MaDanhMuc" className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="MaDanhMuc"
                      name="MaDanhMuc"
                      value={formData.MaDanhMuc}
                      onChange={handleInputChange}
                      required
                      disabled={productSuspended}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${productSuspended ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((category) => (
                        <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                          {category.TenDanhMuc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="SoLuong" className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="SoLuong"
                        name="SoLuong"
                        value={formData.SoLuong}
                        onChange={handleInputChange}
                        min="0"
                        required
                        disabled={productSuspended}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${productSuspended ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="GiaSanPham" className="block text-sm font-medium text-gray-700 mb-1">
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="GiaSanPham"
                        name="GiaSanPham"
                        value={formData.GiaSanPham}
                        onChange={handleInputChange}
                        min="0"
                        required
                        disabled={productSuspended}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${productSuspended ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="MoTa" className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      id="MoTa"
                      name="MoTa"
                      value={formData.MoTa}
                      onChange={handleInputChange}
                      rows={5}
                      disabled={productSuspended}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${productSuspended ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh sản phẩm
                  </label>
                  <div className="mt-1 flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative w-full h-64 mb-4">
                        <img
                          src={imagePreview}
                          alt="Xem trước"
                          className="w-full h-full object-contain border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center mb-4">
                        <Upload size={48} className="text-gray-400" />
                        <p className="text-gray-500 mt-2">Chưa có hình ảnh</p>
                      </div>
                    )}
                    <label className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      {imagePreview ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || productSuspended}
                  className={`flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    productSuspended 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save size={18} />
                  {loading ? 'Đang lưu...' : productSuspended ? 'Không thể lưu' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm; 