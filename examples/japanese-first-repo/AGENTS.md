# AGENTS.md

このrepoでは、ユーザー向け説明は日本語で書いてください。

## コマンド

- Install: `pnpm install`
- Test: `pnpm test`
- Build: `pnpm build`
- Lint: `pnpm lint`

## 安全ルール

- `.env` の中身を読んだり表示したりしないでください。
- commit / push / publish / release はメンテナー確認後に行ってください。

## メンテナー作業

- PR reviewではテスト結果と差分の意図を確認します。
- Issue triageでは再現手順を確認します。
- ReleaseはCI成功後に行います。

