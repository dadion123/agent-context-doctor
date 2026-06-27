# Codex For Open Source Application Evidence

Agent Context Doctor is a doctor-first CLI for keeping AI coding agent context files clean, minimal, consistent, and safe.

## Public Artifacts

- Public repository: `https://github.com/dadion123/agent-context-doctor`
- npm package: `https://www.npmjs.com/package/agent-context-doctor`
- Initial release: `https://github.com/dadion123/agent-context-doctor/releases/tag/v0.1.0`
- Current release target: `v0.1.1`
- CLI names: `agent-context-doctor`, `acd`
- License: MIT

## Verified Usage Evidence

- `agent-context-doctor@0.1.0` is published on npm.
- `agent-context-doctor@0.1.1` includes GitHub annotations, README `.env.example` safe fix, Japanese fixture docs, and Codex application evidence.
- `npx agent-context-doctor@latest --version` was verified after publication.
- `npx agent-context-doctor@latest scan . --json` was verified after publication.
- GitHub Action `dadion123/agent-context-doctor@v0.1.0` was verified from a separate fixture repository.
- Fixture run `28288986156` completed successfully with `Score: 100/100`.
- Public repo CI run `28289035608` completed successfully after Action docs and TODO updates.
- Main branch includes a Japanese-first fixture at `examples/japanese-first-repo`.
- Main branch includes GitHub annotation formatting for `acd ci`.

## Why This Fits Codex For Open Source

Codex adoption depends on maintainers giving agents accurate repository context. Agent Context Doctor focuses on maintaining that context after the first file is created.

The project is aligned with Codex for Open Source because it:

- improves `AGENTS.md` quality without requiring an LLM API
- detects drift between `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, README, and package scripts
- warns about unsafe automatic execution instructions
- protects secret boundaries by avoiding `.env` reads and output
- supports Japanese-first maintainers with Japanese text reports
- gives OSS maintainers a CI gate for context health

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
- Maintainer workflow checks for release, PR review, and issue triage evidence.

## Next Evidence To Build

1. Add GitHub annotations screenshots or logs from a deliberately drifted fixture.
2. Add SARIF output for code scanning surfaces.
3. Publish bilingual release notes for the next release.
4. Collect feedback from Japanese OSS maintainers.
5. Add more fixture repositories for bloated and drifted contexts.
