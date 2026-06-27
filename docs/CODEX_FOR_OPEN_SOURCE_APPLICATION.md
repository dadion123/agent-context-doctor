# Codex For Open Source Application Evidence

Agent Context Doctor is a doctor-first CLI for keeping AI coding agent context files clean, minimal, consistent, and safe.

## Public Artifacts

- Public repository: `https://github.com/dadion123/agent-context-doctor`
- npm package: `https://www.npmjs.com/package/agent-context-doctor`
- Initial release: `https://github.com/dadion123/agent-context-doctor/releases/tag/v0.1.0`
- Current release: `https://github.com/dadion123/agent-context-doctor/releases/tag/v0.2.0`
- CLI names: `agent-context-doctor`, `acd`
- License: MIT

## Verified Usage Evidence

- `agent-context-doctor@0.1.0` is published on npm.
- `agent-context-doctor@0.1.1` is published on npm and tagged as `latest`.
- `agent-context-doctor@0.1.1` includes GitHub annotations, README `.env.example` safe fix, Japanese fixture docs, and Codex application evidence.
- `agent-context-doctor@0.2.0` is published on npm and tagged as `latest`.
- `agent-context-doctor@0.2.0` adds SARIF output for Code Scanning and other SARIF consumers.
- GitHub Release `v0.2.0`: `https://github.com/dadion123/agent-context-doctor/releases/tag/v0.2.0`
- `npx agent-context-doctor@latest --version` was verified after publication.
- `npx agent-context-doctor@latest scan . --json` was verified after publication.
- GitHub Action `dadion123/agent-context-doctor@v0.1.0` was verified from a separate fixture repository.
- GitHub Action `dadion123/agent-context-doctor@v0.1.1` was verified from a separate fixture repository.
- GitHub Action `dadion123/agent-context-doctor@v0.2.0` supports SARIF output with `sarif: "true"`.
- Fixture run `28288986156` completed successfully with `Score: 100/100`.
- Public drift fixture: `https://github.com/dadion123/agent-context-doctor-drifted-fixture`
- Public drift fixture run `28290907857` completed with expected failure after SARIF upload succeeded.
- Public drift fixture score: `52/100`.
- Public drift fixture created 8 open Code Scanning alerts from SARIF.
- Public drift fixture evidence: `docs/DRIFT_FIXTURE_EVIDENCE.md`
- Public repo CI run `28289035608` completed successfully after Action docs and TODO updates.
- Public repo CI run `28290493593` completed successfully for the `v0.2.0` SARIF implementation.
- Main branch includes a Japanese-first fixture at `examples/japanese-first-repo`.
- Main branch includes GitHub annotation formatting for `acd ci`.
- Main branch includes SARIF formatting for `acd scan` and `acd ci`.

## Why This Fits Codex For Open Source

Codex adoption depends on maintainers giving agents accurate repository context. Agent Context Doctor focuses on maintaining that context after the first file is created.

The project is aligned with Codex for Open Source because it:

- improves `AGENTS.md` quality without requiring an LLM API
- detects drift between `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, README, and package scripts
- warns about unsafe automatic execution instructions
- protects secret boundaries by avoiding `.env` reads and output
- supports Japanese-first maintainers with Japanese text reports
- gives OSS maintainers a CI gate for context health
- can surface AI-context drift through GitHub annotations and SARIF-based Code Scanning

## Safety Model

- Deterministic checks first.
- `fix` is dry-run first.
- File writes require explicit `--apply`.
- `.env` contents are not read or printed.
- Current low-risk autofixes are limited to:
  - adding `.env` to `.gitignore`
  - adding a generic `.env.example` setup note to README

## Current Differentiation

- Doctor-first rather than generator-first.
- Japanese-first user experience.
- Cross-file drift detection.
- Safe patch plan before autofix.
- CI-friendly output, including GitHub annotations for warnings and failures.
- SARIF output for Code Scanning.
- Maintainer workflow checks for release, PR review, and issue triage evidence.

## Next Evidence To Build

1. Collect feedback from Japanese OSS maintainers.
2. Add more fixture repositories for bloated and monorepo contexts.
3. Polish Japanese Zenn / Qiita launch articles with the `v0.2.0` evidence links.

## Submission Narrative Draft

Agent Context Doctor helps open-source maintainers keep AI coding agent instructions accurate after the first `AGENTS.md` or `CLAUDE.md` file is created. The project is intentionally doctor-first rather than generator-first: it scans existing repository context, scores drift, flags unsafe or stale instructions, and proposes low-risk fixes without requiring an LLM API.

The current MVP supports `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, README setup notes, package scripts, `.env.example`, and `.gitignore`. It is designed for CI use through `acd ci`, GitHub Actions annotations, JSON output, and SARIF output for Code Scanning. This gives maintainers visible evidence when agent context has drifted from real project commands or safety boundaries.

The project has a Japanese-first maintainer focus. Japanese reports are available through `--locale ja`, and the roadmap prioritizes Japanese OSS maintainers who are adopting Codex, Claude Code, Cursor, and Copilot while needing safer context hygiene.
