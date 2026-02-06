import { useEffect, useState } from 'react';
import { UserPlus, Search, RefreshCw, Bell, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllCustomers,
  getAllStaff,
  getAllVendors,
  createUser,
  listVendorApplications,
  approveVendorApplication,
  rejectVendorApplication,
} from '../../services/user.service';
import type { UserResponse } from '../../services/user.service';
import { useToast } from '../../contexts/ToastContext';
import { useLocation } from 'react-router-dom';
import { getOrdersByCustomerId } from '../../services/order.service';

const UserManagement = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors' | 'staff'>('customers');
  const { addToast } = useToast();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    TenNhanVien: '',
    SoDienThoai: '',
    MatKhau: '',
    MatKhauNhapLai: '',
    DiaChi: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorApps, setVendorApps] = useState<any[]>([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'staff' || tab === 'customers' || tab === 'vendors') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let response;
        if (activeTab === 'customers') {
          response = await getAllCustomers(currentPage, 10);
          setUsers(response.users || []);
        } else if (activeTab === 'vendors') {
          response = await getAllVendors(currentPage, 10);
          setUsers(response.users || []);
        } else {
          response = await getAllStaff(currentPage, 10);
          setUsers(response.users || []);
        }
        setTotalPages(response.totalPages);
        setError(null);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setError('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, currentPage, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const openVendorApps = async () => {
    try {
      setVendorLoading(true);
      const data = await listVendorApplications('PENDING', 1, 20);
      setVendorApps(data.applications || []);
      setShowVendorModal(true);
    } catch (e) {
      addToast('Không thể tải danh sách đăng ký vendor', 'error');
    } finally {
      setVendorLoading(false);
    }
  };

  const approveVendor = async (id: number) => {
    try {
      await approveVendorApplication(id);
      setVendorApps(prev => prev.filter(a => a.MaNguoiBan !== id));
      addToast('Đã phê duyệt hồ sơ', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Không thể phê duyệt', 'error');
    }
  };

  const rejectVendor = async (id: number) => {
    const reason = prompt('Lý do từ chối (tuỳ chọn):') || '';
    try {
      await rejectVendorApplication(id, reason);
      setVendorApps(prev => prev.filter(a => a.MaNguoiBan !== id));
      addToast('Đã từ chối hồ sơ', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || 'Không thể từ chối', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'customers' | 'vendors' | 'staff') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleShowDetail = async (user: UserResponse) => {
    setShowDetailModal(true);
    setSelectedUser(user);
    if (user.MaKhachHang) {
      setOrdersLoading(true);
      try {
        // Nếu là admin/staff, lấy đơn hàng của khách hàng này qua API mới
        const res = await getOrdersByCustomerId(user.MaKhachHang);
        setUserOrders(res);
      } catch {
        setUserOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    } else {
      setUserOrders([]);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
    setUserOrders([]);
  };

  const handleDisableUser = () => {
    addToast(
      <span>Bạn có chắc chắn muốn vô hiệu hóa tài khoản này không?
        <button onClick={() => confirmDisableUser()} className="ml-4 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">Xác nhận</button>
        <button onClick={() => { }} className="ml-2 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Hủy</button>
      </span>,
      'warning'
    );
  };

  const confirmDisableUser = () => {
    addToast('Đây chỉ là thử nghiệm, tính năng vô hiệu hóa sẽ phát triển trong tương lai.', 'info');
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddForm({ TenNhanVien: '', SoDienThoai: '', MatKhau: '', MatKhauNhapLai: '', DiaChi: '' });
  };
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra dữ liệu đầu vào
    if (!addForm.TenNhanVien || !addForm.SoDienThoai || !addForm.MatKhau || !addForm.MatKhauNhapLai || !addForm.DiaChi) {
      addToast('Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }
    if (!/^[0-9]{10}$/.test(addForm.SoDienThoai)) {
      addToast('Số điện thoại phải có 10 chữ số.', 'error');
      return;
    }
    if (addForm.MatKhau.length < 6) {
      addToast('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
      return;
    }
    if (addForm.MatKhau !== addForm.MatKhauNhapLai) {
      addToast('Mật khẩu nhập lại không khớp.', 'error');
      return;
    }
    setAddLoading(true);
    try {
      await createUser({
        TenNhanVien: addForm.TenNhanVien,
        SoDienThoai: addForm.SoDienThoai,
        MatKhau: addForm.MatKhau,
        DiaChi: addForm.DiaChi,
        MaVaiTro: 1
      });
      addToast('Thêm tài khoản nhân viên thành công!', 'success');
      handleCloseAddModal();
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      if (error?.response?.data?.message?.includes('Số điện thoại đã được sử dụng')) {
        addToast('Số điện thoại đã được sử dụng. Vui lòng nhập số khác.', 'error');
      } else {
        addToast(error?.response?.data?.message || 'Đã xảy ra lỗi khi thêm tài khoản.', 'error');
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Filter users theo searchTerm
  const filteredUsers = users.filter(user => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    const name = (user.TenKhachHang || user.TenNhanVien || '').toLowerCase();
    const phone = (user.SoDienThoai || '').toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">Quản lý người dùng</h1>
            <button
              className="relative focus:outline-none"
              onClick={openVendorApps}
              title="Đăng ký vendor chờ duyệt"
            >
              <Bell className="w-7 h-7 text-primary-600" />
            </button>
          </div>
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            onClick={handleOpenAddModal}
          >
            <UserPlus size={18} />
            <span>Thêm tài khoản nhân viên</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b mb-6">
            <div className="flex space-x-4">
              <button
                className={`pb-3 px-2 ${activeTab === 'customers'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => handleTabChange('customers')}
              >
                Khách hàng
              </button>
              <button
                className={`pb-3 px-2 ${activeTab === 'vendors'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => handleTabChange('vendors')}
              >
                Người bán
              </button>
              <button
                className={`pb-3 px-2 ${activeTab === 'staff'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => handleTabChange('staff')}
              >
                Nhân viên
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm người dùng..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button
                onClick={handleRefresh}
                className="bg-primary-50 text-primary-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Số điện thoại
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Không có người dùng nào
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.MaKhachHang || user.MaNhanVien} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.TenKhachHang || user.TenNhanVien}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {user.MaKhachHang || user.MaNhanVien}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                            {user.SoDienThoai}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                            {user.DiaChi || 'Không có địa chỉ'}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                title="Xem chi tiết tài khoản"
                                onClick={() => handleShowDetail(user)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                              </button>
                              <button
                                className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                title="Vô hiệu hóa tài khoản"
                                onClick={() => handleDisableUser()}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75l10.5 10.5m0-10.5L6.75 17.25" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex space-x-2" aria-label="Pagination">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-md ${currentPage === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative">
            <button onClick={() => setShowVendorModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 transition">
              <X className="w-7 h-7" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
              <Bell className="w-6 h-6" /> Đăng ký vendor chờ duyệt
            </h2>
            {vendorLoading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : vendorApps.length === 0 ? (
              <div className="text-gray-500 italic">Không có hồ sơ nào.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow mt-2">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Tên cửa hàng</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Loại hình</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Danh mục chính</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">SĐT liên hệ</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendorApps.map((app) => (
                      <tr key={app.MaNguoiBan} className="hover:bg-primary-50 transition">
                        <td className="px-4 py-2">{app.TenCuaHang || '—'}</td>
                        <td className="px-4 py-2">{app.LoaiHinh === 'CA_NHAN' ? 'Cá nhân' : 'Doanh nghiệp'}</td>
                        <td className="px-4 py-2">{app.DanhMuc?.TenDanhMuc || app.MaDanhMucChinh}</td>
                        <td className="px-4 py-2">{app.SoDienThoaiLienHe}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => approveVendor(app.MaNguoiBan)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2">Duyệt</button>
                          <button onClick={() => rejectVendor(app.MaNguoiBan)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Từ chối</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal chi tiết tài khoản */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in">
            <button onClick={handleCloseDetail} className="absolute top-3 right-3 text-gray-400 hover:text-primary-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  {(selectedUser.TenKhachHang || selectedUser.TenNhanVien || 'U').charAt(0)}
                </div>
              </div>
              {/* Thông tin tài khoản */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Tên:
                  </span>
                  <span>{selectedUser.TenKhachHang || selectedUser.TenNhanVien}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>
                    Số điện thoại:
                  </span>
                  <span>{selectedUser.SoDienThoai}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
                    Địa chỉ:
                  </span>
                  <span>{selectedUser.DiaChi || 'Không có'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 19v-7m0 0V5m0 7h7m-7 0H5" /></svg>
                    Vai trò:
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.MaVaiTro === 0 ? 'bg-blue-100 text-blue-700' : selectedUser.MaVaiTro === 1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedUser.VaiTro?.TenVaiTro || (selectedUser.MaVaiTro === 0 ? 'Quản trị viên' : selectedUser.MaVaiTro === 1 ? 'Nhân viên' : 'Khách hàng')}
                  </span>
                </div>
              </div>
            </div>
            {/* Đơn hàng của khách hàng */}
            {selectedUser.MaKhachHang && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                  Đơn hàng của tài khoản này
                </h3>
                {ordersLoading ? (
                  <div className="text-gray-500">Đang tải đơn hàng...</div>
                ) : userOrders.length === 0 ? (
                  <div className="text-gray-400 italic">Chưa có đơn hàng nào.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg shadow mt-2">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Ngày lập</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userOrders.map(order => (
                          <tr key={order.MaHoaDon} className="hover:bg-primary-50 transition">
                            <td className="px-4 py-2 font-medium text-gray-800">#{order.MaHoaDon}</td>
                            <td className="px-4 py-2 text-gray-600">{new Date(order.NgayLap).toLocaleString('vi-VN')}</td>
                            <td className="px-4 py-2 text-right text-primary-600 font-semibold">{order.TongTien.toLocaleString('vi-VN')} ₫</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.TrangThai === 'Đã giao hàng' ? 'bg-green-100 text-green-700' : order.TrangThai === 'Đã hủy' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.TrangThai}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm tài khoản nhân viên */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={handleCloseAddModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Thêm tài khoản nhân viên</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên nhân viên</label>
                <input type="text" name="TenNhanVien" value={addForm.TenNhanVien} onChange={handleAddInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input type="text" name="SoDienThoai" value={addForm.SoDienThoai} onChange={handleAddInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                <input type="text" name="MatKhau" value={addForm.MatKhau} onChange={handleAddInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu</label>
                <input type="password" name="MatKhauNhapLai" value={addForm.MatKhauNhapLai} onChange={handleAddInputChange} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input type="text" name="DiaChi" value={addForm.DiaChi} onChange={handleAddInputChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleCloseAddModal} className="px-4 py-2 border rounded bg-gray-100 text-gray-700">Hủy</button>
                <button type="submit" disabled={addLoading} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                  {addLoading ? 'Đang thêm...' : 'Thêm nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement; 