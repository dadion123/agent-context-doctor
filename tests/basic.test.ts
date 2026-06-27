import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applySafeFixes, formatTextReport, scanRepository } from "../src/index.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "acd-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("scanRepository", () => {
  it("reports missing AGENTS.md and undocumented env example", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# Example\n\nRun `pnpm test`.\n");
    await writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify({ scripts: { test: "vitest run", build: "tsc -p tsconfig.json" } }, null, 2)
    );
    await writeFile(path.join(tempDir, ".env.example"), "API_KEY=\n");
    await writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n.env\n");

    const report = await scanRepository(tempDir);

    expect(report.score).toBeLessThan(100);
    expect(report.checks.find((check) => check.id === "agents-exists")?.status).toBe("fail");
    expect(report.checks.find((check) => check.id === "env-example-mentioned")?.status).toBe("warn");
    expect(report.patchPlan.some((item) => item.path === "AGENTS.md")).toBe(true);
  });

  it("passes core checks for a concise aligned repository", async () => {
    await writeFile(
      path.join(tempDir, "README.md"),
      "# Example\n\nSetup: `pnpm install`. Test: `pnpm test`. Release, PR review, and issue triage are documented.\n"
    );
    await writeFile(
      path.join(tempDir, "AGENTS.md"),
      "# Agent Notes\n\nUse `pnpm install`, `pnpm test`, and `pnpm build`. User-facing output should be English.\n"
    );
    await writeFile(path.join(tempDir, "CLAUDE.md"), "# Claude Notes\n\nRead AGENTS.md. Use `pnpm test` and `pnpm build`.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run", build: "tsc" } }, null, 2));
    await writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n.env\n");

    const report = await scanRepository(tempDir);

    expect(report.checks.find((check) => check.id === "agents-exists")?.status).toBe("pass");
    expect(report.checks.find((check) => check.id === "package-scripts-mentioned")?.status).toBe("pass");
    expect(report.score).toBeGreaterThanOrEqual(70);
  });

  it("applies the low-risk .env gitignore fix without reading secrets", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# Example\n\nRelease, PR review, and issue triage are documented.\n");
    await writeFile(path.join(tempDir, "AGENTS.md"), "# Agent Notes\n\nUse `pnpm test`. User-facing output should be English.\n");
    await writeFile(path.join(tempDir, "CLAUDE.md"), "# Claude Notes\n\nRead AGENTS.md.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));
    await writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n");
    await writeFile(path.join(tempDir, ".env"), "SECRET=do-not-print\n");

    const before = await scanRepository(tempDir);
    expect(before.checks.find((check) => check.id === "env-gitignore")?.status).toBe("fail");

    const result = await applySafeFixes(tempDir);
    const gitignore = await readFile(path.join(tempDir, ".gitignore"), "utf8");

    expect(result.applied).toEqual([{ title: "Add .env to .gitignore", path: ".gitignore", changed: true }]);
    expect(gitignore).toContain(".env\n");
    expect(JSON.stringify(result)).not.toContain("do-not-print");
    expect(result.report.checks.find((check) => check.id === "env-gitignore")?.status).toBe("pass");
  });

  it("formats a Japanese text report", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# 日本語Repo\n\nリリース、PRレビュー、Issue triageを扱います。\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));

    const report = await scanRepository(tempDir);
    const text = formatTextReport(report, { locale: "ja" });

    expect(text).toContain("診断:");
    expect(text).toContain("AGENTS.md が見つかりません。");
    expect(text).toContain("次にやること:");
  });
});
