<!-- Context: project-intelligence/notes | Priority: high | Version: 1.0 | Updated: 2026-05-15 -->

# Living Notes

> Active items, open questions, conventions, and gotchas for the issue-tracker project.

## Quick Reference

- **Purpose**: Capture current state, problems, and open questions
- **Update**: Weekly or when status changes
- **Archive**: Move resolved items to bottom with status

## Technical Debt

| Item | Impact | Priority | Mitigation |
|------|--------|----------|------------|
| Committed secrets in `server/.env` (DB password, auth secret) | Security — credentials exposed in git history | Critical | Rotate creds, `git rm --cached server/.env`, add to `.gitignore` |
| Better Auth middleware runs AFTER `express.json()` | Sign-in/sign-up silently fail | Critical | Reorder middleware: Better Auth first |
| Express 5 wildcard `*any` should be `{*splat}` | Routes may not match correctly | Critical | Fix syntax to `{*splat}` |
| TypeScript version mismatch (root 6.x, server peer-dep `^5`) | Build warnings, potential resolution issues | High | Update server peerDeps to `^6.0.2` |
| Client `biome.json` uses `space` indent (docs claim `tab`) | Inconsistent formatting across packages | High | Align or update docs to reflect reality |
| No global Express error handler | Unhandled async errors crash process | Medium | Add `app.use()` error middleware |
| CORS reflects any origin with credentials | Security risk for production | Medium | Use `TRUSTED_ORIGINS` env var |
| `core/package.json` missing `./constants` export | Import errors when using `@issue-tracker/core/constants` | Medium | Add to exports map |
| `router.tsx` is dead code — never imported | Confusion for developers | Low | Delete file |
| "Welcome to TanStack Start" boilerplate still shown | Unprofessional first impression | Low | Replace with real content |
| Zero test files exist despite full Vitest tooling | No test coverage at all | Medium | Add unit tests for core schemas first |
| No `@tanstack/react-query` dependency installed | Planned but missing; blocks data fetching phase | Medium | Install when starting Phase 3/4 |

## Open Questions

| Question | Stakeholders | Status | Next Action |
|----------|--------------|--------|-------------|
| Database choice: SQLite vs PostgreSQL? | Project owner | Open | Evaluate once CRUD is planned |
| Deployment target? | Project owner | Open | Not needed until MVP is ready |
| Server testing framework? | Project owner | Open | Vitest could extend to server, or use Bun test |
| Add Issue/Label Prisma models to schema? | Project owner | Open | Planned for Phase 3 |

### Open Question Details

**Database choice**
*Context*: Need to store issues. SQLite is simpler (no server), PostgreSQL is more production-realistic.
*Options*: SQLite (via Bun's built-in `bun:sqlite` or better-sqlite3), PostgreSQL (via drizzle or Prisma)
*Timeline*: Before starting CRUD implementation
*Status*: Open

**Deployment target**
*Context*: Once the app is functional, where to deploy?
*Options*: Vercel, Railway, Fly.io, self-hosted
*Timeline*: Future
*Status*: Open

## Known Issues

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| `server/.env` committed to git with live credentials | Critical | Rotate DB password, regenerate auth secret | Open |
| Better Auth runs after `express.json()` — body consumed | Critical | Reorder: Better Auth before express.json() | Open |
| Express 5 `*any` wildcard should be `{*splat}` | Critical | Fix route syntax | Open |
| `core/package.json` missing `./constants` export | Medium | Add export entry | Open |
| `router.tsx` is dead code | Low | Delete if not needed | Open |

## Insights & Lessons Learned

### What Works Well
- **Bun monorepo**: Auto-detects packages via `bun.lock` — smooth DX
- **Vite 8 + React 19**: HMR is instant, no compatibility issues so far
- **TanStack Router plugin**: File-based routing works out of the box with Vite
- **Better Auth + Prisma**: Session-based auth set up with Prisma ORM (PostgreSQL driver)

### What Could Be Better
- **No server tests yet**: Server has no test setup — need to add before implementing API logic
- **No client tests either**: Vitest tooling is fully configured but zero test files exist
- **Biome indentation inconsistency**: Server uses `tab`, client uses `space` — confusing for formatting

### Lessons Learned
- **AGENTS.md is essential**: Documenting project structure and gotchas upfront helps AI agents serve better context
- **Biome exclusion patterns**: `styles.css` and `routeTree.gen.ts` must be explicitly excluded from Biome checks — easy to forget
- **Better Auth requires raw body**: Must mount Better Auth handler BEFORE `express.json()` — Easy Auth expects to parse the request body itself
- **Express 5 uses path-to-regexp v8**: Route wildcard syntax changed from `*` to `{*splat}` — old patterns silently fail

## Patterns & Conventions

### Code Patterns Worth Preserving
- **File-based routing**: Route files in `client/src/routes/` auto-map to URLs
- **Independent Biome configs**: Each package has its own `biome.json` — keeps concerns separate
- **Shared core validation**: Zod schemas in `core/validation.ts` shared between server and client

### Gotchas for Maintainers
- **`routeTree.gen.ts` is auto-generated** — never edit manually. Regenerated on dev/build by `@tanstack/router-plugin/vite`
- **`server/src/` is empty** — the server entrypoint is `server/index.ts`, not `src/`
- **Path aliases `#/` and `@/` both resolve to `client/src/`** — defined in `client/tsconfig.json` paths and `client/package.json` imports
- **Root `package.json` scripts (`dev`, `build`, `preview`) are for Vite** — they won't work for the server
- **Server runs on port 4000** by default, client dev server on port 3000
- **`styles.css` excluded from Biome** — contains Tailwind directives, not standard CSS
- **Better Auth MUST be mounted before `express.json()`** — otherwise sign-in/sign-up silently fail
- **Express 5 wildcard syntax**: Use `{*splat}`, NOT `*any` or `*` for catch-all routes
- **`core/constants.ts` and `core/types.ts` are empty** — populate before importing
- **`core/package.json` exports map is incomplete** — missing `./constants` entry
- **Biome indentation differs**: Server = `tab`, Client = `space` (with `lineWidth: 2`). This is a known inconsistency
- **`server/.env` was committed to git** — `.gitignore` now covers it, but history still has the secrets

## Active Projects

| Project | Goal | Owner | Timeline |
|---------|------|-------|----------|
| Scaffolding (current) | Project setup, tooling, dev commands working | Project owner | ✅ Complete |
| Code review remediation | Fix critical issues (committed secrets, middleware order, route syntax) | Project owner | Immediate |
| Core CRUD (next) | Issue data model + REST API + UI | Project owner | Next sprint |

## Archive (Resolved Items)

No resolved items yet.

## Onboarding Checklist

- [ ] Know that `routeTree.gen.ts` is auto-generated — never edit
- [ ] Know that `server/index.ts` is the server entrypoint, not `src/`
- [ ] Know about the `#/` and `@/` path aliases for client imports
- [ ] Understand Biome indentation inconsistency (server = tab, client = space)
- [ ] Know that Better Auth must be mounted BEFORE `express.json()`
- [ ] Know Express 5 uses `{*splat}` for wildcard routes (not `*` or `*name`)
- [ ] Know which files are excluded from Biome checking
- [ ] Know that `server/.env` was committed to git history — rotate credentials
- [ ] Know that `core/types.ts` and `core/constants.ts` are empty placeholders
- [ ] Know that `core/package.json` is missing `./constants` export
- [ ] Be aware of open questions (database, deployment, testing)
- [ ] Understand current project phase (scaffold complete, code review remediation, CRUD next)

## Related Files

- `decisions-log.md` — Past decisions that inform current state
- `business-domain.md` — Learning goals and project identity
- `technical-domain.md` — Technical details and architecture
- `business-tech-bridge.md` — Learning goal ↔ tech mapping
