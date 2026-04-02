import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; pass: string }) => Promise<void>;
  register: (userInfo: { email: string; pass: string; fullName: string }) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,

        setAuthToken: async (token: string) => {
          set({ token });
          await get().initAuth();
        },

        login: async (credentials) => {
          const { email, pass } = credentials;
          const response = await api.post('/auth/login', {
            email,
            password: pass,
          });
          const { token, user } = response.data;
          set({ token, user, isAuthenticated: true, isLoading: false });
        },

        register: async (userInfo) => {
          const { email, pass, fullName } = userInfo;
          const response = await api.post('/auth/register', {
            email,
            password: pass,
            fullName,
          });
          const { token, user } = response.data;
          set({ token, user, isAuthenticated: true, isLoading: false });
        },

        logout: () => {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        },

        initAuth: async () => {
          const { token, isAuthenticated } = get();

          // If the user is already authenticated (e.g. after login/register),
          // do NOT overwrite their auth state with a potentially failing API call.
          // This prevents a race condition where initAuth clears auth after login.
          if (isAuthenticated) {
            set({ isLoading: false });
            return;
          }

          if (token) {
            try {
              const response = await api.get('/users/profile');
              const userProfile = response.data;
              const user = {
                id: userProfile.id,
                email: userProfile.email,
                fullName: userProfile.full_name,
                role: userProfile.role,
              };
              set({ user, isAuthenticated: true, isLoading: false });
            } catch {
              // Token is invalid/expired — clear auth state
              set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'auth-storage', // unique name for localStorage key
      }
    )
  )
);