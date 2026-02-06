import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, ChevronDown, User, LogOut, Store, ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    navItems: NavItem[];
    basePath: string;
    accentColor?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    navItems,
    basePath,
    accentColor = 'primary'
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { addToast } = useToast();

    useClickOutside<HTMLDivElement>(dropdownRef, () => setDropdownOpen(false));

    const handleLogout = async () => {
        try {
            await logout();
            addToast('Đăng xuất thành công!', 'success');
            navigate('/login');
        } catch (error) {
            addToast('Có lỗi xảy ra khi đăng xuất.', 'error');
        }
    };

    const isActive = (path: string) => location.pathname === path;

    const themeClasses = {
        primary: {
            header: 'bg-primary-600',
            avatar: 'bg-primary-700',
            navActive: 'bg-primary-50 text-primary-700 font-bold shadow-sm',
            navActiveIcon: 'text-primary-600',
            navHover: 'hover:bg-primary-50 hover:text-primary-700',
            dropdownHover: 'hover:bg-primary-50'
        },
        secondary: {
            header: 'bg-secondary-600',
            avatar: 'bg-secondary-700',
            navActive: 'bg-secondary-50 text-secondary-700 font-bold shadow-sm',
            navActiveIcon: 'text-secondary-600',
            navHover: 'hover:bg-secondary-50 hover:text-secondary-700',
            dropdownHover: 'hover:bg-secondary-50'
        }
    }[accentColor as 'primary' | 'secondary'] || themeClasses.primary;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className={`${themeClasses.header} text-white shadow-md`}>
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mr-3 transition hover:bg-white/10 p-1 rounded">
                            <Menu size={24} />
                        </button>
                        <Link to={basePath} className="font-bold text-xl tracking-tight">
                            {title}
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/" className="hidden sm:flex items-center px-4 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium transition">
                            <Store className="h-4 w-4 mr-2" />
                            <span>Cửa hàng</span>
                            <ExternalLink className="h-3 w-3 ml-2 opacity-70" />
                        </Link>

                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-3 focus:outline-none group">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold">{user?.TenKhachHang || user?.TenNhanVien}</div>
                                    <div className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
                                        {user?.MaVaiTro === 0 ? 'Admin' : user?.MaVaiTro === 1 ? 'Staff' : 'Seller'}
                                    </div>
                                </div>
                                <div className={`h-10 w-10 ${themeClasses.avatar} border-2 border-white border-opacity-30 rounded-full flex items-center justify-center font-bold text-lg shadow-inner group-hover:scale-105 transition`}>
                                    {(user?.TenKhachHang || user?.TenNhanVien || 'A')[0].toUpperCase()}
                                </div>
                                <ChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                    <Link to="/account" className={`flex items-center px-4 py-3 text-sm text-gray-700 ${themeClasses.dropdownHover} transition`}>
                                        <User className="h-4 w-4 mr-3 text-gray-400" />
                                        Tài khoản cá nhân
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                                        <LogOut className="h-4 w-4 mr-3" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col pt-8">
                        <nav className="flex-1 px-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                        ? themeClasses.navActive
                                        : `text-gray-500 ${themeClasses.navHover} font-medium`
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 transition-all duration-300 ${isActive(item.path) ? themeClasses.navActiveIcon : 'text-gray-400 group-hover:scale-110'}`} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 mt-auto">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 text-center">Bảng điều khiển</p>
                                <div className="text-center text-[10px] text-gray-500 italic">
                                    V.1.0.4 - Electronic Hub
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Backdrop */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
                )}

                {/* Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 focus:outline-none scroll-smooth">
                    <div className="container mx-auto px-4 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
