# Action Fixture Validation

This page records evidence that the published composite GitHub Action works from another repository.

## Verified Release: v0.1.1

- Action: `dadion123/agent-context-doctor@v0.1.1`
- Date: 2026-06-27
- Fixture repository: `dadion123/agent-context-doctor-action-fixture`
- Fixture visibility: private
- Fixture commit: `01694aba009abc913ee54487d97952fc539623c7`
- Workflow run: `https://github.com/dadion123/agent-context-doctor-action-fixture/actions/runs/28289873291`
- Action source SHA: `1fa7da58caf16d7cbf658edf23a2f79e317b15a1`
- Conclusion: success
- Result: `Score: 100/100`
- Locale: `ja`

## Verified Release: v0.1.0

- Action: `dadion123/agent-context-doctor@v0.1.0`
- Date: 2026-06-27
- Fixture repository: `dadion123/agent-context-doctor-action-fixture`
- Fixture visibility: private
- Fixture commit: `ec477b4581d969f926c0a26cf28ee42ee9761460`
- Workflow run: `https://github.com/dadion123/agent-context-doctor-action-fixture/actions/runs/28288986156`
- Conclusion: success
- Result: `Score: 100/100`
- Locale: `ja`

## Workflow Used

```yaml
name: Agent Context Doctor Fixture

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - name: Check out fixture
        uses: actions/checkout@v4

      - name: Run Agent Context Doctor
        uses: dadion123/agent-context-doctor@v0.1.1
        with:
          path: "."
          min-score: "80"
          locale: "ja"
```

## Observed Output

The action installed dependencies, built the CLI from the tagged action source, and ran:

```bash
node "$GITHUB_ACTION_PATH/dist/cli.js" ci "." --min-score "80" --locale "ja"
```

The report completed successfully with Japanese text output and `Score: 100/100`.

## Notes

- GitHub Actions emitted Node.js 20 deprecation warnings for upstream actions such as `actions/checkout@v4`, `actions/setup-node@v4`, and `pnpm/action-setup@v4`.
- Agent Context Doctor itself sets up Node 24 in the composite action.
- The warning did not affect the fixture run result.
