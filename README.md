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
pnpm install
pnpm dev:web
```

## Notes

- MVP は TypeScript で開始
- 音声処理や集計の一部は将来的に Go へ切り出し可能
