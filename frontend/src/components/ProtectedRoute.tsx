import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: number[]; // 0: Admin, 1: Staff, 2: Customer
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      // Kiểm tra đã xác thực chưa
      if (!isAuthenticated) {
        setIsAuthorized(false);
        return;
      }

      // Nếu không yêu cầu vai trò cụ thể, chỉ cần đăng nhập là đủ
      if (!requiredRoles || requiredRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }

      // Kiểm tra vai trò
      const hasRequiredRole = user && requiredRoles.includes(user.MaVaiTro);
      setIsAuthorized(hasRequiredRole || false);
    }
  }, [isAuthenticated, loading, requiredRoles, user]);

  // Hiển thị màn hình loading trong khi kiểm tra
  if (loading || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Chuyển hướng nếu không được phép truy cập
  if (!isAuthorized) {
    // Lưu lại trang đang cố truy cập để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Nếu đã xác thực và có quyền, hiển thị nội dung
  return <>{children}</>;
};

export default ProtectedRoute; 