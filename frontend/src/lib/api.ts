import axios from 'axios';

// 本番環境ではNext.js APIルートを使用
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? '/api' 
  : 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの追加）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // トークンの更新を試みる
      // TODO: リフレッシュトークンの実装
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // ログインページへのリダイレクトは/loginが既にパブリックページなので
      // 無限ループを避けるために現在のページがログインページでない場合のみ実行
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);