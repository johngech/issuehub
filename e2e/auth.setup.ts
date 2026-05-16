import type { Page } from "@playwright/test";
import { request } from "@playwright/test";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

// ──────────────────────────────────────────────
// Test User Factory
// ──────────────────────────────────────────────

/**
 * Generate a test user with unique credentials.
 * Each invocation creates a fresh identity so tests never collide.
 */
export function createTestUser(): TestUser {
  const id = crypto.randomUUID();
  return {
    name: `Test User ${id}`,
    email: `e2e-${id}@test.example`,
    password: "TestPass123!",
  };
}

// ──────────────────────────────────────────────
// API Helpers
// ──────────────────────────────────────────────

/**
 * Sign up a user via the Better Auth REST API.
 *
 * The created user is persisted in the database but NO browser session
 * is established — cookies live only in the ephemeral API context.
 *
 * Use this for sign-in tests that need a pre-existing user account
 * without an active session in the browser.
 */
export async function signUpUserViaAPI(
  user: TestUser,
): Promise<{ ok: boolean; status: number }> {
  const apiContext = await request.newContext({
    baseURL: "http://localhost:4000",
  });

  const response = await apiContext.post("/api/auth/sign-up/email", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  await apiContext.dispose();

  return { ok: response.ok(), status: response.status() };
}

/**
 * Sign up a user via the API AND transfer session cookies into
 * the browser page context.
 *
 * After this call the browser behaves as if the user just signed in
 * through the UI — the navbar shows the avatar/dropdown instead of
 * the auth buttons.
 *
 * Use this for logout tests or any scenario that starts from a
 * pre-authenticated state.
 */
export async function signUpAndAuthenticateBrowser(
  page: Page,
  user: TestUser,
): Promise<void> {
  const apiContext = await request.newContext({
    baseURL: "http://localhost:4000",
  });

  const response = await apiContext.post("/api/auth/sign-up/email", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      [`signUpAndAuthenticateBrowser: HTTP ${response.status()}`, body].join(
        "\n",
      ),
    );
  }

  // Collect cookies auto-stored by the API context from set-cookie headers,
  // then transfer them into the browser context so the page "sees" them.
  const state = await apiContext.storageState();
  await apiContext.dispose();

  // Normalize cookie domain so they are sent to the server (port 4000)
  // regardless of which port the browser page is on (port 3000).
  const normalizedCookies = state.cookies.map((cookie) => ({
    ...cookie,
    domain: cookie.domain || "localhost",
  }));

  await page.context().addCookies(normalizedCookies);
}

// ──────────────────────────────────────────────
// Navigation Helpers
// ──────────────────────────────────────────────

/**
 * Navigate to a route.
 *
 * No explicit wait is needed — Playwright's goto() waits for the load
 * event, and subsequent auto-waiting assertions/actions handle SPA
 * hydration timing.
 */
export async function visit(page: Page, path: string): Promise<void> {
  await page.goto(path);
}
