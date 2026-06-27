# Agent Context Doctor

`AGENTS.md` / `CLAUDE.md` / Cursor rules / Copilot instructions を、短く・安全に・ズレなく保つための doctor-first CLI です。

Agent Context Doctor は、AIコーディングエージェント向けの設定ファイルを「生成して終わり」にせず、継続的に診断・採点・差分検出・安全な修正提案を行うことを目的にしています。

## なぜ doctor-first なのか

AI向けcontextは、最初に作ることよりも、後からズレることの方が問題になりやすいです。

- READMEの手順と `AGENTS.md` の手順が違う
- `AGENTS.md` と `CLAUDE.md` が二重管理になっている
- Cursor rulesだけが更新され、他のAI向け文脈が古くなる
- `.env.example` はあるのに説明がない
- `.env` が `.gitignore` で守られていない
- AIに危険な自動実行を許す指示が混ざる

このCLIは、巨大なテンプレートを出すより先に、今のrepoに何が足りないかを見つけます。

## 使い方

```bash
pnpm install
pnpm dev -- scan .
pnpm dev -- scan . --locale ja
pnpm dev -- scan . --json
pnpm dev -- fix . --dry-run
pnpm dev -- fix . --apply
pnpm dev -- ci .
```

将来的な公開後は以下の形を想定しています。

```bash
npx agent-context-doctor scan .
acd scan .
acd scan . --locale ja
acd ci . --min-score 80
```

## パッケージとリポジトリ

- GitHub repository: `dadion123/agent-context-doctor`
- npm package: `agent-context-doctor`

## 診断対象

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md`
- `README.md`
- `docs/**/*.md`
- `.env.example`
- `.gitignore`
- `package.json`
- GitHub Actions workflow

## safe fix の方針

`fix` は dry-run first です。ファイルを書き換えるには `--apply` が必要です。

現在の自動修正は、`.env` が存在し、既存の `.gitignore` に `.env` が入っていない場合に、`.gitignore` へ `.env` を追記するだけです。

`.env` の中身は読み上げません。JSON出力にも含めません。

## 日本語ユーザー向けの価値

- 日本語repoで、AIへの言語指示が明確か確認できます。
- `AGENTS.md` / `CLAUDE.md` / Cursor rules の役割分担を診断できます。
- 日本語OSSメンテナーが、PRレビュー・Issue triage・リリース作業でAIを安全に使いやすくなります。
- Zenn / Qiitaで語られている運用知を、CLIの診断ルールとして育てられます。

## 関連ドキュメント

- [MVP Spec](docs/MVP_SPEC.md)
- [Rules](docs/RULES.md)
- [JSON Report Contract](docs/JSON_SCHEMA.md)
- [GitHub Action Usage](docs/GITHUB_ACTION.md)
- [Roadmap](docs/ROADMAP.md)
- [TODO](docs/TODO.md)
- [Codex For Open Source Strategy](docs/CODEX_FOR_OSS_STRATEGY.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)

## ライセンス

MIT
