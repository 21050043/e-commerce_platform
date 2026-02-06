import React from 'react';
import { Home, Package, ShoppingBag, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

interface SellerLayoutProps {
    children: React.ReactNode;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
    const navItems = [
        { path: '/seller', label: 'Bảng điều khiển', icon: Home },
        { path: '/seller/products', label: 'Quản lý sản phẩm', icon: Package },
        { path: '/seller/orders', label: 'Quản lý đơn hàng', icon: ShoppingBag },
        { path: '/seller/settings', label: 'Thiết lập shop', icon: Settings },
    ];

    return (
        <DashboardLayout
            title="Seller Center"
            navItems={navItems}
            basePath="/seller"
            accentColor="secondary"
        >
            {children}
        </DashboardLayout>
    );
};

export default SellerLayout;
