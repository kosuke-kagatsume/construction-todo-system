# 本番環境デプロイガイド

## 📋 前提条件

- GitHub アカウント
- Vercel アカウント（フロントエンド用）
- PostgreSQL データベース（Supabase, Neon, Railway など）
- Redis インスタンス（Upstash Redis 推奨）

## 🚀 フロントエンドのデプロイ（Vercel）

### 1. Vercel でのデプロイ

1. [Vercel](https://vercel.com) にログイン
2. "New Project" をクリック
3. GitHub リポジトリをインポート
4. Framework Preset: `Next.js` を選択
5. Root Directory: `frontend` を指定
6. 環境変数を設定：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.herokuapp.com
   ```

### 2. 自動デプロイの設定

Vercel は GitHub の main ブランチへのプッシュを自動的に検知してデプロイします。

## 🔧 バックエンドのデプロイ

### オプション 1: Railway でのデプロイ（推奨）

1. [Railway](https://railway.app) にログイン
2. "New Project" → "Deploy from GitHub repo" を選択
3. リポジトリを選択し、`backend` ディレクトリを指定
4. 環境変数を設定：

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
DATABASE_SYNC_URL=postgresql://user:password@host:port/dbname

# Security
SECRET_KEY=your-production-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# Redis
REDIS_URL=redis://default:password@host:port

# CORS
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

5. PostgreSQL と Redis サービスを追加：
   - "New" → "Database" → "PostgreSQL"
   - "New" → "Redis"

### オプション 2: Heroku でのデプロイ

1. Heroku CLI をインストール
2. プロジェクトのルートで以下を実行：

```bash
cd backend
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set BACKEND_CORS_ORIGINS='["https://your-frontend.vercel.app"]'
git push heroku main
```

### オプション 3: Render でのデプロイ

1. [Render](https://render.com) にログイン
2. "New" → "Web Service" を選択
3. GitHub リポジトリを接続
4. 設定：
   - Name: `construction-todo-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 📊 データベースのセットアップ

### Supabase を使用する場合

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Database URL を取得
3. マイグレーションを実行：

```bash
# ローカルで実行
cd backend
alembic upgrade head
python scripts/init_db.py
```

### Neon を使用する場合

1. [Neon](https://neon.tech) でプロジェクトを作成
2. Connection string を取得
3. 環境変数に設定

## 🔐 本番環境のセキュリティ

### 必須の設定

1. **SECRET_KEY の変更**
   ```bash
   openssl rand -hex 32
   ```

2. **HTTPS の有効化**
   - Vercel: 自動的に有効
   - バックエンド: プロバイダーの設定に従う

3. **CORS の設定**
   - フロントエンドのURLのみを許可

4. **環境変数の保護**
   - 本番環境の `.env` ファイルは Git にコミットしない
   - 各プラットフォームの環境変数機能を使用

## 📝 デプロイ後の確認

1. **ヘルスチェック**
   ```bash
   curl https://your-backend-api.herokuapp.com/
   curl https://your-backend-api.herokuapp.com/api/v1/
   ```

2. **フロントエンドの動作確認**
   - ログイン機能
   - プロジェクト一覧の表示
   - タスクの作成・更新

3. **エラーログの確認**
   - Vercel: Dashboard → Functions → Logs
   - Railway/Heroku: Dashboard → Logs

## 🔄 継続的デプロイ

### GitHub Actions の設定（オプション）

`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway CLI を使用したデプロイ
```

## 🚨 トラブルシューティング

### よくある問題

1. **CORS エラー**
   - `BACKEND_CORS_ORIGINS` に正しいフロントエンドURLが設定されているか確認

2. **データベース接続エラー**
   - `DATABASE_URL` の形式が正しいか確認
   - SSL設定が必要な場合: `?sslmode=require` を追加

3. **500 Internal Server Error**
   - ログを確認
   - 環境変数がすべて設定されているか確認
   - マイグレーションが実行されているか確認

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)