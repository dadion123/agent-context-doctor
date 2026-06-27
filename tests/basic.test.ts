import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applySafeFixes, formatGithubAnnotations, formatSarifReport, formatTextReport, scanRepository } from "../src/index.js";

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

  it("applies the low-risk .env.example README note fix", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# Example\n\nRelease, PR review, and issue triage are documented.\n");
    await writeFile(path.join(tempDir, "AGENTS.md"), "# Agent Notes\n\nUse `pnpm test`. User-facing output should be English.\n");
    await writeFile(path.join(tempDir, "CLAUDE.md"), "# Claude Notes\n\nRead AGENTS.md.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));
    await writeFile(path.join(tempDir, ".env.example"), "API_KEY=\n");
    await writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n.env\n");

    const before = await scanRepository(tempDir);
    expect(before.checks.find((check) => check.id === "env-example-mentioned")?.status).toBe("warn");
    expect(before.patchPlan.find((item) => item.title === "Add .env.example setup note")?.dryRunOnly).toBe(false);

    const result = await applySafeFixes(tempDir);
    const readme = await readFile(path.join(tempDir, "README.md"), "utf8");

    expect(result.applied).toContainEqual({ title: "Add .env.example setup note", path: "README.md", changed: true });
    expect(readme).toContain("## Environment Variables");
    expect(readme).toContain("Copy `.env.example` to `.env`");
    expect(JSON.stringify(result)).not.toContain("API_KEY=");
    expect(result.report.checks.find((check) => check.id === "env-example-mentioned")?.status).toBe("pass");
  });

  it("uses a Japanese .env.example README note for Japanese repositories", async () => {
    await writeFile(
      path.join(tempDir, "README.md"),
      "# 日本語サンプル\n\nこれは日本語メンテナー向けのサンプルリポジトリです。リリース、PRレビュー、Issue triageを扱います。\n"
    );
    await writeFile(path.join(tempDir, "AGENTS.md"), "# Agent Notes\n\nUse `pnpm test`. ユーザー向け説明は日本語で書いてください。\n");
    await writeFile(path.join(tempDir, "CLAUDE.md"), "# Claude Notes\n\nRead AGENTS.md.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));
    await writeFile(path.join(tempDir, ".env.example"), "API_KEY=\n");
    await writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n.env\n");

    const result = await applySafeFixes(tempDir);
    const readme = await readFile(path.join(tempDir, "README.md"), "utf8");

    expect(result.applied).toContainEqual({ title: "Add .env.example setup note", path: "README.md", changed: true });
    expect(readme).toContain("## 環境変数");
    expect(readme).toContain("`.env.example` を `.env` にコピー");
  });

  it("formats GitHub annotations for CI warnings and failures", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# Example\n\nRun `pnpm test`.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));

    const report = await scanRepository(tempDir);
    const annotations = formatGithubAnnotations(report);

    expect(annotations).toContain("::error title=ACD agents-exists::AGENTS.md not found.");
    expect(annotations).toContain("::warning title=ACD claude-exists::CLAUDE.md not found.");
    expect(annotations).toContain("Suggestion:");
  });

  it("formats SARIF for CI warnings and failures without leaking the absolute root", async () => {
    await writeFile(path.join(tempDir, "README.md"), "# Example\n\nRun `pnpm test`.\n");
    await writeFile(path.join(tempDir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));

    const report = await scanRepository(tempDir);
    const sarif = formatSarifReport(report) as {
      version: string;
      runs: Array<{
        tool: { driver: { name: string; version: string; rules: Array<{ id: string }> } };
        results: Array<{ ruleId: string; level: string; locations: Array<{ physicalLocation: { artifactLocation: { uri: string } } }> }>;
      }>;
    };
    const serialized = JSON.stringify(sarif);

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.tool.driver.name).toBe("Agent Context Doctor");
    expect(sarif.runs[0]?.tool.driver.rules.some((rule) => rule.id === "agents-exists")).toBe(true);
    expect(sarif.runs[0]?.results).toContainEqual(
      expect.objectContaining({
        ruleId: "agents-exists",
        level: "error",
        locations: [{ physicalLocation: { artifactLocation: { uri: "AGENTS.md" } } }]
      })
    );
    expect(serialized).not.toContain(tempDir);
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
