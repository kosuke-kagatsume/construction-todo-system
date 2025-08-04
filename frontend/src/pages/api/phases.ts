import type { NextApiRequest, NextApiResponse } from 'next';

// フェーズのモックデータ
const mockPhases = [
  { code: 'LEAD', name: '引合', order: 1 },
  { code: 'INITIAL_INVESTIGATION', name: '初回現調', order: 2 },
  { code: 'PLAN_ESTIMATION', name: 'プラン・見積', order: 3 },
  { code: 'PLAN_PROPOSAL', name: 'プラン提案', order: 4 },
  { code: 'CONTRACT', name: '契約', order: 5 },
  { code: 'DESIGN', name: '設計', order: 6 },
  { code: 'BEFORE_CONSTRUCTION', name: '着工前', order: 7 },
  { code: 'CONSTRUCTION', name: '工事', order: 8 },
  { code: 'COMPLETION', name: '完工', order: 9 },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 認証チェック（簡易版）
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    res.status(200).json(mockPhases);
  } else {
    res.status(405).json({ detail: 'Method not allowed' });
  }
}