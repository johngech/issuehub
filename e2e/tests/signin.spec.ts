import { test, expect } from "@playwright/test";
import { createTestUser, signUpUserViaAPI } from "../auth.setup";

// ──────────────────────────────────────────────
// Signin Flow — E2E Tests
// ──────────────────────────────────────────────

/**
 * Verifies valid credentials sign in user and redirect to home page.
 */
test("Signin happy path — valid credentials sign in and redirect to home", async ({
  page,
}) => {
  const user = createTestUser();

  // Create user via API (no browser session)
  await signUpUserViaAPI(user);

  await page.goto("/signin");

  // Fill signin form with valid credentials
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Assert — redirected to home
  await page.waitForURL("**/");
  await expect(
    page.getByRole("heading", { name: "Welcome to TanStack Start" }),
  ).toBeVisible();

   // Assert — logged-in state (user menu visible, sign in link hidden)
   await expect(page.getByLabel("User menu")).toBeVisible();
   await expect(page.getByRole("link", { name: /Sign In/i })).not.toBeVisible();
});

/**
 * Verifies error message appears when signing in with wrong password.
 * Better Auth maps INVALID_EMAIL_OR_PASSWORD to "Invalid email or password".
 */
test("Signin wrong password — error message displayed", async ({ page }) => {
  const user = createTestUser();

  // Create user via API
  await signUpUserViaAPI(user);

  await page.goto("/signin");

  // Fill form with wrong password
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("WrongPassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Assert — server error displayed in FormError
  await expect(
    page.getByRole("alert").filter({ hasText: /invalid email or password/i }),
  ).toBeVisible();
});

/**
 * Verifies error message appears when signing in with non-existent email.
 * Better Auth maps USER_NOT_FOUND to "Invalid email or password".
 */
test("Signin non-existent email — error message displayed", async ({
  page,
}) => {
  await page.goto("/signin");

  // Fill form with unregistered email
  await page.getByLabel("Email").fill("nonexistent@test.example");
  await page.getByLabel("Password").fill("SomePass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Assert
  await expect(
    page.getByRole("alert").filter({ hasText: /invalid email or password/i }),
  ).toBeVisible();
});

/**
 * Verifies Zod validation errors appear when submitting empty signin form.
 */
test("Signin validation errors — empty fields show validation messages", async ({
  page,
}) => {
  await page.goto("/signin");

  // Submit empty form
  await page.getByRole("button", { name: /Sign in/i }).click();

  // Assert
  await expect(page.getByText("Invalid email address")).toBeVisible();
  await expect(
    page.getByText(/Password must be at least 8 characters/i),
  ).toBeVisible();
});

/**
 * Verifies clicking signup link on signin page navigates to signup page.
 */
test("Signin navigation — signup link navigates to signup page", async ({
  page,
}) => {
  await page.goto("/signin");

  // Click the "Sign up" link
  await page.getByRole("link", { name: /Sign up/i }).click();

  // Assert — navigated to signup
  await page.waitForURL("**/signup");
  await expect(
    page.getByRole("heading", { name: /Create account/i }),
  ).toBeVisible();
});
