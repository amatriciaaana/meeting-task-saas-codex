# DB Architecture

## Decision

このプロジェクトの DB は PostgreSQL を採用する。

初期構成:

- Local: PostgreSQL in Docker
- App ORM: Prisma
- Production first stage: Amazon RDS for PostgreSQL
- Production growth stage: Amazon Aurora PostgreSQL

## Why PostgreSQL

- meeting, transcript, summary, task, workspace の関係が強い
- JOIN とトランザクションが必要
- 集計、検索、並び替え、将来の分析に向く
- TypeScript + Prisma と相性が良い
- AWS 上でも移行先が明確

## Environments

### Local

- Docker container で PostgreSQL を起動
- アプリは `DATABASE_URL` を使って接続
- Prisma migration をローカルで適用

### Staging / Production

初期:

- Amazon RDS for PostgreSQL
- private subnet 配置
- アプリからのみ接続
- 自動バックアップ有効

将来:

- Aurora PostgreSQL
- reader endpoint
- 高可用性
- 必要に応じて serverless v2

## Initial Schema Scope

最初は `meetings` のみ永続化する。

後続で追加する候補:

- workspaces
- users
- workspace_members
- meeting_assets
- transcripts
- summaries
- tasks
- integrations
- billing_subscriptions

## Table Design: meetings

```sql
create table meetings (
  id text primary key,
  title varchar(100) not null,
  meeting_type varchar(32) not null,
  status varchar(32) not null,
  scheduled_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);
```

## Prisma Mapping

`Meeting` model を Prisma schema に定義し、アプリの API から直接利用する。

型対応:

- `meeting_type` -> enum
- `status` -> enum
- `scheduled_at` -> `DateTime`
- `created_at` -> `DateTime`

## Access Pattern

初期アクセス:

- list meetings ordered by scheduled_at desc
- create meeting
- get meeting by id

将来アクセス:

- workspace 単位で絞り込み
- status フィルタ
- full text search
- transcript / task join

## Connection Strategy

App server では Prisma Client を singleton 化する。

理由:

- dev 環境のホットリロードで接続を増やしすぎない
- server runtime で再利用しやすい

## Migration Strategy

- schema 変更は Prisma migration で管理
- ローカルで migration 作成
- CI / deploy 時に migration deploy

## AWS Direction

### Start with RDS for PostgreSQL

理由:

- MVP には十分
- 運用が読みやすい
- コストを抑えやすい

### Move to Aurora PostgreSQL when

- read traffic が増える
- 可用性要件が強くなる
- 分析や統合で接続数が増える
- グローバル展開が必要になる

## Secrets

以下は環境変数管理する。

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`

本番では Secrets Manager か Parameter Store に置く。

## Backup / Recovery

ローカル:

- バックアップ不要

本番:

- automated backups
- point-in-time recovery
- snapshot 運用

## Next Steps

1. Prisma 導入
2. Docker Compose で local postgres 追加
3. Meeting model 作成
4. migration 作成
5. API を Prisma 経由に差し替え
