import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { CreditCard, Truck, MapPin, ShieldCheck, CheckCircle2, Wallet, Banknote, Landmark, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/format';

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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    diaChi: '',
    phuongThucTT: 'Tiền mặt',
  });
  const [orderError, setOrderError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Address integration
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

  const { isAuthenticated } = useAuth();
  const { cart: cartItems, clearAll } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      setSearchDistrict('');
      setSearchWard('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
      setSelectedWard(null);
      setSearchWard('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout', message: 'Vui lòng đăng nhập để thanh toán' } });
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const formattedCart = cartItems.map(item => ({
      productId: item.product.MaSanPham,
      name: item.product.TenSanPham,
      price: item.price,
      quantity: item.quantity,
      image: item.product.HinhAnh || ''
    }));

    setCart(formattedCart);
  }, [isAuthenticated, navigate, cartItems]);

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressDetail || !selectedProvince || !selectedDistrict || !selectedWard) {
      addToast('Vui lòng hoàn tất địa chỉ giao hàng', 'error');
      return;
    }

    setSubmitting(true);
    try {
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

      const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);

      if (response.status === 201 || response.status === 200) {
        addToast('Đặt hàng thành công!', 'success');
        setStep(3); // Show Success State
        setTimeout(() => {
          clearAll();
          navigate('/orders', { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      setOrderError(error.response?.data?.message || 'Có lỗi xảy ra');
      addToast(error.response?.data?.message || 'Đặt hàng thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Vận chuyển', icon: MapPin },
    { id: 2, name: 'Thanh toán', icon: CreditCard },
  ];

  if (step === 3) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-200"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-900 mb-4"
          >
            Đã đặt hàng thành công!
          </motion.h1>
          <p className="text-gray-500 font-medium italic">Chúng tôi đang chuẩn bị đơn hàng cho bạn và sẽ giao nhanh nhất có thể.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <section className="bg-gray-900 pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-8 tracking-tighter text-center">Hoàn tất đơn hàng</h1>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
              {steps.map((s) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-800 text-gray-500'}`}>
                    <s.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-white' : 'text-gray-600'}`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Form Side */}
              <div className="lg:w-2/3 space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100"
                    >
                      <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <MapPin className="text-primary-600" /> Địa chỉ giao nhận
                      </h2>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="relative group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 absolute left-4 top-3 transition-all group-focus-within:text-primary-500 group-focus-within:top-1 group-focus-within:scale-75 origin-left">Địa chỉ cụ thể</label>
                          <input
                            type="text"
                            value={addressDetail}
                            onChange={e => setAddressDetail(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl px-4 pt-7 pb-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                            placeholder="Số nhà, tên đường..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Province */}
                          <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Tỉnh / Thành</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                              placeholder="Chọn..."
                              value={searchProvince}
                              onChange={e => setSearchProvince(e.target.value)}
                              onFocus={() => setFocusProvince(true)}
                              onBlur={() => setTimeout(() => setFocusProvince(false), 200)}
                            />
                            {focusProvince && (
                              <ul className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                                {provinces.filter(p => p.name.toLowerCase().includes(searchProvince.toLowerCase())).map(p => (
                                  <li
                                    key={p.code}
                                    onMouseDown={() => { setSelectedProvince(p); setSearchProvince(p.name); }}
                                    className="px-4 py-3 rounded-xl hover:bg-primary-50 cursor-pointer font-bold text-gray-700 transition-colors"
                                  >
                                    {p.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* District */}
                          <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Quận / Huyện</label>
                            <input
                              type="text"
                              disabled={!selectedProvince}
                              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-40"
                              placeholder="Chọn..."
                              value={searchDistrict}
                              onChange={e => setSearchDistrict(e.target.value)}
                              onFocus={() => setFocusDistrict(true)}
                              onBlur={() => setTimeout(() => setFocusDistrict(false), 200)}
                            />
                            {focusDistrict && selectedProvince && (
                              <ul className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                                {districts.filter(d => d.name.toLowerCase().includes(searchDistrict.toLowerCase())).map(d => (
                                  <li
                                    key={d.code}
                                    onMouseDown={() => { setSelectedDistrict(d); setSearchDistrict(d.name); }}
                                    className="px-4 py-3 rounded-xl hover:bg-primary-50 cursor-pointer font-bold text-gray-700 transition-colors"
                                  >
                                    {d.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Ward */}
                          <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Phường / Xã</label>
                            <input
                              type="text"
                              disabled={!selectedDistrict}
                              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-40"
                              placeholder="Chọn..."
                              value={searchWard}
                              onChange={e => setSearchWard(e.target.value)}
                              onFocus={() => setFocusWard(true)}
                              onBlur={() => setTimeout(() => setFocusWard(false), 200)}
                            />
                            {focusWard && selectedDistrict && (
                              <ul className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                                {wards.filter(w => w.name.toLowerCase().includes(searchWard.toLowerCase())).map(w => (
                                  <li
                                    key={w.code}
                                    onMouseDown={() => { setSelectedWard(w); setSearchWard(w.name); }}
                                    className="px-4 py-3 rounded-xl hover:bg-primary-50 cursor-pointer font-bold text-gray-700 transition-colors"
                                  >
                                    {w.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="pt-8">
                          <button
                            onClick={() => {
                              if (addressDetail && selectedProvince && selectedDistrict && selectedWard) setStep(2);
                              else addToast('Vui lòng nhập đầy đủ địa chỉ', 'info');
                            }}
                            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition shadow-xl shadow-gray-200"
                          >
                            Tiếp tục đến thanh toán
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <CreditCard className="text-pink-500" /> Thanh toán
                          </h2>
                          <button onClick={() => setStep(1)} className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">Thay đổi địa chỉ</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          {[
                            { id: 'Tiền mặt', label: 'Tiền mặt (COD)', icon: Banknote, color: 'emerald' },
                            { id: 'Chuyển khoản', label: 'Ngân hàng', icon: Landmark, color: 'blue' },
                            { id: 'Momo', label: 'Ví MoMo', icon: Wallet, color: 'pink' },
                            { id: 'ZaloPay', label: 'ZaloPay', icon: Wallet, color: 'cyan' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setFormData(p => ({ ...p, phuongThucTT: m.id as any }))}
                              className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left group ${formData.phuongThucTT === m.id ? 'border-primary-500 bg-primary-50/30' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                            >
                              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${m.color}-500 group-hover:scale-110 transition-transform`}>
                                <m.icon size={24} />
                              </div>
                              <div>
                                <p className="font-black text-gray-900">{m.label}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">An toàn & bảo mật</p>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-4">
                          <ShieldCheck className="text-amber-600 shrink-0" />
                          <p className="text-sm text-amber-800 font-medium italic">Chúng tôi cam kết bảo vệ dữ liệu thanh toán của bạn. Đây là môi trường đặt hàng an toàn.</p>
                        </div>

                        {/* Conditional Payment Details Form */}
                        <AnimatePresence>
                          {formData.phuongThucTT !== 'Tiền mặt' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 pt-6 border-t border-gray-100 overflow-hidden"
                            >
                              <div className="bg-primary-50/50 rounded-3xl p-6 border border-primary-100">
                                <div className="flex items-center gap-3 mb-4">
                                  <Info className="text-primary-600" size={20} />
                                  <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Thông tin thanh toán giả lập</h4>
                                </div>
                                <p className="text-xs text-primary-700 mb-6 font-medium leading-relaxed italic">
                                  Hệ thống đang ở chế độ thử nghiệm. Vui lòng nhập thông tin giả để hoàn tất quy trình.
                                  <strong className="block mt-1 uppercase text-[10px] tracking-tighter">KHÔNG thực hiện giao dịch thật tại đây.</strong>
                                </p>

                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative group">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Số điện thoại / TK</label>
                                      <input
                                        type="text"
                                        placeholder="0xxxxxxxxx"
                                        className="w-full bg-white border border-primary-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
                                      />
                                    </div>
                                    <div className="relative group">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Mã tham chiếu (tùy chọn)</label>
                                      <input
                                        type="text"
                                        placeholder="TXN-123456"
                                        className="w-full bg-white border border-primary-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                          <Truck className="text-amber-500" /> Vận chuyển
                        </h2>
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-blue-50 border border-blue-100 group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                              <Truck size={24} />
                            </div>
                            <div>
                              <p className="font-black text-gray-900">Giao hàng tiêu chuẩn</p>
                              <p className="text-xs text-blue-600 font-bold italic">Dự kiến: 2-3 ngày làm việc</p>
                            </div>
                          </div>
                          <span className="font-black text-green-600 uppercase text-xs tracking-widest">Miễn phí</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Summary Side */}
              <div className="lg:w-1/3">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -mr-16 -mt-16 opacity-30 blur-3xl" />
                    <h3 className="text-xl font-black text-gray-900 mb-6 relative">Tóm tắt sản phẩm</h3>

                    <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4 custom-scrollbar">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex gap-4 items-center group">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{item.name}</h4>
                            <p className="text-xs text-gray-400 font-bold">SL: {item.quantity} × {formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-dashed border-gray-100">
                      <div className="flex justify-between text-gray-500 font-bold text-sm">
                        <span>Tạm tính</span>
                        <span className="text-gray-900">{formatCurrency(calculateTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between font-black text-gray-900 text-xl pt-4 border-t border-gray-100">
                        <span>Tổng tiền</span>
                        <span className="text-primary-600 tracking-tighter">{formatCurrency(calculateTotalPrice())}</span>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      {step === 2 && (
                        <motion.button
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full bg-primary-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition disabled:bg-gray-400"
                        >
                          {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                        </motion.button>
                      )}

                      {orderError && (
                        <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest text-center p-3 rounded-xl border border-red-100">
                          {orderError}
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-green-500" />
                        Giao dịch bảo mật 256-bit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Checkout;