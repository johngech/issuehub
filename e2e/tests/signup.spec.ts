import { expect, test } from "@playwright/test";
import { createTestUser, signUpUserViaAPI } from "../auth.setup";

// ──────────────────────────────────────────────
// Signup Flow — E2E Tests
// ──────────────────────────────────────────────

/**
 * Navigate to /signup, fill all 4 fields with valid data, submit, and verify:
 *  - Redirect to home (/)
 *  - User is logged in (navbar shows user dropdown, not auth buttons)
 */
test("Signup happy path — valid data creates account and redirects to home", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");
	await page.waitForLoadState("networkidle");

	// Arrange — fill the signup form
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByLabel("Confirm password").fill(user.password);

	// Act — submit
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — redirected to home
	await page.waitForURL("**/");
	await expect(
		page.getByRole("heading", { name: "Welcome to TanStack Start" }),
	).toBeVisible();

	// Assert — logged-in state: avatar button visible, auth buttons absent
	await expect(page.getByLabel("User menu")).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
});

/**
 * Submit the form with all fields empty and verify Zod validation errors
 * appear for each required field.
 */
test("Signup validation errors — empty fields show validation messages", async ({
	page,
}) => {
	await page.goto("/signup");
	await page.waitForLoadState("networkidle");

	// Act — submit without filling anything
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — validation error messages visible
	// Name: min 2 characters
	await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
	// Email: invalid format
	await expect(page.getByText("Invalid email address")).toBeVisible();
	// Password: min 8 characters
	await expect(
		page.getByText("Password must be at least 8 characters"),
	).toBeVisible();
});

/**
 * Enter different values for password and confirmPassword, then submit.
 * A superRefine validation catches the mismatch and shows
 * "Passwords do not match" on the confirmPassword field.
 */
test("Signup password mismatch — different passwords show error", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");
	await page.waitForLoadState("networkidle");

	// Arrange — fill form with mismatched passwords
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill("ValidPass1");
	await page.getByLabel("Confirm password").fill("DifferentPass1");

	// Act
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert
	await expect(page.getByText("Passwords do not match")).toBeVisible();
});

/**
 * Attempt signup with an email that already exists.
 * The API returns a USER_ALREADY_EXISTS error which the client
 * maps to "An account with this email already exists."
 */
test("Signup duplicate email — server error displayed in FormError", async ({
	page,
}) => {
	const user = createTestUser();

	// Arrange — pre-create the user via API
	await signUpUserViaAPI(user);

	await page.goto("/signup");
	await page.waitForLoadState("networkidle");

	// Arrange — fill form with same email
	await page.getByLabel("Name").fill(user.name);
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByLabel("Confirm password").fill(user.password);

	// Act
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert — server error displayed in FormError (role="alert")
	await expect(
		page.getByRole("alert").filter({
			hasText: "An account with this email already exists.",
		}),
	).toBeVisible();
});

/**
 * Enter a single-character name (below the 2-char minimum) and verify
 * the Zod validation error appears.
 */
test("Signup short name — single character triggers validation error", async ({
	page,
}) => {
	const user = createTestUser();

	await page.goto("/signup");
	await page.waitForLoadState("networkidle");

	// Arrange — enter short name
	await page.getByLabel("Name").fill("A");
	await page.getByLabel("Email").fill(user.email);
	await page.getByLabel("Password").fill(user.password);
	await page.getByLabel("Confirm password").fill(user.password);

	// Act
	await page.getByRole("button", { name: "Sign up" }).click();

	// Assert
	await expect(
		page.getByText("Name must be at least 2 characters"),
	).toBeVisible();
});
