import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Shield, ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Chính Sách Bảo Mật</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Chính Sách Bảo Mật</span>
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
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Chính Sách Bảo Mật Thông Tin</h2>
            </div>

            <div className="prose max-w-none">
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Thu Thập Thông Tin</h3>
                  <p className="mb-2">
                    Chúng tôi thu thập thông tin cá nhân của bạn khi bạn:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Đăng ký tài khoản trên website</li>
                    <li>Đặt hàng và thanh toán</li>
                    <li>Liên hệ với chúng tôi qua email hoặc điện thoại</li>
                    <li>Sử dụng các dịch vụ của chúng tôi</li>
                  </ul>
                  <p className="mt-2">
                    Thông tin thu thập bao gồm: họ tên, số điện thoại, địa chỉ email, địa chỉ giao hàng, 
                    và thông tin thanh toán (nếu có).
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Sử Dụng Thông Tin</h3>
                  <p className="mb-2">Chúng tôi sử dụng thông tin cá nhân của bạn để:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Xử lý đơn hàng và giao hàng</li>
                    <li>Liên hệ với bạn về đơn hàng và dịch vụ</li>
                    <li>Cải thiện chất lượng dịch vụ</li>
                    <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
                    <li>Tuân thủ các yêu cầu pháp lý</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Bảo Mật Thông Tin</h3>
                  <p className="mb-2">
                    Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Mã hóa mật khẩu bằng thuật toán bcrypt</li>
                    <li>Sử dụng HTTPS để bảo vệ dữ liệu truyền tải</li>
                    <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên có thẩm quyền</li>
                    <li>Thường xuyên cập nhật và kiểm tra hệ thống bảo mật</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">4. Chia Sẻ Thông Tin</h3>
                  <p className="mb-2">
                    Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, 
                    trừ các trường hợp:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                    <li>Với các đối tác vận chuyển để giao hàng (chỉ thông tin cần thiết)</li>
                    <li>Khi bạn đồng ý chia sẻ</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">5. Quyền Của Bạn</h3>
                  <p className="mb-2">Bạn có quyền:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Truy cập và xem thông tin cá nhân của mình</li>
                    <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
                    <li>Từ chối nhận thông tin khuyến mãi</li>
                    <li>Khiếu nại về việc xử lý thông tin cá nhân</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">6. Liên Hệ</h3>
                  <p className="mb-2">
                    Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ với chúng tôi:
                  </p>
                  <ul className="space-y-2">
                    <li><strong>Email:</strong> 21050043@student.bdu.edu.vn</li>
                    <li><strong>Điện thoại:</strong> 0938 320 498</li>
                    <li><strong>Địa chỉ:</strong> Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="text-sm text-gray-600">
                    <strong>Cập nhật lần cuối:</strong> Chính sách này có thể được cập nhật định kỳ. 
                    Chúng tôi sẽ thông báo cho bạn về các thay đổi quan trọng qua email hoặc thông báo trên website.
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

export default PrivacyPolicy;

