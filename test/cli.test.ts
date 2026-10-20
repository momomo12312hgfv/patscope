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

    expect(report.schemaVersion).toBe(1);
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
