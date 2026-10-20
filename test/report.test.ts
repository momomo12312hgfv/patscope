import { describe, expect, test } from "bun:test";
import { renderReport } from "../src/report";
import { scanToken } from "../src/scan";

async function makeReport() {
  return scanToken({
    offline: true,
    scopes: ["repo", "delete_repo"],
    login: "octocat",
    source: "offline",
  });
}

describe("renderTerminal", () => {
  test("includes the score and top risks", async () => {
    const output = renderReport(await makeReport(), "terminal", false);

    expect(output).toContain("patscope 0.1.0");
    expect(output).toContain("Blast radius");
    expect(output).toContain("CRITICAL");
    expect(output).toContain("Delete repositories");
    expect(output).toContain("delete_repo");
  });
});

describe("renderMarkdown", () => {
  test("renders metadata and capability tables", async () => {
    const output = renderReport(await makeReport(), "markdown", false);

    expect(output).toContain("# patscope report");
    expect(output).toContain("| Capability | Severity | Granted by |");
    expect(output).toContain("Delete repositories");
    expect(output).toContain("delete_repo");
  });
});

describe("renderJson", () => {
  test("is machine-readable and keeps the schema version", async () => {
    const output = renderReport(await makeReport(), "json", false);
    const parsed = JSON.parse(output) as {
      schemaVersion: number;
      scoreKnown: boolean;
      identity: { login: string };
      token: { scopes: string[] };
      score: { level: string; value: number };
    };

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.scoreKnown).toBe(true);
    expect(parsed.identity.login).toBe("octocat");
    expect(parsed.token.scopes).toEqual(["delete_repo", "repo"]);
    expect(parsed.score.level).toBe("critical");
    expect(parsed.score.value).toBe(100);
  });
});
