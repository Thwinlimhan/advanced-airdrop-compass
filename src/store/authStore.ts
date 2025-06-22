import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '../../services/dataService';
import { CurrentUser, AuthResponse, UserRegistrationInfo } from '../../types';
import { AUTH_TOKEN_KEY } from '../../constants';

interface AuthState {
  // State
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: Pick<UserRegistrationInfo, 'email' | 'password'>) => Promise<void>;
  register: (userInfo: UserRegistrationInfo) => Promise<void>;
  logout: () => void;
  validateSession: () => Promise<void>;
  clearError: () => void;
  setUser: (user: CurrentUser) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response: AuthResponse = await authService.login(credentials);
            
            // Store token if provided
            if (response.token) {
              localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            }
            
            // Create user object from response
            const user: CurrentUser = {
              id: response.userId || '',
              email: response.email || '',
              username: response.username || ''
            };
            
            // Set user data
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
            throw error;
          }
        },

        register: async (userInfo) => {
          set({ isLoading: true, error: null });
          try {
            const response: AuthResponse = await authService.register(userInfo);
            
            // Store token if provided
            if (response.token) {
              localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            }
            
            // Create user object from response
            const user: CurrentUser = {
              id: response.userId || '',
              email: response.email || '',
              username: response.username || ''
            };
            
            // Set user data
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed'
            });
            throw error;
          }
        },

        logout: () => {
          // Clear token
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem('currentUser');
          
          // Reset state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        },

        validateSession: async () => {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          set({ isLoading: true });
          try {
            const user = await authService.validateSession();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            // Session is invalid, clear everything
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem('currentUser');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setUser: (user) => {
          set({ user, isAuthenticated: true });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
); 