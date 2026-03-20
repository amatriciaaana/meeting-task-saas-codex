# Product Roadmap

## Current State

実装済みの中心機能:

- login / session
- admin / general user roles
- user management
- meeting CRUD (list / create / detail)
- transcript text save / update
- PostgreSQL + Prisma persistence
- unit tests
- CI/CD skeleton

## Product Goal

会議の情報を入力すると、要約、決定事項、未決事項、担当者付きタスクまで整理し、チームの実行につなげる。

## Roadmap Principles

- 先に価値の中心を作る
- 後で壊しやすい認可は早めに入れる
- 外部連携は中核データモデルが固まってから入れる
- AWS 本番化はアプリの主要導線が固まってから進める

## Phase 1: AI Core

### 1. Summary Generation

目的:

- transcript から要約を生成する

実装内容:

- summary テーブル追加
- summary API
- meeting detail に summary 表示
- OpenAI API 接続
- prompt 管理

完了条件:

- transcript から summary を生成できる
- 会議詳細で再表示できる

### 2. Decisions / Open Questions Extraction

目的:

- 会議結果の整理を進める

実装内容:

- decisions
- open questions
- structured output

完了条件:

- summary と一緒に decisions / open questions を保存・表示できる

### 3. Task Extraction

目的:

- 会議から行動に落とす

実装内容:

- tasks テーブル追加
- AI task extraction
- task list / edit UI
- assignee, due date, status

完了条件:

- 会議ごとに task が抽出され、編集できる

## Phase 2: Multi-User Productization

### 4. Workspace Model

目的:

- チーム運用の単位を作る

実装内容:

- workspaces
- workspace_members
- meeting に workspaceId 追加
- users page を workspace 配下の概念に寄せる

完了条件:

- データが workspace 単位で分離される

### 5. Authorization Hardening

目的:

- 他組織や他ユーザーのデータを見せない

実装内容:

- workspace-based authorization
- admin scope の整理
- API の認可統一

完了条件:

- 全 API で workspace / role に基づくアクセス制御が入る

### 6. Audit Log

目的:

- B2B 向けの運用性を上げる

実装内容:

- password reset
- unlock
- delete
- transcript update
- summary generation

完了条件:

- 重要操作の履歴を保存できる

## Phase 3: Integrations

### 7. Slack Integration

目的:

- 会議結果をすぐ共有する

実装内容:

- Slack webhook or OAuth
- summary / tasks の送信

完了条件:

- meeting detail から Slack 送信できる

### 8. Notion Integration

目的:

- ドキュメント連携を強める

実装内容:

- Notion page 作成
- summary / tasks を整形送信

### 9. Google Calendar Integration

目的:

- 会議作成と予定をつなぐ

実装内容:

- event import
- meeting prefill

## Phase 4: Input Expansion

### 10. Audio Upload

目的:

- transcript 手入力依存を減らす

実装内容:

- audio upload
- object storage
- asset metadata

### 11. Speech-to-Text

目的:

- 実際の議事録作成を自動化する

実装内容:

- transcription worker
- queue
- async job status

### 12. Transcript Versioning

目的:

- AI 再生成や手修正に耐える

実装内容:

- transcript revision history

## Phase 5: Production Readiness

### 13. Security Hardening

実装内容:

- rate limiting
- CSRF protection
- secure cookie settings by env
- password reset policy review

### 14. E2E Tests

実装内容:

- login
- user management
- meeting create
- transcript save
- summary generate

### 15. AWS Deployment

推奨:

- ECS Fargate
- ALB
- RDS for PostgreSQL
- Secrets Manager

完了条件:

- main から staging or production に deploy できる

## Recommended Order

1. summary generation
2. decisions / open questions extraction
3. task extraction
4. workspace model
5. authorization hardening
6. Slack integration
7. audio upload
8. speech-to-text
9. security hardening
10. AWS deployment

## Best Next Task

次に着手するなら `summary generation` が最優先。

理由:

- transcript 入力までできているので最短で価値が出る
- タスク抽出や連携の前提にもなる
- ユーザーにとって「AIっぽい成果」が最初に見える
