import { expect, test } from "@playwright/test";
import { createTestUser, signUpUserViaAPI } from "../auth.setup";

// ──────────────────────────────────────────────
// Signin Flow — E2E Tests
// ──────────────────────────────────────────────

/**
 * Create a user via the API, then sign in through the UI with valid
 * credentials and verify:
 *  - Redirect to home (/)
 *  - User is logged in (navbar shows user dropdown)
 */
test("Signin happy path — valid credentials sign in and redirect to home", async ({
	page,
}) => {
	const user = createTestUser();

	// Arrange — create user via API (no browser session)
	await signUpUserViaAPI(user);

	await page.goto("/signin");
	await page.waitForLoadState("networkidle");

	// Act — fill signin form
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByRole("button", { name: "Sign in" }).click();

	// Assert — redirected to home
	await page.waitForURL("**/");
	await expect(
		page.getByRole("heading", { name: "Welcome to TanStack Start" }),
	).toBeVisible();

	// Assert — logged-in state
	await expect(page.getByLabel("User menu")).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
});

/**
 * Enter a valid email with an incorrect password.
 * Better Auth returns INVALID_EMAIL_OR_PASSWORD which maps to
 * "Invalid email or password".
 */
test("Signin wrong password — error message displayed", async ({ page }) => {
	const user = createTestUser();

	// Arrange — create user via API
	await signUpUserViaAPI(user);

	await page.goto("/signin");
	await page.waitForLoadState("networkidle");

	// Act — fill with wrong password
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill("WrongPassword123!");
	await page.getByRole("button", { name: "Sign in" }).click();

	// Assert — server error displayed in FormError
	await expect(
		page.getByRole("alert").filter({ hasText: "Invalid email or password" }),
	).toBeVisible();
});

/**
 * Enter an email that has never been registered.
 * Better Auth returns USER_NOT_FOUND which maps to
 * "Invalid email or password" (same message as wrong password).
 */
test("Signin non-existent email — error message displayed", async ({
	page,
}) => {
	await page.goto("/signin");
	await page.waitForLoadState("networkidle");

	// Act — fill with unregistered email
	await page.getByLabel("Email").fill("nonexistent@test.example");
	await page.getByLabel("Password").fill("SomePass123!");
	await page.getByRole("button", { name: "Sign in" }).click();

	// Assert
	await expect(
		page.getByRole("alert").filter({ hasText: "Invalid email or password" }),
	).toBeVisible();
});

/**
 * Submit the signin form with empty fields and verify Zod validation
 * errors appear.
 */
test("Signin validation errors — empty fields show validation messages", async ({
	page,
}) => {
	await page.goto("/signin");
	await page.waitForLoadState("networkidle");

	// Act — submit empty form
	await page.getByRole("button", { name: "Sign in" }).click();

	// Assert
	await expect(page.getByText("Invalid email address")).toBeVisible();
	await expect(
		page.getByText("Password must be at least 8 characters"),
	).toBeVisible();
});

/**
 * The signin page has a link to /signup. Verify clicking it navigates
 * to the signup page.
 */
test("Signin navigation — signup link navigates to signup page", async ({
	page,
}) => {
	await page.goto("/signin");
	await page.waitForLoadState("networkidle");

	// Act — click the "Sign up" link
	await page.getByRole("link", { name: "Sign up" }).click();

	// Assert — navigated to signup
	await page.waitForURL("**/signup");
	await expect(
		page.getByRole("heading", { name: "Create account" }),
	).toBeVisible();
});
