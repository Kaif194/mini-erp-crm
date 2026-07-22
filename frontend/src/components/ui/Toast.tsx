import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-600 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-100" />,
    },
    error: {
      bg: 'bg-red-600 text-white',
      icon: <AlertCircle className="w-5 h-5 text-red-100" />,
    },
    info: {
      bg: 'bg-blue-600 text-white',
      icon: <Info className="w-5 h-5 text-blue-100" />,
    },
  };

  const { bg, icon } = typeConfig[type];

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${bg} animate-in slide-in-from-bottom-5 duration-300 max-w-md`}
    >
      {icon}
      <p className="text-xs font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
