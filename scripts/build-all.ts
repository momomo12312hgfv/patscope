import { mkdir } from "node:fs/promises";

const targets = [
  { target: "bun-linux-x64", asset: "patscope-linux-x64" },
  { target: "bun-linux-arm64", asset: "patscope-linux-arm64" },
  { target: "bun-darwin-x64", asset: "patscope-darwin-x64" },
  { target: "bun-darwin-arm64", asset: "patscope-darwin-arm64" },
  { target: "bun-windows-x64", asset: "patscope-windows-x64.exe" },
] as const;

await mkdir("dist", { recursive: true });

for (const { target, asset } of targets) {
  const outfile = `dist/${asset}`;
  console.log(`Building ${target} -> ${outfile}`);

  const child = Bun.spawn(
    ["bun", "build", "--compile", "--minify", `--target=${target}`, "./src/cli.ts", "--outfile", outfile],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );

  const code = await child.exited;
  if (code !== 0) {
    process.exit(code);
  }
}

console.log("All targets built.");
