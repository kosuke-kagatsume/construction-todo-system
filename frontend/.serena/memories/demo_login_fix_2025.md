# デモログイン機能の修正 (2025-08-23)

## 問題
- Vercelデプロイ環境でデモログインボタンが反応しない
- キャッシュによりコード更新が反映されない

## 実施した修正

### 1. デモログインボタンの実装
**ファイル**: `/src/pages/login.tsx`

- `handleDemoLogin`関数を追加
- 各ロール（管理者、営業、設計、IC、工務）用のクイックログインボタンを実装
- ボタンクリック時に直接ログイン処理を実行

### 2. Vercelキャッシュ問題の対応
**ファイル**: `/next.config.js`

- HTTPヘッダーにキャッシュ無効化設定を追加
  - `Cache-Control: no-cache, no-store, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`

## 機能詳細
- 5つのデモアカウント用ボタン
  - 管理者: admin@demo.com / admin123
  - 営業: sales@demo.com / sales123
  - 設計: design@demo.com / design123
  - IC: ic@demo.com / ic123
  - 工務: construction@demo.com / const123

- ローディング中はボタンを無効化
- エラーハンドリング実装済み

## デプロイ時の注意
- Vercelへの再デプロイが必要
- ブラウザキャッシュのクリアを推奨