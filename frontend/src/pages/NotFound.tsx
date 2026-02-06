import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Không tìm thấy trang</h2>
        <p className="text-gray-600 mt-2 text-center">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
        >
          <Home size={18} />
          <span>Quay về trang chủ</span>
        </Link>
      </div>
    </MainLayout>
  );
};

export default NotFound; 