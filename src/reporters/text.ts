import type { AppliedFix, PatchPlanItem, ReportLocale, ScanReport } from "../types.js";

interface ReportOptions {
  locale?: ReportLocale;
}

export function formatTextReport(report: ScanReport, options: ReportOptions = {}): string {
  const locale = options.locale ?? "en";
  const lines: string[] = [];
  lines.push("Agent Context Doctor");
  lines.push(`${label("repository", locale)}: ${report.root}`);
  lines.push(`${label("score", locale)}: ${report.score}/100`);
  lines.push(`${label("checks", locale)}:`);

  for (const check of report.checks) {
    lines.push(`${statusIcon(check.status)} ${localizedCheckMessage(check.id, check.message, locale)}`);
  }

  if (report.suggestedNextSteps.length > 0) {
    lines.push(`${label("nextSteps", locale)}:`);
    report.suggestedNextSteps.forEach((step, index) => {
      lines.push(`${index + 1}. ${localizedSuggestion(step, locale)}`);
    });
  }

  return `${lines.join("\n")}\n`;
}

export function formatPatchPlan(items: PatchPlanItem[], options: ReportOptions = {}): string {
  const locale = options.locale ?? "en";
  if (items.length === 0) {
    return `${label("patchPlan", locale)}: ${locale === "ja" ? "安全に提案できる変更はありません。" : "no safe changes suggested."}\n`;
  }

  const lines = [`${label("patchPlan", locale)}:`];
  items.forEach((item, index) => {
    const mode = item.dryRunOnly
      ? locale === "ja"
        ? "dry-runのみ"
        : "dry-run only"
      : locale === "ja"
        ? "安全な自動修正候補"
        : "safe autofix candidate";
    lines.push(`${index + 1}. ${localizedPatchTitle(item.title, locale)}`);
    lines.push(`   ${label("path", locale)}: ${item.path}`);
    lines.push(`   ${label("reason", locale)}: ${localizedPatchReason(item.reason, locale)}`);
    lines.push(`   ${label("mode", locale)}: ${mode}`);
  });

  return `${lines.join("\n")}\n`;
}

export function formatAppliedFixes(items: AppliedFix[], options: ReportOptions = {}): string {
  const locale = options.locale ?? "en";
  if (items.length === 0) {
    return locale === "ja" ? "Applied fixes: 変更はありません。\n" : "Applied fixes: no changes.\n";
  }

  const lines = [locale === "ja" ? "Applied fixes:" : "Applied fixes:"];
  items.forEach((item, index) => {
    const status = item.changed ? (locale === "ja" ? "changed" : "changed") : locale === "ja" ? "unchanged" : "unchanged";
    lines.push(`${index + 1}. ${localizedPatchTitle(item.title, locale)} (${status})`);
    lines.push(`   ${label("path", locale)}: ${item.path}`);
  });

  return `${lines.join("\n")}\n`;
}

function statusIcon(status: string): string {
  if (status === "pass") {
    return "✓";
  }
  if (status === "fail") {
    return "✗";
  }
  return "⚠";
}

function label(key: "repository" | "score" | "checks" | "nextSteps" | "patchPlan" | "path" | "reason" | "mode", locale: ReportLocale): string {
  if (locale === "ja") {
    const labels = {
      repository: "Repository",
      score: "Score",
      checks: "診断",
      nextSteps: "次にやること",
      patchPlan: "Patch plan",
      path: "Path",
      reason: "Reason",
      mode: "Mode"
    };
    return labels[key];
  }

  const labels = {
    repository: "Repository",
    score: "Score",
    checks: "Checks",
    nextSteps: "Suggested next steps",
    patchPlan: "Patch plan",
    path: "Path",
    reason: "Reason",
    mode: "Mode"
  };
  return labels[key];
}

function localizedCheckMessage(id: string, fallback: string, locale: ReportLocale): string {
  if (locale !== "ja") {
    return fallback;
  }

  const messages: Record<string, string> = {
    "readme-found": "README.md を確認しました。",
    "package-json-found": "package.json を確認しました。",
    "agents-exists": fallback.includes("not found") ? "AGENTS.md が見つかりません。" : "AGENTS.md を確認しました。",
    "claude-exists": fallback.includes("not found") ? "CLAUDE.md が見つかりません。" : "CLAUDE.md を確認しました。",
    "agent-claude-overlap": fallback.includes("highly duplicated")
      ? "AGENTS.md と CLAUDE.md の重複が多すぎます。"
      : "AGENTS.md / CLAUDE.md の重複は許容範囲です。",
    "agent-claude-command-drift": fallback.includes("different commands")
      ? "AGENTS.md と CLAUDE.md のコマンド記述にズレがあります。"
      : "AGENTS.md / CLAUDE.md のコマンドズレは検出されませんでした。",
    "agents-length": fallback.includes("longer") ? "AGENTS.md がMVPの目安より長いです。" : "AGENTS.md は短く保たれています。",
    "context-bloat": fallback.startsWith("AGENTS.md has 200")
      ? "AGENTS.md が200行以上で、context bloat の疑いがあります。"
      : "200行以上のcontext bloatは検出されませんでした。",
    "readme-agents-setup-drift": fallback.includes("mentions setup commands")
      ? "README.md と AGENTS.md のセットアップ手順にズレがあります。"
      : "README.md と AGENTS.md のセットアップ手順は概ね揃っています。",
    "package-scripts-mentioned": fallback.includes("do not mention")
      ? "package.json の重要scriptがAI contextに書かれていません。"
      : "重要なpackage scriptはAI contextに書かれています。",
    "env-example-mentioned": fallback.includes("does not mention")
      ? ".env.example はありますが、README.md / AI context に説明がありません。"
      : ".env.example の説明状態を確認しました。",
    "env-gitignore": fallback.includes("not clearly ignored") || fallback.includes("missing")
      ? ".env が .gitignore で保護されていません。"
      : ".env のgitignore状態を確認しました。",
    "cursor-role-split": fallback.includes("not documented")
      ? ".cursor/rules と AGENTS/CLAUDE の役割分担が説明されていません。"
      : "Cursor rules の役割分担を確認しました。",
    "copilot-drift": fallback.includes("different commands")
      ? "Copilot instructions と AGENTS.md のコマンド記述にズレがあります。"
      : "Copilot instructions のズレは検出されませんでした。",
    "dangerous-auto-instructions": fallback.includes("risky")
      ? "危険な自動実行指示の可能性があります。"
      : "危険な自動実行指示は検出されませんでした。",
    "maintainer-workflow": fallback.includes("incomplete")
      ? "release / PR review / issue triage の記述が不足しています。"
      : "release / PR review / issue triage の記述を確認しました。",
    "japanese-language-instruction": fallback.includes("lacks language guidance")
      ? "日本語repoの可能性がありますが、AIへの言語指示が不足しています。"
      : "日本語repo向けの言語指示を確認しました。"
  };

  return messages[id] ?? fallback;
}

function localizedSuggestion(value: string, locale: ReportLocale): string {
  if (locale !== "ja") {
    return value;
  }

  const suggestions: Record<string, string> = {
    "Create a concise AGENTS.md from detected project facts.": "検出したプロジェクト情報をもとに、短い AGENTS.md を作成する。",
    "Add CLAUDE.md or document why Claude Code uses AGENTS.md through an adapter.": "CLAUDE.md を追加するか、Claude Code が AGENTS.md を読む運用を明記する。",
    "Add test/build/lint/dev commands to AGENTS.md or CLAUDE.md.": "test/build/lint/dev コマンドを AGENTS.md または CLAUDE.md に追記する。",
    "Tell AI agents whether user-facing output should be Japanese, English, or bilingual.": "ユーザー向け出力を日本語・英語・二言語のどれにするかAIへ明記する。",
    "Add a short setup note for copying .env.example without exposing secrets.": "秘密情報を出さずに .env.example の使い方を短く追記する。",
    "Add concise release, PR review, and issue triage guidance for AI agents.": "release / PR review / issue triage の最小手順をAI向けに追記する。"
  };

  return suggestions[value] ?? value;
}

function localizedPatchTitle(value: string, locale: ReportLocale): string {
  if (locale !== "ja") {
    return value;
  }

  const titles: Record<string, string> = {
    "Add .env to .gitignore": ".gitignore に .env を追加する",
    "Create a minimal AGENTS.md from detected project facts": "検出情報から最小AGENTS.mdを作成する",
    "Add .env.example setup note": ".env.example のセットアップ説明を追加する"
  };

  return titles[value] ?? value;
}

function localizedPatchReason(value: string, locale: ReportLocale): string {
  if (locale !== "ja") {
    return value;
  }

  const reasons: Record<string, string> = {
    ".env exists but is not clearly ignored.": ".env が存在しますが、.gitignore で明確に無視されていません。",
    "Codex and compatible agents need a concise repository entrypoint.": "Codex互換エージェントには短いリポジトリ入口が必要です。",
    ".env.example exists but setup docs do not mention it.": ".env.example はありますが、セットアップ文書で触れられていません。"
  };

  return reasons[value] ?? value;
}
