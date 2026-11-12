// Finds imports whose letter case does not match the real file name.
// Windows and macOS ignore case, so these work on your PC and then fail
// on Vercel or Netlify (Linux). It also checks that Git tracks the same case.
//
//   node scripts/check-import-case.mjs
//
// Add to package.json:  "check:case": "node scripts/check-import-case.mjs",
//                       "prebuild": "node scripts/check-import-case.mjs"

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const RESOLVE_EXT = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"];
const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g,
  /import\(\s*["']([^"']+)["']\s*\)/g,
];

const toPosix = (p) => p.split(path.sep).join("/");

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

// Resolve a path ignoring case. Returns the path with its REAL letter case, or null.
function realCasePath(target) {
  const parsed = path.parse(path.resolve(target));
  let current = parsed.root;
  for (const part of path.relative(parsed.root, path.resolve(target)).split(path.sep)) {
    if (!part) continue;
    let names;
    try {
      names = fs.readdirSync(current);
    } catch {
      return null;
    }
    const match = names.find((n) => n === part) ?? names.find((n) => n.toLowerCase() === part.toLowerCase());
    if (!match) return null;
    current = path.join(current, match);
  }
  return current;
}

function candidates(base) {
  const list = [base];
  for (const ext of RESOLVE_EXT) list.push(base + ext);
  for (const ext of RESOLVE_EXT) list.push(path.join(base, "index" + ext));
  return list;
}

function resolveImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier.split("?")[0]);
  for (const candidate of candidates(base)) {
    const real = realCasePath(candidate);
    if (real && fs.statSync(real).isFile()) return { candidate, real };
  }
  return null;
}

export function findProblems({ rootDir, srcDir, gitPaths = null }) {
  const problems = [];
  let checked = 0;
  const gitSet = gitPaths ? new Set(gitPaths) : null;
  const gitLower = gitPaths ? new Map(gitPaths.map((p) => [p.toLowerCase(), p])) : null;

  const sources = walk(srcDir).filter((f) => SOURCE_EXT.has(path.extname(f)));
  for (const file of sources) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    const seen = new Set();
    for (const pattern of IMPORT_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const specifier = match[1];
        if (!specifier.startsWith(".")) continue;
        const key = `${match.index}:${specifier}`;
        if (seen.has(key)) continue;
        seen.add(key);
        checked++;

        const lineNo = text.slice(0, match.index).split(/\r?\n/).length;
        const where = `${toPosix(path.relative(rootDir, file))}:${lineNo}`;
        const resolved = resolveImport(file, specifier);
        if (!resolved) {
          problems.push({ kind: "missing", where, specifier, detail: "file not found" });
          continue;
        }

        // 1. Does the import use the same letter case as the file on disk?
        const wantedRel = toPosix(path.relative(rootDir, resolved.candidate));
        const realRel = toPosix(path.relative(rootDir, resolved.real));
        if (wantedRel !== realRel) {
          problems.push({
            kind: "case",
            where,
            specifier,
            detail: `the file on disk is ${realRel}`,
          });
          continue;
        }

        // 2. Does Git track the file with that same case? (This is what Vercel builds from.)
        if (gitSet && !gitSet.has(realRel)) {
          const tracked = gitLower.get(realRel.toLowerCase());
          if (tracked) {
            problems.push({
              kind: "git",
              where,
              specifier,
              detail: `Git still tracks it as ${tracked}`,
            });
          }
        }
      }
    }
  }
  return { problems, checked };
}

function getGitPaths(rootDir) {
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { cwd: rootDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return out.split("\0").filter(Boolean);
  } catch {
    return null;
  }
}

function main() {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, "src");
  if (!fs.existsSync(srcDir)) {
    console.error("Run this from the project root (the folder that contains src/).");
    process.exit(2);
  }
  const gitPaths = getGitPaths(rootDir);
  const { problems, checked } = findProblems({ rootDir, srcDir, gitPaths });

  if (!gitPaths) console.log("Note: not a Git repository (or Git is missing), so the Git check was skipped.");
  if (problems.length === 0) {
    console.log(`Import case check passed: ${checked} imports.`);
    return;
  }
  console.error(`\nImport case check found ${problems.length} problem(s) in ${checked} imports:\n`);
  for (const p of problems) {
    console.error(`  ${p.where}  "${p.specifier}"\n    ${p.detail}`);
  }
  console.error(
    "\nFix: make the import match the file name exactly. If Git has the old case, rename in two steps:\n" +
      "  git mv src/old.tsx src/tmp.tsx && git mv src/tmp.tsx src/Old.tsx\n",
  );
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
