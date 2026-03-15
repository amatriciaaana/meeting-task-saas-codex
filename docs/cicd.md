# CI/CD

## Goal

- CI: every push and pull request should run install, prisma generate, typecheck, unit tests, and build
- CD: every push to `main` should build a container image and optionally deploy to AWS ECS

## CI

Workflow:

- `.github/workflows/ci.yml`

Checks:

- `pnpm install --frozen-lockfile`
- `pnpm db:generate`
- `pnpm typecheck`
- `pnpm test:unit`
- `pnpm build`

## CD

Workflow:

- `.github/workflows/cd.yml`

Behavior:

- builds Docker image from repo root
- pushes image to GHCR
- treats image publication on `main` as the first CD stage
- keeps AWS deployment as a follow-up step once ECS task definition details are fixed

## Container Notes

- health check endpoint: `/api/health`
- app listens on port `3000`
- Next.js standalone output is enabled

## Recommended AWS Target

- runtime: ECS Fargate
- image registry: GHCR or ECR
- database: Amazon RDS for PostgreSQL
- secrets: AWS Secrets Manager

## First-Time Setup

1. Push `pnpm-lock.yaml`
2. Enable GitHub Actions
3. Confirm CI succeeds on pull requests
4. Confirm CD can push image to GHCR on `main`
5. Prepare ECS task definition with container name `web`
6. Add AWS deploy workflow after task definition and IAM details are fixed
