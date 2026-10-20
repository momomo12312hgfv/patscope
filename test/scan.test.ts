import { afterEach, describe, expect, test } from "bun:test";
import { scanToken } from "../src/scan";

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
}

function installFetch(options: { scopes?: string } = {}): void {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    const scopeHeaders: Record<string, string> = options.scopes
      ? { "x-oauth-scopes": options.scopes }
      : {};

    if (url.endsWith("/user")) {
      return jsonResponse(
        {
          login: "octocat",
          name: "The Octocat",
          two_factor_authentication: true,
          public_repos: 1,
          total_private_repos: 1,
          plan: { name: "free" },
        },
        scopeHeaders,
      );
    }

    if (url.includes("/user/orgs")) {
      return jsonResponse([{ login: "acme", role: "member" }]);
    }

    if (url.endsWith("/repos/octocat/hello")) {
      return jsonResponse({ full_name: "octocat/hello", private: true });
    }

    if (url.endsWith("/repos/octocat/missing")) {
      return new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "unexpected request" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("scanToken", () => {
  test("probes explicit repositories", async () => {
    installFetch({ scopes: "repo" });

    const report = await scanToken({
      token: "ghp_test_token_for_unit_tests_only",
      repos: ["octocat/hello", "octocat/missing", "not a repo"],
      source: "test",
      offline: false,
    });

    expect(report.schemaVersion).toBe(2);
    expect(report.repositories).toHaveLength(3);
    expect(report.repositories[0]).toMatchObject({
      fullName: "octocat/hello",
      accessible: true,
      private: true,
      status: 200,
    });
    expect(report.repositories[1]).toMatchObject({
      fullName: "octocat/missing",
      accessible: false,
      status: 404,
    });
    expect(report.repositories[2]?.error).toContain("Invalid repository name");
    expect(report.orgs.map((org) => org.login)).toEqual(["acme"]);
  });

  test("fine-grained PAT with self-reported permissions is scoreable", async () => {
    installFetch();

    const report = await scanToken({
      token: "github_pat_test_token_for_unit_tests_only",
      permissions: [{ permission: "repo.contents", access: "write" }],
      source: "test",
      offline: false,
    });

    expect(report.token.permissions).toEqual([{ permission: "repo.contents", access: "write" }]);
    expect(report.scoreKnown).toBe(true);
    expect(report.score.level).toBe("high");
    expect(report.capabilities.map((capability) => capability.id)).toContain("code:write");
  });

  test("fine-grained PAT without permissions is marked unknown", async () => {
    installFetch();

    const report = await scanToken({
      token: "github_pat_test_token_for_unit_tests_only",
      source: "test",
      offline: false,
    });

    expect(report.scoreKnown).toBe(false);
    expect(report.score.value).toBe(0);
    expect(report.warnings.some((warning) => warning.includes("not exposed"))).toBe(true);
  });
});
