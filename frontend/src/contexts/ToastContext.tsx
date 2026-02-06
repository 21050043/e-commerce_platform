import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Toast {
  id: string;
  message: ReactNode;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: ReactNode, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: ReactNode, type: Toast['type']) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Tự động xóa toast sau 3 giây
    setTimeout(() => {
      removeToast(newToast.id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    // Thêm class để kích hoạt animation trước khi xóa
    const toastElement = document.getElementById(`toast-${id}`);
    if (toastElement) {
      toastElement.classList.add('toast-exit');
      
      // Đợi animation hoàn thành rồi mới xóa khỏi state
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
      }, 300); // 300ms là thời gian của animation
    } else {
      // Trường hợp không tìm thấy element (hiếm gặp), xóa ngay
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}; 