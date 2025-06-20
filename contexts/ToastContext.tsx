

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType, PublicToastContextType } from '../types';

// Extended internal context type to manage the list of toasts
interface InternalToastContextType extends PublicToastContextType {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  addToast: (message: string, type: ToastType, duration?: number) => void; // Ensure addToast is here
}

export const ToastContext = createContext<InternalToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = crypto.randomUUID();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
