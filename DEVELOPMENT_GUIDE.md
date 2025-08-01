# 建築TODO管理システム - 開発ガイド

## 🚀 クイックスタート

### 前提条件
- Node.js 18+ および npm
- Python 3.11+
- PostgreSQL 15+
- Redis

### フロントエンド起動手順

```bash
# 1. フロントエンドディレクトリへ移動
cd construction-todo-system/frontend

# 2. 環境変数設定
cp .env.example .env.local

# 3. 依存関係インストール
npm install

# 4. 開発サーバー起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

### バックエンド起動手順

```bash
# 1. バックエンドディレクトリへ移動  
cd construction-todo-system/backend

# 2. Python仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 依存関係インストール
pip install -r requirements.txt

# 4. 環境変数設定
cp .env.example .env

# 5. Docker起動（DB & Redis）
docker-compose up -d postgres redis

# 6. データベースマイグレーション
alembic upgrade head

# 7. 開発サーバー起動
uvicorn app.main:app --reload
```

バックエンドは http://localhost:8000 で起動します。
API仕様書: http://localhost:8000/docs

## 📱 画面構成

### 1. 現場ボード（メインダッシュボード）
- **URL**: `/`
- **機能**: 全プロジェクトの進捗を横断的に確認
- **タブ**: 
  - 実施済日程ボード
  - 予測日程ボード
  - 実施・予測日程ボード
  - 一覧確認

### 2. プロジェクト詳細
- **URL**: `/projects/[id]`
- **機能**: 個別プロジェクトの詳細管理
- **表示内容**:
  - プロジェクト情報
  - 担当者一覧
  - 進捗状況
  - フェーズ別タスクリスト

### 3. マイタスク
- **URL**: `/my-tasks`
- **機能**: ログインユーザーのタスク管理
- **フィルター**: 今日/今週/すべて

## 🔧 開発のポイント

### データフロー
```
エクセル分析結果
    ↓
5フェーズ × 44ステージ
    ↓
プロジェクト別タスク生成
    ↓
役割別（営業/設計/IC/工務）割当
    ↓
進捗トラッキング
```

### 主要コンポーネント
- `ConstructionBoard`: Data Gridによる進捗ボード
- `ProjectDetail`: プロジェクト詳細表示
- `MainLayout`: 共通レイアウト

### カスタマイズポイント
- フェーズ/ステージはDBで管理（テナント別カスタマイズ可能）
- タスクテンプレートで標準化
- 色設定、表示順など柔軟に変更可能

## 📊 デモデータ

現在、UIにはハードコードされたデモデータが表示されています。
実際のデータ連携には以下が必要：

1. バックエンドAPIの実装完了
2. 認証システムの実装
3. データベースへの初期データ投入

## 🎨 UIの特徴

- **Material-UI (MUI)** による統一的なデザイン
- **レスポンシブ対応** - モバイル、タブレット、デスクトップ
- **日本語最適化** - 日付表示、曜日表示など
- **リアルタイム更新準備** - React Queryによる状態管理

## 📝 次のステップ

1. **Phase 1**: Core CRUD実装
   - [ ] 認証API実装
   - [ ] プロジェクトCRUD API
   - [ ] タスク更新API
   - [ ] リアルタイムポーリング

2. **Phase 2**: 予測機能
   - [ ] LightGBMモデル実装
   - [ ] Celeryジョブ設定
   - [ ] アラート通知

3. **Phase 3**: モバイルアプリ
   - [ ] React Native版開発
   - [ ] プッシュ通知実装