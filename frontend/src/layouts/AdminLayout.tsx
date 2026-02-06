import React from 'react';
import { Home, Package, ShoppingBag, Users, Settings } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.MaVaiTro === 0;

  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: Home },
    { path: '/admin/products', label: 'Sản phẩm', icon: Package },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin/users', label: 'Quản lý người dùng', icon: Users });
  }

  navItems.push({ path: '/admin/settings', label: 'Cài đặt', icon: Settings });

  return (
    <DashboardLayout
      title="Electronic Hub Admin"
      navItems={navItems}
      basePath="/admin"
      accentColor="primary"
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminLayout;