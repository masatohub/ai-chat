# AI Chat Application

## 概要

一般ユーザー向けの汎用AIチャットボットWebアプリケーション。認証不要で誰でも利用できる、シンプルなチャットUI。

- **AIモデル**: Claude (Anthropic) — `claude-sonnet-4-6` をデフォルトで使用
- **デプロイ先**: Google Cloud Run
- **認証**: なし（ログイン不要）

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| サーバーサイド処理 | Hono (`app/api/` 以下の Route Handler に統合) |
| データベース | MongoDB (将来の機能拡張用に接続設定のみ用意) |
| スタイル | Tailwind CSS — シンプル・ミニマル |
| AI SDK | Anthropic SDK (`@anthropic-ai/sdk`) |
| コンテナ | Docker → Google Cloud Run |

## アーキテクチャ

```
ブラウザ (Next.js App Router)
  └─ チャットUI (useState で messages 管理)
       └─ POST /api/chat  (Hono Router)
            └─ Anthropic API (claude-sonnet-4-6)
                 └─ SSE ストリームでレスポンスを返却
```

## 主要機能

- **ストリーミング応答**: Anthropic SDK の `stream()` + Server-Sent Events でリアルタイム表示
- **会話履歴**: クライアントの `useState` で管理。ページリロードで消去（DBへの永続化なし）
- **シンプルUI**: 入力ボックス・メッセージリスト・送信ボタンのみ

## ディレクトリ構成

```
.
├── app/
│   ├── page.tsx              # チャット画面（メインページ）
│   ├── layout.tsx
│   └── api/
│       └── chat/
│           └── route.ts      # Hono を使った AI API エンドポイント
├── components/
│   ├── chat-window.tsx       # メッセージ一覧 + 入力フォームのコンテナ
│   ├── message-list.tsx      # メッセージ一覧の表示
│   └── message-input.tsx     # テキスト入力 + 送信ボタン
├── lib/
│   ├── anthropic.ts          # Anthropic クライアント初期化
│   └── mongodb.ts            # MongoDB 接続（将来用）
├── Dockerfile
├── .env.local
└── CLAUDE.md
```

## 環境変数

```bash
# .env.local
ANTHROPIC_API_KEY=your-api-key
MONGODB_URI=mongodb+srv://...   # 将来の機能拡張時に使用
```

## 実装ルール

### API
- Hono のルーターを `app/api/chat/route.ts` にマウントし、Next.js の Route Handler として動作させる
- ストリーミングは `anthropic.messages.stream()` で取得し、`ReadableStream` (SSE) としてレスポンスを返す
- リクエストボディは `{ messages: Message[] }` の形式で受け取り、そのまま Anthropic API に渡す

### クライアント
- 会話履歴は `useState<Message[]>` で管理し、各リクエスト時にサーバーへ全件送信
- ストリーミング受信は `fetch` + `ReadableStreamDefaultReader` で実装
- 送信中はボタンを disabled にしてダブル送信を防止

### スタイル
- Tailwind CSS のみ使用。外部UIライブラリは原則追加しない
- ダークモード対応は不要（ライトモード固定）

## デプロイ手順（Cloud Run）

```bash
# ビルド & プッシュ
docker build -t ai-chat .
docker tag ai-chat gcr.io/[PROJECT_ID]/ai-chat
docker push gcr.io/[PROJECT_ID]/ai-chat

# デプロイ
gcloud run deploy ai-chat \
  --image gcr.io/[PROJECT_ID]/ai-chat \
  --platform managed \
  --region asia-northeast1 \
  --set-env-vars ANTHROPIC_API_KEY=your-key \
  --allow-unauthenticated
```

## 将来の拡張候補（現時点では実装しない）

- MongoDB を使った会話履歴の永続化
- ユーザー認証（Google OAuth 等）
- ファイル・画像のアップロード対応
- 複数会話セッションの管理
