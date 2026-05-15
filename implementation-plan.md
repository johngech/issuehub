# Implementation Plan

## How the Libraries Fit Together

```
Better Auth (server)          TanStack Query (client)
       │                              │
  ┌────┴──────┐           ┌──────────┴──────────┐
  │  Auth API  │           │  useQuery / useMutation │
  │  Sessions  │           │  cache invalidation │
  │  Prisma DB │           │  loading/error states│
  └────┬───────┘           └──────────┬──────────┘
       │                              │
       └────────── REST ──────────────┘
                          ↑
                    React Hook Form
                    (zodResolver for validation)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Server | Express 5 + TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | Better Auth (session-based, Prisma adapter) |
| Client | React 19 + TanStack Router (file-based) |
| Styling | Tailwind v4 + Radix UI primitives |
| Server state | TanStack Query (React Query v5) |
| Forms | React Hook Form + zod (via `@hookform/resolvers`) |
| Lint/Format | Biome (tab indent, double quotes) |

---

## Dependencies

### Server

| Package | Purpose |
|---------|---------|
| `better-auth` | Auth: sessions, email/password, API |
| `cors` | CORS headers for client dev server |
| `zod` | Schema validation |
| `prisma` (dev) | ORM |
| `@prisma/client` | Prisma client runtime |
| `@types/cors` (dev) | CORS types |

### Client

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management |
| `better-auth` | Client SDK: `createAuthClient` from `better-auth/react` |
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | Zod resolver adapter |
| `zod` | Form validation schemas |
| `@radix-ui/react-dialog` | Modal primitive |
| `@radix-ui/react-select` | Select primitive |
| `@radix-ui/react-dropdown-menu` | Dropdown primitive |
| `@radix-ui/react-label` | Label primitive |
| `clsx` + `tailwind-merge` | Class name utilities |

---

## Better Auth Integration

### Server — `server/src/lib/auth.ts`

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	emailAndPassword: { enabled: true },
});
```

### Server — Express 5 mount (`server/src/app.ts`)

```ts
import { toNodeHandler } from "better-auth/node";

// ⚠️ MUST be before express.json() — Better Auth handles its own body parsing
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
```

Better Auth automatically provides these endpoints:
- `POST /api/auth/sign-up` — email + password + name → creates user, sets session
- `POST /api/auth/sign-in` — email + password → validates, sets session
- `POST /api/auth/sign-out` — destroys session
- `GET /api/auth/session` — returns current session/user or null
- `GET /api/auth/list-sessions` — all sessions for current user

### Protected route middleware (`server/src/middleware/auth.ts`)

```ts
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) return res.status(401).json({ error: "Unauthorized" });
	req.user = session.user;
	next();
}
```

### Client — auth client (`client/src/lib/auth-client.ts`)

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:4000",
});

// Reactive hook:
// const { data: session, isPending, error } = authClient.useSession();

// Imperative methods:
// await authClient.signUp.email({ email, password, name })
// await authClient.signIn.email({ email, password })
// await authClient.signOut()
// await authClient.getSession()
```

---

## Prisma Schema

Better Auth requires four models (`user`, `session`, `account`, `verification`). Custom models (`issue`, `label`, `issueLabel`) are added alongside.

The simplest approach is to define the Better Auth config in `src/lib/auth.ts`, then auto-generate the Prisma models:

```bash
bunx auth@latest generate --config src/lib/auth.ts --y
```

This outputs the required `user`, `session`, `account`, `verification` models into `prisma/schema.prisma`. After generation, add the custom models below:

```prisma
// ─── Custom models ───

enum IssueStatus {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum IssuePriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model issue {
  id          String        @id @default(cuid())
  title       String
  description String?
  status      IssueStatus   @default(OPEN)
  priority    IssuePriority @default(MEDIUM)
  authorId    String
  assigneeId  String?
  author      user          @relation("IssueAuthor", fields: [authorId], references: [id])
  assignee    user?         @relation("IssueAssignee", fields: [assigneeId], references: [id])
  labels      issueLabel[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model label {
  id     String       @id @default(cuid())
  name   String       @unique
  color  String       @default("#6366f1")
  issues issueLabel[]
}

model issueLabel {
  issueId String
  labelId String
  issue   issue @relation(fields: [issueId], references: [id], onDelete: Cascade)
  label   label @relation(fields: [labelId], references: [id], onDelete: Cascade)
  @@id([issueId, labelId])
}
```

Run after generation + edits:

```bash
bunx prisma migrate dev --name init
```

---

## TanStack Query Setup

### Provider (`client/src/providers/app.tsx`)

```tsx
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function AppProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: { staleTime: 30_000, retry: 1 },
		},
	}));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
```

### Data fetching hooks pattern (`client/src/hooks/use-issues.ts`)

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useIssues() {
	return useQuery({
		queryKey: ["issues"],
		queryFn: () => api("/api/issues"),
	});
}

export function useIssue(id: string) {
	return useQuery({
		queryKey: ["issues", id],
		queryFn: () => api(`/api/issues/${id}`),
		enabled: !!id,
	});
}

export function useCreateIssue() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: unknown) =>
			api("/api/issues", { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
	});
}

export function useUpdateIssue(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: unknown) =>
			api(`/api/issues/${id}`, { method: "PUT", body: JSON.stringify(data) }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["issues"] });
			queryClient.invalidateQueries({ queryKey: ["issues", id] });
		},
	});
}

export function useDeleteIssue() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			api(`/api/issues/${id}`, { method: "DELETE" }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
	});
}
```

---

## Client Page Patterns

### API client (`client/src/lib/api.ts`)

```ts
const BASE = "http://localhost:4000";

export async function api(path: string, options?: RequestInit) {
	const res = await fetch(`${BASE}${path}`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		...options,
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message);
	}
	return res.json();
}
```

### Login page pattern

```tsx
// routes/login.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

function LoginPage() {
	const form = useForm({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: { email: string; password: string }) => {
		await authClient.signIn.email(data);
		// Redirect to /issues on success
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<input type="email" {...form.register("email")} placeholder="Email" />
			{form.formState.errors.email && <p>{form.formState.errors.email.message}</p>}
			<input type="password" {...form.register("password")} placeholder="Password" />
			<button type="submit" disabled={form.formState.isSubmitting}>
				Sign In
			</button>
		</form>
	);
}
```

---

## File Structure (Final)

```
server/
  .env.example
  .env
  prisma/
    schema.prisma              ← Better Auth models + custom
  src/
    index.ts                   ← app.listen(PORT), graceful shutdown
    app.ts                     ← createApp(): Better Auth handler → cors → json → routes → errorHandler
    lib/
      auth.ts                  ← betterAuth() instance (Prisma adapter)
      prisma.ts                ← PrismaClient singleton
    middleware/
      auth.ts                  ← requireAuth (fromNodeHeaders + getSession)
      errorHandler.ts          ← zod → 400, rest → 500
    routes/
      issues.ts                ← /api/issues CRUD with zod validation
      labels.ts                ← /api/labels
      users.ts                 ← /api/users (for assignee picker)

client/
  src/
    lib/
      api.ts                   ← fetch wrapper
      auth-client.ts           ← createAuthClient() from better-auth/react
      utils.ts                 ← cn() helper (clsx + tailwind-merge)
    providers/
      app.tsx                  ← QueryClientProvider + auth session provider
    hooks/
      use-issues.ts            ← TanStack Query hooks for issues
      use-labels.ts
      use-users.ts
    components/
      ui/
        Button.tsx             ← Radix + Tailwind + CVA
        Input.tsx
        Select.tsx
        Dialog.tsx
        Badge.tsx
    routes/
      __root.tsx               ← AppProviders + devtools gate
      index.tsx                ← redirect / → /issues
      login.tsx                ← React Hook Form + authClient.signIn
      register.tsx             ← React Hook Form + authClient.signUp
      issues/
        index.tsx              ← list with useQuery(["issues"])
        new.tsx                ← create form with React Hook Form + useCreateIssue
        $id.tsx                ← detail with useQuery(["issues", id])
        $id.edit.tsx           ← edit form with React Hook Form + useUpdateIssue
```

---

## Server Route Spec

### Auth (handled by Better Auth automatically)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-up` | Register with email, password, name |
| POST | `/api/auth/sign-in` | Sign in with email, password |
| POST | `/api/auth/sign-out` | Sign out |
| GET | `/api/auth/session` | Get current session |

### Custom API (express routes with zod validation)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/issues` | ✅ | List issues |
| POST | `/api/issues` | ✅ | Create issue |
| GET | `/api/issues/:id` | ✅ | Get issue |
| PUT | `/api/issues/:id` | ✅ | Update issue |
| DELETE | `/api/issues/:id` | ✅ | Delete issue |
| GET | `/api/labels` | ✅ | List labels |
| POST | `/api/labels` | ✅ | Create label |
| GET | `/api/users` | ✅ | List users |

---

## Build Order

| Phase | Steps | Key Files |
|-------|-------|-----------|
| **1** Server foundation | Prisma schema, install deps, `lib/auth.ts`, `lib/prisma.ts`, `app.ts`, error handler | `prisma/schema.prisma`, `src/lib/auth.ts`, `src/app.ts`, `src/index.ts` |
| **2** Server API | Issue/label/user routes with zod validation + requireAuth | `src/routes/*.ts`, `src/middleware/auth.ts` |
| **3** Client foundation | Install deps, `providers/app.tsx`, `lib/api.ts`, `lib/auth-client.ts`, consolidate router | `providers/app.tsx`, `lib/api.ts`, `main.tsx` |
| **4** Client auth UI | Login + register pages with React Hook Form | `routes/login.tsx`, `routes/register.tsx` |
| **5** Client UI primitives | Radix + Tailwind component kit | `components/ui/*.tsx` |
| **6** Client issues | List, detail, create, edit — TanStack Query + React Hook Form | `routes/issues/*.tsx`, `hooks/use-issues.ts` |
| **7** Polish | Loading/empty/error states, seed data, tests | Various |

---

## Key Gotchas

- **Better Auth handler must mount BEFORE `express.json()`** — `app.all("/api/auth/*splat", toNodeHandler(auth))` then `app.use(express.json())`
- **Use `fromNodeHeaders()` helper** from `better-auth/node` when calling `auth.api.getSession()` in Express middleware
- **Client auth SDK import**: `createAuthClient` comes from `better-auth/react`, not `better-auth/client`
- **Prisma models**: Run `bunx auth generate` to auto-generate Better Auth models, then add custom models manually
- **TanStack Query staleTime**: Default 30s to avoid excessive refetching for this type of app
- **Radix + Tailwind**: Use `cn()` helper (clsx + tailwind-merge) for conditional class merging
