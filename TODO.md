# 実行計画 — AI Chat Application

## フェーズ 1: プロジェクトセットアップ

- [x] **1-1** `create-next-app` で Next.js 15 プロジェクトを初期化
  - TypeScript / Tailwind CSS / App Router を有効にする
  - `src/` ディレクトリは使わず、ルート直下に `app/` を配置
- [x] **1-2** 依存パッケージのインストール
  - `@anthropic-ai/sdk` — Anthropic SDK
  - `hono` — サーバーサイドルーティング
  - `@hono/node-server` または Next.js の Route Handler と統合するためのアダプター確認
- [x] **1-3** `.env.local` を作成し `ANTHROPIC_API_KEY` を設定
- [x] **1-4** 不要なボイラープレート（`app/page.tsx` のデフォルト内容など）を削除

---

## フェーズ 2: APIエンドポイント実装

- [x] **2-1** `lib/anthropic.ts` を作成し Anthropic クライアントを初期化
- [x] **2-2** `app/api/chat/route.ts` に Hono ルーターをマウント
  - `POST /api/chat` を定義
  - リクエストボディ `{ messages: Message[] }` をバリデーション
- [x] **2-3** ストリーミングレスポンスを実装
  - `anthropic.messages.stream()` でストリーム取得
  - `ReadableStream` + `TransformStream` で SSE 形式に変換してレスポンス返却
  - `Content-Type: text/event-stream` ヘッダーを設定
- [x] **2-4** エラーハンドリング
  - API キー未設定、Anthropic API エラー、リクエスト不正を適切に処理
  - クライアントに JSON エラーレスポンスを返す

---

## フェーズ 3: フロントエンド実装

- [x] **3-1** 型定義を `types/index.ts` などに作成
  - `Message` 型 (`role: "user" | "assistant"`, `content: string`)
- [x] **3-2** `components/message-input.tsx` を実装
  - テキストエリア（複数行入力対応）と送信ボタン
  - `isLoading` が `true` の間はボタンを `disabled` にする
  - `Shift+Enter` で改行、`Enter` で送信
- [x] **3-3** `components/message-list.tsx` を実装
  - メッセージを `user` / `assistant` でスタイルを分けて表示
  - `assistant` の返答中はストリーミングテキストを逐次描画
  - 新しいメッセージが追加されたら自動スクロール
- [x] **3-4** `components/chat-window.tsx` を実装
  - `useState<Message[]>` で会話履歴を管理
  - `fetch` + `ReadableStreamDefaultReader` でストリーム受信
  - ストリーミング受信中は末尾の `assistant` メッセージをリアルタイム更新
- [x] **3-5** `app/page.tsx` に `ChatWindow` を配置してレイアウトを整える

---

## フェーズ 4: スタイリング

- [x] **4-1** 全体レイアウト: 画面全体をチャット領域として使う (`h-dvh` / `flex-col`)
- [x] **4-2** メッセージバブルのスタイル
  - `user`: 右寄せ、アクセントカラー背景
  - `assistant`: 左寄せ、グレー背景
- [x] **4-3** 入力エリアを画面下部に固定
- [x] **4-4** ローディング中のインジケーター（点滅ドットなど）を表示

---

## フェーズ 5: Docker化

- [x] **5-1** `Dockerfile` を作成
  - マルチステージビルド（`builder` → `runner`）
  - `node:24-alpine` ベースイメージを使用
  - `NEXT_TELEMETRY_DISABLED=1` を設定
- [x] **5-2** `.dockerignore` を作成（`node_modules`、`.env.local`、`.next` など除外）
- [ ] **5-3** ローカルで `docker build & run` して動作確認

---

## フェーズ 6: Cloud Run デプロイ

- [x] **6-1** Google Cloud プロジェクトの確認 / `gcloud` CLI の認証
- [x] **6-2** Artifact Registry にリポジトリを作成（または Container Registry を使用）
- [x] **6-3** イメージをビルドしてプッシュ
  ```bash
  docker build -t gcr.io/[PROJECT_ID]/ai-chat .
  docker push gcr.io/[PROJECT_ID]/ai-chat
  ```
- [x] **6-4** Cloud Run にデプロイ
  ```bash
  gcloud run deploy ai-chat \
    --image gcr.io/[PROJECT_ID]/ai-chat \
    --platform managed \
    --region asia-northeast1 \
    --set-env-vars ANTHROPIC_API_KEY=... \
    --allow-unauthenticated
  ```
- [x] **6-5** デプロイ後に発行された URL でストリーミングを含む動作確認

---

## フェーズ 7: 将来の拡張準備（実装不要）

- [ ] **7-1** `lib/mongodb.ts` に MongoDB 接続クライアントの雛形のみ作成
  - 実際の呼び出しは行わず、接続コードと型のみ用意

---

## 完了チェックリスト

- [ ] ローカルでチャットが送受信できる
- [ ] ストリーミングで文字が逐次表示される
- [ ] 会話が複数ターン継続できる（履歴が引き継がれる）
- [ ] 送信中の二重送信が防止されている
- [ ] Docker コンテナとして起動できる
- [ ] Cloud Run でパブリックにアクセスできる
