# Construction Todo System - Frontend

建築会社向けTO DO管理システムのフロントエンド

## 🚀 デモサイト

Vercelにデプロイされたデモサイトで実際の動作を確認できます。

## 📱 主な機能

### 1. 現場ボード
- 全プロジェクトの進捗を横断的に確認
- 44ステージ × プロジェクトのグリッド表示
- 実施済/予測日程の切り替え表示

### 2. プロジェクト詳細
- 個別プロジェクトの詳細管理
- 5フェーズ（追客・設計、契約、打ち合わせ、施工、竣工）
- 4役職（営業、設計、IC、工務）の担当者管理

### 3. マイタスク
- 個人のタスク管理
- 今日/今週のフィルタリング
- 優先度別表示

## 🛠 技術スタック

- **Framework**: Next.js 14
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand + React Query
- **Date Handling**: date-fns
- **Language**: TypeScript

## 📦 ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プロダクションサーバーの起動
npm start
```

## 🎨 カスタマイズ

エクセル分析に基づいた44ステージは、実際の運用に合わせてカスタマイズ可能です。
各建築会社のワークフローに合わせて調整してください。