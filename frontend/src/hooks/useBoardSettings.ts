import { useState, useEffect } from 'react';

export interface BoardDisplaySettings {
  // 担当者列の表示設定
  roles: {
    sales: boolean;
    design: boolean;
    ic: boolean;
    construction: boolean;
  };
  
  // 共有事項の表示設定（項目IDベース）
  visibleSharedItems: string[];
  
  // ステージの表示設定（ステージ名ベース）
  visibleStages: string[];
  
  // 表示モード
  displayMode: {
    compactMode: boolean;
    showProgress: boolean;
    showDelay: boolean;
    showAlert: boolean;
    colorCoding: boolean;
  };
}

const defaultSettings: BoardDisplaySettings = {
  roles: {
    sales: true,
    design: true,
    ic: true,
    construction: true,
  },
  visibleSharedItems: [
    '1',  // 邸名
    '2',  // フレーム
    '3',  // 階数
    '8',  // 仮案土地
    '9',  // 土地状況
    '10', // ローン状況
    '11', // 引込状況
    '14', // プレカット依頼
    '15', // 引渡希望月
    '16', // 地盤保証
    '17', // 見学会
    '18', // 農地転用確認書
    '19', // 許容応力度計算
    '20', // 防火
    '21', // 省エネ
    '22', // 大垣モ
  ],
  visibleStages: [
    // 追客・設計
    '設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', 
    '設計契約', '実施設計', '確認申請',
    // 契約
    '契約前打合せ', '請負契約', '建築請負契約',
    // 打ち合わせ
    '1st仕様打合せ', '2nd仕様打合せ', '3rd仕様打合せ', '仕様決定', 
    '図面承認', '地鎮祭準備', '地鎮祭',
    // 施工
    '地盤改良', '基礎着工', '基礎配筋検査', '基礎完了', '土台敷き', 
    '上棟', '上棟式', '屋根工事', '外装工事', '内装下地', '内装仕上げ', 
    '設備工事', '外構工事', '美装工事', '社内検査', '竣工検査',
    // 竣工
    '引き渡し準備', '引き渡し', 'アフター点検'
  ],
  displayMode: {
    compactMode: false,
    showProgress: true,
    showDelay: true,
    showAlert: true,
    colorCoding: true,
  },
};

export const useBoardSettings = () => {
  const [settings, setSettings] = useState<BoardDisplaySettings>(defaultSettings);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('boardDisplaySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse board settings:', error);
      }
    }
  }, []);

  // 設定を保存
  const saveSettings = (newSettings: BoardDisplaySettings) => {
    setSettings(newSettings);
    localStorage.setItem('boardDisplaySettings', JSON.stringify(newSettings));
  };

  // 設定をリセット
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('boardDisplaySettings');
  };

  return {
    settings,
    saveSettings,
    resetSettings,
  };
};