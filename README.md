# Meeting Task SaaS

AI 議事録 + タスク抽出 SaaS の初期プロジェクト。

## Structure

- `apps/web`: Next.js Web アプリ
- `workers/transcript-worker`: 非同期ジョブ用ワーカー
- `packages/types`: 共通型
- `packages/prompts`: AI プロンプト定義
- `docs`: 実装補助ドキュメント

## First Steps

```bash
cp .env.example .env
pnpm db:start
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev:web
```

## Development URL

ローカル開発サーバーは、既に `3000` が使用中なら `3001` などの空きポートで起動する。

## Database

- local: Docker Compose PostgreSQL
- ORM: Prisma
- production target: Amazon RDS for PostgreSQL

この開発環境で Docker が使えない場合は、PostgreSQL を別途起動して `DATABASE_URL` を合わせたうえで `pnpm db:migrate` を実行する。

## Notes

- MVP は TypeScript で開始
- 音声処理や集計の一部は将来的に Go へ切り出し可能
