import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'info':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-green-500 to-emerald-600';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`bg-gradient-to-r ${getToastColor()} bg-opacity-90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl p-4 max-w-sm`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className={`h-5 w-5 ${getIconColor()}`} />
          <p className="text-white font-medium">{message}</p>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;