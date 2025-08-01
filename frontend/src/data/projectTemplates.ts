// プロジェクトテンプレートの型定義
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultDuration: number; // 日数
  dependencies?: string[]; // 前提タスクのID
  assigneeRole?: 'sales' | 'design' | 'ic' | 'construction';
  checklist?: string[];
  phaseId: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  productType: string; // 商品タイプ（企画住宅、注文住宅など）
  icon: string;
  defaultDuration: number; // 全体の標準工期（日数）
  tasks: TaskTemplate[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// デフォルトテンプレート
export const defaultTemplates: ProjectTemplate[] = [
  {
    id: 'template-kikaku',
    name: '企画住宅テンプレート',
    description: '規格化された住宅プランでの標準的な工程',
    productType: '企画住宅',
    icon: '🏠',
    defaultDuration: 180,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tasks: [
      // 追客・設計フェーズ
      {
        id: 'kikaku-1',
        name: '設計申込',
        description: '企画住宅プランの申込受付',
        defaultDuration: 1,
        phaseId: '1',
        assigneeRole: 'sales',
        checklist: [
          '申込書受領確認',
          '敷地資料確認',
          '規格プラン選定',
          '担当者アサイン'
        ]
      },
      {
        id: 'kikaku-2',
        name: 'プラン確認',
        description: '選定した企画プランの確認と微調整',
        defaultDuration: 7,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['kikaku-1'],
        checklist: [
          'プラン説明',
          '配置計画確認',
          '外観カラー選定',
          '設備仕様確認'
        ]
      },
      {
        id: 'kikaku-3',
        name: '見積作成',
        description: '企画住宅の標準見積作成',
        defaultDuration: 3,
        phaseId: '1',
        assigneeRole: 'sales',
        dependencies: ['kikaku-2'],
        checklist: [
          '標準仕様確認',
          'オプション選定',
          '見積書作成',
          '資金計画作成'
        ]
      },
      // 契約フェーズ
      {
        id: 'kikaku-4',
        name: '契約前最終確認',
        description: '契約前の最終確認と調整',
        defaultDuration: 3,
        phaseId: '2',
        assigneeRole: 'sales',
        dependencies: ['kikaku-3'],
        checklist: [
          '最終見積確認',
          '契約条件確認',
          'スケジュール確認',
          '支払い条件確認'
        ]
      },
      {
        id: 'kikaku-5',
        name: '請負契約',
        description: '建築請負契約の締結',
        defaultDuration: 1,
        phaseId: '2',
        assigneeRole: 'sales',
        dependencies: ['kikaku-4'],
        checklist: [
          '契約書類準備',
          '重要事項説明',
          '契約締結',
          '手付金受領'
        ]
      },
      // 打ち合わせフェーズ（企画住宅は簡略化）
      {
        id: 'kikaku-6',
        name: '仕様確認',
        description: '標準仕様とオプションの最終確認',
        defaultDuration: 7,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['kikaku-5'],
        checklist: [
          '内装カラー確認',
          '設備仕様確認',
          '電気配線確認',
          'オプション最終確認'
        ]
      },
      {
        id: 'kikaku-7',
        name: '確認申請',
        description: '建築確認申請の提出',
        defaultDuration: 21,
        phaseId: '3',
        assigneeRole: 'design',
        dependencies: ['kikaku-6'],
        checklist: [
          '申請書類作成',
          '構造計算確認',
          '申請提出',
          '確認済証受領'
        ]
      },
      // 施工フェーズ
      {
        id: 'kikaku-8',
        name: '地鎮祭',
        description: '地鎮祭の実施',
        defaultDuration: 1,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['kikaku-7'],
        checklist: [
          '日程調整',
          '準備物確認',
          '地鎮祭実施',
          '近隣挨拶'
        ]
      },
      {
        id: 'kikaku-9',
        name: '基礎着工',
        description: '基礎工事の開始',
        defaultDuration: 14,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['kikaku-8'],
        checklist: [
          '地盤確認',
          '掘削工事',
          '配筋工事',
          'コンクリート打設'
        ]
      },
      {
        id: 'kikaku-10',
        name: '上棟',
        description: '建物骨組みの組み上げ',
        defaultDuration: 3,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['kikaku-9'],
        checklist: [
          '土台据付',
          '柱・梁組立',
          '屋根下地',
          '上棟式準備'
        ]
      },
      {
        id: 'kikaku-11',
        name: '外装工事',
        description: '外壁・屋根工事',
        defaultDuration: 30,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['kikaku-10'],
        checklist: [
          '屋根工事',
          '外壁下地',
          '防水工事',
          '外壁仕上げ'
        ]
      },
      {
        id: 'kikaku-12',
        name: '内装工事',
        description: '内装仕上げ工事',
        defaultDuration: 45,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['kikaku-11'],
        checklist: [
          '断熱工事',
          '内壁下地',
          'フロア工事',
          'クロス工事',
          '設備機器設置'
        ]
      },
      // 竣工フェーズ
      {
        id: 'kikaku-13',
        name: '社内検査',
        description: '社内完了検査の実施',
        defaultDuration: 2,
        phaseId: '5',
        assigneeRole: 'construction',
        dependencies: ['kikaku-12'],
        checklist: [
          '仕上がり確認',
          '設備動作確認',
          '是正リスト作成',
          '是正工事実施'
        ]
      },
      {
        id: 'kikaku-14',
        name: '施主検査',
        description: 'お客様立会い検査',
        defaultDuration: 1,
        phaseId: '5',
        assigneeRole: 'construction',
        dependencies: ['kikaku-13'],
        checklist: [
          '立会い日程調整',
          '検査実施',
          '指摘事項確認',
          '是正対応'
        ]
      },
      {
        id: 'kikaku-15',
        name: '引渡し',
        description: '建物の引渡し',
        defaultDuration: 1,
        phaseId: '5',
        assigneeRole: 'sales',
        dependencies: ['kikaku-14'],
        checklist: [
          '引渡し書類準備',
          '鍵引渡し',
          '設備説明',
          '保証書発行'
        ]
      }
    ]
  },
  {
    id: 'template-chumon',
    name: '注文住宅テンプレート',
    description: 'フルオーダーメイドの注文住宅向け詳細工程',
    productType: '注文住宅',
    icon: '🏗️',
    defaultDuration: 240,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tasks: [
      // 追客・設計フェーズ
      {
        id: 'chumon-1',
        name: '設計申込',
        description: '注文住宅の設計申込受付',
        defaultDuration: 1,
        phaseId: '1',
        assigneeRole: 'sales',
        checklist: [
          '申込書受領確認',
          '敷地資料収集',
          '要望ヒアリングシート準備',
          '設計担当者アサイン'
        ]
      },
      {
        id: 'chumon-2',
        name: 'プランヒアリング',
        description: '詳細な要望ヒアリング',
        defaultDuration: 3,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['chumon-1'],
        checklist: [
          'ライフスタイルヒアリング',
          '間取り要望確認',
          'デザイン要望確認',
          '予算ヒアリング',
          '敷地調査'
        ]
      },
      {
        id: 'chumon-3',
        name: '1stプラン',
        description: '初回プラン提案',
        defaultDuration: 14,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['chumon-2'],
        checklist: [
          'コンセプト作成',
          '配置計画',
          '平面計画',
          '立面計画',
          'パース作成'
        ]
      },
      {
        id: 'chumon-4',
        name: '2ndプラン',
        description: '修正プラン提案',
        defaultDuration: 10,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['chumon-3'],
        checklist: [
          '1stプランフィードバック反映',
          '間取り修正',
          '外観デザイン調整',
          '概算見積作成'
        ]
      },
      {
        id: 'chumon-5',
        name: '3rdプラン',
        description: '最終調整プラン',
        defaultDuration: 7,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['chumon-4'],
        checklist: [
          '最終調整',
          '構造確認',
          '設備計画',
          '詳細見積準備'
        ]
      },
      // 契約フェーズ
      {
        id: 'chumon-6',
        name: '契約前打合せ',
        description: '契約条件の最終確認',
        defaultDuration: 5,
        phaseId: '2',
        assigneeRole: 'sales',
        dependencies: ['chumon-5'],
        checklist: [
          '最終プラン確認',
          '見積内容説明',
          '契約条件確認',
          '支払い計画確認',
          'スケジュール確認'
        ]
      },
      {
        id: 'chumon-7',
        name: '請負契約',
        description: '建築請負契約締結',
        defaultDuration: 1,
        phaseId: '2',
        assigneeRole: 'sales',
        dependencies: ['chumon-6'],
        checklist: [
          '契約書類準備',
          '重要事項説明',
          '契約締結',
          '手付金受領',
          '実施設計開始'
        ]
      },
      // 打ち合わせフェーズ
      {
        id: 'chumon-8',
        name: '1st仕様打合せ',
        description: '基本仕様の決定',
        defaultDuration: 7,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['chumon-7'],
        checklist: [
          '構造仕様確認',
          '断熱仕様確認',
          '基本設備選定',
          '電気設備計画'
        ]
      },
      {
        id: 'chumon-9',
        name: '2nd仕様打合せ',
        description: '外装仕様の決定',
        defaultDuration: 7,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['chumon-8'],
        checklist: [
          '屋根材選定',
          '外壁材選定',
          '窓・サッシ選定',
          '玄関ドア選定'
        ]
      },
      {
        id: 'chumon-10',
        name: '3rd仕様打合せ',
        description: '内装仕様の決定',
        defaultDuration: 10,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['chumon-9'],
        checklist: [
          'フロア材選定',
          '内装ドア選定',
          'クロス選定',
          '照明計画',
          '収納計画'
        ]
      },
      {
        id: 'chumon-11',
        name: '4th仕様打合せ',
        description: '設備仕様の決定',
        defaultDuration: 10,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['chumon-10'],
        checklist: [
          'キッチン選定',
          'バスルーム選定',
          'トイレ選定',
          '洗面化粧台選定',
          '給湯器選定'
        ]
      },
      {
        id: 'chumon-12',
        name: 'カラーコーディネート',
        description: '全体のカラーコーディネート',
        defaultDuration: 5,
        phaseId: '3',
        assigneeRole: 'ic',
        dependencies: ['chumon-11'],
        checklist: [
          '外観カラー最終確認',
          '内装カラー調整',
          'アクセントクロス選定',
          'コーディネート確認'
        ]
      },
      {
        id: 'chumon-13',
        name: '確認申請',
        description: '建築確認申請',
        defaultDuration: 30,
        phaseId: '3',
        assigneeRole: 'design',
        dependencies: ['chumon-12'],
        checklist: [
          '実施設計図作成',
          '構造計算',
          '申請書類作成',
          '申請提出',
          '確認済証受領'
        ]
      },
      // 施工フェーズ
      {
        id: 'chumon-14',
        name: '地鎮祭',
        description: '地鎮祭の実施',
        defaultDuration: 1,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-13'],
        checklist: [
          '日程調整',
          '神主手配',
          '準備物確認',
          '地鎮祭実施',
          '近隣挨拶'
        ]
      },
      {
        id: 'chumon-15',
        name: '基礎着工',
        description: '基礎工事開始',
        defaultDuration: 21,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-14'],
        checklist: [
          '地盤改良（必要時）',
          '掘削工事',
          '捨てコンクリート',
          '配筋工事',
          'コンクリート打設',
          '養生期間'
        ]
      },
      {
        id: 'chumon-16',
        name: '土台伏せ',
        description: '土台の据付',
        defaultDuration: 2,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-15'],
        checklist: [
          '基礎パッキン設置',
          '土台据付',
          'アンカーボルト締付',
          '床下配管'
        ]
      },
      {
        id: 'chumon-17',
        name: '上棟',
        description: '建物骨組みの組み上げ',
        defaultDuration: 3,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-16'],
        checklist: [
          '材料搬入',
          '柱建て',
          '梁組み',
          '屋根下地',
          '上棟式'
        ]
      },
      {
        id: 'chumon-18',
        name: '屋根工事',
        description: '屋根仕上げ工事',
        defaultDuration: 7,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-17'],
        checklist: [
          'ルーフィング',
          '屋根材施工',
          '雨樋設置',
          '板金工事'
        ]
      },
      {
        id: 'chumon-19',
        name: '外壁工事',
        description: '外壁仕上げ工事',
        defaultDuration: 21,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-18'],
        checklist: [
          '透湿防水シート',
          '胴縁施工',
          '外壁材施工',
          'シーリング工事',
          '外部塗装'
        ]
      },
      {
        id: 'chumon-20',
        name: '断熱・内部造作',
        description: '断熱工事と内部造作',
        defaultDuration: 30,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-19'],
        checklist: [
          '断熱材施工',
          '気密施工',
          '間仕切り壁',
          '階段造作',
          '造作家具'
        ]
      },
      {
        id: 'chumon-21',
        name: '内装仕上げ',
        description: '内装仕上げ工事',
        defaultDuration: 21,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-20'],
        checklist: [
          'フロア施工',
          'クロス工事',
          '建具取付',
          '照明器具設置',
          'スイッチ・コンセント'
        ]
      },
      {
        id: 'chumon-22',
        name: '設備機器設置',
        description: '住宅設備の設置',
        defaultDuration: 7,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-21'],
        checklist: [
          'キッチン設置',
          'バスルーム設置',
          'トイレ設置',
          '洗面化粧台設置',
          '給湯器設置'
        ]
      },
      {
        id: 'chumon-23',
        name: '外構工事',
        description: '外構・エクステリア工事',
        defaultDuration: 14,
        phaseId: '4',
        assigneeRole: 'construction',
        dependencies: ['chumon-22'],
        checklist: [
          '駐車場工事',
          'アプローチ工事',
          'フェンス工事',
          '植栽工事',
          '照明工事'
        ]
      },
      // 竣工フェーズ
      {
        id: 'chumon-24',
        name: '社内検査',
        description: '社内完了検査',
        defaultDuration: 3,
        phaseId: '5',
        assigneeRole: 'construction',
        dependencies: ['chumon-23'],
        checklist: [
          '全体仕上がり確認',
          '設備動作確認',
          '建具調整',
          '是正リスト作成',
          '是正工事'
        ]
      },
      {
        id: 'chumon-25',
        name: '施主検査',
        description: 'お客様立会い検査',
        defaultDuration: 2,
        phaseId: '5',
        assigneeRole: 'construction',
        dependencies: ['chumon-24'],
        checklist: [
          '検査日程調整',
          '検査立会い',
          '指摘事項確認',
          '是正対応',
          '再検査'
        ]
      },
      {
        id: 'chumon-26',
        name: '完了検査',
        description: '行政完了検査',
        defaultDuration: 3,
        phaseId: '5',
        assigneeRole: 'design',
        dependencies: ['chumon-25'],
        checklist: [
          '検査申請',
          '検査立会い',
          '検査済証受領'
        ]
      },
      {
        id: 'chumon-27',
        name: '引渡し',
        description: '建物引渡し式',
        defaultDuration: 1,
        phaseId: '5',
        assigneeRole: 'sales',
        dependencies: ['chumon-26'],
        checklist: [
          '引渡し書類準備',
          '鍵引渡し',
          '設備取扱説明',
          '保証書発行',
          'アフターサービス説明'
        ]
      }
    ]
  },
  {
    id: 'template-renovation',
    name: 'リノベーションテンプレート',
    description: '既存建物のリノベーション工事向け工程',
    productType: 'リノベーション',
    icon: '🔨',
    defaultDuration: 120,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tasks: [
      // 追客・設計フェーズ
      {
        id: 'reno-1',
        name: '現地調査',
        description: '既存建物の詳細調査',
        defaultDuration: 3,
        phaseId: '1',
        assigneeRole: 'design',
        checklist: [
          '建物調査',
          '劣化診断',
          '採寸・実測',
          '設備状況確認',
          '構造確認'
        ]
      },
      {
        id: 'reno-2',
        name: 'リノベーションプラン',
        description: 'リノベーションプランの作成',
        defaultDuration: 14,
        phaseId: '1',
        assigneeRole: 'design',
        dependencies: ['reno-1'],
        checklist: [
          '現況図作成',
          'プラン作成',
          '構造検討',
          'デザイン提案',
          '概算見積'
        ]
      },
      // 以下、簡略化したタスクを追加...
    ]
  }
];

// テンプレートからプロジェクトタスクを生成する関数
export function generateTasksFromTemplate(
  templateId: string,
  projectStartDate: Date,
  assignees: {
    sales: string;
    design: string;
    ic: string;
    construction: string;
  }
): Array<{
  stageName: string;
  dueDate: Date;
  assignee: string;
  description: string;
  checklist: string[];
  phaseId: string;
}> {
  const template = defaultTemplates.find(t => t.id === templateId);
  if (!template) return [];

  const tasks: Array<{
    stageName: string;
    dueDate: Date;
    assignee: string;
    description: string;
    checklist: string[];
    phaseId: string;
  }> = [];

  let currentDate = new Date(projectStartDate);
  
  template.tasks.forEach(taskTemplate => {
    const assignee = taskTemplate.assigneeRole ? assignees[taskTemplate.assigneeRole] : assignees.construction;
    
    tasks.push({
      stageName: taskTemplate.name,
      dueDate: new Date(currentDate.getTime() + taskTemplate.defaultDuration * 24 * 60 * 60 * 1000),
      assignee,
      description: taskTemplate.description,
      checklist: taskTemplate.checklist || [],
      phaseId: taskTemplate.phaseId
    });
    
    currentDate = new Date(currentDate.getTime() + taskTemplate.defaultDuration * 24 * 60 * 60 * 1000);
  });

  return tasks;
}