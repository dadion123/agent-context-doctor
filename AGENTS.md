# Agent Notes

Agent Context Doctor is a TypeScript / Node.js CLI. Keep changes small, deterministic, and safe by default.

Public identity:

- GitHub repository: `dadion123/agent-context-doctor`
- npm package: `agent-context-doctor`

## Commands

- Install: `pnpm install`
- Test: `pnpm test`
- Build: `pnpm build`
- Dev scan: `pnpm dev -- scan .`
- JSON scan: `pnpm dev -- scan . --json`
- Built CLI scan: `pnpm start -- scan .`
- CI scan: `pnpm start -- ci . --min-score 80`

## Product Direction

- This project is doctor-first, not generator-first.
- Prefer deterministic checks before LLM-assisted features.
- Keep `AGENTS.md` short and move long explanations into `docs/`.
- Default to dry-run plans for fixes; require explicit user intent before writing.
- Never print `.env` contents or secrets.
- User-facing explanations should be Japanese by default when working with Japanese users.

## Maintainer Workflow

- PR review should focus on behavior, safety, and tests.
- Issue triage should separate bugs, rule ideas, docs gaps, and ecosystem compatibility requests.
- Release work should confirm tests, build output, README examples, and package metadata before external publication.
