import { prisma } from "./client";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

async function seed() {
	const existing = await prisma.user.findUnique({
		where: { email: ADMIN_EMAIL },
	});

	if (existing) {
		console.log(`Admin user already exists: ${existing.name} <${existing.email}>`);
		return;
	}

	console.log("Seeding database...");

	// Use Better Auth's internal password hasher (salt:key format)
	const { hashPassword } = await import("better-auth/crypto");
	const hashedPassword = await hashPassword(ADMIN_PASSWORD);

	const userId = `admin-${Date.now()}`;

	// Create admin user
	await prisma.user.create({
		data: {
			id: userId,
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			emailVerified: true,
			role: "ADMIN",
			status: "ACTIVE",
		},
	});

	// Create credential account with password
	await prisma.account.create({
		data: {
			id: `admin-account-${Date.now()}`,
			providerId: "credential",
			accountId: ADMIN_EMAIL,
			userId,
			password: hashedPassword,
		},
	});

	console.log(`Created admin user: ${ADMIN_NAME} <${ADMIN_EMAIL}>`);
	console.log(`Password: ${ADMIN_PASSWORD}`);
	console.log("Seed complete.");
}

seed()
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
