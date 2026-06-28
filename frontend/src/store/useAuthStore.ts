import { create } from 'zustand';
import type { User } from '../types';
import client from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await client.get('/me');
      set({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
