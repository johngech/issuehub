import { test, expect } from "@playwright/test";
import { createTestUser, signUpUserViaAPI } from "../auth.setup";

// ──────────────────────────────────────────────
// Signup Flow — E2E Tests
// ──────────────────────────────────────────────

/**
 * Verifies valid signup creates account, redirects to home, and shows user menu.
 */
test("Signup happy path — valid data creates account and redirects to home", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");

	// Wait for form to be ready, then fill with valid data
	await page.waitForSelector('input[name="name"]');
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.locator('input[name="password"]').fill(user.password);
	await page.locator('input[name="confirmPassword"]').fill(user.password);

	// Submit form
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — redirected to home
	await page.waitForURL("**/");
	await expect(
		page.getByRole("heading", { name: "Welcome to TanStack Start" }),
	).toBeVisible();

	// Assert — logged-in state (user menu visible, auth buttons hidden)
	await expect(page.getByLabel("User menu")).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
});

/**
 * Verifies Zod validation errors appear when submitting empty signup form.
 */
test("Signup validation errors — empty fields show validation messages", async ({
	page,
}) => {
	await page.goto("/signup");

	// Submit empty form
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — validation error messages visible
	await expect(page.getByText(/name must be at least 2 characters/i)).toBeVisible();
	await expect(page.getByText(/invalid email address/i)).toBeVisible();
	await expect(
		page.getByText(/password must be at least 8 characters/i),
	).toBeVisible();
});

/**
 * Verifies error appears when password and confirmPassword fields don't match.
 */
test("Signup password mismatch — different passwords show error", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");

	// Wait for form to be ready, then fill with mismatched passwords
	await page.waitForSelector('input[name="name"]');
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.locator('input[name="password"]').fill("ValidPass1");
	await page.locator('input[name="confirmPassword"]').fill("DifferentPass1");

	// Submit form
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert
	await expect(page.getByText(/passwords do not match/i)).toBeVisible();
});

/**
 * Verifies server error appears when attempting to signup with existing email.
 * Better Auth maps USER_ALREADY_EXISTS to "An account with this email already exists."
 */
test("Signup duplicate email — server error displayed in FormError", async ({
	page,
}) => {
	const user = createTestUser();

	// Pre-create user via API
	await signUpUserViaAPI(user);

	await page.goto("/signup");

	// Wait for form to be ready, then fill with existing email
	await page.waitForSelector('input[name="name"]');
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.locator('input[name="password"]').fill(user.password);
	await page.locator('input[name="confirmPassword"]').fill(user.password);

	// Submit form
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — server error displayed in FormError (role="alert")
	await expect(
		page.getByRole("alert").filter({
			hasText: /an account with this email already exists/i,
		}),
	).toBeVisible();
});

/**
 * Verifies validation error appears when name is too short (single character).
 */
test("Signup short name — single character triggers validation error", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");

	// Wait for form to be ready, then enter short name
	await page.waitForSelector('input[name="name"]');
	await page.getByLabel("Name").fill("A");
	await page.getByLabel("Email").fill(user.email);
	await page.locator('input[name="password"]').fill(user.password);
	await page.locator('input[name="confirmPassword"]').fill(user.password);

	// Submit form
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert
	await expect(
		page.getByText(/name must be at least 2 characters/i),
	).toBeVisible();
});
