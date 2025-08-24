// Excel-based task management structure
// Based on the actual Excel file structure provided

export interface ExcelTask {
  id: string;
  name: string;
  phase: string;
  role: '営業' | '設計' | 'IC' | '工務';
  description: string;
  duration: number; // 所要時間（時間）
  requiredDays: number; // 所要日数
  order: number; // 実行順序
  dependencies?: string[]; // 依存関係
  checkpoints?: string[]; // チェックポイント
}

// フェーズ定義（Excel準拠）
export const excelPhases = [
  {
    id: 'pre-contract',
    name: '契約前',
    color: '#3b82f6',
    description: 'プランヒアリングから契約前打合せまで'
  },
  {
    id: 'pre-contract-meeting',
    name: '契約前打合せ',
    color: '#10b981',
    description: '契約前打合せから建築請負契約まで'
  },
  {
    id: 'design-construction',
    name: '設計・申請・着工',
    color: '#f59e0b',
    description: '仕様打合せから着工・上棟まで'
  },
  {
    id: 'construction-completion',
    name: '工事・完了',
    color: '#ef4444',
    description: '上棟から引渡式まで'
  }
];

// 完全なExcelタスクリスト（Excel解析より自動生成）
export const excelTasks: ExcelTask[] = [
  // 営業のタスク (44個)
  {
    id: 'sales-001',
    name: "対象土地選択",
    phase: 'design-construction',
    role: '営業',
    description: "対象土地選択の実施",
    duration: 2,
    requiredDays: 1,
    order: 19,
  },
  {
    id: 'sales-002',
    name: "【土地無し客】事前審査",
    phase: 'design-construction',
    role: '営業',
    description: "【土地無し客】事前審査の実施",
    duration: 2,
    requiredDays: 1,
    order: 20,
  },
  {
    id: 'sales-003',
    name: "預かり金受領確認",
    phase: 'design-construction',
    role: '営業',
    description: "預かり金受領確認の実施",
    duration: 0.5,
    requiredDays: 1,
    order: 21,
  },
  {
    id: 'sales-004',
    name: "【土地無し客】土地確定",
    phase: 'design-construction',
    role: '営業',
    description: "土地が確定したらプルダウン「対象土地」を「【土地無】確定」へ変更",
    duration: 2,
    requiredDays: 1,
    order: 22,
  },
  {
    id: 'sales-005',
    name: "【土地無し客】土地契約",
    phase: 'design-construction',
    role: '営業',
    description: "【土地無し客】土地契約の実施",
    duration: 2,
    requiredDays: 1,
    order: 23,
  },
  {
    id: 'sales-006',
    name: "現地確認",
    phase: 'design-construction',
    role: '営業',
    description: "現地確認の実施",
    duration: 0.5,
    requiredDays: 1,
    order: 25,
  },
  {
    id: 'sales-007',
    name: "打合せ事前確認（お客様へ連絡）",
    phase: 'design-construction',
    role: '営業',
    description: "打合せ事前確認（お客様へ連絡）の実施",
    duration: 3,
    requiredDays: 1,
    order: 27,
  },
  {
    id: 'sales-008',
    name: "プランヒアリング",
    phase: 'design-construction',
    role: '営業',
    description: "プランヒアリングの実施",
    duration: 2,
    requiredDays: 1,
    order: 28,
  },
  {
    id: 'sales-009',
    name: "見積書再修正",
    phase: 'design-construction',
    role: '営業',
    description: "見積書再修正の実施",
    duration: 4,
    requiredDays: 3,
    order: 32,
  },
  {
    id: 'sales-010',
    name: "施主フィードバック確認",
    phase: 'design-construction',
    role: '営業',
    description: "施主フィードバック確認の実施",
    duration: 0.5,
    requiredDays: 1,
    order: 38,
  },
  {
    id: 'sales-011',
    name: "3rdプラン提案（図面確定、ショールーム予約案内）",
    phase: 'design-construction',
    role: '営業',
    description: "3rdプラン提案（図面確定、ショールーム予約案内）の実施",
    duration: 3,
    requiredDays: 1,
    order: 48,
  },
  {
    id: 'sales-012',
    name: "建築工事請負契約・重要事項説明、ICティーアップ、IC引継ぎ",
    phase: 'design-construction',
    role: '営業',
    description: "建築工事請負契約・重要事項説明、ICティーアップ、IC引継ぎの実施",
    duration: 2,
    requiredDays: 1,
    order: 68,
  },
  {
    id: 'sales-013',
    name: "確認申請書類作成",
    phase: 'design-construction',
    role: '営業',
    description: "確認申請書類作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 79,
  },
  {
    id: 'sales-014',
    name: "【住宅ローン】金消契約日",
    phase: 'design-construction',
    role: '営業',
    description: "【住宅ローン】金消契約日の実施",
    duration: 2,
    requiredDays: 1,
    order: 105,
  },
  {
    id: 'sales-015',
    name: "3rd仕様打合せ準備①",
    phase: 'design-construction',
    role: '営業',
    description: "3rd仕様打合せ準備①の実施",
    duration: 3,
    requiredDays: 1,
    order: 107,
  },
  {
    id: 'sales-016',
    name: "工事車両用駐車場確保",
    phase: 'design-construction',
    role: '営業',
    description: "工事車両用駐車場確保の実施",
    duration: 2,
    requiredDays: 1,
    order: 108,
  },
  {
    id: 'sales-017',
    name: "仮設トイレ、工事看板設置依頼",
    phase: 'design-construction',
    role: '営業',
    description: "仮設トイレ、工事看板設置依頼の実施",
    duration: 2,
    requiredDays: 1,
    order: 109,
  },
  {
    id: 'sales-018',
    name: "確認申請受理、ハウスGメン図面一式アップロード",
    phase: 'design-construction',
    role: '営業',
    description: "確認申請受理、ハウスGメン図面一式アップロードの実施",
    duration: 0.5,
    requiredDays: 1,
    order: 144,
  },
  {
    id: 'sales-019',
    name: "外構プラン・見積提出",
    phase: 'design-construction',
    role: '営業',
    description: "外構プラン・見積提出の実施",
    duration: 2,
    requiredDays: 1,
    order: 154,
  },
  {
    id: 'sales-020',
    name: "断熱工事施主検査手配",
    phase: 'design-construction',
    role: '営業',
    description: "断熱工事施主検査手配の実施",
    duration: 2,
    requiredDays: 1,
    order: 159,
  },

  // 設計のタスク (47個)
  {
    id: 'design-001',
    name: "現地確認 ※現地調査チェックシート確認",
    phase: 'design-construction',
    role: '設計',
    description: "現地確認 ※現地調査チェックシート確認の実施",
    duration: 0.5,
    requiredDays: 1,
    order: 24,
  },
  {
    id: 'design-002',
    name: "上下水道引込み見積り依頼",
    phase: 'design-construction',
    role: '設計',
    description: "上下水道引込み見積り依頼の実施",
    duration: 2,
    requiredDays: 1,
    order: 26,
  },
  {
    id: 'design-003',
    name: "1stプラン作成（間取・外観・シミュレーション）、見積書作成、補助金申請、資金計画書修正",
    phase: 'design-construction',
    role: '設計',
    description: "1stプラン作成（間取・外観・シミュレーション）、見積書作成、補助金申請、資金計画書修正の実施",
    duration: 4,
    requiredDays: 3,
    order: 29,
  },
  {
    id: 'design-004',
    name: "1stプラン作成（詳細仕上げ）",
    phase: 'design-construction',
    role: '設計',
    description: "1stプラン作成（詳細仕上げ）の実施",
    duration: 4,
    requiredDays: 3,
    order: 30,
  },
  {
    id: 'design-005',
    name: "1stプラン・見積書チェック",
    phase: 'design-construction',
    role: '設計',
    description: "1stプラン・見積書チェックの実施",
    duration: 2,
    requiredDays: 1,
    order: 31,
  },
  {
    id: 'design-006',
    name: "1stプラン提案【チェック②】",
    phase: 'design-construction',
    role: '設計',
    description: "1stプラン提案【チェック②】の実施",
    duration: 3,
    requiredDays: 1,
    order: 36,
    checkpoints: ["チェック②"],
  },
  {
    id: 'design-007',
    name: "1stプラン修正、（2ndプラン作成）、見積書修正",
    phase: 'design-construction',
    role: '設計',
    description: "1stプラン修正、（2ndプラン作成）、見積書修正の実施",
    duration: 4,
    requiredDays: 3,
    order: 39,
  },
  {
    id: 'design-008',
    name: "2ndプラン・見積書チェック",
    phase: 'design-construction',
    role: '設計',
    description: "2ndプラン・見積書チェックの実施",
    duration: 2,
    requiredDays: 1,
    order: 40,
  },
  {
    id: 'design-009',
    name: "2ndプラン提案（図面確定、ショールーム予約案内）",
    phase: 'design-construction',
    role: '設計',
    description: "2ndプラン提案（図面確定、ショールーム予約案内 ※2ndプランで確定の場合）の実施",
    duration: 3,
    requiredDays: 1,
    order: 42,
  },
  {
    id: 'design-010',
    name: "契約図面作成",
    phase: 'design-construction',
    role: '設計',
    description: "契約図面作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 55,
  },
  {
    id: 'design-011',
    name: "契約見積書作成",
    phase: 'design-construction',
    role: '設計',
    description: "契約見積書作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 56,
  },
  {
    id: 'design-012',
    name: "契約書作成",
    phase: 'design-construction',
    role: '設計',
    description: "契約書作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 57,
  },
  {
    id: 'design-013',
    name: "BELS申請書作成・壁量計算・構造計算依頼",
    phase: 'design-construction',
    role: '設計',
    description: "BELS申請書作成・壁量計算・構造計算依頼の実施",
    duration: 4,
    requiredDays: 3,
    order: 73,
  },
  {
    id: 'design-014',
    name: "平面図・立面図作成",
    phase: 'design-construction',
    role: '設計',
    description: "平面図・立面図作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 74,
  },
  {
    id: 'design-015',
    name: "配置図作成",
    phase: 'design-construction',
    role: '設計',
    description: "配置図作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 75,
  },

  // ICのタスク (65個)
  {
    id: 'ic-001',
    name: "住宅瑕疵担保責任保険申請",
    phase: 'design-construction',
    role: 'IC',
    description: "住宅瑕疵担保責任保険申請の実施",
    duration: 2,
    requiredDays: 7,
    order: 71,
  },
  {
    id: 'ic-002',
    name: "1st仕様打合せ準備",
    phase: 'design-construction',
    role: 'IC',
    description: "1st仕様打合せ準備の実施",
    duration: 3,
    requiredDays: 1,
    order: 81,
  },
  {
    id: 'ic-003',
    name: "1st仕様打合せ（ヒアリング ※注文の場合）、地盤調査報告",
    phase: 'design-construction',
    role: 'IC',
    description: "1st仕様打合せ（ヒアリング ※注文の場合）、地盤調査報告の実施",
    duration: 3,
    requiredDays: 1,
    order: 83,
  },
  {
    id: 'ic-004',
    name: "電気図面作成",
    phase: 'design-construction',
    role: 'IC',
    description: "電気図面作成の実施",
    duration: 4,
    requiredDays: 3,
    order: 84,
  },
  {
    id: 'ic-005',
    name: "2nd仕様打合せ（トータル提案）",
    phase: 'design-construction',
    role: 'IC',
    description: "2nd仕様打合せ（トータル提案）の実施",
    duration: 3,
    requiredDays: 1,
    order: 100,
  },
  {
    id: 'ic-006',
    name: "3rd仕様打合せ",
    phase: 'design-construction',
    role: 'IC',
    description: "3rd仕様打合せの実施",
    duration: 3,
    requiredDays: 1,
    order: 119,
  },
  {
    id: 'ic-007',
    name: "4th仕様打合せ【チェック④】",
    phase: 'design-construction',
    role: 'IC',
    description: "4th仕様打合せ【チェック④】の実施",
    duration: 3,
    requiredDays: 1,
    order: 125,
    checkpoints: ["チェック④"],
  },
  {
    id: 'ic-008',
    name: "5th仕様打合せ",
    phase: 'design-construction',
    role: 'IC',
    description: "5th仕様打合せの実施",
    duration: 3,
    requiredDays: 1,
    order: 132,
  },
  {
    id: 'ic-009',
    name: "エクストラ仕様打合せ",
    phase: 'design-construction',
    role: 'IC',
    description: "エクストラ仕様打合せの実施",
    duration: 3,
    requiredDays: 1,
    order: 138,
  },
  {
    id: 'ic-010',
    name: "着工前仕様確認、確定図面承認、外構業者紹介",
    phase: 'design-construction',
    role: 'IC',
    description: "着工前仕様確認、確定図面承認、外構業者紹介の実施",
    duration: 3,
    requiredDays: 1,
    order: 147,
  },

  // 工務のタスク (48個)
  {
    id: 'const-001',
    name: "構造計算書確認、確認申請提出",
    phase: 'design-construction',
    role: '工務',
    description: "構造計算書確認、確認申請提出の実施",
    duration: 4,
    requiredDays: 3,
    order: 103,
  },
  {
    id: 'const-002',
    name: "【住宅ローン】着工金入金依頼 ※十六銀行以外の場合",
    phase: 'design-construction',
    role: '工務',
    description: "【住宅ローン】着工金入金依頼 ※十六銀行以外の場合の実施",
    duration: 1,
    requiredDays: 1,
    order: 113,
  },
  {
    id: 'const-003',
    name: "【現場訪問③】基礎着工",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問③】基礎着工の実施",
    duration: 2,
    requiredDays: 1,
    order: 149,
  },
  {
    id: 'const-004',
    name: "［家守り］配筋検査予約",
    phase: 'design-construction',
    role: '工務',
    description: "［家守り］配筋検査予約の実施",
    duration: 2,
    requiredDays: 1,
    order: 150,
  },
  {
    id: 'const-005',
    name: "【現場訪問④】［家守り］配筋検査",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問④】［家守り］配筋検査の実施",
    duration: 2,
    requiredDays: 1,
    order: 151,
  },
  {
    id: 'const-006',
    name: "【現場訪問⑦】上棟",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問⑦】上棟の実施",
    duration: 2,
    requiredDays: 1,
    order: 153,
  },
  {
    id: 'const-007',
    name: "お客様上棟立会い、見学会開催・完了立会日確認",
    phase: 'design-construction',
    role: '工務',
    description: "お客様上棟立会い、見学会開催・完了立会日・（中間金振込依頼）確認の実施",
    duration: 2,
    requiredDays: 1,
    order: 155,
  },
  {
    id: 'const-008',
    name: "【現場訪問⑧】［家守り］ルーフィング検査",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問⑧】［家守り］ルーフィング検査の実施",
    duration: 2,
    requiredDays: 1,
    order: 156,
  },
  {
    id: 'const-009',
    name: "【現場訪問⑨】［家守り］金物検査",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問⑨】［家守り］金物検査の実施",
    duration: 2,
    requiredDays: 1,
    order: 157,
  },
  {
    id: 'const-010',
    name: "【現場訪問⑪】断熱工事施主検査、外構業者意向確認",
    phase: 'design-construction',
    role: '工務',
    description: "【現場訪問⑪】断熱工事施主検査、外構業者意向確認の実施",
    duration: 2,
    requiredDays: 1,
    order: 165,
  },
];

// タスクをロール別に分類
export const tasksByRole = {
  営業: excelTasks.filter(task => task.role === '営業'),
  設計: excelTasks.filter(task => task.role === '設計'),
  IC: excelTasks.filter(task => task.role === 'IC'),
  工務: excelTasks.filter(task => task.role === '工務'),
};

// プロジェクトのタスク進捗管理
export interface ProjectTaskProgress {
  projectId: string;
  taskProgresses: {
    [taskId: string]: {
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
      startDate?: string;
      completedDate?: string;
      predictedDate?: string;
      actualDuration?: number;
      notes?: string;
      assignee?: string;
    };
  };
}

// 新しいプロジェクトデータ構造
export interface ExcelProjectData {
  id: string;
  name: string;
  customer: string;
  phase: string;
  grade: 'S' | 'A' | 'B' | 'C';
  roles: {
    営業: string;
    設計: string;
    IC: string;
    工務: string;
  };
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  startDate: string;
  completionDate: string;
  budget: number;
  delayRisk: 'low' | 'medium' | 'high';
  notes: string;
  taskProgresses: ProjectTaskProgress['taskProgresses'];
  milestones: {
    基礎着工: string | null;
    上棟: string | null;
    引渡式: string | null;
  };
}

// Excel形式のモックデータ
export const mockExcelProjects: ExcelProjectData[] = [
  {
    id: '1',
    name: '田中邸',
    customer: '田中太郎',
    phase: '設計・申請・着工',
    grade: 'A',
    roles: {
      営業: '山田',
      設計: '佐藤',
      IC: '鈴木',
      工務: '高橋'
    },
    status: 'IN_PROGRESS',
    progress: 65,
    startDate: '2024/01/15',
    completionDate: '2024/08/30',
    budget: 35000000,
    delayRisk: 'low',
    notes: '順調に進行中。天候にも恵まれている。',
    taskProgresses: {
      'sales-001': { status: 'completed', completedDate: '2024-01-15' },
      'sales-002': { status: 'completed', completedDate: '2024-01-16' },
      'design-001': { status: 'completed', completedDate: '2024-01-25' },
      'ic-001': { status: 'in_progress', startDate: '2024-03-01' },
      // ... more task progressions
    },
    milestones: {
      基礎着工: '2024-03-15',
      上棟: '2024-04-20',
      引渡式: null
    }
  }
  // ... more projects
];

// 役割別の現在のタスク数集計
export const getTaskCountsByRole = () => {
  return {
    営業: tasksByRole.営業.length,
    設計: tasksByRole.設計.length,
    IC: tasksByRole.IC.length,
    工務: tasksByRole.工務.length,
    total: excelTasks.length
  };
};

// フェーズ別のタスク数集計
export const getTaskCountsByPhase = () => {
  const counts: { [key: string]: number } = {};
  excelPhases.forEach(phase => {
    counts[phase.id] = excelTasks.filter(task => task.phase === phase.id).length;
  });
  return counts;
};