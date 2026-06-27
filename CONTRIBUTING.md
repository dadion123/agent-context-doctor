# Contributing

Agent Context Doctor is early. The most useful contributions are small deterministic rules, focused fixtures, documentation improvements, and safe patch-plan ideas.

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm dev -- scan .
pnpm dev -- scan . --locale ja
```

## Rule Contributions

Good rules should:

- be deterministic
- produce a clear maintainer action
- avoid reading or printing secrets
- include at least one focused test
- keep autofix narrower than diagnosis

## Safe Fix Contributions

Autofix must be explicit through `fix --apply`.

Safe fixes should:

- touch one file or one narrow concern
- be reversible by a maintainer
- avoid broad rewrites
- never inspect `.env` contents
- include dry-run patch plan behavior

## Language

English and Japanese documentation are both welcome. Japanese-first maintainer UX is part of the project strategy, not a side translation.
