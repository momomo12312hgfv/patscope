import { describe, expect, test } from "bun:test";
import { renderReport } from "../src/report";
import { scanToken } from "../src/scan";

async function makeReport() {
  return scanToken({
    offline: true,
    permissions: [{ permission: "repo.contents", access: "write" }],
    login: "octocat",
    source: "offline",
  });
}

describe("SARIF output", () => {
  test("is valid SARIF 2.1.0 with one rule per capability", async () => {
    const output = renderReport(await makeReport(), "sarif", false);
    const sarif = JSON.parse(output) as {
      version: string;
      runs: Array<{
        tool: { driver: { name: string; rules: Array<{ id: string }> } };
        results: Array<{
          ruleId: string;
          level: string;
          message: { text: string };
          locations: Array<{
            physicalLocation?: { artifactLocation?: { uri?: string } };
          }>;
          partialFingerprints: Record<string, string>;
        }>;
        invocations: Array<{ executionSuccessful: boolean }>;
      }>;
    };

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs).toHaveLength(1);

    const run = sarif.runs[0];
    expect(run?.tool.driver.name).toBe("patscope");
    expect(run?.tool.driver.rules.length).toBeGreaterThan(20);
    expect(run?.tool.driver.rules.some((rule) => rule.id === "patscope/code:write")).toBe(true);
    expect(run?.invocations[0]?.executionSuccessful).toBe(true);

    const result = run?.results.find((item) => item.ruleId === "patscope/code:write");
    expect(result).toBeDefined();
    expect(result?.level).toBe("error");
    expect(result?.message.text).toContain("Granted by");
    expect(result?.locations).toHaveLength(1);
    expect(result?.locations[0]?.physicalLocation?.artifactLocation?.uri).toBe(
      "patscope-report.md",
    );
    expect(result?.partialFingerprints["patscope/v1"]).toBe("code:write");
  });

  test("does not include the token in the report", async () => {
    const output = renderReport(await makeReport(), "sarif", false);

    expect(output).not.toContain("ghp_");
    expect(output).not.toContain("github_pat_");
  });
});
