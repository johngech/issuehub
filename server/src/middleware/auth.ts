import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

/**
 * Authentication middleware.
 * Extracts session from Better Auth, attaches user/session to request,
 * and blocks disabled accounts.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if ((session.user as { status?: string }).status === "DISABLED") {
    return res.status(403).json({ error: "Account disabled" });
  }

  req.user = session.user;
  req.session = session.session;
  next();
}
