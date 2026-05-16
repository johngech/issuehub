import { test as base, expect } from "@playwright/test";
import type { TestUser } from "../auth.setup";
import { createTestUser, signUpAndAuthenticateBrowser } from "../auth.setup";

// ──────────────────────────────────────────────
// Custom Fixtures
// ──────────────────────────────────────────────

type AuthFixtures = {
	/**
	 * A pre-authenticated browser page plus the TestUser credentials.
	 *
	 * The user is created via the API and session cookies are injected
	 * so the page loads in a "signed in" state — no UI interaction required.
	 */
	authenticatedPage: {
		page: import("@playwright/test").Page;
		user: TestUser;
	};
};

/**
 * Extended test with an `authenticatedPage` fixture.
 *
 * Usage:
 * ```
 * import { test, expect } from '../fixtures/auth-fixtures';
 *
 * test('some test', async ({ authenticatedPage }) => {
 *   const { page, user } = authenticatedPage;
 *   // page is already logged in
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page }, use) => {
		const user = createTestUser();
		await signUpAndAuthenticateBrowser(page, user);
		// Navigate to home so the page is on a known URL
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await use({ page, user });
	},
});

export { expect };
