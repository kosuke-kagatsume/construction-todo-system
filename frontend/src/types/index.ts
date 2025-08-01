// プロジェクト関連の型定義
export interface Project {
  id: string;
  name: string; // 邸名
  customerName: string;
  phase: string; // 契約前、契約後など
  grade?: string;
  salesUserId?: string;
  designUserId?: string;
  icUserId?: string;
  constructionUserId?: string;
  foundationTargetDate?: string; // 基礎着工目標日
  roofingTargetDate?: string; // 上棟目標日
  plannedStart?: string;
  plannedFinish?: string;
  actualStart?: string;
  actualFinish?: string;
  predictedFinish?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  delayProbability?: number;
  showInCentralBoard: boolean;
}

// フェーズの型定義
export interface Phase {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  colorCode: string;
}

// ステージの型定義
export interface Stage {
  id: string;
  phaseId: string;
  code: string;
  name: string;
  displayOrder: number;
  isMilestone: boolean;
}

// タスクの型定義
export interface Task {
  id: string;
  projectId: string;
  stageId?: string;
  seq: number;
  name: string;
  description?: string;
  assigneeRole?: 'SALES' | 'DESIGN' | 'IC' | 'CONSTRUCTION';
  assigneeUserId?: string;
  plannedStart?: string;
  plannedFinish?: string;
  actualStart?: string; // 実施済日程
  actualFinish?: string;
  predictedStart?: string; // 予測日程
  predictedFinish?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
  overrunDays?: number;
}

// ユーザーの型定義
export interface User {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  role?: Role;
}

// 役割の型定義
export interface Role {
  id: string;
  code: 'SALES' | 'DESIGN' | 'IC' | 'CONSTRUCTION';
  name: string;
}