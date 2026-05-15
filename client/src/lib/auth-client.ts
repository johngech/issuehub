import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "production"
			? process.env.VITE_API_URL
			: "http://localhost:4000",
});

export type Session = typeof authClient.$Infer.Session;
