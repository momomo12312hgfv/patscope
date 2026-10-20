import { mkdir } from "node:fs/promises";

const outfile = process.platform === "win32" ? "dist/patscope.exe" : "dist/patscope";

await mkdir("dist", { recursive: true });

const child = Bun.spawn(
  ["bun", "build", "--compile", "--minify", "./src/cli.ts", "--outfile", outfile],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

const code = await child.exited;
if (code !== 0) {
  process.exit(code);
}

console.log(`Built ${outfile}`);
