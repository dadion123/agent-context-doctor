# Agent Context Doctor PRD

## Problem

AI coding agents rely on repository context files such as `AGENTS.md`, `CLAUDE.md`, Cursor rules, and Copilot instructions. These files are easy to create but hard to keep clean. They drift away from `README.md`, `package.json`, `.env.example`, and maintainer workflows.

Japanese OSS maintainers have an additional problem: public guidance is increasing, but practical Japanese-first doctor tooling is still thin.

## Product

Agent Context Doctor is a doctor-first CLI that scans repository context files, scores their health, detects drift, and proposes safe dry-run fixes.

Initial public identity:

- GitHub repository: `dadion123/agent-context-doctor`
- npm package: `agent-context-doctor`

## Primary Users

- Japanese OSS maintainers
- Maintainers using Codex, Claude Code, Cursor, and GitHub Copilot together
- Teams that want CI checks for agent context drift

## Non-Goals For MVP

- LLM API dependency
- Large template generation
- Full automatic rewriting of every context file
- Reading or printing `.env` contents
- Runtime guardrails for code execution

## Success Criteria

- `pnpm dev -- scan .` works locally
- `acd scan . --json` has stable report shape
- 10-15 deterministic checks are implemented
- Dry-run patch plan exists before any autofix
- Japanese-first positioning is clear in README and docs
