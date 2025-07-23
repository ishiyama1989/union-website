# 労働組合ウェブサイト (Next.js版)

Next.js + Vercel KVを使用した労働組合公式ウェブサイトです。組合員からの意見収集機能を含みます。

## 機能概要

### 一般向け機能
- 組合概要・理念の紹介
- ニュース・お知らせの表示
- 活動紹介
- 組合加入案内
- お問い合わせフォーム
- **組合員意見投稿フォーム**（匿名投稿可能）

### 管理者向け機能
- 管理者ログイン
- ダッシュボード（統計情報表示）
- **意見管理**（一覧・詳細・既読管理・削除）

## 技術スタック

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Authentication**: Cookie-based session management

## セットアップ手順

### 1. プロジェクトのクローン
```bash
git clone <repository-url>
cd union-website
npm install
```

### 2. Vercel KVの設定
1. Vercelアカウントでプロジェクトを作成
2. Vercel KVデータベースを作成
3. 環境変数をコピー

### 3. 環境変数の設定
`.env.local.example`を`.env.local`にコピーして設定：

```env
# Vercel KV Database
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 4. 開発環境での実行
```bash
npm run dev
```

http://localhost:3000 でアクセス可能です。

## デプロイ手順

### Vercelへのデプロイ

1. **Vercelアカウント準備**
   - [Vercel](https://vercel.com)でアカウント作成

2. **KVデータベース作成**
   - Vercelダッシュボードで「Storage」→「Create Database」
   - 「KV」を選択してデータベース作成

3. **環境変数設定**
   - プロジェクト設定で以下の環境変数を設定：
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`

4. **デプロイ実行**
   ```bash
   # Vercel CLIを使用する場合
   npm install -g vercel
   vercel
   
   # または、GitHubと連携してプッシュでデプロイ
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

## 使用方法

### 一般利用者
1. ウェブサイトにアクセス
2. 「お問い合わせ・ご意見」セクションから意見を投稿
3. 匿名投稿も選択可能

### 管理者
1. `/admin`にアクセス
2. 設定したユーザー名・パスワードでログイン
3. ダッシュボードで投稿状況を確認
4. 意見管理で投稿された意見を確認・管理

## ファイル構成

```
src/
├── app/
│   ├── page.tsx              # メインページ
│   ├── admin/
│   │   ├── page.tsx          # 管理者ログイン
│   │   ├── dashboard/        # ダッシュボード
│   │   └── opinions/         # 意見管理
│   └── api/
│       ├── opinions/         # 意見API
│       └── admin/            # 管理者API
└── lib/
    ├── kv.ts                 # Vercel KV操作
    └── auth.ts               # 認証機能
```

## API エンドポイント

### 公開API
- `POST /api/opinions` - 意見投稿
- `GET /api/opinions` - 意見一覧取得

### 管理者API
- `POST /api/admin/login` - 管理者ログイン
- `POST /api/admin/logout` - 管理者ログアウト
- `GET /api/admin/stats` - 統計情報取得
- `PUT /api/opinions/[id]` - 意見更新
- `DELETE /api/opinions/[id]` - 意見削除

## カスタマイズ方法

### デザインの変更
- Tailwind CSSクラスを編集
- `src/app/page.tsx`でレイアウト調整

### 組合情報の更新
- `src/app/page.tsx`の組合名、住所、連絡先を実際の情報に更新

### 管理者認証の変更
- 環境変数`ADMIN_USERNAME`、`ADMIN_PASSWORD`を更新

## セキュリティ対策

### 実装済み
- CSRF対策（Next.js標準）
- XSS対策（React標準のエスケープ処理）
- HTTPオンリークッキー
- 入力値検証・サニタイズ

### 推奨される追加対策
- 強固な管理者パスワードの設定
- 定期的なパスワード変更
- IPアドレス制限（Vercel Pro機能）

## トラブルシューティング

### よくある問題

**Vercel KV接続エラー**
- 環境変数が正しく設定されているか確認
- KVデータベースが有効になっているか確認

**管理画面にログインできない**
- 環境変数のユーザー名・パスワードを確認
- ブラウザのクッキーが有効になっているか確認

**意見が投稿できない**
- フォームの必須項目が入力されているか確認
- 文字数制限（1000文字）を超えていないか確認

## ライセンス

このプロジェクトは組合運営用に作成されたものです。
必要に応じて改変・配布してください。

## サポート

技術的な問題が発生した場合は、システム管理者にお問い合わせください。
