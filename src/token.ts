import { execFileSync } from "node:child_process";
import type { TokenType } from "./types";

const TOKEN_PREFIXES: Array<[string, TokenType]> = [
  ["github_pat_", "fine-grained-pat"],
  ["ghp_", "classic-pat"],
  ["gho_", "oauth"],
  ["ghu_", "github-app-user"],
  ["ghs_", "github-app-server"],
  ["ghr_", "github-app-refresh"],
];

const TYPE_LABELS: Record<TokenType, string> = {
  "classic-pat": "classic PAT",
  "fine-grained-pat": "fine-grained PAT",
  oauth: "OAuth access token",
  "github-app-user": "GitHub App user token",
  "github-app-server": "GitHub App server token",
  "github-app-refresh": "GitHub App refresh token",
  unknown: "unknown token type",
};

export function detectTokenType(token: string): TokenType {
  for (const [prefix, type] of TOKEN_PREFIXES) {
    if (token.startsWith(prefix)) return type;
  }
  return "unknown";
}

export function tokenTypeLabel(type: TokenType): string {
  return TYPE_LABELS[type];
}

export function redactToken(token: string): string {
  const prefix = TOKEN_PREFIXES.find(([candidate]) => token.startsWith(candidate))?.[0];
  return prefix ? `${prefix}****...redacted` : "****...redacted";
}

export function normalizeScopes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((scope) => scope.trim()).filter(Boolean))].sort();
}

export function parseScopeInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\s,]+/)
        .map((scope) => scope.trim())
        .filter(Boolean),
    ),
  ].sort();
}

export function redactSecrets(text: string): string {
  return text.replace(/\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/g, (match) =>
    redactToken(match),
  );
}

export async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

export function getGhToken(account: string): string {
  try {
    return execFileSync("gh", ["auth", "token", "--user", account], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    throw new Error(
      `Could not read a token for "${account}" from the gh CLI. Run "gh auth status" to check the account name.`,
    );
  }
}
