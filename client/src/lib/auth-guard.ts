import { Role } from "@issue-tracker/core/constants";
import type { Session } from "#/lib/auth-client";

export function isAdmin(user: Session["user"] | null | undefined): boolean {
  return (user as { role?: string })?.role === Role.ADMIN;
}

export function isAgent(user: Session["user"] | null | undefined): boolean {
  return (user as { role?: string })?.role === Role.AGENT;
}

export function isUser(user: Session["user"] | null | undefined): boolean {
  return (user as { role?: string })?.role === Role.USER;
}
