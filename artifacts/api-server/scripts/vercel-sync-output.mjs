import path from "node:path";
import { pathToFileURL } from "node:url";

const sharedScriptPath = path.resolve(
  process.cwd(),
  "..",
  "..",
  "scripts",
  "vercel-sync-output.mjs",
);

await import(pathToFileURL(sharedScriptPath).href);

