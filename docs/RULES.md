# Rules

Agent Context Doctor starts with deterministic rules. Missing evidence creates warnings; it does not prove a maintainer is wrong.

| Rule ID | Purpose | Default Severity |
| --- | --- | --- |
| `readme-found` | Check whether `README.md` exists. | warn |
| `package-json-found` | Check whether `package.json` exists. | warn |
| `agents-exists` | Check whether `AGENTS.md` exists. | fail |
| `claude-exists` | Check whether `CLAUDE.md` exists. | warn |
| `agent-claude-overlap` | Warn when `AGENTS.md` and `CLAUDE.md` are highly duplicated. | warn |
| `agent-claude-command-drift` | Detect command drift between `AGENTS.md` and `CLAUDE.md`. | warn |
| `agents-length` | Warn when `AGENTS.md` is longer than the MVP target. | warn |
| `context-bloat` | Warn when `AGENTS.md` reaches 200+ lines. | warn |
| `readme-agents-setup-drift` | Compare README setup commands with `AGENTS.md`. | warn |
| `package-scripts-mentioned` | Check whether important package scripts are mentioned in AI context. | warn |
| `env-example-mentioned` | Check whether `.env.example` is documented. | warn |
| `env-gitignore` | Check whether `.env` is ignored when present. | fail |
| `cursor-role-split` | Check whether Cursor rules role split is documented. | warn |
| `copilot-drift` | Detect command drift between Copilot instructions and `AGENTS.md`. | warn |
| `dangerous-auto-instructions` | Warn on risky automatic execution guidance. | warn |
| `maintainer-workflow` | Check release, PR review, and issue triage guidance. | warn |
| `japanese-language-instruction` | Check language guidance for Japanese-first repositories. | warn |

## Rule Design Principles

- Rules should be explainable without an LLM.
- A rule should point to a maintainer action, not just complain.
- Fixes must be narrower than diagnostics.
- The CLI must not print secrets or `.env` contents.
- Japanese-first repositories should get natural Japanese guidance.

## First Autofix

`env-gitignore` can produce the first low-risk autofix:

```bash
acd fix . --apply
```

It appends `.env` to an existing `.gitignore` only when a local `.env` path exists and `.env` is not already ignored.
