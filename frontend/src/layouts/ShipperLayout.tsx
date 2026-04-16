import React from 'react';
import { Truck, Home, LayoutDashboard } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

interface ShipperLayoutProps {
  children: React.ReactNode;
}

const ShipperLayout: React.FC<ShipperLayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/shipper/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { path: '/shipper/orders', label: 'Đơn giao hàng', icon: Truck },
    { path: '/', label: 'Cửa hàng', icon: Home },
  ];

  return (
    <DashboardLayout
      title="Shipper Center"
      navItems={navItems}
      basePath="/shipper"
      accentColor="secondary"
    >
      {children}
    </DashboardLayout>
  );
};

export default ShipperLayout;
