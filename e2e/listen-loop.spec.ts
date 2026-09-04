import { expect, test } from "@playwright/test";

import { prepareApp, recommendedPiece } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await prepareApp(page);
});

test("listen loop: annotations → reflection → recommendation", async ({
  page,
}) => {
  // Brandenburg 3 — short featured starter
  await page.goto("/listen/openopus-9688");

  await expect(page.getByRole("button", { name: "Play" })).toBeEnabled({
    timeout: 20_000,
  });

  await expect(page.getByText("Opening flourish")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(/musical knowledge of this work/i)).toBeVisible();

  await page.getByRole("button", { name: "Done listening" }).click();

  await expect(page.getByText("What stood out?")).toBeVisible();
  await page
    .getByLabel("Your reflection")
    .fill("I loved the conversational exchange between the voices.");
  await page.getByRole("button", { name: "Save reflection" }).click();

  await expect(page.getByText("What stood out?")).toBeHidden({
    timeout: 15_000,
  });

  await expect(page.getByText("Your reflection")).toBeVisible();
  await expect(
    page.getByText("I loved the conversational exchange between the voices."),
  ).toBeVisible();

  await expect(page.getByText("Why this piece")).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByText(/try Gershwin next for a related sense of dialogue/i),
  ).toBeVisible();

  await expect(page.getByText("Up next")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: `${recommendedPiece.composer} — ${recommendedPiece.title}`,
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start listening" }).click();
  await expect(page).toHaveURL(new RegExp(`/listen/${recommendedPiece.id}`));
});

test("piece detail links into guided listening when playable", async ({
  page,
}) => {
  await page.goto("/piece/openopus-9688");

  await expect(page.getByText("Guided listening")).toBeVisible();
  await page.getByRole("link", { name: "Start listening" }).click();
  await expect(page).toHaveURL("/listen/openopus-9688");
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
});
