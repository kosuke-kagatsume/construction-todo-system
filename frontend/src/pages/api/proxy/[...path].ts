import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// バックエンドAPIのURL（環境変数から取得）
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const url = `${API_URL}/${Array.isArray(path) ? path.join('/') : path}`;

  try {
    const response = await axios({
      method: req.method as any,
      url,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,
      },
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Proxy error' });
    }
  }
}