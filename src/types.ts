export type CheckStatus = "pass" | "warn" | "fail";
export type ReportLocale = "en" | "ja";

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  suggestion?: string;
  details?: Record<string, unknown>;
}

export interface PatchPlanItem {
  title: string;
  path: string;
  reason: string;
  risk: "low" | "medium";
  dryRunOnly: boolean;
}

export interface AppliedFix {
  title: string;
  path: string;
  changed: boolean;
}

export interface FixResult {
  dryRun: boolean;
  applied: AppliedFix[];
  skipped: PatchPlanItem[];
  report: ScanReport;
}

export interface ScanReport {
  tool: "Agent Context Doctor";
  version: string;
  root: string;
  score: number;
  checks: CheckResult[];
  suggestedNextSteps: string[];
  patchPlan: PatchPlanItem[];
  metadata: {
    files: Record<string, boolean | number>;
    packageScripts: string[];
  };
}

export interface ScanContext {
  root: string;
  files: {
    readme?: string;
    agents?: string;
    claude?: string;
    copilot?: string;
    gitignore?: string;
    envExample?: string;
    packageJson?: unknown;
    docs: string[];
    cursorRules: string[];
    workflows: string[];
  };
  packageScripts: Record<string, string>;
  exists: {
    readme: boolean;
    agents: boolean;
    claude: boolean;
    copilot: boolean;
    gitignore: boolean;
    env: boolean;
    envExample: boolean;
    packageJson: boolean;
    cursorRules: boolean;
    workflows: boolean;
  };
}
