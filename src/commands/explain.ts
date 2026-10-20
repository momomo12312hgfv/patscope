import { Command } from "commander";
import { CAPABILITY_BY_ID } from "../capabilities";
import { scopeNames, getScope } from "../scopes";
import type { ScopeDefinition } from "../types";

interface ExplainCliOptions {
  all?: boolean;
  json?: boolean;
}

function scopeJson(scope: ScopeDefinition) {
  return {
    ...scope,
    capabilityDetails: scope.capabilities.map((capabilityId) => {
      const capability = CAPABILITY_BY_ID[capabilityId];
      return capability
        ? {
            id: capability.id,
            title: capability.title,
            description: capability.description,
            severity: capability.severity,
          }
        : { id: capabilityId, title: capabilityId, description: "", severity: "low" };
    }),
  };
}

export function registerExplain(program: Command): void {
  program
    .command("explain [scope]")
    .description("Explain a classic GitHub token scope")
    .option("--all", "list every known scope")
    .option("--json", "output JSON")
    .action((scopeName: string | undefined, options: ExplainCliOptions) => {
      if (options.all || !scopeName) {
        const scopes = scopeNames().map((name) => getScope(name)).filter((scope): scope is ScopeDefinition => scope !== null);

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

      const scope = getScope(scopeName);
      if (!scope) {
        const suggestions = scopeNames().filter((name) => name.includes(scopeName));
        const hint = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : "";
        throw new Error(`Unknown scope "${scopeName}".${hint}`);
      }

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
    })
    .addHelpText(
      "after",
      `
Examples:
  $ patscope explain repo
  $ patscope explain delete_repo
  $ patscope explain --all
`,
    );
}
