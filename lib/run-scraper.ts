import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runScraperProcess() {
  const scriptPath = path.join(process.cwd(), "scripts", "scraper.mjs");
  const { stdout, stderr } = await execFileAsync("node", [scriptPath], {
    cwd: process.cwd(),
    timeout: 1000 * 60 * 8,
    maxBuffer: 1024 * 1024 * 8,
    env: process.env,
  });

  return {
    stdout,
    stderr,
    result: JSON.parse(stdout),
  };
}
