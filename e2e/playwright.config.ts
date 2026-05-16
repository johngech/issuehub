import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	// Test files are in the ./tests directory
	testDir: "./tests",

	// Run tests serially to avoid auth state conflicts between tests
	fullyParallel: false,

	// Fail if CI and there's a test.only() lingering
	forbidOnly: !!process.env.CI,

	// Retry on CI only — local runs fail fast
	retries: process.env.CI ? 2 : 0,

	// Single worker to guarantee no cross-test interference
	workers: 1,

	// CI-friendly output
	reporter: "list",

	// Shared settings for all projects
	use: {
		// Base URL for all page navigations
		baseURL: "http://localhost:3000",

		// Collect trace on retry for debugging
		trace: "on-first-retry",

		// Screenshot on failure for visual debugging
		screenshot: "only-on-failure",
	},

	// Only Chromium — simpler and faster
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	// Start the client Vite dev server (port 3000).
	// The server (port 4000) must be running separately — see README.
	webServer: {
		command: "cd client && bunx vite dev --port 3000",
		port: 3000,
		timeout: 30_000,
		reuseExistingServer: !process.env.CI,
	},
});
