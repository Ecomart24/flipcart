import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptsDir, "..");
const repoRoot = path.resolve(appDir, "..", "..");

const sourceDir = path.join(appDir, "dist", "public");
const targetDirs = [
  path.join(repoRoot, "public"),
  path.join(repoRoot, "artifacts", "api-server", "public"),
  path.join(appDir, "public"),
];

for (const targetDir of targetDirs) {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
}
