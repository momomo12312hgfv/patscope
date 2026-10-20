import { Command } from "commander";
import { CAPABILITY_BY_ID } from "../capabilities";
import {
  getPermission,
  parsePermissionInput,
  permissionNames,
  resolvePermissionName,
} from "../permissions";
import { getScope, scopeNames } from "../scopes";
import type { PermissionAccess, PermissionDefinition, ScopeDefinition } from "../types";

interface ExplainCliOptions {
  all?: boolean;
  permissions?: boolean;
  json?: boolean;
}

function capabilityDetails(ids: string[]) {
  return ids.map((capabilityId) => {
    const capability = CAPABILITY_BY_ID[capabilityId];
    return capability
      ? {
          id: capability.id,
          title: capability.title,
          description: capability.description,
          severity: capability.severity,
        }
      : { id: capabilityId, title: capabilityId, description: "", severity: "low" };
  });
}

function scopeJson(scope: ScopeDefinition) {
  return {
    ...scope,
    capabilityDetails: capabilityDetails(scope.capabilities),
  };
}

function permissionJson(permission: PermissionDefinition, access?: PermissionAccess) {
  return {
    ...permission,
    selectedAccess: access ?? null,
    readCapabilityDetails: capabilityDetails(permission.readCapabilities),
    writeCapabilityDetails: capabilityDetails(permission.writeCapabilities),
  };
}

function printPermission(permission: PermissionDefinition, access?: PermissionAccess): void {
  process.stdout.write(`${permission.name} — ${permission.title}\n`);
  process.stdout.write(`  Category:    ${permission.category}\n`);
  process.stdout.write(`  Access:      ${permission.access.join(", ")}\n`);
  process.stdout.write(`  ${permission.description}\n`);

  const sections: Array<{ label: string; access: PermissionAccess; capabilities: string[] }> = [
    { label: "Read", access: "read", capabilities: permission.readCapabilities },
    { label: "Write", access: "write", capabilities: permission.writeCapabilities },
  ];

  for (const section of sections) {
    if (access && section.access !== access) continue;
    if (section.capabilities.length === 0) continue;
    process.stdout.write(`\n  ${section.label} capabilities:\n`);
    for (const capabilityId of section.capabilities) {
      const capability = CAPABILITY_BY_ID[capabilityId];
      if (!capability) continue;
      process.stdout.write(
        `    - ${capability.title} (${capability.severity}) [${capability.id}]\n      ${capability.description}\n`,
      );
    }
  }
}

export function registerExplain(program: Command): void {
  program
    .command("explain [name]")
    .description("Explain a classic scope or a fine-grained permission")
    .option("--all", "list every known scope")
    .option("--permissions", "list fine-grained permissions instead of scopes")
    .option("--json", "output JSON")
    .action((name: string | undefined, options: ExplainCliOptions) => {
      if (options.permissions) {
        const permissions = permissionNames()
          .map((permissionName) => getPermission(permissionName))
          .filter((permission): permission is PermissionDefinition => permission !== null);

        if (options.json) {
          process.stdout.write(`${JSON.stringify(permissions.map((permission) => permissionJson(permission)), null, 2)}\n`);
          return;
        }

        const nameWidth = Math.max(12, ...permissions.map((permission) => permission.name.length));
        process.stdout.write(`${"PERMISSION".padEnd(nameWidth)}  ${"ACCESS".padEnd(12)}  CATEGORY\n`);
        for (const permission of permissions) {
          process.stdout.write(
            `${permission.name.padEnd(nameWidth)}  ${permission.access.join(", ").padEnd(12)}  ${permission.category}\n`,
          );
        }
        process.stdout.write(`\nUse "patscope explain <permission>" for details.\n`);
        return;
      }

      if (options.all || !name) {
        const scopes = scopeNames()
          .map((scopeName) => getScope(scopeName))
          .filter((scope): scope is ScopeDefinition => scope !== null);

        if (options.json) {
          process.stdout.write(`${JSON.stringify(scopes.map(scopeJson), null, 2)}\n`);
          return;
        }

        const nameWidth = Math.max(10, ...scopes.map((scope) => scope.name.length));
        process.stdout.write(`${"SCOPE".padEnd(nameWidth)}  ${"RISK".padEnd(8)}  CATEGORY\n`);
        for (const scope of scopes) {
          process.stdout.write(
            `${scope.name.padEnd(nameWidth)}  ${scope.severity.toUpperCase().padEnd(8)}  ${scope.category}\n`,
          );
        }
        process.stdout.write(`\nUse "patscope explain <scope>" for details.\n`);
        return;
      }

      if (name.includes("=") || name.includes(":")) {
        const parsed = parsePermissionInput(name);
        if (parsed.errors.length > 0) {
          throw new Error(parsed.errors.join(" "));
        }
        const grant = parsed.grants[0];
        if (!grant) {
          throw new Error(`Could not parse permission "${name}".`);
        }
        const permission = getPermission(grant.permission);
        if (!permission) {
          throw new Error(`Unknown permission "${grant.permission}".`);
        }
        if (options.json) {
          process.stdout.write(`${JSON.stringify(permissionJson(permission, grant.access), null, 2)}\n`);
          return;
        }
        printPermission(permission, grant.access);
        return;
      }

      const scope = getScope(name);
      if (scope) {
        if (options.json) {
          process.stdout.write(`${JSON.stringify(scopeJson(scope), null, 2)}\n`);
          return;
        }

        process.stdout.write(`${scope.name}\n`);
        process.stdout.write(`  Risk:     ${scope.severity.toUpperCase()}\n`);
        process.stdout.write(`  Category: ${scope.category}\n`);
        process.stdout.write(`  ${scope.description}\n`);
        process.stdout.write(`\nCapabilities:\n`);
        for (const capabilityId of scope.capabilities) {
          const capability = CAPABILITY_BY_ID[capabilityId];
          if (!capability) continue;
          process.stdout.write(
            `  - ${capability.title} (${capability.severity}) [${capability.id}]\n    ${capability.description}\n`,
          );
        }
        return;
      }

      const permissionName = resolvePermissionName(name);
      if (permissionName) {
        const permission = getPermission(permissionName);
        if (permission) {
          if (options.json) {
            process.stdout.write(`${JSON.stringify(permissionJson(permission), null, 2)}\n`);
            return;
          }
          printPermission(permission);
          return;
        }
      }

      const suggestions = scopeNames().filter((scopeName) => scopeName.includes(name));
      const permissionSuggestions = permissionNames().filter((permission) =>
        permission.includes(name),
      );
      const allSuggestions = [...suggestions, ...permissionSuggestions];
      const hint = allSuggestions.length > 0 ? ` Did you mean: ${allSuggestions.join(", ")}?` : "";
      throw new Error(`Unknown scope or permission "${name}".${hint}`);
    })
    .addHelpText(
      "after",
      `
Examples:
  $ patscope explain repo
  $ patscope explain delete_repo
  $ patscope explain contents=write
  $ patscope explain --permissions
  $ patscope explain --all
`,
    );
}
