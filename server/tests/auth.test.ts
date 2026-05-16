import request from "supertest";
import { afterAll, afterEach, describe, expect, test } from "vitest";
import { app } from "../index";
import { prisma } from "../prisma/client";
import {
	cleanupUser,
	createTestUser,
	TEST_PASSWORD,
	type TestUser,
} from "./helpers";

describe("Auth API", () => {
	let user: TestUser | undefined;

	afterEach(async () => {
		if (user) {
			await cleanupUser(user.email);
		}
	});

	// Safety net: clean up any test users left behind by interrupted runs
	afterAll(async () => {
		await prisma.user.deleteMany({
			where: { email: { startsWith: "test-" } },
		});
	});

	describe("POST /api/auth/sign-up/email", () => {
		test("creates user and returns session on successful sign-up", async () => {
			// Arrange
			user = createTestUser();

			// Act
			const res = await request(app).post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Assert — response shape
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("user");
			expect(res.body).toHaveProperty("token");
			expect(res.body.user.email).toBe(user.email);
			expect(res.body.user.name).toBe(user.name);
			expect(res.body.user).toHaveProperty("id");
			expect(res.body.user.emailVerified).toBe(false);

			// Assert — cookie attributes
			const cookie = res.headers["set-cookie"]?.[0];
			expect(cookie).toBeDefined();
			expect(cookie).toContain("better-auth.session_token");
			expect(cookie).toContain("HttpOnly");
			expect(cookie).toContain("Path=/");
			expect(cookie).toContain("SameSite=Lax");
		});

		test("rejects duplicate email registration with 422", async () => {
			// Arrange — create a user first
			user = createTestUser();
			const first = await request(app).post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});
			expect(first.status).toBe(200);

			// Act — second signup with same email
			const res = await request(app).post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Assert
			expect(res.status).toBe(422);
			expect(res.body).toHaveProperty(
				"code",
				"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
			);
			expect(res.body).toHaveProperty("message");
		});

		test("rejects sign-up with invalid email format", async () => {
			// Act
			const res = await request(app).post("/api/auth/sign-up/email").send({
				name: "Bad Email",
				email: "not-an-email",
				password: TEST_PASSWORD,
			});

			// Assert
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
			expect(res.body.message).toContain("email");
		});

		test("rejects sign-up with missing password", async () => {
			// Act
			const res = await request(app)
				.post("/api/auth/sign-up/email")
				.send({
					name: "No Pass",
					email: `nopass-${Date.now()}@test.com`,
				});

			// Assert
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
			expect(res.body.message).toContain("password");
		});
	});

	describe("POST /api/auth/sign-in/email", () => {
		test("authenticates valid credentials and returns session", async () => {
			// Arrange — sign up a user first
			user = createTestUser();
			await request(app).post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Act
			const res = await request(app).post("/api/auth/sign-in/email").send({
				email: user.email,
				password: user.password,
			});

			// Assert — response shape
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("user");
			expect(res.body).toHaveProperty("token");
			expect(res.body.user.email).toBe(user.email);

			// Assert — cookie attributes
			const cookie = res.headers["set-cookie"]?.[0];
			expect(cookie).toBeDefined();
			expect(cookie).toContain("better-auth.session_token");
			expect(cookie).toContain("HttpOnly");
			expect(cookie).toContain("Path=/");
			expect(cookie).toContain("SameSite=Lax");
		});

		test("rejects sign-in with incorrect password", async () => {
			// Arrange
			user = createTestUser();
			await request(app).post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Act
			const res = await request(app).post("/api/auth/sign-in/email").send({
				email: user.email,
				password: "WrongPassword999!",
			});

			// Assert
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty("code", "INVALID_EMAIL_OR_PASSWORD");
			expect(res.body).toHaveProperty("message");
		});

		test("rejects sign-in with unregistered email", async () => {
			// Act — no user created
			const res = await request(app).post("/api/auth/sign-in/email").send({
				email: "nonexistent@test.com",
				password: TEST_PASSWORD,
			});

			// Assert
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty("code", "INVALID_EMAIL_OR_PASSWORD");
			expect(res.body).toHaveProperty("message");
		});
	});

	describe("POST /api/auth/sign-out", () => {
		test("signs out authenticated user and invalidates session", async () => {
			// Arrange — sign up and create an authenticated agent
			user = createTestUser();
			const agent = request.agent(app);
			await agent.post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Confirm authenticated before sign-out
			const before = await agent.get("/api/me");
			expect(before.status).toBe(200);

			// Act
			const signoutRes = await agent.post("/api/auth/sign-out").send();

			// Assert — sign-out returns success
			expect(signoutRes.status).toBe(200);
			expect(signoutRes.body).toEqual({ success: true });

			// Session is now invalidated
			const after = await agent.get("/api/me");
			expect(after.status).toBe(401);
		});
	});

	describe("GET /api/me", () => {
		test("returns user session when authenticated via cookie", async () => {
			// Arrange — sign up and let agent track cookies
			user = createTestUser();
			const agent = request.agent(app);
			await agent.post("/api/auth/sign-up/email").send({
				name: user.name,
				email: user.email,
				password: user.password,
			});

			// Act
			const res = await agent.get("/api/me");

			// Assert
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("user");
			expect(res.body).toHaveProperty("session");
			expect(res.body.user.email).toBe(user.email);
		});

		test("returns 401 when not authenticated", async () => {
			// Act — no cookies, no auth header
			const res = await request(app).get("/api/me");

			// Assert
			expect(res.status).toBe(401);
		});
	});
});
