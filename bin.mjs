#!/usr/bin/env node
// updoc installer — copies the skill files into an agent skills directory.
// Usage:
//   npx updoc                    # install to ~/.agents/skills/updoc
//   npx updoc --dir <path>       # install to a custom directory
//   npx updoc --dsh              # install to ~/.config/dsh/skills/updoc
//   npx updoc --claude           # install to ~/.claude/skills/updoc
//   npx updoc --remove           # remove the installed skill

import { cp, rm, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const argv = process.argv.slice(2);

function usage() {
  console.log(`updoc — component knowledge-base skill installer

  npx updoc                install to ~/.agents/skills/updoc
  npx updoc --dsh          install to ~/.config/dsh/skills/updoc
  npx updoc --claude       install to ~/.claude/skills/updoc
  npx updoc --dir <path>   install to a custom directory
  npx updoc --remove       remove the installed skill
`);
}

function parseArgs(argv) {
  const opts = { dir: null, remove: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir") opts.dir = argv[++i];
    else if (argv[i] === "--dsh") opts.dir = path.join(os.homedir(), ".config", "dsh", "skills", "updoc");
    else if (argv[i] === "--claude") opts.dir = path.join(os.homedir(), ".claude", "skills", "updoc");
    else if (argv[i] === "--remove") opts.remove = true;
    else if (argv[i] === "-h" || argv[i] === "--help") { usage(); process.exit(0); }
    else { console.error(`unknown option: ${argv[i]}`); usage(); process.exit(1); }
  }
  if (opts.dir === null) opts.dir = path.join(os.homedir(), ".agents", "skills", "updoc");
  return opts;
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

const src = path.dirname(fileURLToPath(import.meta.url));
const opts = parseArgs(argv);
const dest = path.resolve(opts.dir);

if (opts.remove) {
  if (!(await exists(dest))) {
    console.log(`nothing to remove at ${dest}`);
    process.exit(0);
  }
  await rm(dest, { recursive: true, force: true });
  console.log(`removed ${dest}`);
  process.exit(0);
}

if (await exists(dest)) {
  console.log(`updating existing install at ${dest}`);
  await rm(dest, { recursive: true, force: true });
}

await mkdir(path.dirname(dest), { recursive: true });
for (const item of ["SKILL.md", "references"]) {
  await cp(path.join(src, item), path.join(dest, item), { recursive: true });
}

console.log(`installed updoc skill to ${dest}`);
console.log(`next: register it in your agent's skill index if needed (e.g. AGENTS.md)`);
