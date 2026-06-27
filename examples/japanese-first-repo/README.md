# 日本語OSSサンプル

日本語メンテナーがAIコーディングエージェントを安全に使うためのfixtureです。

## セットアップ

```bash
pnpm install
pnpm test
pnpm build
pnpm lint
```

## 環境変数

`.env.example` を `.env` にコピーし、ローカル値を設定します。
`.env` はcommitしません。

## メンテナー作業

- PRレビューでは変更理由とテスト結果を確認します。
- Issue triageでは再現手順と期待動作を確認します。
- リリースはCI成功後に行います。

