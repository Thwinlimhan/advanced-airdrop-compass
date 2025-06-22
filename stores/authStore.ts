import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { CurrentUser, UserRegistrationInfo, UserBadge } from '../types';
import { AUTH_TOKEN_KEY, CURRENT_USER_KEY, DEFAULT_USER_BADGES } from '../constants';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  token: string | null;
  isLoadingAuth: boolean;
  userBadges: UserBadge[];

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userInfo: UserRegistrationInfo) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  setIsLoadingAuth: (loading: boolean) => void;
  validateSession: () => Promise<void>;
  checkAndAwardBadges: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      currentUser: null,
      token: null,
      isLoadingAuth: true,
      userBadges: [],

      // Actions
      login: async (credentials) => {
        set({ isLoadingAuth: true });
        try {
          const response = await apiService.login(credentials);
          if (response.token && response.userId && response.email) {
            const user: CurrentUser = {
              id: response.userId,
              email: response.email,
              username: response.username || response.email.split('@')[0],
            };

            // Set token in API service
            apiService.setToken(response.token);

            // Store in localStorage
            localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

            // Update state
            set({
              token: response.token,
              currentUser: user,
              isAuthenticated: true,
              isLoadingAuth: false,
            });

            return true;
          } else {
            set({ isLoadingAuth: false });
            return false;
          }
        } catch (error) {
          set({ isLoadingAuth: false });
          throw error;
        }
      },

      register: async (userInfo) => {
        set({ isLoadingAuth: true });
        try {
          await apiService.register(userInfo);
          set({ isLoadingAuth: false });
          return true;
        } catch (error) {
          set({ isLoadingAuth: false });
          throw error;
        }
      },

      logout: () => {
        // Clear API service token
        apiService.setToken(null);

        // Clear localStorage
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);

        // Reset state
        set({
          isAuthenticated: false,
          currentUser: null,
          token: null,
          isLoadingAuth: false,
          userBadges: [],
        });
      },

      setToken: (token) => {
        apiService.setToken(token);
        set({ token });
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      setIsLoadingAuth: (loading) => {
        set({ isLoadingAuth: loading });
      },

      checkAndAwardBadges: () => {
        // This is a placeholder implementation
        // In a real app, this would check user activity and award badges
        const currentBadges = get().userBadges;
        const newBadges: UserBadge[] = [];
        
        // Example: Award first login badge if user doesn't have it
        if (!currentBadges.find(badge => badge.id === 'first_login')) {
          newBadges.push({
            id: 'first_login',
            name: 'First Login',
            description: 'Welcome to the platform!',
            iconName: 'Star',
            achieved: true,
            achievedDate: new Date().toISOString(),
          });
        }

        if (newBadges.length > 0) {
          set({ userBadges: [...currentBadges, ...newBadges] });
        }
      },

      validateSession: async () => {
        set({ isLoadingAuth: true });
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (storedToken) {
          try {
            // Set token in API service
            apiService.setToken(storedToken);

            // Validate token with server
            const userData = await apiService.getCurrentUser();
            
            const finalUser: CurrentUser = {
              id: userData.id,
              email: userData.email,
              username: userData.username || userData.email.split('@')[0],
            };

            // Update localStorage with validated user data
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(finalUser));

            // Update state
            set({
              token: storedToken,
              currentUser: finalUser,
              isAuthenticated: true,
              isLoadingAuth: false,
            });
          } catch (error) {
            console.error('Error validating session:', error);
            // Clear invalid session
            get().logout();
          }
        } else {
          set({ isLoadingAuth: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        userBadges: state.userBadges,
      }),
    }
  )
); 