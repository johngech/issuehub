import type { auth } from "../lib/auth";

// Augment Express Request type with auth properties
declare global {
	namespace Express {
		interface Request {
			user: typeof auth.$Infer.Session.user;
			session: typeof auth.$Infer.Session.session;
		}
	}
}
