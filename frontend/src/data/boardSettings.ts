// 現場ボードの表示設定
export interface BoardColumnSettings {
  // タスク（ステージ）の表示設定
  visibleStages: string[];
  
  // 担当者列の表示設定
  showAssignees: {
    sales: boolean;      // 営業
    design: boolean;     // 設計
    ic: boolean;        // IC
    construction: boolean; // 工務
  };
  
  // 共有事項の表示設定
  visibleSharedItems: string[]; // 表示する共有事項のID
}

// デフォルトの表示設定
export const defaultBoardSettings: BoardColumnSettings = {
  visibleStages: [
    // デフォルトで全ステージを表示
    '設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', '設計契約', '実施設計', '確認申請',
    'プランヒアリング(着)', '敷地調査(着)', 'プラン提案(着)', '見積提出(着)', '設計契約(着)', '実施設計(着)', '確認申請(着)', '契約前打合',
    '請負契約', '契約後打合せ', '地盤調査', '地鎮祭・配置', '基礎着工', '基礎配筋', '基礎コンクリート', '基礎完了',
    '材料検査', '建て方', '上棟', '屋根・サッシ', '防水・電気', '断熱・ボード', '外壁下地', '外壁仕上',
    '木完', '内部仕上', 'クリーニング', '完成検査', '是正工事', '施主検査', '是正工事', '引き渡し',
    '1st仕様', '2nd仕様', '3rd仕様',
  ],
  
  showAssignees: {
    sales: true,
    design: true,
    ic: true,
    construction: true,
  },
  
  visibleSharedItems: [
    '9',  // 土地状況
    '10', // ローン状況
    '15', // 引渡希望月
  ],
};

// 会社ごとの設定を管理
export interface CompanyBoardSettings {
  companyId: string;
  settings: BoardColumnSettings;
}

// サンプルの会社設定
export const sampleCompanySettings: CompanyBoardSettings[] = [
  {
    companyId: 'company-1',
    settings: defaultBoardSettings,
  },
  {
    companyId: 'company-2',
    settings: {
      ...defaultBoardSettings,
      visibleStages: [
        // 重要なステージのみ表示
        '設計申込', '設計契約', '請負契約', '基礎着工', '上棟', '引き渡し',
      ],
      showAssignees: {
        sales: true,
        design: true,
        ic: false,
        construction: true,
      },
      visibleSharedItems: ['9', '10'], // 土地状況とローン状況のみ
    },
  },
];

// 現在の会社の設定を取得
export function getCompanyBoardSettings(companyId: string): BoardColumnSettings {
  const companySetting = sampleCompanySettings.find(s => s.companyId === companyId);
  return companySetting ? companySetting.settings : defaultBoardSettings;
}

// ステージのカテゴリ定義（設定UI用）
export const stageCategories = [
  {
    name: '追客・設計',
    stages: ['設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', '設計契約', '実施設計', '確認申請'],
  },
  {
    name: '契約',
    stages: ['プランヒアリング(着)', '敷地調査(着)', 'プラン提案(着)', '見積提出(着)', '設計契約(着)', '実施設計(着)', '確認申請(着)', '契約前打合', '請負契約', '契約後打合せ', '地盤調査', '地鎮祭・配置'],
  },
  {
    name: '着工・基礎',
    stages: ['基礎着工', '基礎配筋', '基礎コンクリート', '基礎完了'],
  },
  {
    name: '上棟・構造',
    stages: ['材料検査', '建て方', '上棟', '屋根・サッシ', '防水・電気', '断熱・ボード', '外壁下地', '外壁仕上'],
  },
  {
    name: '仕上・完成',
    stages: ['木完', '内部仕上', 'クリーニング', '完成検査', '是正工事', '施主検査', '是正工事', '引き渡し'],
  },
  {
    name: '仕様確定',
    stages: ['1st仕様', '2nd仕様', '3rd仕様'],
  },
];