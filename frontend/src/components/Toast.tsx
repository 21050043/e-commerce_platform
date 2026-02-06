import { X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import type { Toast as ToastType } from '../contexts/ToastContext';
import { useEffect } from 'react';

// Component hiển thị một toast đơn lẻ
const ToastItem = ({ toast, onClose }: { toast: ToastType; onClose: () => void }) => {
  // Biến xác định icon và màu sắc dựa vào loại toast
  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-green-500',
          borderColor: 'border-green-700',
          iconClass: 'toast-success'
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          borderColor: 'border-red-700',
          iconClass: 'toast-error'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-500',
          borderColor: 'border-amber-700',
          iconClass: 'toast-warning'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-700',
          iconClass: 'toast-info'
        };
    }
  };

  const { bgColor, borderColor, iconClass } = getToastConfig();

  return (
    <div 
      id={`toast-${toast.id}`}
      className={`toast-enter ${bgColor} text-white p-4 rounded-lg shadow-md flex items-center mb-3 border-l-4 ${borderColor} opacity-0 translate-x-full`}
    >
      <div className={`${iconClass} mr-3`}></div>
      <div className="flex-1">{toast.message}</div>
      <button
        onClick={onClose}
        className="ml-3 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Container chính cho tất cả các toast
const Toast = () => {
  const { toasts, removeToast } = useToast();

  // Thêm CSS cho animations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        width: 320px;
      }

      .toast-enter {
        animation: slideInRight 0.3s forwards ease-out;
      }

      .toast-exit {
        animation: slideOutRight 0.3s forwards ease-in;
      }

      /* Toast type icons */
      .toast-success::before {
        content: '✓';
        font-size: 1.2rem;
        font-weight: bold;
      }

      .toast-error::before {
        content: '✕';
        font-size: 1.2rem;
        font-weight: bold;
      }

      .toast-warning::before {
        content: '!';
        font-size: 1.2rem;
        font-weight: bold;
      }

      .toast-info::before {
        content: 'i';
        font-size: 1.2rem;
        font-weight: bold;
        font-style: italic;
      }
    `;
    
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

export default Toast; 