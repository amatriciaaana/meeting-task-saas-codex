# Summary Generation MVP Design

## Goal

transcript から会議要約を生成し、会議詳細ページで表示できるようにする。

今回の対象:

- summary 生成
- decisions 抽出
- open questions 抽出
- meeting detail での表示

## Why This Next

- transcript 入力の次に最も価値が出る
- task extraction の前提になる
- AI プロダクトとしての体験が一段進む

## Scope

### In Scope

- summary テーブル追加
- summary 生成 API
- meeting detail に summary 表示
- summary 再生成
- summary provider abstraction

### Out Of Scope

- action item extraction
- Slack / Notion 送信
- provider 切り替え UI
- 非同期ジョブ化

## Data Model

```ts
export type MeetingSummary = {
  id: string;
  meetingId: string;
  summaryText: string;
  decisionsText: string;
  openQuestionsText: string;
  provider: string;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
};
```

MVP では meeting ごとに 1 件。

## Provider Strategy

初期は provider abstraction を持つ。

- default: local heuristic provider
- future: OpenAI provider

理由:

- 実装と画面を先に完成させられる
- API key なしでも動作確認できる
- 後で provider を差し替えやすい

## UX

会議詳細ページに summary セクションを追加。

- summary 表示
- decisions 表示
- open questions 表示
- `Generate summary` ボタン
- `Regenerate` ボタン

空状態:

- `No summary generated yet.`

## Validation / Preconditions

- transcript が存在しない場合は生成不可
- transcript が空文字の場合は `400`

## API

### GET /api/meetings/:id/summary

- summary があれば `200`
- 無ければ `200` + `summary: null`

### POST /api/meetings/:id/summary

- transcript を入力にして summary を生成または更新

Response:

```json
{
  "summary": {
    "id": "sum_123",
    "meetingId": "mtg_123",
    "summaryText": "Summary text",
    "decisionsText": "Decision text",
    "openQuestionsText": "Open question text",
    "provider": "local-heuristic",
    "promptVersion": "v1",
    "createdAt": "2026-03-20T10:00:00.000Z",
    "updatedAt": "2026-03-20T10:00:00.000Z"
  }
}
```

## Acceptance Criteria

- transcript がある meeting で summary を生成できる
- 再読み込み後も summary が見える
- transcript が無い meeting では summary 生成に失敗する
- 再生成で summary が上書きされる
