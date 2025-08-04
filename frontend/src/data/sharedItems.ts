// 共有事項の型定義
export type ItemType = 'text' | 'select' | 'date' | 'number' | 'boolean';

export interface SharedItemDefinition {
  id: string;
  name: string;
  category: string;
  type: ItemType;
  required: boolean;
  options?: string[]; // selectタイプの場合の選択肢
  unit?: string; // 数値の単位
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface SharedItemValue {
  itemId: string;
  value: string | number | boolean | null;
  updatedAt: string;
  updatedBy: string;
}

export interface ProjectSharedItems {
  projectId: string;
  items: { [itemId: string]: SharedItemValue };
}

// 共有事項の定義（エクセルの1-26行目に基づく）
export const sharedItemDefinitions: SharedItemDefinition[] = [
  // 基本情報
  { id: '1', name: '邸名', category: '基本情報', type: 'text', required: true },
  { id: '2', name: 'フェーム', category: '基本情報', type: 'select', required: true, options: ['在来', 'SE', '2×4'] },
  { id: '3', name: '階数', category: '基本情報', type: 'select', required: true, options: ['平屋', '2階建て', '3階建て'] },
  { id: '4', name: '営業', category: '基本情報', type: 'text', required: true },
  { id: '5', name: '設計', category: '基本情報', type: 'text', required: true },
  { id: '6', name: 'IC', category: '基本情報', type: 'text', required: true },
  { id: '7', name: '工務', category: '基本情報', type: 'text', required: true },
  
  // 契約情報
  { id: '8', name: '仮案土地', category: '契約情報', type: 'boolean', required: false },
  { id: '9', name: '土地状況', category: '契約情報', type: 'select', required: true, options: ['所有', '契約済', '検討中', '未定'] },
  { id: '10', name: 'ローン状況', category: '契約情報', type: 'select', required: true, options: ['承認済', '審査中', '申請前', '不要'] },
  { id: '11', name: '引込状況', category: '契約情報', type: 'select', required: false, options: ['完了', '申請中', '未着手'] },
  { id: '12', name: '申火種', category: '契約情報', type: 'text', required: false },
  { id: '13', name: '設計', category: '契約情報', type: 'text', required: false },
  
  // 工事関連
  { id: '14', name: 'プレカット依頼', category: '工事関連', type: 'boolean', required: false },
  { id: '15', name: '引渡希望月', category: '工事関連', type: 'date', required: false },
  { id: '16', name: '地盤保証', category: '工事関連', type: 'boolean', required: false },
  { id: '17', name: '見学会', category: '工事関連', type: 'boolean', required: false },
  { id: '18', name: '農地転用確認書', category: '工事関連', type: 'boolean', required: false },
  
  // 確認事項
  { id: '19', name: '許容応力度計算', category: '確認事項', type: 'boolean', required: false },
  { id: '20', name: '防火', category: '確認事項', type: 'select', required: false, options: ['防火', '準防火', 'なし'] },
  { id: '21', name: '省エネ', category: '確認事項', type: 'select', required: false, options: ['ZEH', '認定低炭素', '一般'] },
  { id: '22', name: '大垣モ', category: '確認事項', type: 'boolean', required: false },
  
  // その他
  { id: '23', name: 'メモ', category: 'その他', type: 'text', required: false },
];

// カテゴリごとにグループ化する関数
export function groupItemsByCategory(items: SharedItemDefinition[]): { [category: string]: SharedItemDefinition[] } {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [category: string]: SharedItemDefinition[] });
}

// サンプルデータ
export const sampleSharedItems: ProjectSharedItems = {
  projectId: '1',
  items: {
    '1': { itemId: '1', value: '田中邸', updatedAt: '2024-03-15', updatedBy: '山田' },
    '2': { itemId: '2', value: '在来', updatedAt: '2024-03-15', updatedBy: '山田' },
    '3': { itemId: '3', value: '2階建て', updatedAt: '2024-03-15', updatedBy: '山田' },
    '4': { itemId: '4', value: '山田', updatedAt: '2024-03-15', updatedBy: '山田' },
    '5': { itemId: '5', value: '佐藤', updatedAt: '2024-03-15', updatedBy: '山田' },
    '6': { itemId: '6', value: '鈴木', updatedAt: '2024-03-15', updatedBy: '山田' },
    '7': { itemId: '7', value: '高橋', updatedAt: '2024-03-15', updatedBy: '山田' },
    '8': { itemId: '8', value: false, updatedAt: '2024-03-15', updatedBy: '山田' },
    '9': { itemId: '9', value: '契約済', updatedAt: '2024-03-16', updatedBy: '佐藤' },
    '10': { itemId: '10', value: '審査中', updatedAt: '2024-03-20', updatedBy: '山田' },
    '11': { itemId: '11', value: '完了', updatedAt: '2024-03-16', updatedBy: '佐藤' },
    '15': { itemId: '15', value: '2024-08-30', updatedAt: '2024-03-20', updatedBy: '鈴木' },
    '16': { itemId: '16', value: true, updatedAt: '2024-03-18', updatedBy: '高橋' },
    '17': { itemId: '17', value: false, updatedAt: '2024-03-18', updatedBy: '山田' },
    '20': { itemId: '20', value: '準防火', updatedAt: '2024-03-19', updatedBy: '佐藤' },
    '21': { itemId: '21', value: 'ZEH', updatedAt: '2024-03-19', updatedBy: '佐藤' },
  },
};