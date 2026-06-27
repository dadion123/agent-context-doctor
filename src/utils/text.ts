export function countLines(value = ""): number {
  if (!value.trim()) {
    return 0;
  }

  return value.split(/\r?\n/).length;
}

export function normalizeTokens(value = ""): string[] {
  return value
    .toLowerCase()
    .replace(/[`*_#[\](){}:;,.!?/\\|<>="-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

export function jaccardSimilarity(left = "", right = ""): number {
  const leftTokens = new Set(normalizeTokens(left));
  const rightTokens = new Set(normalizeTokens(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function containsJapanese(value = ""): boolean {
  const matches = value.match(/[\u3040-\u30ff\u3400-\u9fff]/g);
  return Boolean(matches && matches.length >= 20);
}

export function includesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

export function compactList(values: Array<string | undefined | false>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

export function extractCommandMentions(value = ""): Map<string, Set<string>> {
  const intents = new Map<string, Set<string>>();
  const commandPattern = /\b(pnpm|npm|yarn|bun)\s+(run\s+)?([a-zA-Z0-9:_-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = commandPattern.exec(value)) !== null) {
    const manager = match[1];
    const script = match[3];
    const intent = scriptToIntent(script);
    if (!intent) {
      continue;
    }

    const existing = intents.get(intent) ?? new Set<string>();
    existing.add(`${manager} ${script}`);
    intents.set(intent, existing);
  }

  return intents;
}

export function scriptToIntent(scriptName: string): string | undefined {
  const lower = scriptName.toLowerCase();
  if (lower.includes("test")) {
    return "test";
  }
  if (lower.includes("build")) {
    return "build";
  }
  if (lower.includes("lint")) {
    return "lint";
  }
  if (lower === "dev" || lower.includes("start")) {
    return "dev";
  }
  return undefined;
}
