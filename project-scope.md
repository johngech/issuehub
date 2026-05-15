# Issue Tracker — Project Scope

## Overview

A full-stack issue tracking application built for learning and demonstration. Server-rendered API with a React SPA client.

**Stack:** Express 5 / Bun | Prisma + PostgreSQL | React 19 / TanStack Router / Tailwind v4 / Vite

---

## MVP Features (Medium Scope)

| Feature | Status |
|---------|--------|
| CRUD issues (title, description, status, priority) | ✅ Planned |
| Session-based auth (register, login, logout) | ✅ Planned |
| Labels/Tags with colors | ✅ Planned |
| Assignee management | ✅ Planned |
| Comments on issues | ❌ Future |
| Full-text search & filter | ❌ Future |

---

## Data Model

```
User
  id          String (PK)
  name        String
  email       String (unique)
  password    String (bcrypt hashed)
  createdAt   DateTime
  updatedAt   DateTime
  issues      Issue[]        (author)
  assigned    Issue[]        (assignee)

Issue
  id          String (PK)
  title       String
  description String (optional)
  status      Enum (OPEN, IN_PROGRESS, CLOSED)
  priority    Enum (LOW, MEDIUM, HIGH, CRITICAL)
  authorId    String (FK -> User)
  assigneeId  String? (FK -> User)
  labels      IssueLabel[]
  createdAt   DateTime
  updatedAt   DateTime

Label
  id          String (PK)
  name        String (unique)
  color       String (hex)
  issues      IssueLabel[]

IssueLabel
  issueId     String (FK -> Issue)
  labelId     String (FK -> Label)
```

---

## API Routes

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Start session |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Current user |

### Issues
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/issues` | List issues (with filters/query params) |
| POST | `/api/issues` | Create issue |
| GET | `/api/issues/:id` | Get single issue |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |

### Labels & Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/labels` | List all labels |
| POST | `/api/labels` | Create label |
| GET | `/api/users` | List users (for assignee picker) |

---

## Client Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | Login | Email + password form |
| `/register` | Register | Create account form |
| `/issues` | Issue List | Dashboard with all issues, filter/sort |
| `/issues/new` | Create Issue | Form: title, description, labels, assignee |
| `/issues/:id` | Issue Detail | View full issue with metadata |
| `/issues/:id/edit` | Edit Issue | Update fields, reassign, change labels |

---

## Build Order

### Phase 1 — Foundation
1. **Prisma schema** — models, enums, migrations
2. **Server middleware** — CORS, JSON parser, session setup, error handler
3. **Auth API** — register, login, logout, me

### Phase 2 — Client Auth
4. **Auth pages** — login, register forms
5. **Auth context** — session state provider, protected route wrapper

### Phase 3 — Core CRUD
6. **Issue API** — full CRUD with labels + assignee support
7. **Labels API** — list + create
8. **Users API** — list for picker

### Phase 4 — Client Issues
9. **Issue list page** — display issues with labels/assignee/status badges
10. **Create/edit forms** — issue forms with label + assignee pickers
11. **Issue detail page** — full issue view

### Phase 5 — Polish
12. Loading / empty / error states
13. Seed data for development
14. Final cleanup and testing

---

## Constraints & Conventions

- All commands run from `server/` or `client/` directories (see `AGENTS.md`)
- Biome lint + format with tab indentation and double quotes
- No editing `routeTree.gen.ts` (auto-generated)
- Path aliases: `@/` and `#/` → `client/src/`
- Session-based auth (server-managed cookies, not JWT)
- Server port 4000, client dev server port 3000 (no proxy — direct API calls)

---

## Future Considerations (Post-MVP)

- Comments / discussion threads on issues
- Full-text search
- Kanban board view
- File attachments
- Email notifications
- Webhook integrations
