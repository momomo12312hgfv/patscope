import { Command } from "commander";
import { getRecipe, RECIPES, type Recipe } from "../recipes";

interface RecipeCliOptions {
  json?: boolean;
}

function printRecipe(recipe: Recipe): void {
  process.stdout.write(`${recipe.id} — ${recipe.title}\n`);
  process.stdout.write(`  ${recipe.description}\n\n`);

  const permissionWidth = Math.max(11, ...recipe.fineGrained.map((item) => item.permission.length));
  const accessWidth = Math.max(5, ...recipe.fineGrained.map((item) => item.access.length));

  process.stdout.write("  Fine-grained PAT:\n");
  for (const item of recipe.fineGrained) {
    process.stdout.write(
      `    ${item.permission.padEnd(permissionWidth)}  ${item.access.padEnd(accessWidth)}  ${item.why}\n`,
    );
  }

  process.stdout.write(`\n  Classic PAT: ${recipe.classic.join(", ")}\n`);
  if (recipe.notes.length > 0) {
    process.stdout.write(`\n  Notes:\n`);
    for (const note of recipe.notes) {
      process.stdout.write(`    - ${note}\n`);
    }
  }
  process.stdout.write("\n");
}

export function registerRecipe(program: Command): void {
  program
    .command("recipe [scenario]")
    .description("Show a least-privilege token recipe")
    .option("--json", "output JSON")
    .action((scenario: string | undefined, options: RecipeCliOptions) => {
      if (!scenario) {
        if (options.json) {
          process.stdout.write(`${JSON.stringify(RECIPES, null, 2)}\n`);
          return;
        }
        process.stdout.write("Least-privilege recipes:\n\n");
        for (const recipe of RECIPES) {
          process.stdout.write(`  ${recipe.id.padEnd(8)} ${recipe.title}\n`);
        }
        process.stdout.write(`\nUse "patscope recipe <scenario>" for details.\n`);
        return;
      }

      const recipe = getRecipe(scenario);
      if (!recipe) {
        throw new Error(
          `Unknown recipe "${scenario}". Expected one of: ${RECIPES.map((item) => item.id).join(", ")}.`,
        );
      }

      if (options.json) {
        process.stdout.write(`${JSON.stringify(recipe, null, 2)}\n`);
        return;
      }

      printRecipe(recipe);
    })
    .addHelpText(
      "after",
      `
Examples:
  $ patscope recipe push
  $ patscope recipe ci --json
  $ patscope recipe release
`,
    );
}
