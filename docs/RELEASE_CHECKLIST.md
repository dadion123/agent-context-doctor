# Release Checklist

Use this before the first public release.

## Local Verification

- `node --version` should satisfy `>=22.13`
- `pnpm install`
- `pnpm test`
- `pnpm build`
- `node dist/cli.js scan .`
- `node dist/cli.js scan . --locale ja`
- `node dist/cli.js scan . --json`
- `node dist/cli.js ci . --min-score 80`

## Metadata

- Confirm GitHub repository is `dadion123/agent-context-doctor`.
- Confirm npm package is `agent-context-doctor`.
- Confirm `package.json` repository, bugs, homepage, bin, files, and license.
- Confirm README examples match the current CLI.
- Confirm `README.ja.md` is linked from README.

## Safety

- Confirm `.env` contents are never printed.
- Confirm `fix --apply` only applies low-risk fixes.
- Confirm CI reports drift but does not rewrite files.

## Publishing

- Create the public GitHub repository.
- Push `main`.
- Add repository topics:
  - `agents-md`
  - `claude-md`
  - `cursor-rules`
  - `copilot-instructions`
  - `ai-agent`
  - `maintainer-tools`
  - `japanese`
- Create a `vX.Y.Z` tag after CI passes.
- Publish npm package.
- Draft Japanese launch article.
