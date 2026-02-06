import { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/format';

import { Package, ShoppingBag, TrendingUp, DollarSign, Clock } from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getVendorProducts } from '../../services/product.service';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrdersDirect: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const products = await getVendorProducts(1, 1000);

                setStats({
                    totalProducts: (products as any).totalItems || 0,
                    totalOrders: 12, // Placeholder
                    totalRevenue: 15400000, // Placeholder
                    pendingOrdersDirect: 3 // Placeholder
                });
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    const statCards = [
        { title: 'Tổng sản phẩm', value: stats.totalProducts, icon: Package, color: 'blue' },
        { title: 'Đơn hàng mới', value: stats.pendingOrdersDirect, icon: Clock, color: 'orange' },
        { title: 'Doanh thu tháng', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'teal' },
        { title: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingBag, color: 'indigo' },
    ];

    return (
        <SellerLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Xin chào, {user?.TenCuaHang || 'Người bán'}!</h1>
                <p className="text-gray-500 mt-2">Chào mừng bạn quay lại Kênh Người Bán Electronic Hub.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        </div>
                    ))
                ) : (
                    statCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600`}>
                                    <card.icon size={24} />
                                </div>
                                <TrendingUp size={16} className="text-green-500" />
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Hoạt động gần đây</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">Bạn vừa thêm sản phẩm mới "Arduino Nano Every"</p>
                                <p className="text-xs text-gray-400">2 giờ trước</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">Đơn hàng #1294 đã được khách hàng thanh toán</p>
                                <p className="text-xs text-gray-400">5 giờ trước</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">Cảnh báo: Sản phẩm "Cáp Micro USB" sắp hết hàng</p>
                                <p className="text-xs text-gray-400">1 ngày trước</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-2 text-sm text-secondary-600 font-semibold hover:bg-secondary-50 rounded-lg transition"> Xem tất cả </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Mẹo bán hàng</h2>
                    <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100">
                        <h3 className="text-sm font-bold text-secondary-800">Tối ưu hóa hình ảnh</h3>
                        <p className="text-xs text-secondary-600 mt-2 leading-relaxed">
                            Sản phẩm có hơn 3 hình ảnh chi tiết thường có tỉ lệ chốt đơn cao hơn 40%. Hãy thử thêm ảnh thực tế linh kiện nhé!
                        </p>
                    </div>
                    <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-800">Phản hồi nhanh</h3>
                        <p className="text-xs text-blue-600 mt-2 leading-relaxed">
                            Khách hàng đánh giá cao các shop trả lời tin nhắn trong vòng 15 phút.
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;
