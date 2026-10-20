import { mkdir } from "node:fs/promises";

await mkdir("action-dist", { recursive: true });

const child = Bun.spawn(
  [
    "bun",
    "build",
    "./src/action-entry.ts",
    "--target=node",
    "--format=cjs",
    "--outfile",
    "action-dist/index.cjs",
  ],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

const code = await child.exited;
if (code !== 0) {
  process.exit(code);
}

console.log("Built action-dist/index.cjs");
