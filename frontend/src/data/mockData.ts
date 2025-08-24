import { convertToNewStages } from './stageMapping';

// 基本的な工程一覧（allStagesと同じ）
const baseStages = [
  '設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', '設計契約', '実施設計', '確認申請',
  '契約前打合せ', '請負契約', '建築請負契約', 
  '1st仕様打合せ', '2nd仕様打合せ', '3rd仕様打合せ', '4th仕様打合せ', '5th仕様打合せ', '仕様決定', '図面承認', '建築確認申請', '着工前準備', '地鎮祭準備', '地鎮祭',
  '地盤改良', '基礎着工', '基礎配筋検査', '基礎完了', '土台敷き', '上棟', '上棟式', '屋根工事', '外装工事', '内装下地', '内装仕上げ', '設備工事', '外構工事', '美装工事', '社内検査', '是正工事', '竣工検査', '完了検査',
  '取扱説明', '引き渡し準備', '引き渡し', 'アフター点検'
];

// プロジェクトごとにactualDatesとpredictedDatesを生成するヘルパー
const generateProjectDates = (projectId: string, progress: number) => {
  const actualDates: { [key: string]: string | null } = {};
  const predictedDates: { [key: string]: string | null } = {};
  
  // 進捗に応じて実績日程を設定
  const completedStages = Math.floor(baseStages.length * (progress / 100));
  
  baseStages.forEach((stage, index) => {
    if (index < completedStages) {
      // 実績日程：プロジェクト開始から順次設定
      const dateOffset = index * 7; // 1週間間隔
      const baseDate = new Date('2024-01-15');
      baseDate.setDate(baseDate.getDate() + dateOffset);
      actualDates[stage] = baseDate.toISOString().split('T')[0];
    } else {
      // 予測日程：現在から将来へ
      const dateOffset = (index - completedStages) * 7; // 1週間間隔
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dateOffset + 7);
      predictedDates[stage] = baseDate.toISOString().split('T')[0];
    }
  });
  
  return { actualDates, predictedDates };
};

// モックデータ定義
export interface ProjectData {
  id: string;
  name: string;
  customer: string;
  phase: string;
  grade: string;
  rank: string; // A, B, Cランク
  sales: string;
  design: string;
  ic: string;
  construction: string;
  foundation: string;
  roofing: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  startDate: string;
  completionDate: string;
  budget: number;
  stages: { [key: string]: string | null };
  actualDates: { [key: string]: string | null }; // 実績日程
  predictedDates: { [key: string]: string | null }; // 予測日程
  delayRisk: 'low' | 'medium' | 'high';
  notes: string;
}

// 元のプロジェクトデータ（旧ステージ構成）
const originalProjects: ProjectData[] = [
  {
    id: '1',
    name: '田中邸',
    customer: '田中太郎',
    phase: '施工',
    grade: 'A',
    rank: 'A',
    sales: '山田',
    design: '佐藤',
    ic: '鈴木',
    construction: '高橋',
    foundation: '03/15',
    roofing: '04/20',
    status: 'IN_PROGRESS',
    progress: 65,
    startDate: '2024/01/15',
    completionDate: '2024/08/30',
    budget: 35000000,
    delayRisk: 'low',
    notes: '順調に進行中。天候にも恵まれている。',
    actualDates: {
      '設計申込': '2024-01-15',
      'プランヒアリング': '2024-01-20',
      '敷地調査': '2024-01-22',
      'プラン提案': '2024-01-25',
      '見積提出': '2024-01-28',
      '設計契約': '2024-02-01',
      '実施設計': '2024-02-05',
      '確認申請': '2024-02-10',
      '契約前打合せ': '2024-02-20',
      '請負契約': '2024-02-25',
      '建築請負契約': '2024-03-01',
      '1st仕様打合せ': '2024-03-05',
      '2nd仕様打合せ': '2024-03-10',
      '3rd仕様打合せ': null,
      '地鎮祭準備': '2024-03-10',
      '地鎮祭': '2024-03-12',
      '地盤改良': null,
      '基礎着工': '2024-03-15',
      '基礎配筋検査': '2024-03-20',
      '基礎完了': '2024-03-25',
      '土台敷き': '2024-04-10',
      '上棟': '2024-04-20',
      '屋根工事': null,
      '外装工事': null,
      '内装下地': null,
      '内装仕上げ': null,
      '設備工事': null,
      '外構工事': null,
      '美装工事': null,
      '社内検査': null,
      '是正工事': null,
      '竣工検査': null,
      '完了検査': null,
      '取扱説明': null,
      '引き渡し準備': null,
      '引き渡し': null,
      'アフター点検': null
    },
    predictedDates: {
      '3rd仕様打合せ': '2024-03-15',
      '屋根工事': '2024-04-25',
      '外装工事': '2024-05-10',
      '内装下地': '2024-05-20',
      '内装仕上げ': '2024-06-05',
      '設備工事': '2024-06-15',
      '外構工事': '2024-06-25',
      '美装工事': '2024-07-05',
      '社内検査': '2024-07-10',
      '是正工事': '2024-07-15',
      '竣工検査': '2024-07-20',
      '完了検査': '2024-07-25',
      '取扱説明': '2024-07-30',
      '引き渡し準備': '2024-08-05',
      '引き渡し': '2024-08-10',
      'アフター点検': '2024-08-30'
    },
    stages: {
      '設計申込': '01/15',
      'プランヒアリング': '01/20',
      '1stプラン': '01/25',
      '2ndプラン': '02/01',
      '3rdプラン': '02/08',
      'EXプラン': '02/15',
      '契約前打合せ': '02/20',
      '請負契約': '02/25',
      '建築請負契約': '03/01',
      '1st仕様': '03/05',
      '2nd仕様': '03/10',
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': '03/10',
      '地鎮祭': '03/12',
      '地盤改良': null,
      '基礎着工': '03/15',
      '配筋検査': '03/20',
      'アンカー': '03/25',
      '土台伏せ': '04/10',
      '上棟': '04/20',
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '2',
    name: '佐藤邸',
    customer: '佐藤花子',
    phase: '契約',
    grade: 'B',
    rank: 'B',
    sales: '田中',
    design: '山田',
    ic: '高橋',
    construction: '鈴木',
    foundation: '04/10',
    roofing: '05/15',
    status: 'IN_PROGRESS',
    progress: 25,
    startDate: '2024/02/01',
    completionDate: '2024/09/15',
    budget: 28000000,
    delayRisk: 'medium',
    notes: 'プラン変更により若干の遅延。顧客と調整中。',
    actualDates: {},
    predictedDates: {},
    stages: {
      '設計申込': '02/01',
      'プランヒアリング': '02/05',
      '1stプラン': '02/10',
      '2ndプラン': '02/15',
      '3rdプラン': '02/20',
      'EXプラン': null,
      '契約前打合せ': '02/25',
      '請負契約': null,
      '建築請負契約': null,
      '1st仕様': null,
      '2nd仕様': null,
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '3',
    name: '鈴木邸',
    customer: '鈴木一郎',
    phase: '竣工',
    grade: 'S',
    rank: 'S',
    sales: '高橋',
    design: '田中',
    ic: '山田',
    construction: '佐藤',
    foundation: '01/20',
    roofing: '02/25',
    status: 'IN_PROGRESS',
    progress: 95,
    startDate: '2023/11/01',
    completionDate: '2024/04/30',
    budget: 45000000,
    delayRisk: 'low',
    actualDates: {},
    predictedDates: {},
    notes: '高級仕様。竣工間近。',
    stages: {
      '設計申込': '11/01',
      'プランヒアリング': '11/05',
      '1stプラン': '11/10',
      '2ndプラン': '11/15',
      '3rdプラン': '11/20',
      'EXプラン': '11/25',
      '契約前打合せ': '11/28',
      '請負契約': '12/01',
      '建築請負契約': '12/05',
      '1st仕様': '12/08',
      '2nd仕様': '12/12',
      '3rd仕様': '12/15',
      '4th仕様': '12/18',
      '5th仕様': '12/22',
      'EX仕様': '12/25',
      'FB': '12/28',
      '三者会議': '01/05',
      'プレカット': '01/10',
      '着工前確認': '01/15',
      '地鎮祭準備': '01/18',
      '地鎮祭': '01/19',
      '地盤改良': null,
      '基礎着工': '01/20',
      '配筋検査': '01/25',
      'アンカー': '01/30',
      '土台伏せ': '02/20',
      '上棟': '02/25',
      'ルーフィング': '02/28',
      '金物検査': '03/05',
      '透湿防水': '03/10',
      '断熱検査': '03/15',
      '外壁確認': '03/20',
      '木完': '03/25',
      '追加変更': '04/01',
      '保証書': '04/10',
      '社内完了': '04/15',
      '見学会': '04/20',
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '4',
    name: '山田邸',
    customer: '山田次郎',
    phase: '打ち合わせ',
    grade: 'A',
    rank: 'A',
    sales: '佐藤',
    design: '鈴木',
    ic: '田中',
    construction: '山田',
    foundation: '05/01',
    roofing: '06/05',
    status: 'IN_PROGRESS',
    progress: 40,
    startDate: '2024/02/15',
    completionDate: '2024/10/15',
    budget: 32000000,
    delayRisk: 'low',
    actualDates: {},
    predictedDates: {},
    notes: '仕様打ち合わせ中。順調。',
    stages: {
      '設計申込': '02/15',
      'プランヒアリング': '02/20',
      '1stプラン': '02/25',
      '2ndプラン': '03/01',
      '3rdプラン': '03/05',
      'EXプラン': '03/10',
      '契約前打合せ': '03/12',
      '請負契約': '03/15',
      '建築請負契約': '03/18',
      '1st仕様': '03/20',
      '2nd仕様': '03/25',
      '3rd仕様': '03/28',
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '5',
    name: '高橋邸',
    customer: '高橋健一',
    phase: '追客・設計',
    grade: 'B',
    rank: 'B',
    sales: '山田',
    design: '高橋',
    ic: '佐藤',
    construction: '田中',
    foundation: '06/15',
    roofing: '07/20',
    status: 'PLANNING',
    progress: 15,
    startDate: '2024/03/01',
    completionDate: '2024/11/30',
    budget: 30000000,
    delayRisk: 'medium',
    actualDates: {},
    predictedDates: {},
    notes: 'プラン検討中。予算調整あり。',
    stages: {
      '設計申込': '03/01',
      'プランヒアリング': '03/05',
      '1stプラン': '03/10',
      '2ndプラン': null,
      '3rdプラン': null,
      'EXプラン': null,
      '契約前打合せ': null,
      '請負契約': null,
      '建築請負契約': null,
      '1st仕様': null,
      '2nd仕様': null,
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '6',
    name: '伊藤邸',
    customer: '伊藤美咲',
    phase: '施工',
    grade: 'A',
    rank: 'A',
    sales: '鈴木',
    design: '山田',
    ic: '高橋',
    construction: '佐藤',
    foundation: '02/10',
    roofing: '03/15',
    status: 'IN_PROGRESS',
    progress: 75,
    startDate: '2023/12/01',
    completionDate: '2024/06/30',
    budget: 38000000,
    delayRisk: 'low',
    actualDates: {},
    predictedDates: {},
    notes: '内装工事中。',
    stages: {
      '設計申込': '12/01',
      'プランヒアリング': '12/05',
      '1stプラン': '12/10',
      '2ndプラン': '12/15',
      '3rdプラン': '12/20',
      'EXプラン': '12/22',
      '契約前打合せ': '12/25',
      '請負契約': '12/28',
      '建築請負契約': '01/05',
      '1st仕様': '01/08',
      '2nd仕様': '01/12',
      '3rd仕様': '01/15',
      '4th仕様': '01/18',
      '5th仕様': '01/22',
      'EX仕様': '01/25',
      'FB': '01/28',
      '三者会議': '02/01',
      'プレカット': '02/05',
      '着工前確認': '02/08',
      '地鎮祭準備': '02/09',
      '地鎮祭': '02/10',
      '地盤改良': null,
      '基礎着工': '02/10',
      '配筋検査': '02/15',
      'アンカー': '02/20',
      '土台伏せ': '03/10',
      '上棟': '03/15',
      'ルーフィング': '03/18',
      '金物検査': '03/22',
      '透湿防水': '03/25',
      '断熱検査': '03/28',
      '外壁確認': '04/01',
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '7',
    name: '渡辺邸',
    customer: '渡辺浩二',
    phase: '契約',
    grade: 'S',
    rank: 'S',
    sales: '高橋',
    design: '田中',
    ic: '鈴木',
    construction: '山田',
    foundation: '05/20',
    roofing: '06/25',
    status: 'IN_PROGRESS',
    progress: 30,
    startDate: '2024/02/20',
    completionDate: '2024/10/30',
    budget: 50000000,
    delayRisk: 'high',
    actualDates: {},
    predictedDates: {},
    notes: '高級仕様。仕様決定に時間がかかっている。',
    stages: {
      '設計申込': '02/20',
      'プランヒアリング': '02/25',
      '1stプラン': '03/01',
      '2ndプラン': '03/05',
      '3rdプラン': '03/10',
      'EXプラン': '03/15',
      '契約前打合せ': '03/18',
      '請負契約': '03/22',
      '建築請負契約': null,
      '1st仕様': null,
      '2nd仕様': null,
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '8',
    name: '中村邸',
    customer: '中村裕子',
    phase: '竣工',
    grade: 'B',
    rank: 'B',
    sales: '田中',
    design: '佐藤',
    ic: '山田',
    construction: '鈴木',
    foundation: '12/15',
    roofing: '01/20',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2023/10/01',
    completionDate: '2024/03/30',
    budget: 29000000,
    delayRisk: 'low',
    actualDates: {},
    predictedDates: {},
    notes: '完成。引渡し済み。',
    stages: {
      '設計申込': '10/01',
      'プランヒアリング': '10/05',
      '1stプラン': '10/10',
      '2ndプラン': '10/15',
      '3rdプラン': '10/20',
      'EXプラン': '10/25',
      '契約前打合せ': '10/28',
      '請負契約': '11/01',
      '建築請負契約': '11/05',
      '1st仕様': '11/08',
      '2nd仕様': '11/12',
      '3rd仕様': '11/15',
      '4th仕様': '11/18',
      '5th仕様': '11/22',
      'EX仕様': '11/25',
      'FB': '11/28',
      '三者会議': '12/01',
      'プレカット': '12/05',
      '着工前確認': '12/10',
      '地鎮祭準備': '12/12',
      '地鎮祭': '12/13',
      '地盤改良': null,
      '基礎着工': '12/15',
      '配筋検査': '12/20',
      'アンカー': '12/25',
      '土台伏せ': '01/15',
      '上棟': '01/20',
      'ルーフィング': '01/23',
      '金物検査': '01/28',
      '透湿防水': '02/01',
      '断熱検査': '02/05',
      '外壁確認': '02/10',
      '木完': '02/15',
      '追加変更': '02/20',
      '保証書': '03/01',
      '社内完了': '03/10',
      '見学会': '03/15',
      '施主完了': '03/20',
      '完成検査': '03/25',
      '引渡式': '03/30'
    }
  },
  {
    id: '9',
    name: '小林邸',
    customer: '小林健太',
    phase: '打ち合わせ',
    grade: 'A',
    rank: 'A',
    sales: '佐藤',
    design: '高橋',
    ic: '田中',
    construction: '山田',
    foundation: '04/25',
    roofing: '05/30',
    status: 'ON_HOLD',
    progress: 35,
    startDate: '2024/01/20',
    completionDate: '2024/09/20',
    budget: 33000000,
    delayRisk: 'high',
    actualDates: {},
    predictedDates: {},
    notes: '予算調整のため一時停止中。',
    stages: {
      '設計申込': '01/20',
      'プランヒアリング': '01/25',
      '1stプラン': '01/30',
      '2ndプラン': '02/05',
      '3rdプラン': '02/10',
      'EXプラン': '02/15',
      '契約前打合せ': '02/18',
      '請負契約': '02/22',
      '建築請負契約': '02/25',
      '1st仕様': '02/28',
      '2nd仕様': '03/05',
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  },
  {
    id: '10',
    name: '加藤邸',
    customer: '加藤直樹',
    phase: '追客・設計',
    grade: 'C',
    rank: 'C',
    sales: '山田',
    design: '鈴木',
    ic: '佐藤',
    construction: '高橋',
    foundation: '07/01',
    roofing: '08/05',
    status: 'PLANNING',
    progress: 10,
    startDate: '2024/03/15',
    completionDate: '2024/12/20',
    budget: 25000000,
    delayRisk: 'low',
    actualDates: {},
    predictedDates: {},
    notes: 'コンパクト住宅。初回プラン提案済み。',
    stages: {
      '設計申込': '03/15',
      'プランヒアリング': '03/20',
      '1stプラン': null,
      '2ndプラン': null,
      '3rdプラン': null,
      'EXプラン': null,
      '契約前打合せ': null,
      '請負契約': null,
      '建築請負契約': null,
      '1st仕様': null,
      '2nd仕様': null,
      '3rd仕様': null,
      '4th仕様': null,
      '5th仕様': null,
      'EX仕様': null,
      'FB': null,
      '三者会議': null,
      'プレカット': null,
      '着工前確認': null,
      '地鎮祭準備': null,
      '地鎮祭': null,
      '地盤改良': null,
      '基礎着工': null,
      '配筋検査': null,
      'アンカー': null,
      '土台伏せ': null,
      '上棟': null,
      'ルーフィング': null,
      '金物検査': null,
      '透湿防水': null,
      '断熱検査': null,
      '外壁確認': null,
      '木完': null,
      '追加変更': null,
      '保証書': null,
      '社内完了': null,
      '見学会': null,
      '施主完了': null,
      '完成検査': null,
      '引渡式': null
    }
  }
];

// 新しいステージ構成に変換し、実績・予測日程を追加したプロジェクトデータ
export const mockProjects: ProjectData[] = originalProjects.map(project => {
  const { actualDates, predictedDates } = generateProjectDates(project.id, project.progress);
  
  return {
    ...project,
    // Always use generated data for consistent prediction calculation
    actualDates: actualDates,
    predictedDates: predictedDates,
    stages: convertToNewStages(project.stages)
  };
});;

// フェーズとステージの定義
export const phases = [
  { id: '1', name: '追客・設計', color: '#3b82f6', stages: 8 },
  { id: '2', name: '契約', color: '#10b981', stages: 3 },
  { id: '3', name: '打ち合わせ', color: '#f59e0b', stages: 11 },
  { id: '4', name: '施工', color: '#ef4444', stages: 18 },
  { id: '5', name: '竣工', color: '#8b5cf6', stages: 4 },
];

export const allStages = [
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
];;

// タスクの所要時間設定（営業日数）
const taskDurations: { [key: string]: number } = {
  '設計申込': 1,
  'プランヒアリング': 3,
  '敷地調査': 2,
  'プラン提案': 5,
  '見積提出': 3,
  '設計契約': 2,
  '実施設計': 14,
  '確認申請': 21,
  '契約前打合せ': 2,
  '請負契約': 3,
  '建築請負契約': 1,
  '1st仕様打合せ': 3,
  '2nd仕様打合せ': 3,
  '3rd仕様打合せ': 3,
  '4th仕様打合せ': 3,
  '5th仕様打合せ': 3,
  '仕様決定': 2,
  '図面承認': 3,
  '建築確認申請': 7,
  '着工前準備': 3,
  '地鎮祭準備': 1,
  '地鎮祭': 1,
  '地盤改良': 5,
  '基礎着工': 1,
  '基礎配筋検査': 2,
  '基礎完了': 3,
  '土台敷き': 2,
  '上棟': 1,
  '上棟式': 1,
  '屋根工事': 7,
  '外装工事': 10,
  '内装下地': 7,
  '内装仕上げ': 14,
  '設備工事': 7,
  '外構工事': 7,
  '美装工事': 2,
  '社内検査': 1,
  '是正工事': 3,
  '竣工検査': 1,
  '完了検査': 1,
  '取扱説明': 1,
  '引き渡し準備': 2,
  '引き渡し': 1,
  'アフター点検': 1,
};;

// 営業日を計算するヘルパー関数
const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let daysAdded = 0;
  
  while (daysAdded < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日以外
      daysAdded++;
    }
  }
  
  return result;
};

// プロジェクト詳細用のタスクデータ
export interface TaskDetail {
  id: string;
  stageId: string;
  stageName: string;
  description: string;
  assignee: string;
  dueDate: string | null;
  completedDate: string | null;
  predictedDate: string | null; // 予測日程を追加
  duration: number; // 所要日数を追加
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

// プロジェクト詳細のモックデータ生成関数
export function getProjectDetails(projectId: string): TaskDetail[] {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) return [];

  const actualDates = project.actualDates || {};
  const predictedDates = project.predictedDates || {};

  return allStages.map((stageName, index) => {
    const completedDate = actualDates[stageName];
    const predictedDate = predictedDates[stageName];
    const status = completedDate ? 'completed' : 
                  index < project.progress / 100 * allStages.length ? 'in_progress' : 'pending';
    
    return {
      id: `task-${projectId}-${index}`,
      stageId: `stage-${index}`,
      stageName,
      description: getStageDescription(stageName),
      assignee: getAssigneeByStage(stageName, project),
      dueDate: completedDate || predictedDate,
      completedDate,
      predictedDate,
      duration: taskDurations[stageName] || 3,
      status,
      priority: getStagePriority(stageName),
      checklist: generateChecklist(stageName),
      comments: generateComments(stageName, status),
      attachments: generateAttachments(stageName, status)
    };
  });
}

// 予測日程の再計算関数
export const recalculatePredictedDates = (projectId: string, startStage: string, startDate: string) => {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) return {};
  
  const predictedDates: { [key: string]: string } = {};
  const actualDates = project.actualDates || {};
  
  let currentDate = new Date(startDate);
  let startCalculating = false;
  
  for (const stage of allStages) {
    if (stage === startStage) {
      startCalculating = true;
    }
    
    if (startCalculating) {
      // 実績がある場合はそれを使用
      if (actualDates[stage]) {
        currentDate = new Date(actualDates[stage]);
        predictedDates[stage] = actualDates[stage];
      } else {
        // 予測日程を計算
        const duration = taskDurations[stage] || 3;
        currentDate = addBusinessDays(currentDate, duration);
        predictedDates[stage] = currentDate.toISOString().split('T')[0];
      }
    }
  }
  
  return predictedDates;
};

function getStageDescription(stageName: string): string {
  const descriptions: { [key: string]: string } = {
    '設計申込': 'お客様からの設計申込を受付、初回ヒアリングの日程調整',
    'プランヒアリング': 'お客様の要望、予算、土地条件などを詳細にヒアリング',
    '1stプラン': '初回プラン提案。基本的な間取りと外観イメージを提示',
    '基礎着工': '基礎工事開始。掘削から基礎コンクリート打設まで',
    '上棟': '建物の骨組みを組み上げる重要な工程',
    '引渡式': '建物完成後、お客様への正式な引き渡し'
  };
  return descriptions[stageName] || `${stageName}の実施`;
}

function getAssigneeByStage(stageName: string, project: ProjectData): string {
  if (stageName.includes('プラン') || stageName.includes('設計')) return project.design;
  if (stageName.includes('仕様') || stageName.includes('FB')) return project.ic;
  if (stageName.includes('契約')) return project.sales;
  return project.construction;
}

function calculateDueDate(startDate: string, stageIndex: number): string {
  const start = new Date(startDate);
  // 営業日ベースでの計算に変更
  let currentDate = new Date(start);
  for (let i = 0; i < stageIndex; i++) {
    const stageName = allStages[i];
    const duration = taskDurations[stageName] || 3;
    currentDate = addBusinessDays(currentDate, duration);
  }
  return currentDate.toISOString().split('T')[0];
}

function getStagePriority(stageName: string): 'low' | 'medium' | 'high' {
  if (stageName === '基礎着工' || stageName === '上棟') return 'high';
  if (stageName.includes('契約') || stageName.includes('検査')) return 'medium';
  return 'low';
}

function generateChecklist(stageName: string): ChecklistItem[] {
  const checklists: { [key: string]: string[] } = {
    '設計申込': [
      '申込書受領確認',
      '敷地資料確認',
      'ヒアリング日程調整',
      '担当者アサイン'
    ],
    'プランヒアリング': [
      '要望シート記入',
      '予算確認',
      '土地調査資料確認',
      'スケジュール説明'
    ],
    '基礎着工': [
      '近隣挨拶完了',
      '工事看板設置',
      '安全対策確認',
      '資材搬入確認'
    ],
    '上棟': [
      '天候確認',
      '職人手配完了',
      '資材確認',
      '安全対策実施',
      '上棟式準備'
    ]
  };
  
  const items = checklists[stageName] || ['準備確認', '実施確認', '完了報告'];
  return items.map((text, index) => ({
    id: `check-${index}`,
    text,
    completed: Math.random() > 0.5
  }));
}

function generateComments(stageName: string, status: string): Comment[] {
  if (status === 'pending') return [];
  
  const sampleComments = [
    { author: '山田', text: '予定通り進行中です。' },
    { author: '佐藤', text: '資料を確認しました。問題ありません。' },
    { author: '鈴木', text: 'お客様から追加要望がありました。調整します。' },
  ];
  
  return sampleComments.slice(0, Math.floor(Math.random() * 3) + 1).map((comment, index) => ({
    id: `comment-${index}`,
    ...comment,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
}

function generateAttachments(stageName: string, status: string): Attachment[] {
  if (status === 'pending') return [];
  
  const attachmentTypes: { [key: string]: { name: string; type: string }[] } = {
    '設計申込': [
      { name: '設計申込書.pdf', type: 'application/pdf' },
      { name: '敷地図.dwg', type: 'application/cad' }
    ],
    'プランヒアリング': [
      { name: 'ヒアリングシート.xlsx', type: 'application/excel' },
      { name: '参考写真.jpg', type: 'image/jpeg' }
    ],
    '1stプラン': [
      { name: '平面図_1st.pdf', type: 'application/pdf' },
      { name: '外観パース_1st.jpg', type: 'image/jpeg' }
    ],
    '基礎着工': [
      { name: '基礎施工図.pdf', type: 'application/pdf' },
      { name: '現場写真_基礎.jpg', type: 'image/jpeg' }
    ]
  };
  
  const files = attachmentTypes[stageName] || [
    { name: `${stageName}_資料.pdf`, type: 'application/pdf' }
  ];
  
  return files.map((file, index) => ({
    id: `file-${index}`,
    ...file,
    size: `${Math.floor(Math.random() * 5000 + 500)}KB`,
    uploadedBy: ['山田', '佐藤', '鈴木'][Math.floor(Math.random() * 3)],
    uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
}