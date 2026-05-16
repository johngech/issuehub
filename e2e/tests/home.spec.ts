import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("Should render the home page", async ({ page }) => {
    await page.goto("/");

    // Assert — page renders the expected heading
    await expect(
      page.getByRole("heading", { name: "Welcome to TanStack Start" }),
    ).toBeVisible();
  });
});
