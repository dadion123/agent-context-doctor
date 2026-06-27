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
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm start -- ci . --min-score 80
```

## Composite Action Workflow

After this repository is published on GitHub, consumers should be able to use the root `action.yml`:

```yaml
name: Agent Context Doctor

on:
  pull_request:

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dadion123/agent-context-doctor@v0
        with:
          path: "."
          min-score: "80"
          locale: "ja"
```

## Future Published Package Workflow

After npm publication as `agent-context-doctor`, downstream projects should be able to use:

```yaml
- run: npx agent-context-doctor ci . --min-score 80
```

## CI Policy

- Start with `--min-score 70` while introducing the tool.
- Raise to `80` once `AGENTS.md`, `CLAUDE.md`, README setup notes, and maintainer workflow docs are stable.
- Keep `fix` as a local maintainer action. CI should report drift, not rewrite repository files.
