// 旧ステージ名から新ステージ名へのマッピング
export const stageMapping: { [key: string]: string } = {
  // 追客・設計
  '設計申込': '設計申込',
  'プランヒアリング': 'プランヒアリング',
  '1stプラン': 'プラン提案',
  '2ndプラン': 'プラン提案',
  '3rdプラン': 'プラン提案',
  'EXプラン': 'プラン提案',
  
  // 契約
  '契約前打合せ': '契約前打合せ',
  '請負契約': '請負契約',
  '建築請負契約': '建築請負契約',
  
  // 打ち合わせ
  '1st仕様': '1st仕様打合せ',
  '2nd仕様': '2nd仕様打合せ',
  '3rd仕様': '3rd仕様打合せ',
  '4th仕様': '4th仕様打合せ',
  '5th仕様': '5th仕様打合せ',
  'EX仕様': '仕様決定',
  'FB': '図面承認',
  '三者会議': '建築確認申請',
  'プレカット': '着工前準備',
  '着工前確認': '着工前準備',
  '地鎮祭準備': '地鎮祭準備',
  '地鎮祭': '地鎮祭',
  
  // 施工
  '地盤改良': '地盤改良',
  '基礎着工': '基礎着工',
  '配筋検査': '基礎配筋検査',
  'アンカー': '基礎完了',
  '土台伏せ': '土台敷き',
  '上棟': '上棟',
  'ルーフィング': '屋根工事',
  '金物検査': '外装工事',
  '透湿防水': '外装工事',
  '断熱検査': '内装下地',
  '外壁確認': '内装仕上げ',
  '木完': '設備工事',
  '追加変更': '外構工事',
  '保証書': '美装工事',
  '社内完了': '社内検査',
  
  // 竣工
  '見学会': '竣工検査',
  '施主完了': '完了検査',
  '完成検査': '取扱説明',
  '引渡式': '引き渡し'
};

// 新しいステージ順序
export const newStageOrder = [
  // 追客・設計（8ステージ）
  '設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', '設計契約', '実施設計', '確認申請',
  // 契約（3ステージ）
  '契約前打合せ', '請負契約', '建築請負契約',
  // 打ち合わせ（11ステージ）
  '1st仕様打合せ', '2nd仕様打合せ', '3rd仕様打合せ', '4th仕様打合せ', '5th仕様打合せ', '仕様決定', '図面承認', '建築確認申請', '着工前準備', '地鎮祭準備', '地鎮祭',
  // 施工（18ステージ）
  '地盤改良', '基礎着工', '基礎配筋検査', '基礎完了', '土台敷き', '上棟', '上棟式', '屋根工事', '外装工事', '内装下地', '内装仕上げ', '設備工事', '外構工事', '美装工事', '社内検査', '是正工事', '竣工検査', '完了検査',
  // 竣工（4ステージ）
  '取扱説明', '引き渡し準備', '引き渡し', 'アフター点検'
];

// 日付フォーマットを変換する関数
function convertDateFormat(date: string | null): string | null {
  if (!date || date === 'null') return null;
  
  // MM/DD形式をyyyy-MM-dd形式に変換
  if (date.match(/^\d{2}\/\d{2}$/)) {
    const [month, day] = date.split('/');
    const year = new Date().getFullYear();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // yyyy/MM/dd形式をyyyy-MM-dd形式に変換
  if (date.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
    return date.replace(/\//g, '-');
  }
  
  return date;
}

// 既存のデータを新しいステージ構成に変換する関数
export function convertToNewStages(oldStages: { [key: string]: string | null }): { [key: string]: string | null } {
  const newStages: { [key: string]: string | null } = {};
  
  // 全ての新ステージを初期化
  newStageOrder.forEach(stage => {
    newStages[stage] = null;
  });
  
  // 旧ステージデータをマッピング
  Object.entries(oldStages).forEach(([oldStage, date]) => {
    if (date && date !== 'null') {
      const convertedDate = convertDateFormat(date);
      const newStage = stageMapping[oldStage];
      if (newStage && !newStages[newStage] && convertedDate) {
        // 同じ新ステージにマッピングされる場合は最初の日付を使用
        newStages[newStage] = convertedDate;
      }
    }
  });
  
  // 特殊な処理：プランステージの統合
  const planDates = ['1stプラン', '2ndプラン', '3rdプラン', 'EXプラン']
    .map(stage => oldStages[stage])
    .filter(date => date && date !== 'null')
    .map(date => convertDateFormat(date!));
  if (planDates.length > 0) {
    const lastPlanDate = planDates[planDates.length - 1];
    if (lastPlanDate) {
      newStages['プラン提案'] = lastPlanDate;
    }
  }
  
  return newStages;
}