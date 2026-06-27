import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { scanRepository } from "../scanner/index.js";
import type { AppliedFix, FixResult, PatchPlanItem } from "../types.js";

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
