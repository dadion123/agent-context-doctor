# Agent Context Doctor

[![CI](https://github.com/dadion123/agent-context-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/dadion123/agent-context-doctor/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/agent-context-doctor.svg)](https://www.npmjs.com/package/agent-context-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Doctor-first CLI for keeping `AGENTS.md`, `CLAUDE.md`, Cursor rules, and Copilot instructions clean, minimal, consistent, and safe.

日本語README: [README.ja.md](README.ja.md)

Agent Context Doctor は、Codex / Claude Code / Cursor / GitHub Copilot などのAIコーディングエージェントに渡すリポジトリ文脈を診断・整理するOSS CLIです。特に日本語ユーザー・日本語OSSメンテナーが、AI向け設定ファイルを安全に運用できる状態を目指します。

## JP-First Maintainer UX

This project keeps English public metadata for discovery, but the product direction is explicitly Japanese-first.

- Japanese reports are available with `--locale ja` or `--jp`.
- Japanese OSS maintainers are a primary audience, not an afterthought.
- The tool focuses on diagnosis, score, drift evidence, and safe patch plans before generation.
- It avoids LLM API dependency in the MVP, so CI can run deterministic checks without sending repository content to a model.

## Install

```bash
npm install -D agent-context-doctor
npx agent-context-doctor scan .
```

You can also run it without installing:

```bash
npx agent-context-doctor@latest scan . --locale ja
npx agent-context-doctor@latest ci . --min-score 80
npx agent-context-doctor@latest ci . --sarif --output agent-context-doctor.sarif
```

## What It Diagnoses

MVPでは、次のようなファイルを横断してチェックします。

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

## Why Doctor-First

AI agent context files are easy to generate and easy to let drift. A large generated file can become stale, duplicated, or unsafe before maintainers notice.

Agent Context Doctor starts from a different assumption:

- Generate less; diagnose first.
- Keep agent context short enough to stay useful.
- Detect drift between README, package scripts, `AGENTS.md`, `CLAUDE.md`, Cursor rules, and Copilot instructions.
- Prefer dry-run patch plans before changing files.
- Keep secret boundaries clear. The CLI must not print `.env` contents.

## MVP Commands

```bash
pnpm install
pnpm dev -- scan .
pnpm dev -- scan . --json
pnpm dev -- score .
pnpm dev -- fix . --dry-run
pnpm dev -- fix . --apply
pnpm dev -- sync . --dry-run
pnpm dev -- ci .
```

The package exposes both CLI names:

```bash
npx agent-context-doctor scan .
acd scan .
agent-context-doctor scan .
```

## Example Output

```txt
Agent Context Doctor
Repository: .
Score: 72/100
Checks:
✓ README.md found.
✓ package.json found.
✗ AGENTS.md not found.
⚠ CLAUDE.md found but no AGENTS.md adapter.
⚠ .env.example exists but README.md / AI context does not mention it.
⚠ package.json has important scripts that AI context files do not mention.
✓ .env is ignored by .gitignore.
Suggested next steps:
1. Create a concise AGENTS.md from detected project facts.
2. Add a short setup note for copying .env.example without exposing secrets.
3. Add test/build/lint/dev commands to AGENTS.md or CLAUDE.md.
```

## Value For Japanese Users

- 日本語のREADME・運用ドキュメントを前提に診断できるCLIに育てます。
- `AGENTS.md` と `CLAUDE.md` の二重管理、Cursor rulesとの役割分担、Copilot instructionsとのズレを見つけます。
- 日本語repoでは、AIエージェントへの言語指示が明確かをチェックします。
- Zenn / Qiitaで増えている「AIコーディング運用の実務知」に対して、実際に使えるdoctorを提供します。

## Value For Open Source Maintainers

- PRレビュー、Issue triage、リリース手順がAI contextに残っているかを確認します。
- `package.json` scripts とAI指示ファイルのズレを検出します。
- `.env.example` と `.gitignore` の境界を確認します。
- CIで `acd ci` を実行し、context driftを早期に見つける導線を作ります。

## Safe Fixes

`fix` is dry-run first. It prints a patch plan unless `--apply` is explicit.

```bash
acd fix . --dry-run
acd fix . --apply
```

Current low-risk autofixes:

- append `.env` to an existing `.gitignore` when a local `.env` file exists and is not clearly ignored
- append a short `.env.example` setup note to an existing `README.md` when `.env.example` is present but undocumented

The CLI does not read or print `.env` contents.

## Japanese Reporter

```bash
pnpm dev -- scan . --locale ja
pnpm dev -- scan . --jp
```

JSON output stays stable for automation:

```bash
pnpm dev -- scan . --json
```

## GitHub Actions

See [docs/GITHUB_ACTION.md](docs/GITHUB_ACTION.md) for CI usage.

```yaml
- uses: dadion123/agent-context-doctor@v0.2.0
  with:
    path: "."
    min-score: "80"
    locale: "ja"
    sarif: "true"
    sarif-output: "agent-context-doctor.sarif"
```

The composite action has been verified from an external fixture repository. See [docs/ACTION_FIXTURE_VALIDATION.md](docs/ACTION_FIXTURE_VALIDATION.md).

`acd ci` emits GitHub annotations for warnings and failures while keeping `--json` output clean for machines.

SARIF output is available for GitHub Code Scanning and other code scanning surfaces. See [docs/SARIF.md](docs/SARIF.md).

## Rule Reference

See [docs/RULES.md](docs/RULES.md) for rule IDs, scope, and severity.

## JSON Contract

See [docs/JSON_SCHEMA.md](docs/JSON_SCHEMA.md) for the current JSON report shape.

## SARIF Output

See [docs/SARIF.md](docs/SARIF.md) for `--sarif`, `--output`, and GitHub `upload-sarif` usage.

## Examples

- [examples/minimal-repo](examples/minimal-repo)
- [examples/bloated-context-repo](examples/bloated-context-repo)
- [examples/drifted-context-repo](examples/drifted-context-repo)
- [examples/japanese-first-repo](examples/japanese-first-repo)

## Contributing And Security

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [docs/TODO.md](docs/TODO.md)
- [docs/ACTION_FIXTURE_VALIDATION.md](docs/ACTION_FIXTURE_VALIDATION.md)
- [docs/DRIFT_FIXTURE_EVIDENCE.md](docs/DRIFT_FIXTURE_EVIDENCE.md)
- [docs/CODEX_FOR_OPEN_SOURCE_APPLICATION.md](docs/CODEX_FOR_OPEN_SOURCE_APPLICATION.md)
- [docs/CODEX_FOR_OPEN_SOURCE_SUBMISSION.md](docs/CODEX_FOR_OPEN_SOURCE_SUBMISSION.md)
- [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
- [docs/SARIF.md](docs/SARIF.md)

## Package And Repository

- GitHub repository: `dadion123/agent-context-doctor`
- npm package: `agent-context-doctor`

## Initial Rules

The MVP starts with deterministic checks:

- `README.md` exists
- `package.json` exists
- `AGENTS.md` exists
- `CLAUDE.md` exists
- `AGENTS.md` / `CLAUDE.md` overlap is not too high
- `AGENTS.md` / `CLAUDE.md` command drift
- `AGENTS.md` length warning
- 200+ line context bloat warning
- README / AGENTS setup drift
- package scripts mentioned in AI context
- `.env.example` documented
- `.env` ignored by `.gitignore`
- Cursor rules role split documented
- Copilot instructions command drift
- dangerous automatic execution guidance
- release / PR review / issue triage guidance
- Japanese repo language instruction

## Roadmap

- Text and JSON reporters
- Safer patch plans for low-risk fixes
- Japanese and English report messages
- GitHub Action wrapper
- SARIF output for code scanning surfaces
- README / AGENTS / CLAUDE sync suggestions
- Rule presets for `jp-minimal`, `oss-maintainer`, and `monorepo`
- Public drifted fixture with annotation and SARIF evidence
- Documentation for Codex for Open Source maintainers

## License

MIT
