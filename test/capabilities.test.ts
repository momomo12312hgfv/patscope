import { describe, expect, test } from "bun:test";
import { resolveCapabilities } from "../src/capabilities";
import { evaluateCapabilities, severityAtLeast } from "../src/score";

function capabilityIds(scopes: string[]): string[] {
  return resolveCapabilities(scopes).map((capability) => capability.id);
}

describe("resolveCapabilities", () => {
  test("repo grants code read/write, repository admin and secret management", () => {
    const ids = capabilityIds(["repo"]);

    expect(ids).toContain("code:read");
    expect(ids).toContain("code:write");
    expect(ids).toContain("repo:admin");
    expect(ids).toContain("secrets:manage");
  });

  test("delete_repo grants repository deletion", () => {
    expect(capabilityIds(["delete_repo"])).toContain("repo:delete");
  });

  test("admin:org grants organization administration", () => {
    expect(capabilityIds(["admin:org"])).toContain("org:admin");
  });

  test("ignores unknown scopes", () => {
    expect(capabilityIds(["not:a:scope"])).toEqual([]);
  });

  test("deduplicates capabilities granted by multiple scopes", () => {
    const capabilities = resolveCapabilities(["repo", "admin:org"]);
    const secrets = capabilities.filter((capability) => capability.id === "secrets:manage");

    expect(secrets).toHaveLength(1);
    expect(secrets[0]?.matchedScopes).toEqual(["admin:org", "repo"]);
  });
});

describe("evaluateCapabilities", () => {
  test("an empty token has a low score", () => {
    const score = evaluateCapabilities([]);

    expect(score.value).toBe(0);
    expect(score.level).toBe("low");
    expect(score.highestSeverity).toBeNull();
  });

  test("read:user is low risk", () => {
    const score = evaluateCapabilities(resolveCapabilities(["read:user"]));

    expect(score.level).toBe("low");
    expect(score.value).toBe(2);
  });

  test("repo is high risk", () => {
    const score = evaluateCapabilities(resolveCapabilities(["repo"]));

    expect(score.level).toBe("high");
    expect(score.value).toBe(62);
  });

  test("delete_repo is critical even though its raw weight is 50", () => {
    const score = evaluateCapabilities(resolveCapabilities(["delete_repo"]));

    expect(score.level).toBe("critical");
    expect(score.value).toBe(70);
    expect(score.floorApplied).toBe(true);
  });

  test("admin:enterprise is critical", () => {
    const score = evaluateCapabilities(resolveCapabilities(["admin:enterprise"]));

    expect(score.level).toBe("critical");
    expect(score.value).toBe(70);
  });

  test("a broad token is capped at 100", () => {
    const score = evaluateCapabilities(
      resolveCapabilities([
        "repo",
        "workflow",
        "delete_repo",
        "admin:org",
        "admin:enterprise",
        "write:packages",
        "delete:packages",
      ]),
    );

    expect(score.value).toBe(100);
    expect(score.level).toBe("critical");
    expect(score.rawValue).toBeGreaterThan(100);
  });
});

describe("severityAtLeast", () => {
  test("compares severity levels", () => {
    expect(severityAtLeast("critical", "high")).toBe(true);
    expect(severityAtLeast("high", "critical")).toBe(false);
    expect(severityAtLeast("medium", "medium")).toBe(true);
  });
});
