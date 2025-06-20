
import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AlertMessageProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string | React.ReactNode;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, title, className = '', onDismiss }) => {
  const MAPPING = {
    info: {
      icon: <Info size={20} className="text-primary" />, // Primary accent for info icon
      bgClass: 'bg-primary/10 dark:bg-primary/20 border-primary/50', // Use primary accent with alpha
      textClass: 'text-primary dark:text-primary', // Primary accent for text
      titleClass: 'text-primary dark:text-primary font-semibold',
    },
    success: {
      icon: <CheckCircle size={20} className="text-green-500 dark:text-green-400" />,
      bgClass: 'bg-green-500/10 dark:bg-green-500/20 border-green-500/50',
      textClass: 'text-green-700 dark:text-green-300',
      titleClass: 'text-green-800 dark:text-green-200 font-semibold',
    },
    warning: {
      icon: <AlertTriangle size={20} className="text-yellow-500 dark:text-yellow-400" />,
      bgClass: 'bg-yellow-500/10 dark:bg-yellow-500/20 border-yellow-500/50',
      textClass: 'text-yellow-700 dark:text-yellow-300',
      titleClass: 'text-yellow-800 dark:text-yellow-200 font-semibold',
    },
    error: {
      icon: <XCircle size={20} className="text-red-500 dark:text-red-400" />,
      bgClass: 'bg-red-500/10 dark:bg-red-500/20 border-red-500/50',
      textClass: 'text-red-700 dark:text-red-300',
      titleClass: 'text-red-800 dark:text-red-200 font-semibold',
    },
  };

  const config = MAPPING[type];

  return (
    <div
      className={`border-l-4 p-4 rounded-lg shadow-sm ${config.bgClass} ${className}`} // Rounded-lg
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${config.titleClass}`}>{title}</h3>}
          <div className={`text-sm ${config.textClass} ${title ? 'mt-1' : ''}`}>{message}</div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${config.textClass} hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.bgClass.split(' ')[0]} focus:ring-current`}
              >
                <span className="sr-only">Dismiss</span>
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};