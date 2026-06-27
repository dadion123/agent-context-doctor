# TODO

This list keeps the next public work for Agent Context Doctor visible and ordered.

## Now

1. Add a deliberately drifted public fixture or screenshot for GitHub annotations.
2. Decide the `v0.2.0` scope.
3. Collect Japanese OSS maintainer feedback.

## Next

1. Add SARIF output for code scanning integrations.
2. Add `--format json` / `--format text` aliases while keeping `--json` stable.
3. Add more real-world example repositories:
   - public downstream repository using the Action
   - deliberately drifted GitHub annotations fixture
   - monorepo fixture
4. Add rule presets:
   - `jp-minimal`
   - `oss-maintainer`
   - `node-package`
5. Expand safe fixes beyond README `.env.example` note:
   - AGENTS adapter proposal
   - CLAUDE adapter proposal

## Launch

1. Draft bilingual GitHub Release notes for the next release.
2. Turn `docs/articles/zenn-launch-draft.md` into a publish-ready Zenn article.
3. Turn `docs/articles/qiita-practical-drift-checks-draft.md` into a publish-ready Qiita article.
4. Expand `docs/CODEX_FOR_OPEN_SOURCE_APPLICATION.md` with screenshots and user feedback:
   - public repo and npm evidence
   - fixture Action evidence
   - deterministic safety model
   - Japanese maintainer workflow focus

## Done

- Published `agent-context-doctor@0.1.0` to npm.
- Published GitHub release `v0.1.0`.
- Published `agent-context-doctor@0.1.1` to npm.
- Published GitHub release `v0.1.1`.
- Verified `uses: dadion123/agent-context-doctor@v0.1.1` from an external fixture repository.
- Verified `uses: dadion123/agent-context-doctor@v0.1.0` from an external fixture repository.
- Added bilingual public README surface.
- Added GitHub annotations for CI warnings and failures.
- Added README `.env.example` safe autofix.
- Added `examples/japanese-first-repo`.
- Added draft Zenn and Qiita launch articles.
- Added Codex for Open Source application evidence.
