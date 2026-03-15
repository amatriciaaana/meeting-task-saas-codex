# Meeting CRUD MVP Design

## Goal

1 日で `meeting-task-saas` に最初の業務導線を追加する。

今回の対象は以下。

- 会議一覧表示
- 会議作成
- 会議詳細表示

この段階では認証、音声アップロード、AI 要約、タスク抽出は未実装でよい。

## Why This First

- SaaS の中心オブジェクトである `meeting` を先に置ける
- 以後の transcript, summary, task を自然にぶら下げられる
- 画面、API、状態管理の最小構成を早く確認できる

## Scope

### In Scope

- `/meetings` 一覧ページ
- `/meetings/new` 作成ページ
- `/meetings/[id]` 詳細ページ
- 会議作成 API
- 会議一覧 API
- 会議詳細 API
- 仮保存用のインメモリストア

### Out Of Scope

- 認証
- DB 永続化
- 音声アップロード
- AI 要約
- タスク抽出
- Slack 連携

## User Flow

1. ユーザーが `/meetings` を開く
2. `New Meeting` から `/meetings/new` へ移動
3. タイトル、種別、日時、メモを入力
4. 保存すると会議が作成される
5. `/meetings` に戻り、作成済みの会議が見える
6. 一覧の項目を押すと `/meetings/[id]` で詳細を確認できる

## Screens

### Meetings List

Path: `/meetings`

表示要素:

- ページタイトル
- `New Meeting` ボタン
- 会議カードまたはテーブル
- 空状態メッセージ

各会議に表示するもの:

- title
- meetingType
- scheduledAt
- status

### New Meeting

Path: `/meetings/new`

入力項目:

- title
- meetingType
- scheduledAt
- notes

操作:

- `Create meeting`
- `Cancel`

### Meeting Detail

Path: `/meetings/[id]`

表示項目:

- title
- meetingType
- scheduledAt
- status
- notes
- createdAt

## Data Model

```ts
export type MeetingType = "weekly" | "sales" | "one_on_one" | "custom";

export type MeetingStatus = "draft" | "processing" | "completed";

export type Meeting = {
  id: string;
  title: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  scheduledAt: string;
  notes?: string;
  createdAt: string;
};
```

## API Design

### GET /api/meetings

一覧を返す。

Response:

```json
{
  "meetings": []
}
```

### POST /api/meetings

会議を作成する。

Request:

```json
{
  "title": "Weekly Product Sync",
  "meetingType": "weekly",
  "scheduledAt": "2026-03-15T10:00:00.000Z",
  "notes": "Agenda draft"
}
```

Response:

```json
{
  "meeting": {
    "id": "mtg_123",
    "title": "Weekly Product Sync",
    "meetingType": "weekly",
    "status": "draft",
    "scheduledAt": "2026-03-15T10:00:00.000Z",
    "notes": "Agenda draft",
    "createdAt": "2026-03-15T09:00:00.000Z"
  }
}
```

### GET /api/meetings/:id

単一の会議詳細を返す。

Not found の場合は `404`。

## Storage Strategy

初回実装では `apps/web/lib/meetings-store.ts` にインメモリ保存を持つ。

要件:

- API と UI から同じ store を使う
- DB へ差し替えやすいよう関数境界を切る

想定インターフェース:

```ts
export function listMeetings(): Meeting[];
export function createMeeting(input: CreateMeetingInput): Meeting;
export function getMeetingById(id: string): Meeting | null;
```

## Validation

最低限のバリデーション:

- `title`: 必須、1 文字以上、100 文字以下
- `meetingType`: 許可値のみ
- `scheduledAt`: ISO 日時文字列
- `notes`: 任意、2000 文字以下

エラー時:

- API は `400`
- UI はフォーム下にエラーメッセージ表示

## UI Direction

既存のランディングページの雰囲気を壊さず、同じ配色とカードスタイルを使う。

一覧:

- カードベース
- ステータスバッジ
- モバイルでも縦積み

作成フォーム:

- 1 カラム
- ラベル付き
- プライマリーボタンは明確に強調

## File Plan

追加対象:

- `apps/web/app/meetings/page.tsx`
- `apps/web/app/meetings/new/page.tsx`
- `apps/web/app/meetings/[id]/page.tsx`
- `apps/web/app/api/meetings/route.ts`
- `apps/web/app/api/meetings/[id]/route.ts`
- `apps/web/lib/meetings-store.ts`
- `packages/types/src/meeting.ts`

更新対象:

- `packages/types/src/index.ts`
- 必要に応じて `apps/web/app/globals.css`

## Acceptance Criteria

- `/meetings` で空状態を確認できる
- `/meetings/new` で会議を作成できる
- 作成後に `/meetings` へ戻り、作成済み会議が見える
- 会議カードから `/meetings/[id]` に遷移できる
- 存在しない id では 404 相当になる
- 主要入力に最低限のバリデーションがある

## Risks

- インメモリ保存のため再起動でデータが消える
- serverless 的な実行環境ではインメモリ共有に期待できない

## Follow-up

次の実装候補:

1. DB 永続化
2. transcript テキスト入力
3. summary 生成ジョブ接続
