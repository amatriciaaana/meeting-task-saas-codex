# Architecture

## Recommended Stack

- Web: Next.js App Router
- UI: React + TypeScript
- API/BFF: Next.js Route Handlers
- Async Jobs: BullMQ
- DB: PostgreSQL
- Cache / Queue: Redis
- Object Storage: S3 compatible storage
- Auth: Auth.js or Clerk
- Billing: Stripe
- AI:
  - Speech-to-text: Whisper API or Deepgram
  - Summarization / extraction: OpenAI Responses API
- Observability: OpenTelemetry + Sentry
- Infra:
  - App hosting: Vercel or Fly.io
  - DB/Redis: managed service

## Service Layout

### Phase 1

モノリス寄りの構成で十分。

- `web`
  - UI
  - API
  - auth
  - billing webhook
- `worker`
  - transcription job
  - summarization job
  - export job
- `postgres`
  - users
  - workspaces
  - meetings
  - tasks
- `redis`
  - queue
  - rate limit
- `object storage`
  - uploaded audio
  - generated transcript

### Phase 2

負荷が増えたら Go サービスを追加。

- `go-transcriber`
  - 音声前処理
  - 長時間音声の分割
  - バッチ最適化
- `go-analytics`
  - usage aggregation
  - billing metrics
  - activity reporting

## Request Flow

1. ユーザーが会議を作成
2. 音声またはテキストを投入
3. 音声なら S3 に保存し、ジョブを Redis に投入
4. worker が文字起こし
5. transcript をもとに AI 抽出ジョブ実行
6. 要約、決定事項、タスク、未決事項を保存
7. UI に進捗反映
8. 必要なら Slack / Notion に送信

## Folder Layout

初期実装の推奨構成:

```text
apps/
  web/
    app/
    components/
    lib/
    server/
    styles/
workers/
  transcript-worker/
packages/
  ui/
  config/
  prompts/
  types/
infra/
  docker/
  terraform/
```

## Key Decisions

- 音声処理は同期でやらず非同期化する
- AI 出力は毎回そのまま表示せず、編集可能な下書きとして保存する
- タスク抽出は structured output を前提にする
- ワークスペース単位でデータ分離する
- 監査ログは早めに入れる。B2B では後で効く

## Why TypeScript First

- 単一言語でフロントと API を速く回せる
- ライブラリ選択肢が多い
- 採用しやすい

## Where Go Fits

- 音声の長時間変換
- 重い集計
- 将来の大量 webhook / queue 消化
- CPU バウンド処理
