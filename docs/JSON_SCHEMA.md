# JSON Report Contract

`acd scan . --json` prints a machine-readable report. The MVP keeps this shape stable so CI, dashboards, and future GitHub Action wrappers can rely on it.

For GitHub Code Scanning and other SARIF consumers, use `acd ci . --sarif --output agent-context-doctor.sarif`. See [SARIF.md](SARIF.md).

## Top-Level Shape

```json
{
  "tool": "Agent Context Doctor",
  "version": "0.2.0",
  "root": "/path/to/repo",
  "score": 100,
  "checks": [],
  "suggestedNextSteps": [],
  "patchPlan": [],
  "metadata": {
    "files": {},
    "packageScripts": []
  }
}
```

## `checks[]`

Each check is deterministic and contains:

```json
{
  "id": "agents-exists",
  "title": "AGENTS.md exists",
  "status": "pass",
  "message": "AGENTS.md found.",
  "suggestion": "Create a concise AGENTS.md from detected project facts.",
  "details": {}
}
```

Fields:

- `id`: stable rule identifier
- `title`: short human-readable rule name
- `status`: `pass`, `warn`, or `fail`
- `message`: English default diagnostic message
- `suggestion`: optional maintainer action
- `details`: optional structured evidence

## `patchPlan[]`

Patch plan items describe possible fixes. They do not imply files were changed.

```json
{
  "title": "Add .env to .gitignore",
  "path": ".gitignore",
  "reason": ".env exists but is not clearly ignored.",
  "risk": "low",
  "dryRunOnly": false
}
```

`dryRunOnly: false` means the fix may be applied by `acd fix . --apply` if it is implemented as a low-risk autofix.

## Compatibility Policy

Before `1.0.0`:

- Existing top-level keys should not be removed casually.
- New optional fields may be added.
- Rule IDs should remain stable once documented in `docs/RULES.md`.
- Breaking JSON changes should be called out in release notes.

After `1.0.0`, breaking JSON changes should require a major version bump.
