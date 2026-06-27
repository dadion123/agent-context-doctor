# Public Drift Fixture Evidence

Agent Context Doctor has a deliberately drifted public fixture repository for GitHub annotations and SARIF evidence.

## Fixture Repository

- Repository: `https://github.com/dadion123/agent-context-doctor-drifted-fixture`
- Purpose: intentionally unhealthy AI-context repository for CI evidence
- Workflow: `Agent Context Doctor Drift Evidence`
- Action version: `dadion123/agent-context-doctor@v0.2.0`
- Expected result: failing workflow after SARIF upload succeeds

## Verified Run

- Run: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/actions/runs/28290907857`
- Date: 2026-06-27
- Score: `52/100`
- Workflow conclusion: failure, intentionally kept red for evidence
- SARIF upload: succeeded
- SARIF processing: complete
- GitHub annotations: warnings emitted for drifted context checks

## Detected Drift

The fixture produces warnings for:

- `claude-exists`
- `readme-agents-setup-drift`
- `package-scripts-mentioned`
- `env-example-mentioned`
- `cursor-role-split`
- `copilot-drift`
- `maintainer-workflow`
- `japanese-language-instruction`

## Code Scanning Alerts

SARIF upload created open Code Scanning alerts:

- `claude-exists`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/1`
- `readme-agents-setup-drift`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/2`
- `package-scripts-mentioned`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/3`
- `env-example-mentioned`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/4`
- `cursor-role-split`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/5`
- `copilot-drift`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/6`
- `maintainer-workflow`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/7`
- `japanese-language-instruction`: `https://github.com/dadion123/agent-context-doctor-drifted-fixture/security/code-scanning/8`

## Notes

The fixture does not commit a real `.env` file. It uses `.env.example` to demonstrate missing setup documentation without exposing secrets.
