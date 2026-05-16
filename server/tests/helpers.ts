import { prisma } from "../prisma/client";

export interface TestUser {
	name: string;
	email: string;
	password: string;
}

/** Shared test password used across all auth tests. */
export const TEST_PASSWORD = "TestPass123!";

let counter = 0;

/**
 * Create a unique test user with predictable data.
 * Each call increments a counter so emails never collide.
 * Includes `process.pid` to prevent collisions across parallel CI workers.
 */
export function createTestUser(): TestUser {
	counter++;
	const id = `${Date.now()}-${process.pid}-${counter}`;
	return {
		name: `Test User ${id}`,
		email: `test-${id}@test.com`,
		password: TEST_PASSWORD,
	};
}

/**
 * Remove a test user (and cascaded Sessions / Accounts) by email.
 * Uses deleteMany so it's a no-op gracefully when no record exists.
 */
export async function cleanupUser(email: string): Promise<void> {
	await prisma.user.deleteMany({ where: { email } });
}
