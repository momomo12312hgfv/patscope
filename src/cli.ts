#!/usr/bin/env bun
import { Command } from "commander";
import pkg from "../package.json";
import { registerExplain } from "./commands/explain";
import { registerRecipe } from "./commands/recipe";
import { formatError, registerScan } from "./commands/scan";

const program = new Command();

program
  .name("patscope")
  .description("See the blast radius of your GitHub token — and shrink it.")
  .version(pkg.version)
  .showHelpAfterError()
  .showSuggestionAfterError();

registerScan(program);
registerExplain(program);
registerRecipe(program);

if (process.argv.length <= 2) {
  program.help();
}

try {
  await program.parseAsync(process.argv);
} catch (error) {
  process.stderr.write(`patscope: ${formatError(error)}\n`);
  process.exitCode = 1;
}
