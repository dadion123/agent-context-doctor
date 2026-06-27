# Codex For Open Source Strategy

## Fit

Agent Context Doctor fits Codex for Open Source because it helps maintainers keep repository instructions accurate for Codex and other coding agents.

Public repository: `dadion123/agent-context-doctor`

npm package: `agent-context-doctor`

The strongest application angle is not "another AGENTS.md generator." It is:

> A maintainer workflow tool that keeps AI coding context clean, short, consistent, and safe across common agent surfaces.

## Evidence To Build

- More real repositories scanned
- Issues created from detected context drift
- PRs where `acd scan` prevented stale instructions
- Japanese OSS maintainer feedback
- Contributions to adjacent tools or specs

## Evidence Already Built

- Public repository exists: `https://github.com/dadion123/agent-context-doctor`
- npm package exists: `https://www.npmjs.com/package/agent-context-doctor`
- GitHub release exists: `v0.1.0`
- GitHub release exists: `v0.1.1`
- `v0.1.1` packages GitHub annotations, README `.env.example` safe fix, Japanese fixture docs, and Codex application evidence.
- `v0.2.0` scope adds SARIF output and Code Scanning integration docs.
- GitHub Action was verified from an external fixture repository.
- Deterministic checks run without LLM API dependency.
- Japanese report output exists via `--locale ja` and `--jp`.
- CI annotations exist for GitHub Actions warnings and failures.
- SARIF output exists for Code Scanning and other SARIF consumers.
- Japanese-first fixture exists under `examples/japanese-first-repo`.
- Safe fixes cover `.gitignore` `.env` protection and README `.env.example` setup notes.

## Features That Strengthen The Application

- `acd ci` with JSON, GitHub annotations, and SARIF
- Rule documentation with before/after examples
- Safe patch plans
- Public examples for bloated and drifted agent contexts
- Japanese and English docs
- Clear maintainer-focused README

## Near-Term Actions

1. Publish `v0.2.0` with SARIF output.
2. Add a public drifted fixture with annotation and SARIF evidence.
3. Finish the Japanese launch articles.
4. Open small PRs or issues in adjacent projects with concrete compatibility notes.
5. Collect feedback from Japanese OSS maintainers.
