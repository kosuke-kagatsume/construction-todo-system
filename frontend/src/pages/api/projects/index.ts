import type { NextApiRequest, NextApiResponse } from 'next';

// モックプロジェクトデータ
const mockProjects = [
  {
    id: '1',
    name: '山田様邸新築工事',
    code: 'PRJ-2024-001',
    customer_name: '山田太郎',
    customer_email: 'yamada@example.com',
    customer_phone: '090-1234-5678',
    address: '東京都渋谷区1-1-1',
    estimated_start_date: '2024-02-01',
    estimated_end_date: '2024-08-31',
    actual_start_date: '2024-02-05',
    status: 'IN_PROGRESS',
    current_phase: 'CONSTRUCTION',
    progress: 65,
  },
  {
    id: '2',
    name: '鈴木様邸リフォーム工事',
    code: 'PRJ-2024-002',
    customer_name: '鈴木花子',
    customer_email: 'suzuki@example.com',
    customer_phone: '090-2345-6789',
    address: '東京都世田谷区2-2-2',
    estimated_start_date: '2024-03-01',
    estimated_end_date: '2024-06-30',
    status: 'PLANNING',
    current_phase: 'LEAD',
    progress: 20,
  },
  {
    id: '3',
    name: '田中様邸新築工事',
    code: 'PRJ-2024-003',
    customer_name: '田中次郎',
    customer_email: 'tanaka@example.com',
    customer_phone: '090-3456-7890',
    address: '東京都目黒区3-3-3',
    estimated_start_date: '2024-04-01',
    estimated_end_date: '2024-10-31',
    status: 'IN_PROGRESS',
    current_phase: 'MEETING',
    progress: 35,
  },
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
    // プロジェクト一覧を返す
    res.status(200).json(mockProjects);
  } else if (req.method === 'POST') {
    // 新規プロジェクト作成（モック）
    const newProject = {
      id: String(mockProjects.length + 1),
      ...req.body,
      status: 'PLANNING',
      current_phase: 'LEAD',
      progress: 0,
    };
    mockProjects.push(newProject);
    res.status(201).json(newProject);
  } else {
    res.status(405).json({ detail: 'Method not allowed' });
  }
}