import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FileCheck, ChevronRight } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Điều Khoản Sử Dụng</h1>
            <div className="flex items-center text-sm">
              <Link to="/" className="hover:underline">Trang Chủ</Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span>Điều Khoản Sử Dụng</span>
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
                <FileCheck className="h-6 w-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Điều Khoản và Điều Kiện Sử Dụng</h2>
            </div>

            <div className="prose max-w-none">
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Chấp Nhận Điều Khoản</h3>
                  <p>
                    Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ và bị ràng buộc bởi 
                    các điều khoản và điều kiện sử dụng được nêu trong tài liệu này. Nếu bạn không đồng ý với 
                    bất kỳ phần nào của các điều khoản này, bạn không nên sử dụng website.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Đăng Ký Tài Khoản</h3>
                  <p className="mb-2">Khi đăng ký tài khoản, bạn cam kết:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                    <li>Bảo mật thông tin đăng nhập của bạn</li>
                    <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                    <li>Thông báo ngay cho chúng tôi nếu phát hiện vi phạm bảo mật</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Đặt Hàng và Thanh Toán</h3>
                  <p className="mb-2">Khi đặt hàng, bạn đồng ý:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Cung cấp thông tin giao hàng chính xác</li>
                    <li>Thanh toán đầy đủ theo giá đã công bố</li>
                    <li>Chấp nhận các điều kiện về vận chuyển và giao hàng</li>
                    <li>Kiểm tra hàng hóa khi nhận và báo cáo vấn đề trong vòng 24 giờ</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">4. Quyền Sở Hữu Trí Tuệ</h3>
                  <p>
                    Tất cả nội dung trên website, bao gồm văn bản, hình ảnh, logo, và thiết kế, đều thuộc 
                    quyền sở hữu của chúng tôi hoặc được sử dụng với sự cho phép. Bạn không được sao chép, 
                    phân phối, hoặc sử dụng nội dung này cho mục đích thương mại mà không có sự đồng ý bằng văn bản.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">5. Hành Vi Bị Cấm</h3>
                  <p className="mb-2">Bạn không được:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Sử dụng website cho mục đích bất hợp pháp</li>
                    <li>Gây nhiễu hoặc làm gián đoạn hoạt động của website</li>
                    <li>Thử nghiệm bảo mật hoặc tìm cách truy cập trái phép</li>
                    <li>Đăng tải nội dung vi phạm pháp luật hoặc đạo đức</li>
                    <li>Giả mạo danh tính hoặc thông tin cá nhân</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">6. Trách Nhiệm</h3>
                  <p className="mb-2">
                    Chúng tôi không chịu trách nhiệm cho:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Thiệt hại gián tiếp hoặc hậu quả phát sinh từ việc sử dụng website</li>
                    <li>Lỗi kỹ thuật hoặc gián đoạn dịch vụ ngoài tầm kiểm soát</li>
                    <li>Hành vi của người dùng khác trên website</li>
                    <li>Thông tin được cung cấp bởi bên thứ ba</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">7. Hoàn Trả và Đổi Trả</h3>
                  <p className="mb-2">
                    Chính sách hoàn trả và đổi trả:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Hàng hóa bị lỗi hoặc không đúng mô tả sẽ được đổi trả miễn phí</li>
                    <li>Yêu cầu đổi trả phải được thực hiện trong vòng 7 ngày kể từ ngày nhận hàng</li>
                    <li>Hàng hóa phải còn nguyên vẹn, chưa sử dụng và có đầy đủ bao bì</li>
                    <li>Chi phí vận chuyển đổi trả do khách hàng chịu (trừ trường hợp lỗi từ phía chúng tôi)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">8. Thay Đổi Điều Khoản</h3>
                  <p>
                    Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực 
                    ngay sau khi được đăng tải trên website. Việc bạn tiếp tục sử dụng website sau khi có thay đổi 
                    được xem như bạn đã chấp nhận các điều khoản mới.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">9. Liên Hệ</h3>
                  <p className="mb-2">
                    Nếu bạn có câu hỏi về các điều khoản sử dụng, vui lòng liên hệ:
                  </p>
                  <ul className="space-y-2">
                    <li><strong>Email:</strong> 21050043@student.bdu.edu.vn</li>
                    <li><strong>Điện thoại:</strong> 0938 320 498</li>
                    <li><strong>Địa chỉ:</strong> Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="text-sm text-gray-600">
                    <strong>Lưu ý:</strong> Đây là dự án học tập. Các điều khoản này được soạn thảo nhằm mục đích 
                    minh họa và học tập. Trong thực tế, bạn nên tham khảo ý kiến pháp lý chuyên nghiệp.
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

export default TermsOfUse;

