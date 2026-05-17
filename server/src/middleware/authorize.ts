import type { Role } from "@issue-tracker/core/constants";
import type { NextFunction, Request, Response } from "express";

/**
 * Authorization middleware factory.
 * Returns Express middleware that checks if the authenticated user
 * has one of the allowed roles.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req.user as { role?: string })?.role;
    if (!userRole || !roles.includes(userRole as Role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
