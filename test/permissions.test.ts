import { describe, expect, test } from "bun:test";
import {
  mergeCapabilities,
  resolveCapabilities,
  resolveCapabilitiesFromPermissions,
} from "../src/capabilities";
import {
  parsePermissionInput,
  permissionNames,
  resolvePermissionName,
} from "../src/permissions";
import { evaluateCapabilities } from "../src/score";

describe("permission parsing", () => {
  test("accepts short names and normalizes them", () => {
    const result = parsePermissionInput("contents=write,metadata=read");

    expect(result.errors).toEqual([]);
    expect(result.grants).toEqual([
      { permission: "repo.contents", access: "write" },
      { permission: "repo.metadata", access: "read" },
    ]);
  });

  test("accepts colons as a separator", () => {
    const result = parsePermissionInput("workflows:write");

    expect(result.errors).toEqual([]);
    expect(result.grants).toEqual([{ permission: "repo.workflows", access: "write" }]);
  });

  test("rejects unknown permissions", () => {
    const result = parsePermissionInput("not_a_permission=write");

    expect(result.grants).toEqual([]);
    expect(result.errors[0]).toContain("Unknown or ambiguous permission");
  });

  test("rejects unsupported access levels", () => {
    const result = parsePermissionInput("metadata=write");

    expect(result.grants).toEqual([]);
    expect(result.errors[0]).toContain("does not support");
  });

  test("rejects ambiguous short names", () => {
    const result = parsePermissionInput("codespaces=write");

    expect(result.grants).toEqual([]);
    expect(result.errors[0]).toContain("Unknown or ambiguous");
  });

  test("resolves canonical names", () => {
    expect(resolvePermissionName("repo.contents")).toBe("repo.contents");
    expect(resolvePermissionName("org.members")).toBe("org.members");
    expect(permissionNames()).toContain("user.emails");
  });
});

describe("resolveCapabilitiesFromPermissions", () => {
  test("contents write grants code read and write", () => {
    const capabilities = resolveCapabilitiesFromPermissions([
      { permission: "repo.contents", access: "write" },
    ]);
    const ids = capabilities.map((capability) => capability.id);

    expect(ids).toContain("code:read");
    expect(ids).toContain("code:write");
    expect(capabilities.find((capability) => capability.id === "code:write")?.matchedScopes).toEqual([
      "repo.contents=write",
    ]);
  });

  test("workflows write grants workflow modification", () => {
    const capabilities = resolveCapabilitiesFromPermissions([
      { permission: "repo.workflows", access: "write" },
    ]);

    expect(capabilities.map((capability) => capability.id)).toEqual(["workflow:write"]);
  });

  test("organization administration write is critical", () => {
    const capabilities = resolveCapabilitiesFromPermissions([
      { permission: "org.administration", access: "write" },
    ]);
    const score = evaluateCapabilities(capabilities);

    expect(score.level).toBe("critical");
    expect(score.value).toBe(70);
  });

  test("metadata read grants no capability", () => {
    const capabilities = resolveCapabilitiesFromPermissions([
      { permission: "repo.metadata", access: "read" },
    ]);

    expect(capabilities).toEqual([]);
  });

  test("merges scopes and permissions without duplicates", () => {
    const merged = mergeCapabilities(
      resolveCapabilities(["repo"]),
      resolveCapabilitiesFromPermissions([{ permission: "repo.contents", access: "write" }]),
    );
    const codeWrite = merged.filter((capability) => capability.id === "code:write");

    expect(codeWrite).toHaveLength(1);
    expect(codeWrite[0]?.matchedScopes).toEqual(["repo", "repo.contents=write"]);
  });
});
