export { applySafeFixes } from "./fixer/index.js";
export { scanRepository } from "./scanner/index.js";
export { formatAppliedFixes, formatPatchPlan, formatTextReport } from "./reporters/text.js";
export type { AppliedFix, CheckResult, CheckStatus, FixResult, PatchPlanItem, ReportLocale, ScanReport } from "./types.js";
