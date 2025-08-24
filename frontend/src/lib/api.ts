import axios from 'axios';

// FastAPIバックエンドとNext.js APIルートの切り替え
const BACKEND_API_URL = 'http://localhost:8000/api/v1';
const MOCK_API_URL = '/api';

// 環境変数またはローカル設定でバックエンド接続を制御
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true' || false;
const API_BASE_URL = USE_BACKEND ? BACKEND_API_URL : MOCK_API_URL;

console.log('API base URL:', API_BASE_URL, '(Backend:', USE_BACKEND ? 'enabled' : 'disabled', ')');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの追加）
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // ログインページへのリダイレクトは/loginが既にパブリックページなので
        // 無限ループを避けるために現在のページがログインページでない場合のみ実行
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);