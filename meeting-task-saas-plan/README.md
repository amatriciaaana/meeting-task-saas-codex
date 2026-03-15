# Meeting Task SaaS Plan

## Product

会議音声またはテキストメモを入力すると、以下を自動生成する Web アプリ。

- 要約
- 決定事項
- 未決事項
- 担当者付きタスク
- Slack / Notion / Google Calendar 連携用の出力

想定ユーザーは 5 名から 100 名規模のチームを持つ中小企業、受託会社、スタートアップ。

## Why This

- 会議後の議事録整理は頻度が高く、継続課金に向く
- タスク化まで含めると「便利」ではなく「業務必須」に寄せやすい
- 日本語対応、連携、権限管理で差別化しやすい
- B2B のため単価を上げやすい

## Monetization

- Free
  - 月 10 会議まで
  - 参加者 3 名まで
  - 連携 1 つまで
- Pro
  - 月額 2,980 円から
  - 会議数拡大
  - Slack / Notion 連携
  - 高精度テンプレート
- Team
  - 月額 12,800 円から
  - ワークスペース共有
  - 権限管理
  - 監査ログ
  - CSV / API 出力
- Enterprise
  - SSO
  - 保存期間制御
  - モデル選択
  - 専用サポート

## MVP

初期リリースでは以下に絞る。

- ユーザー登録 / ログイン
- 会議作成
- テキスト議事録入力
- 音声ファイルアップロード
- 文字起こし
- 要約 / 決定事項 / タスク抽出
- タスク編集
- Slack 送信
- 会議一覧 / 詳細
- 料金プランの課金導線

## Tech Direction

- Frontend / BFF: TypeScript
- Backend API: TypeScript から開始
- 高負荷処理: 必要時に Go へ切り出し

理由:

- MVP は TypeScript で最速に出せる
- UI と API の開発速度が高い
- 後から音声処理キューや集計を Go に分離しやすい

詳細は `architecture.md` と `design.md` を参照。
