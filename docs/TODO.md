# TODO

This list keeps the next public work for Agent Context Doctor visible and ordered.

## Now

1. Keep validating `uses: dadion123/agent-context-doctor@v0.1.0` from external repositories.
2. Make the public GitHub surface explicitly bilingual:
   - keep `README.md` discoverable in English
   - add a clear Japanese-first section near the top
   - keep `README.ja.md` as the full Japanese entrypoint
   - publish future release notes in English and Japanese
3. Improve the GitHub Action surface:
   - document the exact pinned tag example
   - add an action badge after the fixture workflow remains stable
   - track Node.js action runtime deprecation warnings from upstream actions

## Next

1. Add GitHub annotations for CI warnings and failures.
2. Add SARIF output for code scanning integrations.
3. Add `--format json` / `--format text` aliases while keeping `--json` stable.
4. Add real-world example repositories:
   - minimal AI context
   - bloated AGENTS.md
   - README / AGENTS drift
   - Japanese-first OSS repository
5. Add rule presets:
   - `jp-minimal`
   - `oss-maintainer`
   - `node-package`
6. Expand safe fixes beyond `.gitignore`:
   - README `.env.example` note proposal
   - AGENTS adapter proposal
   - CLAUDE adapter proposal

## Launch

1. Draft bilingual GitHub Release notes for the next release.
2. Draft a Japanese Zenn article explaining doctor-first AI context maintenance.
3. Draft a Qiita article focused on practical AGENTS.md / CLAUDE.md / Cursor rules drift checks.
4. Prepare Codex for Open Source application material:
   - public repo and npm evidence
   - fixture Action evidence
   - deterministic safety model
   - Japanese maintainer workflow focus

