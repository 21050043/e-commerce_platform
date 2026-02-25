import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { Package, ShoppingBag, TrendingUp, DollarSign, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerStats, type SellerStats } from '../../services/seller-order.service';

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
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const SellerDashboard = () => {
    // ... (logic remains same)
    const { user } = useAuth();
    const [stats, setStats] = useState<SellerStats>({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        newOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getSellerStats();
                setStats(data);
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: Package,
            color: 'blue',
            link: '/seller/products',
        },
        {
            title: 'Đơn hàng mới',
            value: stats.newOrders,
            icon: Clock,
            color: 'orange',
            link: '/seller/orders',
            alert: stats.pendingOrders > 0,
        },
        {
            title: 'Doanh thu (đã giao)',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'teal',
        },
        {
            title: 'Tổng đơn hàng',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'indigo',
            link: '/seller/orders',
        },
    ];

    return (
        <SellerLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Xin chào, {(user as any)?.TenCuaHang || user?.TenKhachHang || 'Người bán'}!
                    </h1>
                    <p className="text-gray-500 mt-2">Chào mừng bạn quay lại Kênh Người Bán.</p>
                </motion.div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" />
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                            </div>
                        ))
                    ) : (
                        statCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all active:scale-95 cursor-default"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-opacity-10 bg-${card.color}-500 text-${card.color}-600 relative`}>
                                        <card.icon size={24} />
                                        {card.alert && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                                        )}
                                    </div>
                                    <TrendingUp size={16} className="text-green-500" />
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                                {card.link && (
                                    <Link
                                        to={card.link}
                                        className="inline-flex items-center gap-1 text-xs text-secondary-600 hover:text-secondary-800 mt-2 font-medium"
                                    >
                                        Xem chi tiết <ArrowRight size={11} />
                                    </Link>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Bottom panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Đơn hàng cần xử lý */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Đơn hàng chờ xử lý</h2>
                            {stats.pendingOrders > 0 && (
                                <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    <AlertCircle size={12} />
                                    {stats.pendingOrders} chờ xử lý
                                </span>
                            )}
                        </div>
                        {stats.pendingOrders === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <ShoppingBag size={40} className="mb-3 opacity-40" />
                                <p className="text-sm">Không có đơn hàng nào chờ xử lý</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">
                                Bạn có <span className="font-semibold text-orange-600">{stats.pendingOrders}</span> đơn hàng chờ xác nhận
                                {stats.processingOrders > 0 && (
                                    <> và <span className="font-semibold text-yellow-600">{stats.processingOrders}</span> đơn đang xử lý.</>
                                )}
                            </p>
                        )}
                        <Link
                            to="/seller/orders"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 rounded-xl text-sm font-semibold transition"
                        >
                            Đến trang quản lý đơn hàng <ArrowRight size={15} />
                        </Link>
                    </motion.div>

                    {/* Mẹo bán hàng */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Mẹo bán hàng</h2>
                        <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100 mb-4 hover:shadow-sm transition-shadow">
                            <h3 className="text-sm font-bold text-secondary-800">Tối ưu hóa hình ảnh</h3>
                            <p className="text-xs text-secondary-600 mt-2 leading-relaxed">
                                Sản phẩm có hơn 3 hình ảnh chi tiết thường có tỉ lệ chốt đơn cao hơn 40%. Hãy thử thêm ảnh thực tế!
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:shadow-sm transition-shadow">
                            <h3 className="text-sm font-bold text-blue-800">Phản hồi nhanh</h3>
                            <p className="text-xs text-blue-600 mt-2 leading-relaxed">
                                Xác nhận và xử lý đơn hàng trong vòng 24 giờ để tăng điểm uy tín cửa hàng.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </SellerLayout>
    );
};

export default SellerDashboard;
