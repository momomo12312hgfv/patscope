import { runAction } from "./action";

runAction().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`patscope: ${message}\n`);
  process.exitCode = 1;
});
