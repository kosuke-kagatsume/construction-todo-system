// チェックシートの定義
export interface ChecksheetItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  category?: string;
}

export interface StageChecksheet {
  stageId: string;
  stageName: string;
  items: ChecksheetItem[];
  requireAllChecked: boolean; // 全項目チェック必須かどうか
}

// ステージごとのチェックシート定義
export const stageChecksheets: { [stageName: string]: ChecksheetItem[] } = {
  '敷地調査': [
    { id: 'site-1', label: '敷地境界の確認', required: true, category: '土地' },
    { id: 'site-2', label: '前面道路の幅員測定', required: true, category: '土地' },
    { id: 'site-3', label: '隣地との高低差確認', required: true, category: '土地' },
    { id: 'site-4', label: '既存建物の有無確認', required: true, category: '土地' },
    { id: 'site-5', label: '電気・ガス・水道の引込確認', required: true, category: 'インフラ' },
    { id: 'site-6', label: '下水道・浄化槽の確認', required: true, category: 'インフラ' },
    { id: 'site-7', label: '法規制の確認（用途地域等）', required: true, category: '法規' },
    { id: 'site-8', label: '日照・通風の確認', required: true, category: '環境' },
    { id: 'site-9', label: '騒音・振動の確認', required: true, category: '環境' },
    { id: 'site-10', label: '現況写真の撮影', required: true, category: '記録' },
  ],
  
  '地鎮祭準備': [
    { id: 'jichinsai-1', label: '神社への連絡・日程調整', required: true },
    { id: 'jichinsai-2', label: '施主への案内送付', required: true },
    { id: 'jichinsai-3', label: '祭壇の手配', required: true },
    { id: 'jichinsai-4', label: 'お供え物の準備', required: true },
    { id: 'jichinsai-5', label: '駐車場の確保', required: false },
  ],
  
  '基礎配筋検査': [
    { id: 'kiso-1', label: '鉄筋の種類・径の確認', required: true, category: '構造' },
    { id: 'kiso-2', label: 'かぶり厚さの確認', required: true, category: '構造' },
    { id: 'kiso-3', label: '鉄筋の間隔確認', required: true, category: '構造' },
    { id: 'kiso-4', label: '継手・定着長さの確認', required: true, category: '構造' },
    { id: 'kiso-5', label: 'スペーサーの設置確認', required: true, category: '構造' },
    { id: 'kiso-6', label: '型枠の垂直・水平確認', required: true, category: '施工' },
    { id: 'kiso-7', label: '開口部補強筋の確認', required: true, category: '構造' },
    { id: 'kiso-8', label: '検査写真の撮影', required: true, category: '記録' },
  ],
  
  '上棟': [
    { id: 'joto-1', label: '天候確認（雨天中止判断）', required: true, category: '安全' },
    { id: 'joto-2', label: '職人の人数確認', required: true, category: '手配' },
    { id: 'joto-3', label: '資材の数量確認', required: true, category: '資材' },
    { id: 'joto-4', label: 'クレーンの手配確認', required: true, category: '手配' },
    { id: 'joto-5', label: '安全対策の実施', required: true, category: '安全' },
    { id: 'joto-6', label: '近隣への事前連絡', required: true, category: '近隣' },
    { id: 'joto-7', label: '上棟式の準備', required: false, category: '式典' },
  ],
  
  '完了検査': [
    { id: 'complete-1', label: '建築基準法適合確認', required: true, category: '法規' },
    { id: 'complete-2', label: '仕上がり寸法の確認', required: true, category: '品質' },
    { id: 'complete-3', label: '建具の開閉確認', required: true, category: '品質' },
    { id: 'complete-4', label: '設備機器の動作確認', required: true, category: '設備' },
    { id: 'complete-5', label: '外構工事の完了確認', required: true, category: '外構' },
    { id: 'complete-6', label: '清掃状態の確認', required: true, category: '品質' },
    { id: 'complete-7', label: '鍵の確認', required: true, category: '引渡' },
    { id: 'complete-8', label: '取扱説明書の準備', required: true, category: '引渡' },
    { id: 'complete-9', label: '保証書の準備', required: true, category: '引渡' },
    { id: 'complete-10', label: '竣工写真の撮影', required: true, category: '記録' },
  ],
  
  '引き渡し': [
    { id: 'hikiwatashi-1', label: '鍵の引き渡し', required: true },
    { id: 'hikiwatashi-2', label: '設備の使用説明', required: true },
    { id: 'hikiwatashi-3', label: '保証内容の説明', required: true },
    { id: 'hikiwatashi-4', label: 'アフターサービスの説明', required: true },
    { id: 'hikiwatashi-5', label: '引渡書類一式の確認', required: true },
    { id: 'hikiwatashi-6', label: '記念撮影', required: false },
  ],
};

// チェック状態を管理するためのインターフェース
export interface ChecksheetProgress {
  projectId: string;
  stageName: string;
  checkedItems: string[]; // チェック済みアイテムのIDリスト
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

// ステージが完了可能かどうかを判定する関数
export function canCompleteStage(
  stageName: string,
  checkedItems: string[]
): { canComplete: boolean; missingItems: string[] } {
  const checksheet = stageChecksheets[stageName];
  
  if (!checksheet || checksheet.length === 0) {
    // チェックシートがない場合は完了可能
    return { canComplete: true, missingItems: [] };
  }
  
  // 必須項目のみチェック
  const requiredItems = checksheet.filter(item => item.required);
  const checkedSet = new Set(checkedItems);
  const missingItems = requiredItems
    .filter(item => !checkedSet.has(item.id))
    .map(item => item.label);
  
  return {
    canComplete: missingItems.length === 0,
    missingItems,
  };
}

// ステージにチェックシートがあるかどうかを判定
export function hasChecksheet(stageName: string): boolean {
  return stageName in stageChecksheets && stageChecksheets[stageName].length > 0;
}

// チェックシートの進捗率を計算
export function getChecksheetProgress(
  stageName: string,
  checkedItems: string[]
): { total: number; checked: number; required: number; requiredChecked: number; percentage: number } {
  const checksheet = stageChecksheets[stageName];
  
  if (!checksheet || checksheet.length === 0) {
    return { total: 0, checked: 0, required: 0, requiredChecked: 0, percentage: 100 };
  }
  
  const requiredItems = checksheet.filter(item => item.required);
  const checkedSet = new Set(checkedItems);
  const checkedCount = checksheet.filter(item => checkedSet.has(item.id)).length;
  const requiredCheckedCount = requiredItems.filter(item => checkedSet.has(item.id)).length;
  
  return {
    total: checksheet.length,
    checked: checkedCount,
    required: requiredItems.length,
    requiredChecked: requiredCheckedCount,
    percentage: Math.round((requiredCheckedCount / requiredItems.length) * 100),
  };
}