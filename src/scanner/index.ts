import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { runRules } from "../rules/index.js";
import type { PatchPlanItem, ScanContext, ScanReport } from "../types.js";

const VERSION = "0.1.0";

export async function scanRepository(target = "."): Promise<ScanReport> {
  const root = path.resolve(target);
  const context = await createScanContext(root);
  const checks = runRules(context);
  const score = calculateScore(checks);
  const suggestedNextSteps = buildNextSteps(checks);
  const patchPlan = buildPatchPlan(context, checks);

  return {
    tool: "Agent Context Doctor",
    version: VERSION,
    root,
    score,
    checks,
    suggestedNextSteps,
    patchPlan,
    metadata: {
      files: {
        readme: context.exists.readme,
        agents: context.exists.agents,
        claude: context.exists.claude,
        copilot: context.exists.copilot,
        cursorRules: context.files.cursorRules.length,
        docs: context.files.docs.length,
        workflows: context.files.workflows.length,
        env: context.exists.env,
        envExample: context.exists.envExample,
        packageJson: context.exists.packageJson
      },
      packageScripts: Object.keys(context.packageScripts)
    }
  };
}

async function createScanContext(root: string): Promise<ScanContext> {
  const [
    readme,
    agents,
    claude,
    copilot,
    gitignore,
    envExample,
    packageJsonText,
    cursorRules,
    docs,
    workflows,
    envFiles
  ] = await Promise.all([
    readOptional(root, "README.md"),
    readOptional(root, "AGENTS.md"),
    readOptional(root, "CLAUDE.md"),
    readOptional(root, ".github/copilot-instructions.md"),
    readOptional(root, ".gitignore"),
    readOptional(root, ".env.example"),
    readOptional(root, "package.json"),
    fg(".cursor/rules/**/*.mdc", { cwd: root, dot: true, onlyFiles: true, ignore: ["node_modules/**", ".git/**"] }),
    fg("docs/**/*.md", { cwd: root, dot: true, onlyFiles: true, ignore: ["node_modules/**", ".git/**"] }),
    fg(".github/workflows/*.{yml,yaml}", { cwd: root, dot: true, onlyFiles: true, ignore: ["node_modules/**", ".git/**"] }),
    fg(".env", { cwd: root, dot: true, onlyFiles: true, ignore: ["node_modules/**", ".git/**"] })
  ]);

  let packageJson: unknown;
  let packageScripts: Record<string, string> = {};
  if (packageJsonText) {
    try {
      packageJson = JSON.parse(packageJsonText);
      if (isRecord(packageJson) && isRecord(packageJson.scripts)) {
        packageScripts = Object.fromEntries(
          Object.entries(packageJson.scripts).filter((entry): entry is [string, string] => typeof entry[1] === "string")
        );
      }
    } catch {
      packageJson = undefined;
    }
  }

  return {
    root,
    files: {
      readme,
      agents,
      claude,
      copilot,
      gitignore,
      envExample,
      packageJson,
      docs,
      cursorRules,
      workflows
    },
    packageScripts,
    exists: {
      readme: Boolean(readme),
      agents: Boolean(agents),
      claude: Boolean(claude),
      copilot: Boolean(copilot),
      gitignore: Boolean(gitignore),
      env: envFiles.length > 0,
      envExample: Boolean(envExample),
      packageJson: Boolean(packageJsonText),
      cursorRules: cursorRules.length > 0,
      workflows: workflows.length > 0
    }
  };
}

async function readOptional(root: string, relativePath: string): Promise<string | undefined> {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function calculateScore(checks: Array<{ status: string }>): number {
  const penalty = checks.reduce((total, check) => {
    if (check.status === "fail") {
      return total + 10;
    }
    if (check.status === "warn") {
      return total + 6;
    }
    return total;
  }, 0);

  return Math.max(0, 100 - penalty);
}

function buildNextSteps(checks: Array<{ status: string; suggestion?: string }>): string[] {
  const nextSteps = checks
    .filter((check) => check.status !== "pass" && check.suggestion)
    .map((check) => check.suggestion as string);

  return Array.from(new Set(nextSteps)).slice(0, 5);
}

function buildPatchPlan(context: ScanContext, checks: Array<{ id: string; status: string }>): PatchPlanItem[] {
  const failed = new Set(checks.filter((check) => check.status !== "pass").map((check) => check.id));
  const plan: PatchPlanItem[] = [];

  if (failed.has("env-gitignore") && context.exists.gitignore) {
    plan.push({
      title: "Add .env to .gitignore",
      path: ".gitignore",
      reason: ".env exists but is not clearly ignored.",
      risk: "low",
      dryRunOnly: false
    });
  }

  if (failed.has("agents-exists")) {
    plan.push({
      title: "Create a minimal AGENTS.md from detected project facts",
      path: "AGENTS.md",
      reason: "Codex and compatible agents need a concise repository entrypoint.",
      risk: "medium",
      dryRunOnly: true
    });
  }

  if (failed.has("env-example-mentioned")) {
    plan.push({
      title: "Add .env.example setup note",
      path: "README.md",
      reason: ".env.example exists but setup docs do not mention it.",
      risk: "low",
      dryRunOnly: !context.exists.readme
    });
  }

  return plan;
}
