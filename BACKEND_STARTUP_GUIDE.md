# FastAPIバックエンド起動ガイド

## 現在の状況
- フロントエンド（Next.js）: ✅ 正常動作中（ポート 3002）
- バックエンド（FastAPI）: ❌ 未起動

## 必要な設定

### 1. 依存関係の追加
通知システム実装で以下の依存関係が必要：
```
jinja2==3.1.2       # メールテンプレート用
aiosqlite==0.19.0   # SQLite非同期対応
```

### 2. 環境設定
`.env` ファイルを更新（SQLiteを使用して簡素化）：
```env
DATABASE_URL=sqlite+aiosqlite:///./construction_todo.db
DATABASE_SYNC_URL=sqlite:///./construction_todo.db
```

### 3. 起動手順
```bash
cd backend

# 依存関係インストール（仮想環境推奨）
pip install -r requirements.txt

# データベース初期化
alembic upgrade head

# サーバー起動
uvicorn app.main:app --reload --port 8000
```

## 実装済み機能

### ✅ 通知システム
- **モデル**: 通知、設定、配信ログ、テンプレート
- **API**: `/api/v1/notifications/` エンドポイント群
- **WebSocket**: リアルタイム通知配信
- **Email**: HTMLテンプレート対応
- **建築業界特化**: タスク割当、期限通知、ステージ遅延、引き継ぎ、ボトルネック

### ✅ フロントエンド
- **認証**: デモユーザー対応（営業、設計、IC、工務）
- **ダッシュボード**: 役割別進捗、ボトルネック分析、KPI表示
- **プロジェクト管理**: 一覧、詳細、作成機能
- **タスク管理**: マイタスク、進捗管理
- **ボード機能**: Excel風グリッド表示
- **通知システム**: WebSocket対応、設定管理

### 🔧 API連携状況
- **現在**: Next.js APIルート（モック）使用
- **目標**: FastAPIバックエンド連携
- **切り替え**: `NEXT_PUBLIC_USE_BACKEND=true` で制御

## 次のステップ
1. バックエンド起動
2. API接続テスト
3. 通知機能テスト
4. WebSocket接続確認
5. 統合テスト

## テスト用ファイル
- `test_notification_service.py` - 通知サービステスト
- `test_email_service.py` - メール配信テスト
- `test_websocket_client.html` - WebSocketテスト