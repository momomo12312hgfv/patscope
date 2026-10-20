import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";

const projectRoot = `${import.meta.dir}/..`;

function run(args: string[]): string {
  return execFileSync(process.execPath, ["run", "src/cli.ts", ...args], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

describe("cli", () => {
  test("scan --offline --format json returns a report", () => {
    const output = run([
      "scan",
      "--offline",
      "--scopes",
      "repo",
      "--login",
      "octocat",
      "--format",
      "json",
    ]);
    const report = JSON.parse(output) as {
      schemaVersion: number;
      identity: { login: string };
      token: { scopes: string[] };
      score: { level: string };
    };

    expect(report.schemaVersion).toBe(2);
    expect(report.identity.login).toBe("octocat");
    expect(report.token.scopes).toEqual(["repo"]);
    expect(report.score.level).toBe("high");
  });

  test("scan --fail-on exits with code 2", () => {
    const result = Bun.spawnSync(
      [
        process.execPath,
        "run",
        "src/cli.ts",
        "scan",
        "--offline",
        "--scopes",
        "delete_repo",
        "--login",
        "octocat",
        "--format",
        "json",
        "--fail-on",
        "high",
      ],
      {
        cwd: projectRoot,
        stdout: "pipe",
        stderr: "pipe",
      },
    );

    expect(result.exitCode).toBe(2);
  });

  test("scan --offline --permissions evaluates fine-grained permissions", () => {
    const output = run([
      "scan",
      "--offline",
      "--permissions",
      "contents=write,metadata=read",
      "--login",
      "octocat",
      "--format",
      "json",
    ]);
    const report = JSON.parse(output) as {
      token: { permissions: Array<{ permission: string; access: string }> };
      score: { level: string; value: number };
      capabilities: Array<{ id: string }>;
    };

    expect(report.token.permissions).toEqual([
      { permission: "repo.contents", access: "write" },
      { permission: "repo.metadata", access: "read" },
    ]);
    expect(report.score.level).toBe("high");
    expect(report.score.value).toBe(45);
    expect(report.capabilities.map((capability) => capability.id)).toContain("code:write");
  });

  test("scan --format sarif emits SARIF 2.1.0", () => {
    const output = run([
      "scan",
      "--offline",
      "--scopes",
      "delete_repo",
      "--login",
      "octocat",
      "--format",
      "sarif",
    ]);
    const sarif = JSON.parse(output) as {
      version: string;
      runs: Array<{ results: Array<{ ruleId: string }> }>;
    };

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.results.some((result) => result.ruleId === "patscope/repo:delete")).toBe(
      true,
    );
  });

  test("explain prints fine-grained permission details", () => {
    const output = run(["explain", "contents=write"]);

    expect(output).toContain("repo.contents");
    expect(output).toContain("Write capabilities");
    expect(output).toContain("code:write");
  });

  test("explain --permissions lists permission names", () => {
    const output = run(["explain", "--permissions"]);

    expect(output).toContain("repo.contents");
    expect(output).toContain("org.members");
    expect(output).toContain("user.emails");
  });

  test("explain prints scope details", () => {
    const output = run(["explain", "repo"]);

    expect(output).toContain("Full control of private repositories");
    expect(output).toContain("code:write");
  });

  test("recipe prints fine-grained permissions", () => {
    const output = run(["recipe", "push"]);

    expect(output).toContain("Contents");
    expect(output).toContain("Pull requests");
    expect(output).toContain("Classic PAT: repo");
  });
});
