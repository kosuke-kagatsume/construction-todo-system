import type { NextApiRequest, NextApiResponse } from 'next';

// モックタスクデータ
const mockTasks = [
  {
    id: '1',
    project_id: '1',
    project_name: '山田様邸新築工事',
    stage_code: 'FOUNDATION_START',
    stage_name: '基礎着工',
    title: '基礎工事開始の準備',
    description: '基礎工事に必要な資材の確認と現場準備',
    assignee_id: '550e8400-e29b-41d4-a716-446655440001',
    due_date: '2024-08-10',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    checklist_items: [
      { id: '1', text: '資材確認', completed: true },
      { id: '2', text: '業者手配', completed: true },
      { id: '3', text: '現場準備', completed: false },
    ],
  },
  {
    id: '2',
    project_id: '2',
    project_name: '鈴木様邸リフォーム工事',
    stage_code: 'PLAN_HEARING',
    stage_name: 'プランヒアリング',
    title: 'お客様要望のヒアリング',
    description: 'リフォーム内容の詳細な要望を確認',
    assignee_id: '550e8400-e29b-41d4-a716-446655440001',
    due_date: '2024-08-08',
    priority: 'MEDIUM',
    status: 'PENDING',
    checklist_items: [
      { id: '1', text: 'ヒアリングシート準備', completed: false },
      { id: '2', text: '参考資料収集', completed: false },
    ],
  },
  {
    id: '3',
    project_id: '3',
    project_name: '田中様邸新築工事',
    stage_code: '1ST_SPEC_MTG',
    stage_name: '1st仕様打合せ',
    title: '仕様打合せ資料の準備',
    description: '初回仕様打合せに必要な資料を準備',
    assignee_id: '550e8400-e29b-41d4-a716-446655440001',
    due_date: '2024-08-15',
    priority: 'LOW',
    status: 'PENDING',
    checklist_items: [
      { id: '1', text: 'カタログ準備', completed: false },
      { id: '2', text: '見積書作成', completed: false },
      { id: '3', text: 'サンプル準備', completed: false },
    ],
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
    // フィルタリング（今日/今週）
    const { filter } = req.query;
    let filteredTasks = mockTasks;

    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredTasks = mockTasks.filter(task => task.due_date === today);
    } else if (filter === 'week') {
      const today = new Date();
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filteredTasks = mockTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate <= weekLater;
      });
    }

    res.status(200).json(filteredTasks);
  } else {
    res.status(405).json({ detail: 'Method not allowed' });
  }
}