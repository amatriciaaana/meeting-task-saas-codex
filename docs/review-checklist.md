# Review Checklist

## Current Validation Status

ローカルでは以下を確認済み。

- `corepack pnpm typecheck`
- `corepack pnpm test:unit`
- `corepack pnpm build`

補足:

- CI workflow は PR ブランチに追加された直後のため、GitHub 側の workflow 一覧にはまだ登録されていない
- workflow は `main` に入った時点で通常運用に乗る

## Review Focus

### 1. Auth / Authorization

- login が username + password で動くか
- admin と general の権限制御が合っているか
- 自己削除禁止
- 自己 admin 権限解除禁止
- 5 回失敗で lock されるか

### 2. User Management

- admin が user create/update/delete を実行できるか
- admin が他者 password change/reset/unlock を実行できるか
- general は自分の profile edit と password change のみ可能か

### 3. Persistence

- meetings が PostgreSQL に保存されるか
- users / sessions の migration が意図どおりか

### 4. Security

- raw SQL を使っていないか
- malformed JSON で `400` が返るか
- security headers が付与されるか
- local credentials file が Git 対象外か

### 5. CI/CD

- `pnpm-lock.yaml` が追跡対象になっているか
- Docker image がビルド可能か
- `output: standalone` が効いているか
- `/api/health` が利用できるか
