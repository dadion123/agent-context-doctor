import type { CheckResult, ScanReport } from "../types.js";

const RULE_DOC_BASE = "https://github.com/dadion123/agent-context-doctor/blob/main/docs/RULES.md";

export function formatSarifReport(report: ScanReport): Record<string, unknown> {
  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "Agent Context Doctor",
            informationUri: "https://github.com/dadion123/agent-context-doctor",
            version: report.version,
            rules: report.checks.map((check) => ({
              id: check.id,
              name: check.title,
              shortDescription: {
                text: check.title
              },
              fullDescription: {
                text: check.suggestion ? `${check.message} ${check.suggestion}` : check.message
              },
              helpUri: `${RULE_DOC_BASE}#${check.id}`
            }))
          }
        },
        results: report.checks.filter(isIssue).map((check) => ({
          ruleId: check.id,
          level: check.status === "fail" ? "error" : "warning",
          message: {
            text: check.suggestion ? `${check.message} Suggestion: ${check.suggestion}` : check.message
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: ruleLocation(check.id)
                }
              }
            }
          ],
          properties: {
            status: check.status,
            details: check.details ?? {}
          }
        })),
        properties: {
          score: report.score,
          suggestedNextSteps: report.suggestedNextSteps
        }
      }
    ]
  };
}

function isIssue(check: CheckResult): boolean {
  return check.status !== "pass";
}

function ruleLocation(ruleId: string): string {
  const locations: Record<string, string> = {
    "readme-found": "README.md",
    "package-json-found": "package.json",
    "agents-exists": "AGENTS.md",
    "claude-exists": "CLAUDE.md",
    "agent-claude-overlap": "AGENTS.md",
    "agent-claude-command-drift": "AGENTS.md",
    "agents-length": "AGENTS.md",
    "context-bloat": "AGENTS.md",
    "readme-agents-setup-drift": "README.md",
    "package-scripts-mentioned": "package.json",
    "env-example-mentioned": "README.md",
    "env-gitignore": ".gitignore",
    "cursor-role-split": ".cursor/rules",
    "copilot-drift": ".github/copilot-instructions.md",
    "dangerous-auto-instructions": "AGENTS.md",
    "maintainer-workflow": "README.md",
    "japanese-language-instruction": "AGENTS.md"
  };

  return locations[ruleId] ?? ".";
}
