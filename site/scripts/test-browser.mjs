import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
const site = fileURLToPath(new URL("../", import.meta.url));
let server;
const env = { ...process.env };
try {
  if (!env.PREVIEW_URL) {
    env.PREVIEW_URL = "http://127.0.0.1:4325";
    server = spawn(
      process.execPath,
      [
        `${site}/node_modules/astro/bin/astro.mjs`,
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        "4325",
        "--ignore-lock",
      ],
      { cwd: site, stdio: "inherit" },
    );
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null)
        throw new Error("Preview server exited before readiness");
      try {
        const response = await fetch(env.PREVIEW_URL);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await setTimeout(300);
    }
    if (!ready) throw new Error("Timed out starting built preview server");
  }
  const browser = spawn(
    process.execPath,
    [
      `${site}/node_modules/@playwright/test/cli.js`,
      "test",
      "--config",
      "tests/browser/playwright.config.ts",
    ],
    { cwd: site, env, stdio: "inherit" },
  );
  process.exitCode = await new Promise((resolve, reject) => {
    browser.once("error", reject);
    browser.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((resolve) => server.once("exit", resolve));
  }
}
