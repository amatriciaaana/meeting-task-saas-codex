# Data Model

## Core Tables

### users

- id
- email
- name
- created_at

### workspaces

- id
- name
- owner_user_id
- plan
- created_at

### workspace_members

- id
- workspace_id
- user_id
- role

### meetings

- id
- workspace_id
- title
- meeting_type
- status
- source_type
- scheduled_at
- created_by
- created_at

### meeting_assets

- id
- meeting_id
- asset_type
- storage_key
- mime_type
- duration_sec

### transcripts

- id
- meeting_id
- raw_text
- normalized_text
- language
- created_at

### summaries

- id
- meeting_id
- summary_text
- decisions_text
- open_questions_text
- model_name
- created_at

### tasks

- id
- meeting_id
- title
- description
- assignee_name
- due_date
- status
- source
- confidence

### integrations

- id
- workspace_id
- provider
- access_token_ref
- created_at

### billing_subscriptions

- id
- workspace_id
- stripe_customer_id
- stripe_subscription_id
- plan
- status

## Notes

- transcript と summary は再生成できるよう履歴を残す
- task は AI 生成と手動作成を区別する
- token や webhook secret は DB に平文保存しない
