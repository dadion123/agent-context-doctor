# Codex For Open Source Submission Draft

## Project

Agent Context Doctor

## Repository

https://github.com/dadion123/agent-context-doctor

## Package

https://www.npmjs.com/package/agent-context-doctor

## One-Line Summary

Agent Context Doctor is a doctor-first CLI that helps open-source maintainers keep AI coding agent context files clean, minimal, consistent, and safe.

## Short Application Narrative

Agent Context Doctor helps maintainers keep repository instructions accurate for Codex and other AI coding agents after the first `AGENTS.md`, `CLAUDE.md`, Cursor rule, or Copilot instruction file is created.

The project is intentionally doctor-first rather than generator-first. It scans existing repository context, scores context health, detects drift across AI-agent instruction files, README setup notes, package scripts, `.env.example`, and `.gitignore`, and proposes low-risk fixes without requiring an LLM API.

This matters for open source because agent context can silently become stale: README setup commands change, package scripts drift, Cursor rules and `AGENTS.md` disagree, or `.env.example` exists without safe setup guidance. Agent Context Doctor turns those failures into deterministic CI signals.

The current release supports:

- `acd scan`
- `acd score`
- `acd fix --dry-run`
- `acd fix --apply` for low-risk fixes
- `acd sync --dry-run`
- `acd ci`
- JSON output
- GitHub Actions annotations
- SARIF output for GitHub Code Scanning
- Japanese text reports with `--locale ja`

The project has a Japanese-first maintainer focus. Japanese OSS maintainers are already adopting Codex, Claude Code, Cursor, and Copilot, but the tooling around context hygiene is still thin. Agent Context Doctor aims to give those maintainers a deterministic, CI-friendly, safety-conscious way to keep AI-agent context useful.

## Evidence

- Public repo: `https://github.com/dadion123/agent-context-doctor`
- npm latest: `agent-context-doctor@0.2.0`
- GitHub Release: `https://github.com/dadion123/agent-context-doctor/releases/tag/v0.2.0`
- Main repo CI success: `https://github.com/dadion123/agent-context-doctor/actions/runs/28290997210`
- Public drift fixture: `https://github.com/dadion123/agent-context-doctor-drifted-fixture`
- Public drift fixture run: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/actions/runs/28290907857`
- Public drift fixture score: `52/100`
- SARIF upload from fixture: succeeded
- Code Scanning alerts from fixture: 8 open alerts

## Why Codex For Open Source Fits

Codex becomes more useful when repositories provide concise, accurate, up-to-date context. Agent Context Doctor directly improves that layer. It is not an LLM wrapper; it is deterministic infrastructure around the files that help agents work safely in open-source repositories.

Support from Codex for Open Source would help push the project from MVP into a useful maintainer tool by funding:

- more deterministic rules for real repositories
- safer patch plans for common context drift
- better Japanese and English documentation
- public examples and fixtures for maintainer workflows
- compatibility guidance for Codex, Claude Code, Cursor, and Copilot
- feedback collection from Japanese OSS maintainers

## Japanese Summary

Agent Context Doctor は、Codex / Claude Code / Cursor / GitHub Copilot などの AI コーディングエージェントに渡す repository context を診断する doctor-first CLI です。

`AGENTS.md` や `CLAUDE.md` を生成して終わりにするのではなく、README、package scripts、Cursor rules、Copilot instructions、`.env.example`、`.gitignore` とのズレを継続的に検出します。CI では GitHub annotations と SARIF / Code Scanning に対応し、日本語 maintainer 向けには `--locale ja` のレポートを提供します。

日本語 OSS maintainer が AI coding agent を安全に使うための、軽量で決定的な context health check として育てます。
