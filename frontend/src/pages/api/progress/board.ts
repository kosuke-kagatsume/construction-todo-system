import type { NextApiRequest, NextApiResponse } from 'next';

// モックボードデータ
const mockBoardData = {
  projects: [
    {
      id: '1',
      name: '山田様邸',
      customer_name: '山田太郎',
      status: 'IN_PROGRESS',
      phases: {
        'LEAD': { status: 'completed', progress: 100 },
        'INITIAL_INVESTIGATION': { status: 'completed', progress: 100 },
        'PLAN_ESTIMATION': { status: 'completed', progress: 100 },
        'PLAN_PROPOSAL': { status: 'completed', progress: 100 },
        'CONTRACT': { status: 'completed', progress: 100 },
        'DESIGN': { status: 'completed', progress: 100 },
        'BEFORE_CONSTRUCTION': { status: 'active', progress: 75 },
        'CONSTRUCTION': { status: 'pending', progress: 0 },
        'COMPLETION': { status: 'pending', progress: 0 },
      },
      tasks: {
        'FOUNDATION_START': { status: 'IN_PROGRESS', assignee: '営業太郎' },
        'FRAME_COMPLETE': { status: 'PENDING', assignee: '工務三郎' },
      }
    },
    {
      id: '2',
      name: '鈴木様邸',
      customer_name: '鈴木花子',
      status: 'PLANNING',
      phases: {
        'LEAD': { status: 'active', progress: 50 },
        'INITIAL_INVESTIGATION': { status: 'pending', progress: 0 },
        'PLAN_ESTIMATION': { status: 'pending', progress: 0 },
        'PLAN_PROPOSAL': { status: 'pending', progress: 0 },
        'CONTRACT': { status: 'pending', progress: 0 },
        'DESIGN': { status: 'pending', progress: 0 },
        'BEFORE_CONSTRUCTION': { status: 'pending', progress: 0 },
        'CONSTRUCTION': { status: 'pending', progress: 0 },
        'COMPLETION': { status: 'pending', progress: 0 },
      },
      tasks: {
        'PLAN_HEARING': { status: 'PENDING', assignee: '営業太郎' },
      }
    },
    {
      id: '3',
      name: '田中様邸',
      customer_name: '田中次郎',
      status: 'IN_PROGRESS',
      phases: {
        'LEAD': { status: 'completed', progress: 100 },
        'INITIAL_INVESTIGATION': { status: 'completed', progress: 100 },
        'PLAN_ESTIMATION': { status: 'active', progress: 60 },
        'PLAN_PROPOSAL': { status: 'pending', progress: 0 },
        'CONTRACT': { status: 'pending', progress: 0 },
        'DESIGN': { status: 'pending', progress: 0 },
        'BEFORE_CONSTRUCTION': { status: 'pending', progress: 0 },
        'CONSTRUCTION': { status: 'pending', progress: 0 },
        'COMPLETION': { status: 'pending', progress: 0 },
      },
      tasks: {
        '1ST_SPEC_MTG': { status: 'PENDING', assignee: '設計花子' },
      }
    },
  ],
  statistics: {
    total_projects: 3,
    active_projects: 2,
    delayed_projects: 0,
    tasks_today: 2,
    tasks_week: 5,
  }
};

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
    // ボードデータを返す
    res.status(200).json(mockBoardData);
  } else {
    res.status(405).json({ detail: 'Method not allowed' });
  }
}