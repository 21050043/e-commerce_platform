import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, register as registerApi, getCurrentUser, logout as logoutApi, refreshToken } from '../services/auth.service';
import type { LoginRequest, RegisterRequest } from '../services/auth.service';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isVendor: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState<number | null>(null);

  // Khởi tạo phiên làm việc từ localStorage khi load trang
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const storedUser = getCurrentUser();

        // Kiểm tra xem có token trong localStorage không
        const token = localStorage.getItem('accessToken');

        if (token && storedUser) {
          // Tự động refresh token khi khởi động ứng dụng
          try {
            await refreshToken();
            setUser(storedUser);

            // Thiết lập interval để refresh token tự động (mỗi 14 phút)
            // Token thường có thời hạn 15 phút, refresh trước 1 phút
            const interval = setInterval(async () => {
              try {
                await refreshToken();
              } catch (error) {
                console.error('Failed to refresh token:', error);
                // Nếu refresh token thất bại, xóa interval và đăng xuất
                clearInterval(interval);
                setUser(null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
              }
            }, 14 * 60 * 1000); // 14 phút

            setTokenRefreshInterval(interval);
          } catch (error) {
            console.error('Failed to refresh token on init:', error);
            // Nếu refresh token thất bại, xóa thông tin người dùng
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup interval khi component unmount
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      // Xóa interval cũ nếu có
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        setTokenRefreshInterval(null);
      }

      const response = await loginApi(data);
      setUser(response.user);

      // Thiết lập interval để refresh token tự động (mỗi 14 phút)
      const interval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          clearInterval(interval);
          setUser(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }, 14 * 60 * 1000); // 14 phút

      setTokenRefreshInterval(interval);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      // Xóa interval cũ nếu có
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        setTokenRefreshInterval(null);
      }

      const response = await registerApi(data);
      setUser(response.user);

      // Thiết lập interval để refresh token tự động (mỗi 14 phút)
      const interval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          clearInterval(interval);
          setUser(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }, 14 * 60 * 1000); // 14 phút

      setTokenRefreshInterval(interval);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Xóa interval refresh token
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      setTokenRefreshInterval(null);
    }

    await logoutApi();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.MaVaiTro === 0;
  const isStaff = user?.MaVaiTro === 1;
  const isVendor = user?.MaVaiTro === 3;

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isStaff,
    isVendor,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 