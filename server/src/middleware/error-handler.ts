import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Centralized error handler middleware.
 * Must be mounted last in the Express middleware chain.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return res.status(400).json({
      error: "Validation Error",
      messages,
    });
  }

  // Custom forbidden errors → 403
  if ((err as { code?: string }).code === "FORBIDDEN") {
    return res.status(403).json({ error: err.message });
  }

  // Custom not-found errors → 404
  if ((err as { code?: string }).code === "NOT_FOUND") {
    return res.status(404).json({ error: err.message });
  }

  // Custom conflict errors → 409
  if ((err as { code?: string }).code === "CONFLICT") {
    return res.status(409).json({ error: err.message });
  }

  // Everything else → 500
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
}
