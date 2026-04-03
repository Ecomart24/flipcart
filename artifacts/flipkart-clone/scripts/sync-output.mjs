import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const distPublicDir = path.join(appRoot, "dist", "public");
const appPublicDir = path.join(appRoot, "public");
const repoPublicDir = path.join(repoRoot, "public");

const targetDirs = [appPublicDir, repoPublicDir];

for (const targetDir of targetDirs) {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(distPublicDir, targetDir, { recursive: true });
}
