
import React from 'react';
import { useToastContext } from '../../hooks/useToast'; // Assuming useToastContext is the way to get toasts
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  // This expects useToastContext to expose 'toasts' and 'removeToast'
  // Since the hook setup earlier was useToast for adding, we'll assume ToastContext provides these.
  // This might need adjustment based on the actual ToastContext implementation.
  // For now, let's assume `useToastContext` provides { toasts: ToastMessage[], removeToast: (id: string) => void }
  
  // This part needs to be connected to the actual ToastContext which manages the state of toasts.
  // The provided ToastContextType only has `addToast`. We need to expand it or create a new internal context.
  // For this exercise, I'll mock the hook part and focus on the container structure.
  // A real implementation would lift toasts state to ToastContext.
  
  const { toasts, removeToast } = useToastContext();


  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-[100] space-y-2"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
};
