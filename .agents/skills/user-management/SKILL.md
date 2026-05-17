---
name: user-management
description: Build and maintain the User Management & Authorization module for the Issue Tracker. Covers RBAC roles (ADMIN, AGENT, USER), ownership-based access control, user CRUD, profile updates, role changes, account disable/enable, and the centralized authorization system.
version: 1.0.0
author: opencode
type: skill
category: feature
tags:
  - rbac
  - authorization
  - user-management
  - roles
  - permissions
---

# User Management & Authorization Skill

> **Purpose**: Guide implementation and maintenance of the role-based user management module with centralized authorization, ownership-based access control, and enterprise-style architecture.

---

## What I Do

I provide the complete blueprint, architecture, file structure, and implementation details for the User Management & Authorization module. Use me when:

- Building or modifying user management features
- Adding role-based access control to new endpoints
- Implementing ownership-based authorization for issues or other resources
- Debugging authorization or permission issues
- Understanding the permission matrix or role capabilities
- Adding new roles or permissions in the future

---

## Architecture Overview

```
server/
├── src/
│   ├── auth/
│   │   └── authorization.ts           ← Centralized can() logic (single source of truth)
│   ├── middleware/
│   │   ├── auth.ts                    ← requireAuth (authentication)
│   │   ├── authorize.ts               ← requireRole (authorization)
│   │   └── error-handler.ts           ← Centralized error handling
│   ├── repositories/
│   │   └── user.repository.ts         ← Prisma data access layer
│   ├── services/
│   │   └── user.service.ts            ← Business logic + authorization checks
│   └── routes/
│       └── users.ts                   ← Express route handlers (controllers)

client/src/
├── lib/
│   ├── api.ts                         ← Fetch wrapper with credentials
│   └── auth-guard.ts                  ← Client-side role checking
├── hooks/
│   └── use-users.ts                   ← TanStack Query hooks
├── routes/
│   ├── profile/index.tsx              ← View/edit own profile
│   └── admin/users/
│       ├── index.tsx                  ← User list (admin)
│       └── $id.tsx                    ← User detail + role/disable (admin)
└── components/ui/
    ├── role-badge.tsx                 ← Color-coded role display
    ├── status-badge.tsx               ← ACTIVE/DISABLED badges
    ├── role-select.tsx                ← Role change dropdown
    └── confirm-dialog.tsx             ← Reusable confirmation modal
```

---

## Roles & Permissions

### Role Enum (`core/constants.ts`)

```typescript
export enum Role {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  USER = "USER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}
```

### Permission Matrix (`server/src/auth/authorization.ts`)

```typescript
const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  AGENT: ["issue:read", "issue:resolve", "issue:comment"],
  USER: [
    "issue:create",
    "issue:read:own",
    "issue:reopen:own",
    "issue:comment:own",
  ],
};

export function can(role: Role, permission: string): boolean {
  return (
    PERMISSIONS[role].includes("*") || PERMISSIONS[role].includes(permission)
  );
}

export function isOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}
```

### Role Capabilities

| Capability           | ADMIN | AGENT         | USER     |
| -------------------- | ----- | ------------- | -------- |
| View own profile     | ✅    | ✅            | ✅       |
| Update own profile   | ✅    | ✅            | ✅       |
| View user list       | ✅    | ❌            | ❌       |
| View single user     | ✅    | ❌            | ❌       |
| Change user role     | ✅    | ❌            | ❌       |
| Disable user account | ✅    | ❌            | ❌       |
| Create issues        | ✅    | ❌            | ✅       |
| View all issues      | ✅    | ✅ (assigned) | ✅ (own) |
| Resolve issues       | ✅    | ✅ (assigned) | ❌       |
| Reopen issues        | ✅    | ❌            | ✅ (own) |
| Comment on issues    | ✅    | ✅ (assigned) | ✅ (own) |
| Assign issues        | ✅    | ❌            | ❌       |

---

## API Endpoints

| Method | Path                     | Auth     | Role  | Description                      |
| ------ | ------------------------ | -------- | ----- | -------------------------------- |
| GET    | `/api/me`                | Required | Any   | Current user profile             |
| PUT    | `/api/me`                | Required | Any   | Update own profile (name, email) |
| GET    | `/api/users`             | Required | ADMIN | List all users                   |
| GET    | `/api/users/:id`         | Required | ADMIN | View single user                 |
| PATCH  | `/api/users/:id/role`    | Required | ADMIN | Change user role                 |
| PATCH  | `/api/users/:id/disable` | Required | ADMIN | Toggle user active/disabled      |

---

## Key Files Reference

### Core Package

**`core/constants.ts`** — Role and UserStatus enums
**`core/types.ts`** — Shared TypeScript types:

```typescript
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export interface ChangeRoleInput {
  role: Role;
}
```

**`core/validation.ts`** — Zod v4 validation schemas for user operations
**`core/package.json`** — Must export `./constants` and `./types`

### Server Authorization

**`server/src/auth/authorization.ts`** — Centralized `can()` and `isOwner()` functions. This is the single source of truth for all permission checks. Never scatter role checks outside this file.

### Server Middleware

**`server/src/middleware/auth.ts`** — `requireAuth` middleware:

- Extracts session from Better Auth via `fromNodeHeaders`
- Attaches `req.user` and `req.session`
- Blocks DISABLED users with 403

**`server/src/middleware/authorize.ts`** — `requireRole(...roles)` middleware:

- Returns Express middleware factory
- Checks `req.user.role` against allowed roles
- Returns 403 if not authorized

**`server/src/middleware/error-handler.ts`** — Centralized error handling:

- Zod validation errors → 400
- Authorization errors → 403
- Not found errors → 404
- Everything else → 500

### Server Repository

**`server/src/repositories/user.repository.ts`** — Thin Prisma wrapper:

- `findById(id)`
- `findByEmail(email)`
- `findAll({ search?, skip?, take? })`
- `update(id, data)`
- `updateRole(id, role)`
- `toggleStatus(id)`

### Server Service

**`server/src/services/user.service.ts`** — Business logic layer:

- All authorization checks happen here (defense in depth)
- Uses `can()` from authorization.ts
- Uses `isOwner()` for ownership checks
- Prevents admin from disabling themselves
- Prevents demoting the last admin

### Server Routes

**`server/src/routes/users.ts`** — Express router:

- Input validation with Zod schemas from core
- Calls service layer methods
- Returns standardized JSON responses

### Database

**`server/prisma/schema.prisma`** — User model extended fields:

```prisma
model User {
  // ... Better Auth fields (id, name, email, etc.)
  role    String @default("USER")
  status  String @default("ACTIVE")
  // ...
}
```

**`server/src/lib/auth.ts`** — Better Auth additional fields config:

```typescript
databaseHooks: {
  user: {
    create: {
      before: async (user) => {
        return {
          data: {
            ...user,
            role: "USER",
            status: "ACTIVE",
          },
        };
      },
    },
  },
},
```

**`server/prisma/client.ts`** — Prisma client import (must use generated path):

```typescript
import { PrismaClient } from "./client/client";
```

### Client

**`client/src/lib/api.ts`** — Fetch wrapper:

```typescript
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
export async function api(path, options?) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(...);
  return res.json();
}
```

**`client/src/lib/auth-guard.ts`** — Client-side role checking:

```typescript
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}
```

**`client/src/hooks/use-users.ts`** — TanStack Query hooks:

- `useCurrentUser()` → GET /api/me
- `useUpdateProfile()` → PUT /api/me
- `useUsers()` → GET /api/users
- `useUser(id)` → GET /api/users/:id
- `useChangeRole()` → PATCH /api/users/:id/role
- `useDisableUser()` → PATCH /api/users/:id/disable

---

## Middleware Stacking Pattern

```
GET /api/users
  → requireAuth           (authentication: valid session + not disabled)
  → requireRole("ADMIN")  (authorization: role check)
  → controller handler    (business logic: service call)
```

Ownership checks happen **inside services**, not middleware, because they require DB lookups.

---

## Authorization Patterns

### Role-based (in middleware)

```typescript
router.get("/users", requireAuth, requireRole("ADMIN"), listUsers);
```

### Permission-based (in services)

```typescript
if (!can(user.role, "issue:resolve")) {
  throw new ForbiddenError("Cannot resolve issues");
}
```

### Ownership-based (in services)

```typescript
if (!isOwner(userId, issue.authorId)) {
  throw new ForbiddenError("Not your issue");
}
```

---

## Seed Script

**`server/prisma/seed.ts`** — Creates first admin user:

```bash
bunx prisma db seed
```

The seed script checks if any users exist; if not, creates an ADMIN user with credentials from environment variables or defaults.

---

## Client Routes

| Route              | Access        | Description                                              |
| ------------------ | ------------- | -------------------------------------------------------- |
| `/profile`         | Authenticated | View/edit own name and email                             |
| `/admin/users`     | ADMIN only    | User list table with role/status badges                  |
| `/admin/users/$id` | ADMIN only    | User detail, role change dropdown, disable/enable toggle |

Client-side guards use TanStack Router `beforeLoad` — server is the real authority.

---

## Design Principles

1. **Authentication ≠ Authorization** — `requireAuth` handles authN, `requireRole` + `can()` handle authZ
2. **Centralized authorization** — Single `can()` function in `authorization.ts`
3. **Ownership in services** — Resource-level checks live in services (need DB access)
4. **Defense in depth** — Services re-check permissions even though middleware already did
5. **Keep it simple** — No complex permission systems, role + ownership is enough
6. **Scalable** — Add new roles by extending the PERMISSIONS map, add new permissions by extending strings

---

## Common Workflows

### Add a new permission

1. Add permission string to the relevant role in `authorization.ts`
2. Use `can(user.role, "new:permission")` in the appropriate service
3. Add middleware `requireRole()` if the entire route is role-restricted

### Add a new role

1. Add to `Role` enum in `core/constants.ts`
2. Add permission array in `PERMISSIONS` map in `authorization.ts`
3. Update Prisma schema if needed (usually not — it's a string field)

### Protect a new resource with ownership

1. In the service, find the resource
2. Check `isOwner(userId, resource.ownerId)`
3. Throw `ForbiddenError` if not owner (unless ADMIN)

---

## Troubleshooting

### "401 Unauthorized" on protected route

- Check that `requireAuth` middleware is applied
- Verify session cookie is being sent (`credentials: "include"`)
- Check if user status is DISABLED (blocked by auth middleware)

### "403 Forbidden" on admin route

- Verify `requireRole("ADMIN")` middleware is applied
- Check `req.user.role` is actually "ADMIN"
- User may have been demoted or seed script not run

### User can't access own resource

- Check ownership logic in service — `isOwner()` comparison
- Verify the resource's ownerId matches the user's id
- ADMIN should bypass ownership checks

### Better Auth doesn't recognize role/status fields

- Verify `additionalFields` config in `server/src/lib/auth.ts`
- Run `bunx prisma migrate dev` after schema changes
- Check that fields exist in the database

---

## File Locations

- **Skill**: `.agents/skills/user-management/`
- **Core types/constants**: `core/constants.ts`, `core/types.ts`
- **Authorization logic**: `server/src/auth/authorization.ts`
- **Middleware**: `server/src/middleware/`
- **Repository**: `server/src/repositories/user.repository.ts`
- **Service**: `server/src/services/user.service.ts`
- **Routes**: `server/src/routes/users.ts`
- **Client hooks**: `client/src/hooks/use-users.ts`
- **Client routes**: `client/src/routes/profile/`, `client/src/routes/admin/users/`
- **Client components**: `client/src/components/ui/role-badge.tsx`, `status-badge.tsx`, etc.

---

**User Management & Authorization Skill** - RBAC foundation for the Issue Tracker!
