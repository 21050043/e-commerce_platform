import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Phone, Mail, Clock, Truck, Award, ThumbsUp, Heart } from 'lucide-react';

const About = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center h-80"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Về Chúng Tôi</h1>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Chuyên cung cấp các loại hoa tươi và quà tặng chất lượng với dịch vụ chuyên nghiệp
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <img 
                src="https://images.squarespace-cdn.com/content/v1/5eac4ea3e88fff1b365dc45d/1599599381716-G6S1JK3EQVVQR1F4ZJ4S/AUGUST+pink+50x70.jpg?format=1000w" 
                alt="Flower Shop Story" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Sinh Viên Thực hiện</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
                  <img src="https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=" alt="Phạm Nguyễn Chu Nguyên" className="w-20 h-20 rounded-full mb-3 border-4 border-pink-200 object-cover" />
                  <div className="font-semibold text-lg text-gray-800">Phạm Nguyễn Chu Nguyên</div>
                  <div className="text-pink-600 font-medium text-sm mb-1">MSSV: 21050043</div>
                  <div className="text-gray-500 text-xs">Trách nhiệm: &amp;</div>
                </div>
                {/* Card 2 */}
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
                  <img src="https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=" alt="Vy Ngọc Nhân" className="w-20 h-20 rounded-full mb-3 border-4 border-pink-200 object-cover" />
                  <div className="font-semibold text-lg text-gray-800">Vy Ngọc Nhân</div>
                  <div className="text-pink-600 font-medium text-sm mb-1">MSSV: 22050030</div>
                  <div className="text-gray-500 text-xs">Trách nhiệm: &amp; </div>
                </div>
                {/* Card 3 */}
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition">
                  <img src="https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=" alt="Đặng Văn Nhật Thanh" className="w-20 h-20 rounded-full mb-3 border-4 border-pink-200 object-cover" />
                  <div className="font-semibold text-lg text-gray-800">Đặng Văn Nhật Thanh</div>
                  <div className="text-pink-600 font-medium text-sm mb-1">MSSV: 23050029</div>
                  <div className="text-gray-500 text-xs">Trách nhiệm: &amp; </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Đam Mê</h3>
              <p className="text-gray-600">
                Nhóm sinh viên chúng em thực hiện dự án với sự đam mê đối với Ngành Công Nghệ Thông Tin.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Chất Lượng</h3>
              <p className="text-gray-600">
                Nhóm sinh viên chúng em  cam kết chỉ sử dụng những bông hoa tươi nhất và vật liệu chất lượng cao.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sự Hài Lòng</h3>
              <p className="text-gray-600">
                Sự hài lòng của khách hàng là ưu tiên hàng đầu mà nhóm sinh viên chúng em làm.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Dịch Vụ</h3>
              <p className="text-gray-600">
                Trong tương lai, nhóm sinh viên chúng em có thể trở thành đối tác tin cậy cung cấp dịch vụ giao hàng nhanh chóng và uy tín.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Liên Hệ Với Chúng Tôi</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Thông Tin Liên Hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0 mt-1" />
                  <span>Trường đại học Bình Dương, TP. Thủ dầu Một, Bình Dương</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
                  <span>0938 320 498</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
                  <span>21050043@student.bdu.edu.vn</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-6 w-6 text-pink-500 mr-3 flex-shrink-0" />
                  <div>
                    <p>Thứ Hai - Thứ Bảy: 8:00 - 20:00</p>
                    <p>Chủ Nhật: 9:00 - 18:00</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-4">Kết nối với chúng tôi</h3>
                <p className="text-gray-600 mb-6">Bạn có thể liên hệ hoặc theo dõi chúng tôi qua các kênh mạng xã hội và email bên dưới để nhận thông tin mới nhất, tư vấn hoặc hỗ trợ nhanh chóng.</p>
                <div className="flex justify-center gap-6 mb-2">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition" title="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 2.1A2.1 2.1 0 0 1 19.1 4.2v15.6A2.1 2.1 0 0 1 17 21.9H7A2.1 2.1 0 0 1 4.9 19.8V4.2A2.1 2.1 0 0 1 7 2.1h10zm-2.5 4.4h-1.5c-.8 0-1.5.7-1.5 1.5v1.5h3l-.4 2.9h-2.6v7.1h-3V12.4H7.5v-2.9h1.5V8c0-1.7 1.3-3 3-3h1.5v2.5z" /></svg>
                  </a>
                  <a href="https://zalo.me/0938320498" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition flex flex-col items-center" title="Zalo">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 48 48" fill="currentColor">
                      <rect width="48" height="48" rx="12" fill="#008ee6"/>
                      <text x="24" y="30" textAnchor="middle" fontSize="18" fill="white" fontFamily="Arial, Helvetica, sans-serif">Zalo</text>
                    </svg>
                    <span className="text-xs mt-1 text-gray-700 font-medium">0938 320 498</span>
                  </a>
                  <a href="mailto:21050043@student.bdu.edu.vn" className="text-rose-500 hover:text-rose-700 transition" title="Email">
                    <Mail className="h-8 w-8" />
                  </a>
                </div>
                <div className="text-xs text-gray-400">Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* License Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white bg-opacity-80 rounded-lg shadow p-4 text-center text-sm text-gray-500 border border-gray-200 max-w-xl w-full">
              <span className="font-medium text-gray-700">Bản quyền hình ảnh:</span> Một số hình ảnh sử dụng trong website được lấy từ nguồn <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline font-semibold">www.pexels.com</a> theo giấy phép miễn phí bản quyền.
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default About; 