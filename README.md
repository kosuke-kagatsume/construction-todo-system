# Construction Todo & Forecast System

建築会社向けのTO DO管理・未来予測システム

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kosuke-kagatsume/construction-todo-system&root-directory=frontend)

## 🏗️ 概要

新築住宅建築プロセス（追客→契約→打ち合わせ→施工→竣工）を管理し、機械学習による遅延予測を提供するマルチテナント対応のWebシステムです。

エクセルベースの既存業務フローを完全にデジタル化し、リアルタイム更新・モバイル対応・予測分析機能を追加しました。

## 🎯 主な機能

### 1. 現場ボード（中央管理）
- 全プロジェクトの進捗を横断的に確認
- 44ステージ × プロジェクトのグリッド表示
- 実施済日程・予測日程の切り替え表示
- エクセルの「現場ボード」を完全再現

### 2. プロジェクト詳細（個別管理）
- 5フェーズ・44ステージの詳細タスク管理
- 4役職（営業・設計・IC・工務）の担当者割当
- チェックリスト機能
- エクセルの「原本」に相当

### 3. マイタスク
- 個人のTO DO管理
- 今日/今週のフィルタリング
- 優先度別表示
- プッシュ通知対応（予定）

### 4. 予測機能（開発予定）
- LightGBMによる完成日予測
- 遅延リスクアラート
- 月次での自動再学習

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (React)
- **UI**: Material-UI (MUI)
- **State**: Zustand + React Query
- **Language**: TypeScript

### バックエンド（開発中）
- **API**: FastAPI (Python)
- **DB**: PostgreSQL
- **Queue**: Celery + Redis
- **ML**: LightGBM

## 📊 ワークフロー構造

エクセル分析から抽出した44ステージ：

### Phase 1: 追客・設計（6ステージ）
- 設計申込
- プランヒアリング
- 1st〜3rdプラン提案
- EXプラン提案

### Phase 2: 契約（3ステージ）
- 契約前打合せ
- 請負契約
- 建築請負契約

### Phase 3: 打ち合わせ（10ステージ）
- 1st〜5th仕様打合せ
- EX仕様打合せ
- FBヒアリング
- 三者会議
- プレカット会議
- 着工前仕様確認

### Phase 4: 施工（17ステージ）
- 地鎮祭準備・実施
- 基礎着工 ⭐️（重要マイルストーン）
- 各種検査
- 上棟 ⭐️（重要マイルストーン）
- 完了検査

### Phase 5: 竣工（4ステージ）
- 見学会
- 施主完了検査
- 完成検査
- 引渡式

## 🚀 デモ

Vercelでホスティングされたデモサイトで実際の動作を確認できます。

## 💻 ローカル開発

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 でアクセス

### バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
docker-compose up -d
uvicorn app.main:app --reload
```

http://localhost:8000/docs でAPI仕様確認

## 📱 スクリーンショット

（デプロイ後に追加予定）

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を説明してください。

## 📄 ライセンス

[MIT](LICENSE)