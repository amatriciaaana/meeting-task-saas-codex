# Product Design

## Target User

- 会議が多い PM
- 議事録作成が面倒な営業組織
- 複数案件を走らせる受託開発会社
- メモ文化が弱く、タスク漏れが多い小規模チーム

## Core Value

このプロダクトの価値は「会議内容の記録」ではなく「会議のあとにやるべき仕事を漏らさず前に進めること」。

## Main Screens

1. Landing page
2. Sign up / login
3. Workspace dashboard
4. Meeting create page
5. Meeting detail page
6. Task board
7. Billing page
8. Settings / integrations

## Main User Flow

1. ユーザー登録
2. ワークスペース作成
3. 会議を新規作成
4. 音声アップロードまたはテキスト貼り付け
5. AI 処理完了
6. 要約とタスクを確認・修正
7. Slack へ送信
8. 次回会議で再利用

## Differentiation

- 日本語に強いテンプレート
- タスク抽出の精度
- 会議テンプレート
  - 営業定例
  - 開発定例
  - 1on1
  - 採用面談
- 「誰が何をいつまでに」が最初から整理される

## Pricing Hooks

- 会議数
- 音声分数
- 連携数
- ワークスペース人数
- 履歴保存期間

## MVP Features

- Email / Google login
- Workspace
- Meeting CRUD
- Transcript upload
- Audio upload
- AI summary generation
- Task extraction
- Manual task editing
- Slack integration
- Usage limit display
- Stripe checkout

## V2 Features

- Notion integration
- Google Calendar sync
- action item reminders
- recurring meeting templates
- speaker diarization
- multilingual transcription
- team analytics
- approval workflow

## Non-Goals For MVP

- Zoom / Meet のリアルタイム参加
- 複雑な権限マトリクス
- 自前モデル運用
- オフライン編集

## Success Metrics

- 初回会議作成率
- 会議からタスク生成までの完了率
- 週次継続率
- 1 ワークスペースあたりの会議数
- Free から Pro への転換率
