import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

test("public site contract and local links are valid", async () => {
  await execFileAsync(process.execPath, ["scripts/verify-site.mjs"], {
    cwd: process.cwd(),
  });
});
