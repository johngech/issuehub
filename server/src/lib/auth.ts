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
    requireEmailVerification: true,
  },
  // Session configuration
  session: {
    // Session cookie settings
    cookieName: "session-token",
    // Session expires in 7 days
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    // Update activity on each request
    updateAge: 24 * 60 * 60, // 24 hours
    // Rotate session token on each request for security
    rotateToken: true,
  },
  trustedOrigins: trustedOrigins,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        returned: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        returned: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: (user as { role?: string }).role || "USER",
              status: (user as { status?: string }).status || "ACTIVE",
            },
          };
        },
      },
    },
  },
});
