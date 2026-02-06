import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FileText, ChevronRight } from 'lucide-react';

const BusinessLicense = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Giấy Phép Kinh Doanh</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Giấy Phép Kinh Doanh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Thông Tin Giấy Phép Kinh Doanh</h2>
            </div>

            <div className="prose max-w-none">
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Thông Tin Doanh Nghiệp</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong>Tên doanh nghiệp:</strong> Flower Shop</li>
                    <li><strong>Địa chỉ trụ sở:</strong> Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</li>
                    <li><strong>Số điện thoại:</strong> 0938 320 498</li>
                    <li><strong>Email:</strong> 21050043@student.bdu.edu.vn</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Ngành Nghề Kinh Doanh</h3>
                  <p className="mb-2">Doanh nghiệp hoạt động trong lĩnh vực:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Bán lẻ hoa tươi và cây cảnh</li>
                    <li>Dịch vụ trang trí hoa cho các sự kiện</li>
                    <li>Bán quà tặng và đồ lưu niệm</li>
                    <li>Dịch vụ giao hàng tận nơi</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Cam Kết</h3>
                  <p className="mb-2">
                    Doanh nghiệp cam kết tuân thủ đầy đủ các quy định pháp luật về kinh doanh, 
                    đảm bảo chất lượng sản phẩm và dịch vụ, bảo vệ quyền lợi người tiêu dùng.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Đây là dự án học tập của sinh viên. Thông tin giấy phép kinh doanh 
                    được cung cấp nhằm mục đích minh họa và học tập. Để biết thêm thông tin chi tiết, 
                    vui lòng liên hệ trực tiếp với chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default BusinessLicense;

