// API base URL
export const API_BASE_URL = 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`
  },
  CATEGORY: {
    GET_ALL: `${API_BASE_URL}/categories`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/categories/${id}`,
    CREATE: `${API_BASE_URL}/categories`,
    UPDATE: (id: number) => `${API_BASE_URL}/categories/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/categories/${id}`
  },
  PRODUCT: {
    GET_ALL: `${API_BASE_URL}/products`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/products/${id}`,
    GET_BY_CATEGORY: (categoryId: number) => `${API_BASE_URL}/products/category/${categoryId}`,
    GET_VENDOR_SHOP: (vendorId: number) => `${API_BASE_URL}/products/vendor/${vendorId}`,
    SEARCH: `${API_BASE_URL}/products/search`,
    CREATE: `${API_BASE_URL}/products`,
    UPDATE: (id: number) => `${API_BASE_URL}/products/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/products/${id}`
  },
  ORDER: {
    CREATE: `${API_BASE_URL}/orders`,
    GET_MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/orders/${id}`,
    GET_ALL: `${API_BASE_URL}/orders`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/orders/${id}/status`
  },
  CART: {
    ADD: '/cart',
    GET: '/cart',
    UPDATE: '/cart',
    DELETE: (id: number) => `/cart/${id}`,
  },
  USER: {
    GET_PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`
  },
  ADMIN: {
    DASHBOARD_SUMMARY: `${API_BASE_URL}/admin/dashboard`,
    USERS: {
      GET_ALL_CUSTOMERS: `${API_BASE_URL}/admin/users/customers`,
      GET_ALL_STAFF: `${API_BASE_URL}/admin/users/staff`,
      GET_ALL_VENDORS: `${API_BASE_URL}/admin/users/vendors`,
      GET_BY_ID: (id: number) => `${API_BASE_URL}/admin/users/${id}`,
      CREATE: `${API_BASE_URL}/admin/users`,
      UPDATE: (id: number) => `${API_BASE_URL}/admin/users/${id}`,
      DELETE: (id: number) => `${API_BASE_URL}/admin/users/${id}`,
      CHANGE_ROLE: (id: number) => `${API_BASE_URL}/admin/users/${id}/role`
    },
    PRODUCTS: {
      GET_ALL: `${API_BASE_URL}/admin/products`,
      GET_BY_ID: (id: number) => `${API_BASE_URL}/admin/products/${id}`,
      CREATE: `${API_BASE_URL}/admin/products`,
      UPDATE: (id: number) => `${API_BASE_URL}/admin/products/${id}`,
      DELETE: (id: number) => `${API_BASE_URL}/admin/products/${id}`,
      SUSPEND: (id: number) => `${API_BASE_URL}/admin/products/${id}/suspend`,
      UNSUSPEND: (id: number) => `${API_BASE_URL}/admin/products/${id}/unsuspend`
    },
    ORDERS: {
      GET_ALL: `${API_BASE_URL}/admin/orders`,
      GET_BY_ID: (id: number) => `${API_BASE_URL}/admin/orders/${id}`,
      UPDATE_STATUS: (id: number) => `${API_BASE_URL}/admin/orders/${id}/status`
    }
  },
  VENDOR: {
    APPLY: `${API_BASE_URL}/vendor/apply`,
    ME: `${API_BASE_URL}/vendor/me`,
    UPDATE: `${API_BASE_URL}/vendor/me`,
    PRODUCTS: {
      LIST: `${API_BASE_URL}/vendor/products`,
      CREATE: `${API_BASE_URL}/vendor/products`,
      UPDATE: (id: number) => `${API_BASE_URL}/vendor/products/${id}`,
      DELETE: (id: number) => `${API_BASE_URL}/vendor/products/${id}`
    },
  },
  SELLER_ORDER: {
    STATS: `${API_BASE_URL}/seller/orders/stats`,
    GET_ALL: (page = 1, limit = 10, trangThai?: string) =>
      `${API_BASE_URL}/seller/orders?page=${page}&limit=${limit}${trangThai && trangThai !== 'all' ? `&trangThai=${encodeURIComponent(trangThai)}` : ''}`,
    GET_BY_ID: (id: number) => `${API_BASE_URL}/seller/orders/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/seller/orders/${id}/status`,
  },
};