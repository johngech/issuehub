import type { Role } from "@issue-tracker/core/constants";

// Permission matrix: role → allowed actions.
// ADMIN gets wildcard ("*") which grants all permissions.
const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*", "user:list", "user:view", "user:manage"],
  AGENT: ["issue:read", "issue:resolve", "issue:comment"],
  USER: [
    "issue:create",
    "issue:read:own",
    "issue:reopen:own",
    "issue:comment:own",
  ],
};

/**
 * Check if a role has a specific permission.
 * This is the single source of truth for all permission checks.
 */
export function can(role: Role, permission: string): boolean {
  return (
    PERMISSIONS[role].includes("*") || PERMISSIONS[role].includes(permission)
  );
}

/**
 * Check if a user owns a resource.
 * Used for ownership-based authorization in services.
 */
export function isOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}
