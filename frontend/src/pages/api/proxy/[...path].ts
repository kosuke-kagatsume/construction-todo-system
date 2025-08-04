import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'http-proxy-middleware';

// バックエンドAPIのURL（環境変数から取得）
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

// プロキシの設定
const proxy = httpProxyMiddleware.createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '', // /api/proxy を削除してバックエンドに転送
  },
  onProxyReq: (proxyReq, req, res) => {
    // リクエストヘッダーの調整
    if (req.headers.cookie) {
      proxyReq.setHeader('cookie', req.headers.cookie);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Next.js の bodyParser を無効化（プロキシが処理するため）
  return new Promise((resolve, reject) => {
    proxy(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};