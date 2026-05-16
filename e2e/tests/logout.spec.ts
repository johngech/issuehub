import { expect } from "@playwright/test";
import { test } from "../fixtures/auth-fixtures";

// ──────────────────────────────────────────────
// Logout Flow — E2E Tests
// ──────────────────────────────────────────────

/**
 * Sign up a user via API + authenticate the browser, then click the
 * logout button in the navbar user dropdown.
 *
 * Verifies:
 *  1. User starts logged in (avatar button visible)
 *  2. After logout → redirect to / and auth buttons appear
 *  3. User dropdown is gone
 */
test("Logout happy path — clicking log out signs out and shows auth buttons", async ({
  authenticatedPage,
}) => {
  const { page } = authenticatedPage;

  // Verify pre-condition: logged in
  await expect(page.getByLabel("User menu")).toBeVisible();

  // Act — open user dropdown and click "Log out"
  await page.getByLabel("User menu").click();
  await page.getByText(/Log out/i).click();

  // Assert — redirected to home
  await page.waitForURL("**/");

  // Assert — logged-out state: auth buttons visible, user menu gone
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  await expect(page.getByLabel("User menu")).not.toBeVisible();
});

/**
 * Sign in, reload the page, and verify the session persists
 * (the user remains logged in).
 */
test("Logout session persistence — user stays logged in after page reload", async ({
  authenticatedPage,
}) => {
  const { page } = authenticatedPage;

  // Act — reload the page
  await page.reload();

  // Assert — still logged in
  await expect(page.getByLabel("User menu")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
});

/**
 * Sign in, navigate to /signin, log out, then simulate pressing the
 * browser back button. Because logout redirects to /, going back
 * should land on /signin — and since the session is cleared, the
 * navbar should re-render with auth buttons (not the user dropdown).
 *
 * This verifies that the SPA correctly reflects the logged-out state
 * when navigating via browser history after a session-destroying logout.
 */
test("Logout back button — pressing back after logout shows logged-out page", async ({
  authenticatedPage,
}) => {
  const { page } = authenticatedPage;

  // Arrange — navigate to a different page before logout so
  // goBack() has a distinct URL to return to
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: /Sign In/i })).toBeVisible();

  // Act — log out (redirects to /)
  await page.getByLabel(/User menu/i).click();
  await page.getByText(/Log out/i).click();
  await page.waitForURL("**/");

  // Act — simulate browser back (should return to /signin)
  await page.goBack();
  await page.waitForURL("**/signin");

  // Assert — page shows logged-out UI (session cleared, so
  // navbar re-renders with auth buttons instead of user dropdown)
  await expect(page.getByRole("link", { name: /Sign In/i })).toBeVisible();

  const signUpLink = page.getByRole("link", { name: /Sign Up/i });
  await expect(signUpLink).toHaveCount(2);

  await expect(page.getByLabel(/User menu/i)).not.toBeVisible();
});
