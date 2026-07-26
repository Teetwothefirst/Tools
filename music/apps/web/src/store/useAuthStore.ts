import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@music/types';

interface AuthState {
  user: Omit<User, 'createdAt' | 'updatedAt'> | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: Omit<User, 'createdAt' | 'updatedAt'>, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'music-auth-storage',
    },
  ),
);
