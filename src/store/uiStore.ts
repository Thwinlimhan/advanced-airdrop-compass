import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UiState {
  // State
  isSidebarOpen: boolean;
  activeModal: string | null;
  isLoading: boolean;
  toastMessages: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number }>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeToast: (toastId: string) => void;
  clearToasts: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isSidebarOpen: false,
        activeModal: null,
        isLoading: false,
        toastMessages: [],

        // Actions
        toggleSidebar: () => {
          set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        setSidebarOpen: (isOpen) => {
          set({ isSidebarOpen: isOpen });
        },

        openModal: (modalId) => {
          set({ activeModal: modalId });
        },

        closeModal: () => {
          set({ activeModal: null });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        addToast: (message, type, duration = 5000) => {
          const id = Date.now().toString();
          const toast = { id, message, type, duration };
          
          set(state => ({
            toastMessages: [...state.toastMessages, toast]
          }));

          // Auto-remove toast after duration
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        },

        removeToast: (toastId) => {
          set(state => ({
            toastMessages: state.toastMessages.filter(toast => toast.id !== toastId)
          }));
        },

        clearToasts: () => {
          set({ toastMessages: [] });
        }
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          isSidebarOpen: state.isSidebarOpen
        })
      }
    ),
    {
      name: 'ui-store'
    }
  )
); 