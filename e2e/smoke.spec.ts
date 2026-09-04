import { expect, test } from "@playwright/test";

import { prepareApp } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await prepareApp(page);
});

test("home shows Start here and navigates to a listen page", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Accelerando" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Start here" }),
  ).toBeVisible();

  const starter = page.locator('a[href^="/listen/"]').first();
  await expect(starter).toBeVisible();
  await starter.click();

  await expect(page).toHaveURL(/\/listen\/openopus-/);
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
});

test("about explains how to use the app", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { name: /AI explains/i }),
  ).toBeVisible();
  await expect(page.getByText("How to use it")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start here" })).toBeVisible();
});

test("library search returns filtered works", async ({ page }) => {
  await page.goto("/library");

  await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();

  const search = page.getByLabel("Search");
  await search.fill("Brandenburg");

  await expect(page.getByText(/works/i).first()).toBeVisible();
  await expect(page.getByText(/Brandenburg/i).first()).toBeVisible({
    timeout: 20_000,
  });
});
