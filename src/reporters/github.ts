import type { ScanReport } from "../types.js";

export function formatGithubAnnotations(report: ScanReport): string {
  const lines: string[] = [];

  for (const check of report.checks) {
    if (check.status === "pass") {
      continue;
    }

    const command = check.status === "fail" ? "error" : "warning";
    const title = escapeGithubCommandProperty(`ACD ${check.id}`);
    const message = escapeGithubCommandData(check.suggestion ? `${check.message} Suggestion: ${check.suggestion}` : check.message);
    lines.push(`::${command} title=${title}::${message}`);
  }

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}

function escapeGithubCommandData(value: string): string {
  return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function escapeGithubCommandProperty(value: string): string {
  return escapeGithubCommandData(value).replace(/:/g, "%3A").replace(/,/g, "%2C");
}
