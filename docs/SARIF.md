# SARIF Output

Agent Context Doctor can emit SARIF 2.1.0 so CI systems can upload context health findings to GitHub Code Scanning.

## CLI

Print SARIF to stdout:

```bash
acd scan . --sarif
```

Write SARIF to a file:

```bash
acd ci . --min-score 80 --sarif --output agent-context-doctor.sarif
```

When `--sarif` or `--json` is combined with `--output`, the machine-readable report is written to the file and the normal text report remains on stdout. In GitHub Actions, this allows annotations to stay visible while SARIF stays valid for upload.

## GitHub Actions

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

## Mapping

- `fail` checks become SARIF `error` results.
- `warn` checks become SARIF `warning` results.
- `pass` checks are included as SARIF rules but not emitted as results.
- Result locations point to the most relevant repository file, such as `AGENTS.md`, `README.md`, `package.json`, or `.gitignore`.

SARIF output avoids embedding the local absolute repository root.

## Public Evidence

The public drift fixture demonstrates GitHub annotations and Code Scanning alerts from SARIF upload:

- Fixture repository: `https://github.com/dadion123/agent-context-doctor-drifted-fixture`
- Verified run: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/actions/runs/28290907857`
- Evidence notes: [DRIFT_FIXTURE_EVIDENCE.md](DRIFT_FIXTURE_EVIDENCE.md)
