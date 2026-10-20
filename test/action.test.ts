import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runAction } from "../src/action";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
let tempDir = "";

function jsonResponse(body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
}

function installFetch(): void {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith("/user")) {
      return jsonResponse({
        login: "octocat",
        name: "The Octocat",
        two_factor_authentication: true,
        public_repos: 1,
        total_private_repos: 0,
        plan: { name: "free" },
      });
    }
    if (url.includes("/user/orgs")) {
      return jsonResponse([]);
    }
    return new Response(JSON.stringify({ message: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "patscope-action-"));
  installFetch();
  process.env.INPUT_TOKEN = "github_pat_test_token_for_unit_tests_only";
  process.env.INPUT_FORMAT = "markdown";
  process.env["INPUT_OUTPUT-FILE"] = join(tempDir, "report.md");
  process.env.INPUT_PERMISSIONS = "contents=write,metadata=read";
  process.env.INPUT_REPOS = "";
  process.env.GITHUB_OUTPUT = join(tempDir, "output.txt");
  process.env.GITHUB_STEP_SUMMARY = join(tempDir, "summary.md");
  process.exitCode = 0;
});

afterEach(async () => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  process.exitCode = 0;
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

describe("GitHub Action", () => {
  test("writes the report, step summary and outputs", async () => {
    process.env["INPUT_FAIL-ON"] = "critical";

    await runAction({ silent: true });

    const report = await readFile(join(tempDir, "report.md"), "utf8");
    expect(report).toContain("# patscope report");
    expect(report).toContain("repo.contents=write");

    const summary = await readFile(join(tempDir, "summary.md"), "utf8");
    expect(summary).toContain("Blast radius");

    const outputs = await readFile(join(tempDir, "output.txt"), "utf8");
    expect(outputs).toContain("score=45");
    expect(outputs).toContain("level=high");
    expect(outputs).toContain("report=");
    expect(process.exitCode).toBe(0);
  });

  test("fails the job when the threshold is reached", async () => {
    process.env["INPUT_FAIL-ON"] = "high";
    process.env.INPUT_PERMISSIONS = "repo.administration=write";

    await runAction({ silent: true });

    expect(process.exitCode).toBe(1);
  });

  test("writes SARIF and a Markdown step summary", async () => {
    process.env.INPUT_FORMAT = "sarif";
    process.env["INPUT_OUTPUT-FILE"] = join(tempDir, "report.sarif");
    process.env["INPUT_FAIL-ON"] = "critical";

    await runAction({ silent: true });

    const sarif = JSON.parse(await readFile(join(tempDir, "report.sarif"), "utf8")) as {
      version: string;
      runs: Array<{ results: Array<{ ruleId: string }> }>;
    };
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.results.some((result) => result.ruleId === "patscope/code:write")).toBe(
      true,
    );

    const summary = await readFile(join(tempDir, "summary.md"), "utf8");
    expect(summary).toContain("Blast radius");
    expect(summary).toContain("Capabilities");
  });

  test("rejects invalid fine-grained permissions", async () => {
    process.env.INPUT_PERMISSIONS = "metadata=write";

    await expect(runAction({ silent: true })).rejects.toThrow("does not support");
  });

  test("requires a token", async () => {
    delete process.env.INPUT_TOKEN;

    await expect(runAction({ silent: true })).rejects.toThrow("Input 'token' is required");
  });
});
