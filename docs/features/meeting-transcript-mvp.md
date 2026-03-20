# Meeting Transcript MVP Design

## Goal

会議詳細ページから transcript テキストを登録・更新できるようにする。

今回の対象:

- 会議ごとの transcript 登録
- transcript 更新
- 会議詳細ページでの transcript 表示
- transcript API

## Why This Next

- プロダクト価値の中心に近い
- 後続の summary / task extraction の入力元になる
- meeting 作成済みフローに自然につながる

## Scope

### In Scope

- `meeting` ごとに 1 件の transcript を保持
- `/meetings/[id]` から transcript を編集
- `PUT /api/meetings/:id/transcript`
- `GET /api/meetings/:id/transcript`

### Out Of Scope

- 音声アップロード
- speaker diarization
- transcript versioning
- AI summary generation

## Data Model

```ts
export type Transcript = {
  id: string;
  meetingId: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
};
```

MVP では transcript は会議ごとに 1 件。

## UX

会議詳細ページに transcript セクションを追加する。

- テキストエリア
- `Save transcript` ボタン
- 保存成功 / 失敗メッセージ
- 最終更新日時表示

空状態:

- `No transcript yet.`

## Validation

- `rawText`: 必須、1 文字以上、20,000 文字以下

エラー時:

- API は `400`
- UI はインラインメッセージ表示

## API

### GET /api/meetings/:id/transcript

- transcript があれば `200`
- 無ければ `200` + `transcript: null`
- meeting id 不正は `400`

### PUT /api/meetings/:id/transcript

Request:

```json
{
  "rawText": "Meeting transcript text"
}
```

Response:

```json
{
  "transcript": {
    "id": "trn_123",
    "meetingId": "mtg_123",
    "rawText": "Meeting transcript text",
    "createdAt": "2026-03-16T10:00:00.000Z",
    "updatedAt": "2026-03-16T10:00:00.000Z"
  }
}
```

## Acceptance Criteria

- 会議詳細ページで transcript の入力欄が見える
- transcript を保存できる
- 再読み込み後も transcript が表示される
- 20,000 文字超は保存できない
- 存在しない meeting id は適切に失敗する
