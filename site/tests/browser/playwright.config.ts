import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: process.env.BROWSER_EVIDENCE_DIR
    ? `${process.env.BROWSER_EVIDENCE_DIR}/test-results`
    : "/tmp/ajat-astro-evidence/test-results",
  use: {
    baseURL: process.env.PREVIEW_URL ?? "http://127.0.0.1:4321",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-light",
      use: { viewport: { width: 1440, height: 1000 }, colorScheme: "light" },
    },
    {
      name: "desktop-dark",
      use: { viewport: { width: 1440, height: 1000 }, colorScheme: "dark" },
    },
    {
      name: "mobile-light",
      use: {
        viewport: { width: 320, height: 740 },
        colorScheme: "light",
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-dark",
      use: {
        viewport: { width: 320, height: 740 },
        colorScheme: "dark",
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
