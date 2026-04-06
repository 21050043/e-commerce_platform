import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyVendorProfile } from '../services/user.service';
import { useToast } from '../contexts/ToastContext';

// Biến global để tránh hiện thông báo nhiều lần trong 1 chu kỳ chuyển trang
let lastToastTime = 0;

export const useSellerProfileCheck = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const [isProfileChecking, setIsProfileChecking] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    const checkProfile = useCallback(async () => {
        // Chỉ kiểm tra nếu là đường dẫn seller và KHÔNG phải là trang settings
        if (!location.pathname.startsWith('/seller') || location.pathname === '/seller/settings') {
            setIsProfileChecking(false);
            return;
        }

        try {
            setIsProfileChecking(true);
            const data = await getMyVendorProfile();
            setProfile(data);

            if (!data?.TenCuaHang || !data?.DiaChiKinhDoanh || !data?.SoDienThoaiLienHe) {
                const now = Date.now();
                // Chỉ hiện toast nếu lần cuối hiện cách đây > 5 giây
                if (now - lastToastTime > 5000) {
                    addToast('Hồ sơ chưa hoàn tất. Vui lòng thiết lập thông tin cửa hàng để bắt đầu bán hàng.', 'warning');
                    lastToastTime = now;
                }
                navigate('/seller/settings');
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra hồ sơ người bán:', error);
        } finally {
            setIsProfileChecking(false);
        }
    }, [addToast, navigate, location.pathname]);

    useEffect(() => {
        checkProfile();
    }, [checkProfile]);

    return { isProfileChecking, profile, checkProfile };
}; 
