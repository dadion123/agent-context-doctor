#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { applySafeFixes, formatAppliedFixes, formatPatchPlan, formatSarifReport, formatTextReport, scanRepository } from "./index.js";
import { formatGithubAnnotations } from "./reporters/github.js";
import type { ReportLocale, ScanReport } from "./types.js";

const program = new Command();

program
  .name("acd")
  .description("Doctor-first CLI for AGENTS.md, CLAUDE.md, Cursor rules, and Copilot instructions.")
  .version("0.2.0");

program
  .command("scan")
  .argument("[path]", "repository path", ".")
  .option("--json", "print JSON report")
  .option("--sarif", "print SARIF report")
  .option("--output <file>", "write JSON or SARIF report to a file")
  .option("--locale <locale>", "text report language: en or ja", "en")
  .option("--jp", "alias for --locale ja")
  .description("Scan a repository and print diagnostic checks.")
  .action(async (target: string, options: TextOptions) => {
    const report = await scanRepository(target);
    await printReport(report, options);
  });

program
  .command("score")
  .argument("[path]", "repository path", ".")
  .option("--json", "print JSON report")
  .option("--locale <locale>", "text report language: en or ja", "en")
  .option("--jp", "alias for --locale ja")
  .description("Print the repository context score.")
  .action(async (target: string, options: TextOptions) => {
    const report = await scanRepository(target);
    if (options.json) {
      printJson({ score: report.score, checks: report.checks });
      return;
    }

    const locale = resolveLocale(options);
    const repositoryLabel = locale === "ja" ? "Repository" : "Repository";
    const scoreLabel = locale === "ja" ? "Score" : "Score";
    process.stdout.write(`Agent Context Doctor\n${repositoryLabel}: ${report.root}\n${scoreLabel}: ${report.score}/100\n`);
  });

program
  .command("fix")
  .argument("[path]", "repository path", ".")
  .option("--dry-run", "print a safe patch plan without changing files", false)
  .option("--apply", "apply low-risk safe fixes")
  .option("--json", "print JSON patch plan")
  .option("--locale <locale>", "text report language: en or ja", "en")
  .option("--jp", "alias for --locale ja")
  .description("Plan safe context fixes. MVP is dry-run first.")
  .action(async (target: string, options: FixOptions) => {
    const locale = resolveLocale(options);
    if (options.apply && !options.dryRun) {
      const result = await applySafeFixes(target);
      if (options.json) {
        printJson(result);
        return;
      }

      process.stdout.write(formatAppliedFixes(result.applied, { locale }));
      if (result.skipped.length > 0) {
        process.stdout.write(formatPatchPlan(result.skipped, { locale }));
      }
      return;
    }

    const report = await scanRepository(target);
    if (options.json) {
      printJson({ dryRun: true, patchPlan: report.patchPlan });
      return;
    }

    process.stdout.write(formatPatchPlan(report.patchPlan, { locale }));
    if (!options.dryRun && !options.apply) {
      process.stdout.write(
        locale === "ja"
          ? "No files changed. 変更するには --apply を明示してください。\n"
          : "No files changed. Pass --apply to apply low-risk safe fixes.\n"
      );
    }
  });

program
  .command("sync")
  .argument("[path]", "repository path", ".")
  .option("--dry-run", "print sync suggestions without changing files", false)
  .option("--json", "print JSON sync plan")
  .option("--locale <locale>", "text report language: en or ja", "en")
  .option("--jp", "alias for --locale ja")
  .description("Plan README / AI context sync work.")
  .action(async (target: string, options: SyncOptions) => {
    const report = await scanRepository(target);
    const syncPlan = report.suggestedNextSteps.map((step) => ({ action: step, dryRunOnly: true }));
    if (options.json) {
      printJson({ dryRun: true, syncPlan });
      return;
    }

    const locale = resolveLocale(options);
    process.stdout.write(locale === "ja" ? "Sync plan:\n" : "Sync plan:\n");
    if (syncPlan.length === 0) {
      process.stdout.write(locale === "ja" ? "同期ズレは検出されませんでした。\n" : "No sync drift detected.\n");
      return;
    }

    syncPlan.forEach((item, index) => {
      process.stdout.write(`${index + 1}. ${item.action}\n`);
    });

    if (!options.dryRun) {
      process.stdout.write(
        locale === "ja" ? "No files changed. MVPのsyncはdry-run firstです。\n" : "No files changed. Sync is dry-run first in the MVP.\n"
      );
    }
  });

program
  .command("ci")
  .argument("[path]", "repository path", ".")
  .option("--json", "print JSON report")
  .option("--sarif", "print SARIF report")
  .option("--output <file>", "write JSON or SARIF report to a file")
  .option("--min-score <score>", "minimum accepted score", "70")
  .option("--locale <locale>", "text report language: en or ja", "en")
  .option("--jp", "alias for --locale ja")
  .description("Run scan for CI and exit non-zero below the score threshold.")
  .action(async (target: string, options: CiOptions) => {
    const report = await scanRepository(target);
    const output = await printReport(report, options);
    if (!output.machineReadableStdout) {
      printGithubAnnotations(report);
    }

    const threshold = Number.parseInt(options.minScore, 10);
    if (Number.isFinite(threshold) && report.score < threshold) {
      process.exitCode = 1;
    }
  });

program.parseAsync(normalizeArgv(process.argv)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});

function normalizeArgv(argv: string[]): string[] {
  return argv.filter((arg, index) => !(index >= 2 && arg === "--"));
}

async function printReport(report: ScanReport, options: TextOptions): Promise<PrintResult> {
  const format = resolveOutputFormat(options);

  if (format === "json") {
    const json = `${JSON.stringify(report, null, 2)}\n`;
    if (options.output) {
      await writeOutput(options.output, json);
      process.stdout.write(formatTextReport(report, { locale: resolveLocale(options) }));
      return { machineReadableStdout: false };
    }
    process.stdout.write(json);
    return { machineReadableStdout: true };
  }

  if (format === "sarif") {
    const sarif = `${JSON.stringify(formatSarifReport(report), null, 2)}\n`;
    if (options.output) {
      await writeOutput(options.output, sarif);
      process.stdout.write(formatTextReport(report, { locale: resolveLocale(options) }));
      return { machineReadableStdout: false };
    }
    process.stdout.write(sarif);
    return { machineReadableStdout: true };
  }

  process.stdout.write(formatTextReport(report, { locale: resolveLocale(options) }));
  return { machineReadableStdout: false };
}

function resolveOutputFormat(options: TextOptions): "text" | "json" | "sarif" {
  if (options.json && options.sarif) {
    throw new Error("Use only one machine-readable output format: --json or --sarif.");
  }
  if (options.sarif) {
    return "sarif";
  }
  if (options.json) {
    return "json";
  }
  return "text";
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function writeOutput(filePath: string, content: string): Promise<void> {
  await writeFile(path.resolve(filePath), content, "utf8");
}

function printGithubAnnotations(report: ScanReport): void {
  if (process.env.GITHUB_ACTIONS !== "true") {
    return;
  }

  process.stdout.write(formatGithubAnnotations(report));
}

interface TextOptions {
  json?: boolean;
  sarif?: boolean;
  output?: string;
  locale?: string;
  jp?: boolean;
}

interface PrintResult {
  machineReadableStdout: boolean;
}

interface FixOptions extends TextOptions {
  dryRun?: boolean;
  apply?: boolean;
}

interface SyncOptions extends TextOptions {
  dryRun?: boolean;
}

interface CiOptions extends TextOptions {
  minScore: string;
}

function resolveLocale(options: TextOptions): ReportLocale {
  if (options.jp || options.locale?.toLowerCase() === "ja") {
    return "ja";
  }

  return "en";
}
