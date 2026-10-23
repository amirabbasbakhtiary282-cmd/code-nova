// Copies self-hosted font files from @fontsource packages (node_modules) into
// src/fonts so `next/font/local` can embed them at build time.
// This removes the runtime/build dependency on fonts.googleapis.com, which
// breaks builds in offline or network-restricted environments.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fontsDir = join(root, "public", "fonts");
mkdirSync(fontsDir, { recursive: true });

/** @type {Array<{ from: string; to: string }>} */
const jobs = [];

for (const weight of [400, 500, 700, 800]) {
  jobs.push({
    from: join(root, "node_modules/@fontsource/vazirmatn/files", `vazirmatn-arabic-${weight}-normal.woff2`),
    to: join(fontsDir, `vazirmatn-arabic-${weight}.woff2`),
  });
  jobs.push({
    from: join(root, "node_modules/@fontsource/vazirmatn/files", `vazirmatn-latin-${weight}-normal.woff2`),
    to: join(fontsDir, `vazirmatn-latin-${weight}.woff2`),
  });
}

for (const weight of [400, 500, 700]) {
  jobs.push({
    from: join(root, "node_modules/@fontsource/jetbrains-mono/files", `jetbrains-mono-latin-${weight}-normal.woff2`),
    to: join(fontsDir, `jetbrains-mono-latin-${weight}.woff2`),
  });
}

let copied = 0;
let missing = 0;
for (const job of jobs) {
  if (!existsSync(job.from)) {
    console.warn(`[copy-fonts] missing source: ${job.from}`);
    missing += 1;
    continue;
  }
  copyFileSync(job.from, job.to);
  copied += 1;
}

console.log(`[copy-fonts] copied ${copied} font files to public/fonts (${missing} missing)`);
if (missing > 0) process.exitCode = 1;
