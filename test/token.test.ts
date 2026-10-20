import { describe, expect, test } from "bun:test";
import {
  detectTokenType,
  normalizeScopes,
  parseScopeInput,
  redactSecrets,
  redactToken,
} from "../src/token";

const TOKEN_CASES = [
  ["ghp_abc123", "classic-pat"],
  ["github_pat_abc123", "fine-grained-pat"],
  ["gho_abc123", "oauth"],
  ["ghu_abc123", "github-app-user"],
  ["ghs_abc123", "github-app-server"],
  ["ghr_abc123", "github-app-refresh"],
  ["not-a-token", "unknown"],
] as const;

describe("detectTokenType", () => {
  for (const [token, expected] of TOKEN_CASES) {
    test(`${token} -> ${expected}`, () => {
      expect(detectTokenType(token)).toBe(expected);
    });
  }
});

describe("redactToken", () => {
  test("keeps the prefix but removes the secret", () => {
    const token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";
    const redacted = redactToken(token);

    expect(redacted.startsWith("ghp_")).toBe(true);
    expect(redacted).not.toContain("1234567890");
    expect(redacted).toContain("redacted");
  });

  test("does not reveal unknown token bodies", () => {
    expect(redactToken("supersecret")).toBe("****...redacted");
  });
});

describe("normalizeScopes", () => {
  test("trims, deduplicates and sorts", () => {
    expect(normalizeScopes(" workflow, repo,repo, read:org ")).toEqual([
      "read:org",
      "repo",
      "workflow",
    ]);
  });

  test("handles null", () => {
    expect(normalizeScopes(null)).toEqual([]);
  });
});

describe("parseScopeInput", () => {
  test("accepts commas and whitespace", () => {
    expect(parseScopeInput("repo, workflow delete_repo\nread:org")).toEqual([
      "delete_repo",
      "read:org",
      "repo",
      "workflow",
    ]);
  });
});

describe("redactSecrets", () => {
  test("redacts token-shaped strings inside errors", () => {
    const message = "request failed for ghp_1234567890abcdefghijklmnopqrstuvwxyz";
    const redacted = redactSecrets(message);

    expect(redacted).not.toContain("1234567890");
    expect(redacted).toContain("ghp_****...redacted");
  });
});
