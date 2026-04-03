import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptsDir, "..");
const distPublicDir = path.join(appRoot, "dist", "public");
const publicDir = path.join(appRoot, "public");

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });
await cp(distPublicDir, publicDir, { recursive: true });

