import type { CheckResult, ScanContext } from "../types.js";
import {
  compactList,
  containsJapanese,
  countLines,
  extractCommandMentions,
  includesAny,
  jaccardSimilarity,
  scriptToIntent
} from "../utils/text.js";

export function runRules(context: ScanContext): CheckResult[] {
  const aiContext = compactList([context.files.agents, context.files.claude, context.files.copilot]).join("\n\n");
  const repositoryDocs = compactList([context.files.readme, context.files.agents, context.files.claude]).join("\n\n");
  const packageScriptNames = Object.keys(context.packageScripts);

  return [
    checkReadme(context),
    checkPackageJson(context),
    checkAgents(context),
    checkClaude(context),
    checkAgentClaudeOverlap(context),
    checkAgentClaudeCommandDrift(context),
    checkAgentsLength(context),
    checkContextBloat(context),
    checkReadmeSetupDrift(context),
    checkPackageScriptsMentioned(packageScriptNames, aiContext),
    checkEnvExampleMentioned(context, repositoryDocs),
    checkEnvIgnored(context),
    checkCursorRoleSplit(context, repositoryDocs),
    checkCopilotDrift(context),
    checkDangerousInstructions(aiContext),
    checkMaintainerWorkflow(repositoryDocs),
    checkJapaneseLanguageInstruction(repositoryDocs, aiContext)
  ];
}

function pass(id: string, title: string, message: string, details?: Record<string, unknown>): CheckResult {
  return { id, title, status: "pass", message, details };
}

function warn(id: string, title: string, message: string, suggestion: string, details?: Record<string, unknown>): CheckResult {
  return { id, title, status: "warn", message, suggestion, details };
}

function fail(id: string, title: string, message: string, suggestion: string, details?: Record<string, unknown>): CheckResult {
  return { id, title, status: "fail", message, suggestion, details };
}

function checkReadme(context: ScanContext): CheckResult {
  return context.exists.readme
    ? pass("readme-found", "README found", "README.md found.")
    : warn("readme-found", "README found", "README.md not found.", "Add a README with setup and maintainer workflow notes.");
}

function checkPackageJson(context: ScanContext): CheckResult {
  return context.exists.packageJson
    ? pass("package-json-found", "package.json found", "package.json found.")
    : warn("package-json-found", "package.json found", "package.json not found.", "Add package.json or document why this is not a Node project.");
}

function checkAgents(context: ScanContext): CheckResult {
  return context.exists.agents
    ? pass("agents-exists", "AGENTS.md exists", "AGENTS.md found.")
    : fail("agents-exists", "AGENTS.md exists", "AGENTS.md not found.", "Create a concise AGENTS.md from detected project facts.");
}

function checkClaude(context: ScanContext): CheckResult {
  return context.exists.claude
    ? pass("claude-exists", "CLAUDE.md exists", "CLAUDE.md found.")
    : warn("claude-exists", "CLAUDE.md exists", "CLAUDE.md not found.", "Add CLAUDE.md or document why Claude Code uses AGENTS.md through an adapter.");
}

function checkAgentClaudeOverlap(context: ScanContext): CheckResult {
  if (!context.files.agents || !context.files.claude) {
    return pass("agent-claude-overlap", "AGENTS/CLAUDE overlap", "Skipped because one of the files is missing.");
  }

  const similarity = jaccardSimilarity(context.files.agents, context.files.claude);
  if (similarity > 0.65) {
    return warn(
      "agent-claude-overlap",
      "AGENTS/CLAUDE overlap",
      "AGENTS.md and CLAUDE.md look highly duplicated.",
      "Keep shared guidance in one canonical file and make the other file a short adapter.",
      { similarity: Number(similarity.toFixed(2)) }
    );
  }

  return pass("agent-claude-overlap", "AGENTS/CLAUDE overlap", "AGENTS.md and CLAUDE.md are not overly duplicated.", {
    similarity: Number(similarity.toFixed(2))
  });
}

function checkAgentClaudeCommandDrift(context: ScanContext): CheckResult {
  if (!context.files.agents || !context.files.claude) {
    return pass("agent-claude-command-drift", "AGENTS/CLAUDE command drift", "Skipped because one of the files is missing.");
  }

  const agentCommands = extractCommandMentions(context.files.agents);
  const claudeCommands = extractCommandMentions(context.files.claude);
  const conflicts: string[] = [];

  for (const [intent, commands] of agentCommands.entries()) {
    const claudeForIntent = claudeCommands.get(intent);
    if (!claudeForIntent) {
      continue;
    }

    const left = [...commands].sort().join(", ");
    const right = [...claudeForIntent].sort().join(", ");
    if (left !== right) {
      conflicts.push(`${intent}: AGENTS=${left}; CLAUDE=${right}`);
    }
  }

  if (conflicts.length > 0) {
    return warn(
      "agent-claude-command-drift",
      "AGENTS/CLAUDE command drift",
      "AGENTS.md and CLAUDE.md mention different commands for the same workflow.",
      "Align test/build/lint commands across AGENTS.md and CLAUDE.md.",
      { conflicts }
    );
  }

  return pass("agent-claude-command-drift", "AGENTS/CLAUDE command drift", "No command drift detected.");
}

function checkAgentsLength(context: ScanContext): CheckResult {
  const lines = countLines(context.files.agents);
  if (!context.files.agents) {
    return pass("agents-length", "AGENTS.md length", "Skipped because AGENTS.md is missing.");
  }

  if (lines > 120) {
    return warn("agents-length", "AGENTS.md length", "AGENTS.md is longer than the MVP target.", "Trim AGENTS.md to the commands and rules agents need most.", {
      lines
    });
  }

  return pass("agents-length", "AGENTS.md length", "AGENTS.md is concise.", { lines });
}

function checkContextBloat(context: ScanContext): CheckResult {
  const lines = countLines(context.files.agents);
  if (!context.files.agents || lines < 200) {
    return pass("context-bloat", "Context bloat", "No 200+ line AGENTS.md context bloat detected.", { lines });
  }

  return warn(
    "context-bloat",
    "Context bloat",
    "AGENTS.md has 200 or more lines.",
    "Split durable rules from references and keep AGENTS.md as a short entrypoint.",
    { lines }
  );
}

function checkReadmeSetupDrift(context: ScanContext): CheckResult {
  if (!context.files.readme || !context.files.agents) {
    return pass("readme-agents-setup-drift", "README/AGENTS setup drift", "Skipped because README.md or AGENTS.md is missing.");
  }

  const readmeCommands = extractCommandMentions(context.files.readme);
  const agentCommands = extractCommandMentions(context.files.agents);
  const readmeIntents = new Set(readmeCommands.keys());
  const agentIntents = new Set(agentCommands.keys());
  const missing = [...readmeIntents].filter((intent) => !agentIntents.has(intent));

  if (missing.length > 0) {
    return warn(
      "readme-agents-setup-drift",
      "README/AGENTS setup drift",
      "README.md mentions setup commands that AGENTS.md does not mention.",
      "Mirror core setup/test/build commands from README.md into AGENTS.md.",
      { missingIntents: missing }
    );
  }

  return pass("readme-agents-setup-drift", "README/AGENTS setup drift", "README.md and AGENTS.md setup commands look aligned.");
}

function checkPackageScriptsMentioned(scriptNames: string[], aiContext: string): CheckResult {
  if (scriptNames.length === 0) {
    return pass("package-scripts-mentioned", "package scripts mentioned", "No package scripts to check.");
  }

  const importantScripts = scriptNames.filter((script) => scriptToIntent(script));
  const missing = importantScripts.filter((script) => !new RegExp(`\\b${escapeRegExp(script)}\\b`, "i").test(aiContext));

  if (missing.length > 0) {
    return warn(
      "package-scripts-mentioned",
      "package scripts mentioned",
      "package.json has important scripts that AI context files do not mention.",
      "Add test/build/lint/dev commands to AGENTS.md or CLAUDE.md.",
      { missingScripts: missing }
    );
  }

  return pass("package-scripts-mentioned", "package scripts mentioned", "Important package scripts are mentioned in AI context.");
}

function checkEnvExampleMentioned(context: ScanContext, repositoryDocs: string): CheckResult {
  if (!context.exists.envExample) {
    return pass("env-example-mentioned", ".env.example documented", "No .env.example file found.");
  }

  if (/\.env\.example|environment variables|環境変数|env\s+example/i.test(repositoryDocs)) {
    return pass("env-example-mentioned", ".env.example documented", ".env.example is mentioned in repository docs.");
  }

  return warn(
    "env-example-mentioned",
    ".env.example documented",
    ".env.example exists but README.md / AI context does not mention it.",
    "Add a short setup note for copying .env.example without exposing secrets."
  );
}

function checkEnvIgnored(context: ScanContext): CheckResult {
  if (!context.exists.env) {
    return pass("env-gitignore", ".env ignored", "No .env file found.");
  }

  if (!context.files.gitignore) {
    return fail("env-gitignore", ".env ignored", ".env exists but .gitignore is missing.", "Create .gitignore and ignore .env.");
  }

  const ignored = /^\.env$|^\.env\.\*$|^\.env\*/m.test(context.files.gitignore);
  if (!ignored) {
    return fail("env-gitignore", ".env ignored", ".env exists but is not clearly ignored.", "Add .env to .gitignore.");
  }

  return pass("env-gitignore", ".env ignored", ".env is ignored by .gitignore.");
}

function checkCursorRoleSplit(context: ScanContext, repositoryDocs: string): CheckResult {
  if (!context.exists.cursorRules) {
    return pass("cursor-role-split", "Cursor role split", "No .cursor/rules files found.");
  }

  if (/cursor|\.cursor\/rules|role split|adapter|役割分担|分担/i.test(repositoryDocs)) {
    return pass("cursor-role-split", "Cursor role split", ".cursor/rules role split is documented.");
  }

  return warn(
    "cursor-role-split",
    "Cursor role split",
    ".cursor/rules exists but AGENTS/CLAUDE role split is not documented.",
    "Explain what belongs in Cursor rules versus AGENTS.md / CLAUDE.md."
  );
}

function checkCopilotDrift(context: ScanContext): CheckResult {
  if (!context.files.copilot || !context.files.agents) {
    return pass("copilot-drift", "Copilot instruction drift", "Skipped because Copilot instructions or AGENTS.md is missing.");
  }

  const copilotCommands = extractCommandMentions(context.files.copilot);
  const agentCommands = extractCommandMentions(context.files.agents);
  const conflicts = [...copilotCommands.keys()].filter((intent) => agentCommands.has(intent) && commandSet(copilotCommands, intent) !== commandSet(agentCommands, intent));

  if (conflicts.length > 0) {
    return warn(
      "copilot-drift",
      "Copilot instruction drift",
      "Copilot instructions and AGENTS.md mention different commands.",
      "Align Copilot instructions with the canonical AGENTS.md commands.",
      { conflicts }
    );
  }

  return pass("copilot-drift", "Copilot instruction drift", "No Copilot/AGENTS command drift detected.");
}

function checkDangerousInstructions(aiContext: string): CheckResult {
  const dangerous = [
    /rm\s+-rf/i,
    /sudo\s+/i,
    /chmod\s+777/i,
    /npm\s+publish/i,
    /git\s+push/i,
    /git\s+commit/i,
    /auto-?merge/i,
    /drop\s+database/i,
    /delete\s+production/i,
    /確認なし/i,
    /無確認/i,
    /自動.*(push|commit|publish|デプロイ)/i
  ];

  if (includesAny(aiContext, dangerous)) {
    return warn(
      "dangerous-auto-instructions",
      "Dangerous automatic instructions",
      "AI context appears to contain risky automatic execution guidance.",
      "Require explicit maintainer confirmation before commit, push, publish, deploy, deletion, or secret-related work."
    );
  }

  return pass("dangerous-auto-instructions", "Dangerous automatic instructions", "No dangerous automatic execution guidance detected.");
}

function checkMaintainerWorkflow(repositoryDocs: string): CheckResult {
  const hasRelease = /release|リリース/i.test(repositoryDocs);
  const hasReview = /pull request|\bpr\b|review|レビュー/i.test(repositoryDocs);
  const hasIssue = /issue|triage|イシュー|課題/i.test(repositoryDocs);

  if (hasRelease && hasReview && hasIssue) {
    return pass("maintainer-workflow", "Maintainer workflow", "Release, PR review, and issue triage guidance found.");
  }

  return warn(
    "maintainer-workflow",
    "Maintainer workflow",
    "Release, PR review, or issue triage guidance is incomplete.",
    "Add concise release, PR review, and issue triage guidance for AI agents.",
    { hasRelease, hasReview, hasIssue }
  );
}

function checkJapaneseLanguageInstruction(repositoryDocs: string, aiContext: string): CheckResult {
  if (!containsJapanese(repositoryDocs)) {
    return pass("japanese-language-instruction", "Japanese language instruction", "Repository does not look Japanese-first.");
  }

  if (/日本語|ja-JP|Japanese|ユーザー向け.*日本語|日本語で/i.test(aiContext)) {
    return pass("japanese-language-instruction", "Japanese language instruction", "Japanese language guidance found in AI context.");
  }

  return warn(
    "japanese-language-instruction",
    "Japanese language instruction",
    "Repository looks Japanese-first, but AI context lacks language guidance.",
    "Tell AI agents whether user-facing output should be Japanese, English, or bilingual."
  );
}

function commandSet(commands: Map<string, Set<string>>, intent: string): string {
  return [...(commands.get(intent) ?? new Set<string>())].sort().join(", ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
