import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role_code: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false, // 初期状態はローディング中ではない
  error: null,

  login: async (email: string, password: string) => {
    console.log('Auth store login called:', { email });
    set({ isLoading: true, error: null });
    
    try {
      console.log('Making login request to:', '/auth/login');
      // ログインリクエスト
      const response = await api.post('/auth/login', {
        username: email,
        password: password,
      });

      console.log('Login response received:', response.data);

      // トークンを保存
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        console.log('Tokens saved to localStorage');
      }

      // ユーザー情報を取得
      console.log('Fetching user info from /auth/me');
      const userResponse = await api.get('/auth/me');
      console.log('User info received:', userResponse.data);
      
      set({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('Login completed successfully');
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response?.data);
      set({
        error: error.response?.data?.detail || 'ログインに失敗しました',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    // トークンを削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  fetchUser: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });
    
    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // トークンが無効な場合はログアウト
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}))