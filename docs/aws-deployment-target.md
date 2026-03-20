# AWS Deployment Target

## Recommendation

最初の AWS デプロイ先は `ECS Fargate` を推奨する。

理由:

- Docker 化済みの Next.js アプリをそのまま載せやすい
- 将来 worker を別 service に切り出しやすい
- RDS for PostgreSQL と自然に組み合わせられる
- App Runner より構成自由度が高い

## Recommended Initial Architecture

- App runtime: ECS Fargate
- Load balancer: ALB
- Database: Amazon RDS for PostgreSQL
- Secrets: AWS Secrets Manager
- Container registry:
  - first stage: GHCR
  - later option: ECR
- Static / uploads:
  - S3 for future meeting assets

## Why Not Start With App Runner

- simpler ではあるが、将来 worker 分離や VPC 制御を強めると物足りなくなりやすい
- このプロジェクトは auth, db, worker, queue に伸びるので ECS のほうが収まりがよい

## Why Not Lambda First

- Next.js standalone をコンテナ運用したほうが素直
- session, Prisma, PostgreSQL 接続を考えると常駐コンテナのほうが扱いやすい

## First AWS Milestones

1. ECS task definition を作成
2. ALB + target group を作成
3. RDS for PostgreSQL を作成
4. Secrets Manager に `DATABASE_URL` を登録
5. ECS service から secret 注入
6. `/api/health` を ALB health check に設定
7. GHCR or ECR から image pull

## CD Evolution Path

### Stage 1

- GitHub Actions CD で image build + push

### Stage 2

- ECS deploy job を GitHub Actions に追加

### Stage 3

- separate worker service
- queue / Redis
- blue/green deploy

## Required AWS Inputs Before ECS Deploy Workflow

- AWS account ID
- AWS region
- ECS cluster name
- ECS service name
- task definition file
- IAM role for GitHub OIDC
- execution role and task role
