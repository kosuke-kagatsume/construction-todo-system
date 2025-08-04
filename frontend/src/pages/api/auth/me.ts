import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Authorizationヘッダーからトークンを取得
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const token = authHeader.substring(7);

  try {
    // モックトークンをデコード（実際のJWT検証ではない）
    const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(401).json({ detail: 'Invalid token' });
  }
}