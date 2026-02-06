import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ChevronRight, CreditCard, Truck, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutForm {
  diaChi: string;
  phuongThucTT: 'Tiền mặt' | 'Chuyển khoản' | 'Momo' | 'ZaloPay';
}

const Checkout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    diaChi: '',
    phuongThucTT: 'Tiền mặt',
  });
  const [orderError, setOrderError] = useState<string | null>(null);
  // Dropdown cho địa chỉ
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [addressDetail, setAddressDetail] = useState('');
  const [searchProvince, setSearchProvince] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchWard, setSearchWard] = useState('');
  const [focusProvince, setFocusProvince] = useState(false);
  const [focusDistrict, setFocusDistrict] = useState(false);
  const [focusWard, setFocusWard] = useState(false);
  // Fetch Provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  // Fetch Districts
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedProvince]);

  // Fetch Wards
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
      setSelectedWard(null);
    }
  }, [selectedDistrict]);

  const { user, isAuthenticated } = useAuth();
  const { cart: cartItems, clearAll } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout', message: 'Vui lòng đăng nhập để thanh toán' } });
      return;
    }

    // Lấy thông tin địa chỉ từ user
    if (user && user.DiaChi) {
      setFormData(prev => ({
        ...prev,
        diaChi: user.DiaChi
      }));
    }

    // Sử dụng dữ liệu từ CartContext thay vì trực tiếp từ localStorage
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Chuyển đổi từ định dạng CartContext sang định dạng CartItem cho trang thanh toán
    const formattedCart = cartItems.map(item => ({
      productId: item.product.MaSanPham,
      name: item.product.TenSanPham,
      price: item.price,
      quantity: item.quantity,
      image: item.product.HinhAnh || ''
    }));

    setCart(formattedCart);
    setLoading(false);
  }, [isAuthenticated, user, navigate, cartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!addressDetail || !selectedProvince || !selectedDistrict || !selectedWard) {
      alert('Vui lòng nhập đầy đủ địa chỉ giao hàng');
      return;
    }

    try {
      setSubmitting(true);
      setOrderError(null);


      // Gộp địa chỉ thành một dòng
      const fullAddress = `${addressDetail}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
      const orderData = {
        PhuongThucTT: formData.phuongThucTT,
        DiaChi: fullAddress,
        TongTien: calculateTotalPrice(),
        items: cart.map(item => ({
          MaSanPham: item.productId,
          SoLuong: item.quantity,
          DonGia: item.price,
          ThanhTien: item.price * item.quantity
        }))
      };

      // Gửi yêu cầu tạo đơn hàng
      const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);

      // Đảm bảo đơn hàng đã được tạo thành công
      if (response.status === 201 || response.status === 200) {
        // Hiển thị thông báo thành công
        addToast('Đặt hàng thành công! Bạn có thể xem chi tiết trong trang Đơn hàng của tôi.', 'success');

        // Đảm bảo chuyển hướng trước khi xóa giỏ hàng để tránh tự động chuyển về /cart
        // Sử dụng setTimeout để đảm bảo việc chuyển hướng diễn ra trước
        setTimeout(() => {
          // Xóa giỏ hàng sau khi đã chuyển hướng
          clearAll();
        }, 100);

        // Chuyển hướng ngay lập tức đến trang đơn hàng
        navigate('/orders', { replace: true });
      } else {
        throw new Error('Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setOrderError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
      addToast('Đặt hàng thất bại: ' + (error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Thanh Toán</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <Link to="/cart" className="hover:underline">Giỏ Hàng</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Thanh Toán</span>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
              {/* Checkout Form */}
              <div className="lg:w-2/3">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="text-primary-600 mr-2" size={24} />
                    <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Địa chỉ nhà, đường <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressDetail}
                      onChange={e => setAddressDetail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nhập số nhà, tên đường..."
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md"
                        placeholder="Tìm kiếm Tỉnh/Thành phố"
                        value={searchProvince}
                        onChange={e => setSearchProvince(e.target.value)}
                        onFocus={() => setFocusProvince(true)}
                        onBlur={() => setTimeout(() => setFocusProvince(false), 200)}
                        autoComplete="off"
                      />
                      {(focusProvince && (searchProvince.length > 0 || searchProvince.length === 0)) && (
                        <ul className="absolute z-10 w-full bg-white border rounded-md max-h-60 overflow-y-auto shadow-lg mt-1">
                          {(searchProvince.length === 0
                            ? provinces
                            : provinces.filter(p => {
                              const terms = searchProvince.toLowerCase().split(/\s+/).filter(Boolean);
                              return terms.every(term => p.name.toLowerCase().includes(term));
                            })
                          ).map(p => (
                            <li
                              key={p.code}
                              className={`px-4 py-2 cursor-pointer hover:bg-primary-50 ${selectedProvince?.code === p.code ? 'bg-primary-100' : ''}`}
                              onMouseDown={() => {
                                setSelectedProvince(p);
                                setSearchProvince(p.name);
                              }}
                            >{p.name}</li>
                          ))}
                          {(searchProvince.length > 0 && provinces.filter(p => {
                            const terms = searchProvince.toLowerCase().split(/\s+/).filter(Boolean);
                            return terms.every(term => p.name.toLowerCase().includes(term));
                          }).length === 0) && (
                              <li className="px-4 py-2 text-gray-400">Không tìm thấy</li>
                            )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quận/Huyện <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md"
                        placeholder="Tìm kiếm Quận/Huyện"
                        value={searchDistrict}
                        onChange={e => setSearchDistrict(e.target.value)}
                        onFocus={() => setFocusDistrict(true)}
                        onBlur={() => setTimeout(() => setFocusDistrict(false), 200)}
                        disabled={!selectedProvince}
                        autoComplete="off"
                      />
                      {(focusDistrict && (searchDistrict.length > 0 || searchDistrict.length === 0)) && (
                        <ul className="absolute z-10 w-full bg-white border rounded-md max-h-60 overflow-y-auto shadow-lg mt-1">
                          {(searchDistrict.length === 0
                            ? districts
                            : districts.filter(d => {
                              const terms = searchDistrict.toLowerCase().split(/\s+/).filter(Boolean);
                              return terms.every(term => d.name.toLowerCase().includes(term));
                            })
                          ).map(d => (
                            <li
                              key={d.code}
                              className={`px-4 py-2 cursor-pointer hover:bg-primary-50 ${selectedDistrict?.code === d.code ? 'bg-primary-100' : ''}`}
                              onMouseDown={() => {
                                setSelectedDistrict(d);
                                setSearchDistrict(d.name);
                              }}
                            >{d.name}</li>
                          ))}
                          {(searchDistrict.length > 0 && districts.filter(d => {
                            const terms = searchDistrict.toLowerCase().split(/\s+/).filter(Boolean);
                            return terms.every(term => d.name.toLowerCase().includes(term));
                          }).length === 0) && (
                              <li className="px-4 py-2 text-gray-400">Không tìm thấy</li>
                            )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Phường/Xã <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-md"
                        placeholder="Tìm kiếm Phường/Xã"
                        value={searchWard}
                        onChange={e => setSearchWard(e.target.value)}
                        onFocus={() => setFocusWard(true)}
                        onBlur={() => setTimeout(() => setFocusWard(false), 200)}
                        disabled={!selectedDistrict}
                        autoComplete="off"
                      />
                      {(focusWard && (searchWard.length > 0 || searchWard.length === 0)) && (
                        <ul className="absolute z-10 w-full bg-white border rounded-md max-h-60 overflow-y-auto shadow-lg mt-1">
                          {(searchWard.length === 0
                            ? wards
                            : wards.filter(w => {
                              const terms = searchWard.toLowerCase().split(/\s+/).filter(Boolean);
                              return terms.every(term => w.name.toLowerCase().includes(term));
                            })
                          ).map(w => (
                            <li
                              key={w.code}
                              className={`px-4 py-2 cursor-pointer hover:bg-primary-50 ${selectedWard?.code === w.code ? 'bg-primary-100' : ''}`}
                              onMouseDown={() => {
                                setSelectedWard(w);
                                setSearchWard(w.name);
                              }}
                            >{w.name}</li>
                          ))}
                          {(searchWard.length > 0 && wards.filter(w => {
                            const terms = searchWard.toLowerCase().split(/\s+/).filter(Boolean);
                            return terms.every(term => w.name.toLowerCase().includes(term));
                          }).length === 0) && (
                              <li className="px-4 py-2 text-gray-400">Không tìm thấy</li>
                            )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="text-pink-500 mr-2" size={24} />
                    <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="phuongThucTT"
                          value="Tiền mặt"
                          checked={formData.phuongThucTT === 'Tiền mặt'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="phuongThucTT"
                          value="Chuyển khoản"
                          checked={formData.phuongThucTT === 'Chuyển khoản'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Chuyển khoản ngân hàng</span>
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="phuongThucTT"
                          value="Momo"
                          checked={formData.phuongThucTT === 'Momo'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Ví MoMo</span>
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="phuongThucTT"
                          value="ZaloPay"
                          checked={formData.phuongThucTT === 'ZaloPay'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>ZaloPay</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mt-4">
                    <p className="text-sm">
                      <strong>Lưu ý:</strong> Đây chỉ là chức năng thử nghiệm, không thanh toán thật.
                    </p>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <Truck className="text-pink-500 mr-2" size={24} />
                    <h2 className="text-xl font-semibold">Phương thức vận chuyển</h2>
                  </div>

                  <div>
                    <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
                      <div>
                        <p className="font-medium">Giao hàng tiêu chuẩn</p>
                        <p className="text-sm text-gray-600">Thời gian giao hàng: 2-3 ngày</p>
                      </div>
                      <div className="text-right font-medium text-green-600">Miễn phí</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-gray-700 mb-1">Sản phẩm ({cart.length}):</p>
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Tạm tính</span>
                      <span>{formatPrice(calculateTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Phí vận chuyển</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-b py-4 my-2">
                      <span>Tổng cộng</span>
                      <span className="text-primary-700">{formatPrice(calculateTotalPrice())}</span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold ${submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                      } transition`}
                  >
                    {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>

                  <p className="text-sm text-gray-600 mt-4">
                    Bằng cách đặt hàng, bạn đồng ý với điều khoản và chính sách của chúng tôi.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Checkout; 