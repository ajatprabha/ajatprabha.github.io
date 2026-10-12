import { test, expect, type Page, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
const article = "/2026/08/12/ferry-xload-learns-to-write";
const fixtures = [
  article,
  "/2026/08/12/what-the-windows-registry-taught-me",
  "/2020/06/24/k8s-operator-with-api-server-for-gui",
  "/2018/06/03/second-week-at-gojek",
  "/2017/12/20/tdd-why-bother",
  "/2020/10/06/diy-sound-system-minimalistic",
];
async function containment(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "Page must contain wide content",
  ).toBe(true);
}
async function loadedImage(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate(
        (element) =>
          element instanceof HTMLImageElement &&
          element.complete &&
          element.naturalWidth > 0,
      ),
    )
    .toBe(true);
}
async function centeredArticle(page: Page, viewportWidth: number) {
  const geometry = await page
    .locator(".prose > p")
    .first()
    .evaluate((paragraph) => {
      const prose = paragraph.getBoundingClientRect();
      const cover = document
        .querySelector(".article-cover img")
        ?.getBoundingClientRect();
      return {
        center: prose.x + prose.width / 2,
        width: prose.width,
        left: prose.left,
        right: prose.right,
        headings: Array.from(
          document.querySelectorAll(".reading-body > h2, .reading-body > h3"),
          (heading) => {
            const rect = heading.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              textAlign: getComputedStyle(heading).textAlign,
            };
          },
        ),
        coverWidth: cover?.width,
        quoteWidth: document
          .querySelector(".reading-body > blockquote")
          ?.getBoundingClientRect().width,
      };
    });
  expect(Math.abs(geometry.center - viewportWidth / 2)).toBeLessThanOrEqual(2);
  if (viewportWidth >= 1000) {
    expect(geometry.headings.length).toBeGreaterThan(0);
    for (const heading of geometry.headings) {
      expect(Math.abs(heading.left - geometry.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(heading.right - geometry.right)).toBeLessThanOrEqual(1);
      expect(["left", "start"]).toContain(heading.textAlign);
    }
    expect(geometry.coverWidth).toBeGreaterThan(geometry.width);
    expect(geometry.quoteWidth).toBeGreaterThan(geometry.width);
    expect(geometry.quoteWidth).toBeLessThanOrEqual(geometry.coverWidth!);
  }
}
async function screenshot(page: Page, name: string) {
  const directory =
    process.env.BROWSER_EVIDENCE_DIR ?? "/tmp/ajat-astro-evidence";
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: join(directory, `${name}.png`),
    fullPage: name.includes("home"),
  });
}
test("home to writing/article and projects/detail, metadata and optional composition", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Recent writing", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Selected projects" }),
  ).toBeVisible();
  await containment(page);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator(".home-hero")).toHaveCount(0);
  await loadedImage(page.locator(".featured-article img"));
  await expect(page.locator(".article-card-grid img")).toHaveCount(3);
  for (const image of await page.locator(".article-card-grid img").all()) {
    await loadedImage(image);
  }
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    const luminance = (color: string) => {
      const channels = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const text = luminance(style.color);
    const background = luminance(getComputedStyle(document.documentElement).backgroundColor);
    return {
      contrast:
        (Math.max(text, background) + 0.05) /
        (Math.min(text, background) + 0.05),
      mode: getComputedStyle(document.documentElement).colorScheme,
    };
  });
  expect(palette.contrast).toBeGreaterThanOrEqual(4.5);
  expect(palette.mode).toBe(info.project.use.colorScheme);
  await screenshot(page, `${info.project.name}-home`);
  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("link", { name: "Writing", exact: true })
    .click();
  await expect(page).toHaveURL(/\/writing\/?$/);
  await expect(page.locator("main h2").first()).toBeVisible();
  await expect(page.locator("main h3")).toHaveCount(0);
  await expect(page.locator(".article-card-grid img")).toHaveCount(13);
  await loadedImage(page.locator(".article-card-grid img").first());
  await page
    .getByRole("link", { name: "Ferry: xload Learns to Write", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ferry: xload Learns to Write",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://ajatprabha.in${article}`,
  );
  const relatedSection = page.getByRole("region", {
    name: "Related writing",
    exact: true,
  });
  await expect(relatedSection.locator(".article-card-grid img")).toHaveCount(3);
  for (const image of await relatedSection.locator(".article-card-grid img").all()) {
    await loadedImage(image);
  }
  await centeredArticle(page, info.project.use.viewport!.width);
  const contents =
    info.project.use.viewport!.width >= 1312
      ? page.locator(".toc-rail")
      : page.locator(".toc-disclosure");
  await expect(contents).toBeVisible();
  if (info.project.use.viewport!.width < 1312) {
    await contents.locator("summary").click();
  }
  await expect(contents.getByRole("link")).toHaveCount(12);
  await contents.getByRole("link").first().focus();
  await expect(contents.getByRole("link").first()).toBeFocused();
  if (info.project.use.viewport!.width >= 1312) {
    const firstLabel = contents.getByRole("link").first().locator(".toc-label");
    await expect
      .poll(() => firstLabel.evaluate((label) => getComputedStyle(label).opacity))
      .toBe("1");
    const rail = await contents.boundingBox();
    const cover = await page.locator(".article-cover").boundingBox();
    expect(rail!.x + rail!.width).toBeLessThanOrEqual(cover!.x);
  }
  await contents.getByRole("link").first().click();
  expect(new URL(page.url()).hash).not.toBe("");
  await page.goto("/projects/");
  await expect(page.locator("main h2").first()).toBeVisible();
  await expect(page.locator("main h3")).toHaveCount(0);
  await page.getByRole("link", { name: "Darkroom", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/darkroom\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Darkroom");
  await expect(
    page.getByRole("link", { name: "Source code", exact: true }),
  ).toHaveAttribute("href", "https://github.com/gojek/darkroom");
  await expect(page.locator('aside[aria-label="On this page"]')).toHaveCount(0);
  await expect(page.locator(".article-card-grid img")).toHaveCount(4);
  for (const image of await page.locator(".article-card-grid img").all()) {
    await loadedImage(image);
  }
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
  await expect(page.locator("main")).toContainText("Kong");
  await expect(
    page.getByRole("link", { name: "GSoC 2019 archive", exact: true }),
  ).toHaveAttribute("href", "https://ajatprabha.in/gsoc-meta-k8s/");
  expect(errors).toEqual([]);
});
test("representative media/code/table articles stay contained and load local resources", async ({
  page,
}, info) => {
  const failed: string[] = [];
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.url().startsWith(new URL(page.url()).origin)
    )
      failed.push(`${response.status()} ${response.url()}`);
  });
  for (const path of fixtures) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".article-header")).not.toContainText("by Ajat Prabha");
    await expect(page.locator(".article-header time")).toBeVisible();
    await expect(page.getByRole("list", { name: "Tags", exact: true })).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await containment(page);
    const brokenImages = await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .filter((image): image is HTMLImageElement => image instanceof HTMLImageElement)
          .filter(
            (image) =>
              image.loading !== "lazy" &&
              image.complete &&
              image.naturalWidth === 0,
          )
          .map((image) => image.src),
      );
    expect(brokenImages).toEqual([]);
    if (path === article) {
      await expect(page.locator("pre").first()).toBeVisible();
      await screenshot(page, `${info.project.name}-ferry`);
    }
    for (const image of await page.locator(".gallery img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
    }
    for (const table of await page.locator("main table").all()) {
      expect(
        await table.evaluate((element) => {
          const region = element.closest('[role="region"]');
          return (
            region?.getAttribute("tabindex") === "0" &&
            !!region.getAttribute("aria-label")
          );
        }),
        "Table has named keyboard scroll region",
      ).toBe(true);
    }
    if (path.includes("diy-sound")) {
      await expect(page.locator(".gallery")).toHaveCount(2);
      if (info.project.use.viewport!.width >= 1000) {
        const galleryWidth = await page.locator(".gallery").first().evaluate(
          (gallery) => gallery.getBoundingClientRect().width,
        );
        const proseWidth = await page.locator(".prose > p").first().evaluate(
          (paragraph) => paragraph.getBoundingClientRect().width,
        );
        expect(galleryWidth).toBeGreaterThan(proseWidth);
      }
      expect(await page.locator("video").count()).toBe(2);
      for (const video of await page.locator("video").all()) {
        await expect(video).toHaveAttribute("controls", "");
        await expect(video).toHaveAttribute("preload", "metadata");
        await expect.poll(() => video.evaluate(element => element instanceof HTMLVideoElement ? element.readyState : 0)).toBeGreaterThanOrEqual(1);
      }
      const sizes = await page
        .locator("video")
        .evaluateAll((videos) =>
          videos.map((video) => ({
            width: video.getBoundingClientRect().width,
            height: video.getBoundingClientRect().height,
          })),
        );
      expect(sizes.every((size) => size.height > size.width)).toBe(true);
    }
  }
  expect(failed).toEqual([]);
});
test("keyboard focus, persisted color preference and reduced motion", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  const focusVisible = await page
    .getByRole("link", { name: "Skip to content" })
    .evaluate((link) => {
      const style = getComputedStyle(link);
      return (
        style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0
      );
    });
  expect(focusVisible).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const mode = page.getByRole("button", { name: /^Color mode:/ });
  async function chooseMode(value: "system" | "light" | "dark") {
    for (let click = 0; click < 3; click++) {
      if (await mode.getAttribute("data-color-mode") === value) break;
      await mode.click();
    }
    await expect(mode).toHaveAttribute("data-color-mode", value);
    await expect(mode).toHaveAccessibleName(`Color mode: ${value}`);
  }
  await chooseMode("dark");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.reload();
  await expect(mode).toHaveAttribute("data-color-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await chooseMode("light");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await chooseMode("system");
  const systemMode = info.project.use.colorScheme === "dark" ? "light" : "dark";
  await page.emulateMedia({ colorScheme: systemMode });
  expect(
    await page.locator("html").evaluate((html) => getComputedStyle(html).colorScheme),
  ).toBe(systemMode);
  await page.emulateMedia({ colorScheme: info.project.use.colorScheme });
  expect(
    await page.evaluate(() => localStorage.getItem("color-mode")),
  ).toBeNull();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  const motion = await page
    .getByRole("link", { name: "All writing", exact: true })
    .evaluate((link) => {
      const style = getComputedStyle(link);
      return {
        transition: style.transitionDuration,
        animation: style.animationDuration,
      };
    });
  expect(
    motion.transition.split(",").every((value) => parseFloat(value) <= 0.01),
  ).toBe(true);
  expect(
    motion.animation.split(",").every((value) => parseFloat(value) <= 0.01),
  ).toBe(true);
  await screenshot(page, `${info.project.name}-reduced-motion`);
});
test("core journeys and native article contents work with JavaScript disabled", async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: info.project.use.viewport,
    colorScheme: info.project.use.colorScheme,
  });
  const page = await context.newPage();
  await page.goto(process.env.PREVIEW_URL ?? "http://127.0.0.1:4321");
  await expect(
    page.getByRole("heading", { level: 1, name: "Recent writing", exact: true }),
  ).toBeVisible();
  await loadedImage(page.locator(".featured-article img"));
  await page.getByRole("link", { name: "All writing", exact: true }).click();
  await page
    .getByRole("link", { name: "Ferry: xload Learns to Write", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ferry: xload Learns to Write",
  );
  const contents =
    info.project.use.viewport!.width >= 1312
      ? page.locator(".toc-rail")
      : page.locator(".toc-disclosure");
  await expect(contents).toBeVisible();
  if (info.project.use.viewport!.width < 1312) {
    await contents.locator("summary").click();
  }
  await expect(contents.getByRole("link")).toHaveCount(12);
  await expect(contents.getByRole("link").first()).toBeVisible();
  await contents.getByRole("link").first().click();
  expect(new URL(page.url()).hash).not.toBe("");
  await expect(page.getByRole("button", { name: /^Color mode:/ })).toHaveCount(0);
  await containment(page);
  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await page.getByRole("link", { name: "Darkroom", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Darkroom");
  await context.close();
});
test("image-less writing remains readable and navigable", async ({ page }) => {
  const response = await page.request.get("/theme-reference/");
  test.skip(
    response.status() === 404,
    "Reference fixture is excluded from production builds",
  );
  expect(response.ok()).toBe(true);
  await page.goto("/theme-reference/");
  const fallback = page.locator(".article-card").filter({
    has: page.getByRole("heading", {
      name: "Writing without a cover",
      exact: true,
    }),
  });
  await expect(fallback).toBeVisible();
  await expect(fallback.locator("img")).toHaveCount(0);
  const title = fallback.getByRole("link", {
    name: "Writing without a cover",
    exact: true,
  });
  await expect(title).toHaveAttribute("href", "/writing/");
  await title.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Writing");
  await containment(page);
});
