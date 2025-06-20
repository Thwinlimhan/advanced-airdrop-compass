

import React, { useEffect, useState } from 'react';
import { ToastMessage as ToastProps } from '../../types';
import { X, Info, CheckCircle, AlertTriangle, XCircle as AlertXCircle } from 'lucide-react';

interface IndividualToastProps extends ToastProps {
  onDismiss: (id: string) => void;
  duration?: number; // Added duration here
}

const ToastIcons = {
  success: CheckCircle,
  error: AlertXCircle,
  info: Info,
  warning: AlertTriangle,
};

const ToastStyles = {
  success: {
    bg: 'bg-green-500 dark:bg-green-600',
    text: 'text-white',
    iconColor: 'text-white',
  },
  error: {
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-white',
    iconColor: 'text-white',
  },
  info: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white',
    iconColor: 'text-white',
  },
  warning: {
    bg: 'bg-yellow-500 dark:bg-yellow-600',
    text: 'text-white', // Ensure contrast with yellow
    iconColor: 'text-white',
  },
};

export const Toast: React.FC<IndividualToastProps> = ({ id, message, type, duration = 3000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade-out animation before fully dismissing
      setTimeout(() => onDismiss(id), 300); 
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, onDismiss]);

  const IconComponent = ToastIcons[type];
  const styles = ToastStyles[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-center p-4 mb-3 rounded-lg shadow-xl min-w-[280px] max-w-sm
        ${styles.bg} ${styles.text}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <div className={`flex-shrink-0 ${styles.iconColor}`}>
        <IconComponent size={24} />
      </div>
      <div className="ml-3 text-sm font-medium flex-grow">
        {message}
      </div>
      <button
        onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
        }}
        className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex items-center justify-center h-8 w-8 
                   ${styles.text} hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50`}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X size={20} />
      </button>
    </div>
  );
};
