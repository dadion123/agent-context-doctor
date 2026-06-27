import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { scanRepository } from "../scanner/index.js";
import type { AppliedFix, FixResult, PatchPlanItem } from "../types.js";
import { containsJapanese } from "../utils/text.js";

export async function applySafeFixes(target = "."): Promise<FixResult> {
  const report = await scanRepository(target);
  const applied: AppliedFix[] = [];
  const skipped: PatchPlanItem[] = [];

  for (const item of report.patchPlan) {
    if (item.dryRunOnly) {
      skipped.push(item);
      continue;
    }

    if (item.path === ".gitignore" && item.title === "Add .env to .gitignore") {
      const changed = await addEnvToGitignore(report.root);
      applied.push({ title: item.title, path: item.path, changed });
      continue;
    }

    if (item.path === "README.md" && item.title === "Add .env.example setup note") {
      const changed = await addEnvExampleNote(report.root);
      applied.push({ title: item.title, path: item.path, changed });
      continue;
    }

    skipped.push(item);
  }

  return {
    dryRun: false,
    applied,
    skipped,
    report: await scanRepository(target)
  };
}

async function addEnvToGitignore(root: string): Promise<boolean> {
  const filePath = path.join(root, ".gitignore");
  const current = await readFile(filePath, "utf8");

  if (/^\.env$/m.test(current) || /^\.env\.\*$/m.test(current) || /^\.env\*/m.test(current)) {
    return false;
  }

  const prefix = current.endsWith("\n") || current.length === 0 ? "" : "\n";
  await appendFile(filePath, `${prefix}.env\n`, "utf8");
  return true;
}

async function addEnvExampleNote(root: string): Promise<boolean> {
  const filePath = path.join(root, "README.md");
  const current = await readFile(filePath, "utf8");

  if (/\.env\.example|environment variables|env\s+example/i.test(current)) {
    return false;
  }

  const prefix = current.endsWith("\n") || current.length === 0 ? "" : "\n";
  const note = containsJapanese(current)
    ? [
        "",
        "## 環境変数",
        "",
        "ローカル開発では `.env.example` を `.env` にコピーし、必要な値を設定してください。",
        "`.env` はcommitせず、Issue、ログ、AIアシスタントの出力に秘密情報を表示しないでください。",
        ""
      ].join("\n")
    : [
        "",
        "## Environment Variables",
        "",
        "Copy `.env.example` to `.env` for local development, then fill in local values.",
        "Do not commit `.env` or print secret values in issues, logs, or AI assistant output.",
        ""
      ].join("\n");
  await appendFile(filePath, `${prefix}${note}`, "utf8");
  return true;
}
