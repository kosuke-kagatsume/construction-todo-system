# Construction Todo & Forecast System

建築会社向けのTO DO管理・未来予測システム

## 概要

新築住宅建築プロセス（追客→契約→打ち合わせ→施工→竣工）を管理し、機械学習による遅延予測を提供するマルチテナント対応のWebシステムです。

## 主な機能

- **進捗ボード**: タスク×プロジェクトのグリッド表示
- **マイTO DO**: 担当者別のタスクリスト（今日/今週）
- **予測機能**: LightGBMによる完成日予測と遅延リスク分析
- **アラート**: 遅延・超過の自動通知
- **カレンダー連携**: Googleカレンダーへの一方向同期

## 技術スタック

- **バックエンド**: FastAPI, PostgreSQL, Celery, Redis
- **フロントエンド**: React, Next.js, Material-UI
- **モバイル**: React Native (Expo)
- **機械学習**: LightGBM, scikit-learn

## セットアップ

### バックエンド

```bash
cd backend
cp .env.example .env
# .envファイルを編集
docker-compose up -d
alembic upgrade head
```

### フロントエンド

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## 開発フェーズ

- [x] Phase 0: 開発環境セットアップ
- [ ] Phase 1: Core CRUD & Board MVP (6週間)
- [ ] Phase 2: 予測機能 v1 + アラート (4週間)
- [ ] Phase 3: ネイティブアプリ β版 (6週間)
- [ ] Phase 4: 管理画面カスタマイズ (3週間)
- [ ] Phase 5: DW API + 工数分析拡張 (6週間)

## ドキュメント

- [API仕様](http://localhost:8000/docs)
- [アーキテクチャ設計](docs/architecture.md)
- [デプロイメントガイド](docs/deployment.md)