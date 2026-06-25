#!/usr/bin/env node
/**
 * Pre-flight check for case-sensitive CI (Linux).
 *
 * macOS's filesystem is case-insensitive, so `import "./ResultsPanel"` happily
 * resolves a file Git is actually tracking as "Resultspanel.tsx". On GitHub's
 * Linux runners that import fails and the whole suite errors out. This script
 * resolves every relative / "@/" import against the *Git-tracked* filename,
 * case-sensitively, and fails if any only matches when case is ignored.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
const trackedSet = new Set(tracked);
const trackedLower = new Map(tracked.map((f) => [f.toLowerCase(), f]));

const sources = tracked.filter((f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f));
const importRe =
  /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const exts = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", "/index.ts", "/index.tsx"];

let problems = 0;
for (const file of sources) {
  const code = readFileSync(file, "utf8");
  let m;
  while ((m = importRe.exec(code))) {
    const spec = m[1] || m[2];
    if (!spec) continue;
    let base;
    if (spec.startsWith(".")) {
      base = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
    } else if (spec.startsWith("@/")) {
      base = path.posix.normalize(path.posix.join("src", spec.slice(2)));
    } else {
      continue; // third-party package — not our file casing
    }
    let exact = null;
    let loose = null;
    for (const ext of exts) {
      const cand = base + ext;
      if (trackedSet.has(cand)) { exact = cand; break; }
      const lc = trackedLower.get(cand.toLowerCase());
      if (lc && !loose) loose = lc;
    }
    if (!exact && loose) {
      console.error(`✗ ${file}: import "${spec}" → Git tracks it as "${loose}"`);
      problems++;
    }
  }
}

if (problems === 0) {
  console.log("✓ No case-mismatched relative imports — safe for Linux CI.");
} else {
  console.error(`\n${problems} case mismatch(es) — these WILL fail on Linux CI.`);
  process.exit(1);
}