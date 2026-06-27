# MVP Spec

## Commands

- `acd scan [path]`
- `acd scan [path] --json`
- `acd scan [path] --locale ja`
- `acd score [path]`
- `acd fix [path] --dry-run`
- `acd fix [path] --apply`
- `acd sync [path] --dry-run`
- `acd ci [path] --min-score 70`

## Files In Scope

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md`
- `README.md`
- `docs/**/*.md`
- `.env.example`
- `.gitignore`
- `package.json`
- `.github/workflows/*.{yml,yaml}`

## Safety Rules

- Do not print `.env` contents.
- Do not modify files unless a future command explicitly applies a low-risk patch.
- `fix` must be dry-run first unless `--apply` is explicit.
- Prefer patch plans over full rewrites.
- Treat missing evidence as a warning, not as proof of bad maintenance.

## Current Autofix Scope

The first `--apply` behavior is intentionally narrow:

- If `.env` exists
- and `.gitignore` exists
- and `.gitignore` does not clearly ignore `.env`
- then append `.env` to `.gitignore`

The CLI detects `.env` by path only and must not print its contents.

## JSON Report Shape

```json
{
  "tool": "Agent Context Doctor",
  "version": "0.1.1",
  "root": "/path/to/repo",
  "score": 72,
  "checks": [],
  "suggestedNextSteps": [],
  "patchPlan": [],
  "metadata": {
    "files": {},
    "packageScripts": []
  }
}
```
