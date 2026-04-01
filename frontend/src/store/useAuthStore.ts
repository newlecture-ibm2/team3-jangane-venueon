import { create } from 'zustand';
import { authAPI } from '@/lib/auth-api';

interface User {
  id?: number;
  email?: string;
  nickname?: string;
  role?: "ADMIN" | "HOST" | "USER";
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const data = await authAPI.getSession();
      if (data.isLoggedIn) {
        set({ user: data.user, isLoggedIn: true, isLoading: false });
      } else {
        set({ user: null, isLoggedIn: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await authAPI.logout();
      set({ user: null, isLoggedIn: false });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  }
}));
