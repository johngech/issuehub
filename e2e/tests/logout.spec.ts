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
	await page.getByText("Log out").click();

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
	await page.waitForLoadState("networkidle");

	// Assert — still logged in
	await expect(page.getByLabel("User menu")).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
});

/**
 * Sign in, log out, then simulate pressing the browser back button.
 * The session should be cleared so the user stays on the logged-out
 * page rather than seeing cached authenticated content.
 */
test("Logout back button — pressing back after logout shows logged-out page", async ({
	authenticatedPage,
}) => {
	const { page } = authenticatedPage;

	// Act — log out
	await page.getByLabel("User menu").click();
	await page.getByText("Log out").click();
	await page.waitForURL("**/");

	// Act — simulate browser back
	await page.goBack();

	// Assert — page shows logged-out UI (since session is gone,
	// the navbar re-renders with auth buttons). The URL should
	// either stay on / or navigate somewhere logged-out friendly.
	await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
	await expect(page.getByLabel("User menu")).not.toBeVisible();
});
