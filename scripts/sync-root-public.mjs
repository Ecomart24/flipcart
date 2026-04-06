import { copyFile, cp, mkdir, rm } from "node:fs/promises";
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
const spaDirectRoutes = ["admin", "cart", "checkout", "login"];

for (const targetDir of targetDirs) {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });

  // Safety fallback for direct route hits when rewrites are not applied.
  const indexPath = path.join(targetDir, "index.html");
  for (const route of spaDirectRoutes) {
    const routeDir = path.join(targetDir, route);
    await mkdir(routeDir, { recursive: true });
    await copyFile(indexPath, path.join(routeDir, "index.html"));
  }
}
