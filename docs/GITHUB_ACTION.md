# GitHub Action Usage

Agent Context Doctor can run in CI before it has a dedicated Marketplace action.

## Local Package Workflow

Use this when the repository itself contains Agent Context Doctor.

```yaml
name: Agent Context Doctor

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.7.0
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm start -- ci . --min-score 80
```

## Composite Action Workflow

Consumers can use the root `action.yml` from a pinned release tag:

```yaml
name: Agent Context Doctor

on:
  pull_request:

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dadion123/agent-context-doctor@v0.2.0
        with:
          path: "."
          min-score: "80"
          locale: "ja"
```

The composite action has been verified from an external fixture repository. See [ACTION_FIXTURE_VALIDATION.md](ACTION_FIXTURE_VALIDATION.md).

## GitHub Annotations

When `acd ci` runs inside GitHub Actions, Agent Context Doctor emits workflow annotations for `warn` and `fail` checks.

- `fail` checks become `::error` annotations.
- `warn` checks become `::warning` annotations.
- `--json` stays machine-readable and does not include workflow commands.

This keeps CI logs useful for humans while preserving clean JSON for automation.

This behavior is available in `v0.1.1` and later.

## SARIF And Code Scanning

`v0.2.0` adds SARIF output for GitHub Code Scanning and other SARIF consumers.

```yaml
name: Agent Context Doctor

on:
  pull_request:

permissions:
  contents: read
  security-events: write

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: dadion123/agent-context-doctor@v0.2.0
        with:
          path: "."
          min-score: "80"
          locale: "ja"
          sarif: "true"
          sarif-output: "agent-context-doctor.sarif"

      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: agent-context-doctor.sarif
```

When SARIF is requested with `--output`, the normal text report stays in the workflow log and the SARIF file remains valid for upload.

## Future Published Package Workflow

The npm package is also available as `agent-context-doctor`:

```yaml
- run: npx agent-context-doctor ci . --min-score 80
```

## CI Policy

- Start with `--min-score 70` while introducing the tool.
- Raise to `80` once `AGENTS.md`, `CLAUDE.md`, README setup notes, and maintainer workflow docs are stable.
- Keep `fix` as a local maintainer action. CI should report drift, not rewrite repository files.
- Use Node 24 or newer enough for pnpm 11.
- Track upstream action runtime deprecation warnings. They may appear even when this action itself runs on Node 24.
