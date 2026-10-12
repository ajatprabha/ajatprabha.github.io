import { defineConfig } from "astro/config";
import { rm } from "node:fs/promises";
import tableRegions from "./scripts/rehype-table-regions.mjs";
import { satteri } from "@astrojs/markdown-satteri";
export default defineConfig({
  site: "https://ajatprabha.in",
  output: "static",
  trailingSlash: "ignore",
  markdown: {
    processor: satteri({ hastPlugins: [tableRegions] }),
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
  integrations: [
    {
      name: "review-route-gate",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          if (process.env.THEME_REFERENCE !== "1")
            await rm(new URL("theme-reference/", dir), {
              recursive: true,
              force: true,
            });
        },
      },
    },
  ],
});
