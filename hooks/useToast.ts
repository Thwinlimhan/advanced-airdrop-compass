

import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';
import { PublicToastContextType } from '../types'; // Changed to PublicToastContextType

export const useToast = (): PublicToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  // Return only the addToast function as per the public ToastContextType
  return { addToast: context.addToast };
};

// If ToastContainer needs access to toasts list and removeToast, it should use this:
export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
      throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context; // Exposes toasts and removeToast for the container
}
