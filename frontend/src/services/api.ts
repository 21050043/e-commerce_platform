import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

// Tạo một bộ đếm để tránh vòng lặp vô hạn refresh token
let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi cookies trong các request
});

// Request interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu là lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        // Lưu token mới vào localStorage
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Cập nhật token trong header của request ban đầu
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Xử lý các request trong hàng đợi
        processQueue(null, accessToken);
        
        // Thực hiện lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất người dùng
        processQueue(refreshError, null);
        
        // Chỉ chuyển hướng nếu không phải request API khác đang thử refresh token
        if (isRefreshing) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Tránh chuyển hướng liên tục khi refresh trang
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        
        isRefreshing = false;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Nếu lỗi 401 nhưng đã thử refresh token hoặc các lỗi khác
    return Promise.reject(error);
  }
);

export default api; 