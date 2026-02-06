import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Categories from './pages/Categories';
import ProductsByCategory from './pages/ProductsByCategory';
import ProductDetail from './pages/ProductDetail';
import VendorShop from './pages/VendorShop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ProductForm from './pages/admin/ProductForm';
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';
import BusinessLicense from './pages/BusinessLicense';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <Toast />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<ProductsByCategory />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/vendor/:vendorId" element={<VendorShop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/business-license" element={<BusinessLicense />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              
              {/* Protected Customer Routes */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - cho Admin, Staff và Vendor */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRoles={[0, 1, 3]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requiredRoles={[0, 1, 3]}>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/new" element={
                <ProtectedRoute requiredRoles={[0, 1, 3]}>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/edit/:productId" element={
                <ProtectedRoute requiredRoles={[0, 1, 3]}>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRoles={[0]}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requiredRoles={[0, 1, 3]}>
                  <OrderManagement />
                </ProtectedRoute>
              } />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />

              {/* New route for search results */}
              <Route path="/products/search" element={<SearchResults />} />
            </Routes>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
