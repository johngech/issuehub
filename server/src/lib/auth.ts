import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../prisma/client";

const trustedOrigins = [
	...(process.env.TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) || []),
];

export const auth = betterAuth({
	basePath: "/api/auth",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	trustedOrigins: trustedOrigins,
});
