import type { NextApiRequest, NextApiResponse } from 'next';

// ステージのモックデータ
const mockStages = [
  // 引合フェーズ
  { code: 'INQUIRY_RECEIVED', name: '引合受付', phase_code: 'LEAD', order: 1 },
  { code: 'INITIAL_CONTACT', name: '初回連絡', phase_code: 'LEAD', order: 2 },
  
  // 初回現調フェーズ
  { code: 'SURVEY_SCHEDULED', name: '現調日程調整', phase_code: 'INITIAL_INVESTIGATION', order: 1 },
  { code: 'SURVEY_COMPLETE', name: '現調完了', phase_code: 'INITIAL_INVESTIGATION', order: 2 },
  
  // プラン・見積フェーズ
  { code: 'PLAN_HEARING', name: 'プランヒアリング', phase_code: 'PLAN_ESTIMATION', order: 1 },
  { code: 'CONCEPT_PLAN', name: 'コンセプトプラン', phase_code: 'PLAN_ESTIMATION', order: 2 },
  { code: 'FIRST_PLAN', name: 'ファーストプラン', phase_code: 'PLAN_ESTIMATION', order: 3 },
  
  // プラン提案フェーズ
  { code: 'PLAN_PROPOSAL_MTG', name: 'プラン提案打合せ', phase_code: 'PLAN_PROPOSAL', order: 1 },
  { code: 'REVISED_PLAN', name: '修正プラン', phase_code: 'PLAN_PROPOSAL', order: 2 },
  
  // 契約フェーズ
  { code: 'CONTRACT_PREP', name: '契約準備', phase_code: 'CONTRACT', order: 1 },
  { code: 'CONTRACT_SIGNED', name: '契約締結', phase_code: 'CONTRACT', order: 2 },
  
  // 設計フェーズ
  { code: '1ST_SPEC_MTG', name: '1st仕様打合せ', phase_code: 'DESIGN', order: 1 },
  { code: '2ND_SPEC_MTG', name: '2nd仕様打合せ', phase_code: 'DESIGN', order: 2 },
  { code: 'FINAL_SPEC_MTG', name: '最終仕様打合せ', phase_code: 'DESIGN', order: 3 },
  { code: 'SPEC_CONFIRMED', name: '仕様確定', phase_code: 'DESIGN', order: 4 },
  
  // 着工前フェーズ
  { code: 'GROUND_CEREMONY', name: '地鎮祭', phase_code: 'BEFORE_CONSTRUCTION', order: 1 },
  { code: 'DEMOLITION_START', name: '解体着工', phase_code: 'BEFORE_CONSTRUCTION', order: 2 },
  { code: 'DEMOLITION_COMPLETE', name: '解体完了', phase_code: 'BEFORE_CONSTRUCTION', order: 3 },
  
  // 工事フェーズ
  { code: 'FOUNDATION_START', name: '基礎着工', phase_code: 'CONSTRUCTION', order: 1 },
  { code: 'FOUNDATION_COMPLETE', name: '基礎完了', phase_code: 'CONSTRUCTION', order: 2 },
  { code: 'FRAME_RAISING', name: '上棟', phase_code: 'CONSTRUCTION', order: 3 },
  { code: 'FRAME_COMPLETE', name: '躯体完了', phase_code: 'CONSTRUCTION', order: 4 },
  { code: 'EXTERIOR_COMPLETE', name: '外装完了', phase_code: 'CONSTRUCTION', order: 5 },
  { code: 'INTERIOR_COMPLETE', name: '内装完了', phase_code: 'CONSTRUCTION', order: 6 },
  
  // 完工フェーズ
  { code: 'OWNER_INSPECTION', name: '施主完了検査', phase_code: 'COMPLETION', order: 1 },
  { code: 'FINAL_INSPECTION', name: '完成検査', phase_code: 'COMPLETION', order: 2 },
  { code: 'HANDOVER', name: '引渡式', phase_code: 'COMPLETION', order: 3 },
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
    res.status(200).json(mockStages);
  } else {
    res.status(405).json({ detail: 'Method not allowed' });
  }
}