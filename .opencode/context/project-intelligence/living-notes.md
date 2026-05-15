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
| None yet | — | — | Project is scaffold only |

No technical debt identified yet — the project is at the scaffolding stage with minimal code.

## Open Questions

| Question | Stakeholders | Status | Next Action |
|----------|--------------|--------|-------------|
| Database choice: SQLite vs PostgreSQL? | Project owner | Open | Evaluate once CRUD is planned |
| Deployment target? | Project owner | Open | Not needed until MVP is ready |
| Authentication strategy? | Project owner | Open | Can add later, not blocking |
| Server testing framework? | Project owner | Open | Vitest could extend to server, or use Bun test |

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

**Authentication strategy**
*Context*: Issue tracking needs user accounts for multi-user scenarios.
*Options*: JWT, session-based, OAuth (GitHub)
*Timeline*: Future
*Status*: Open

## Known Issues

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| None | — | — | Project is scaffold only |

## Insights & Lessons Learned

### What Works Well
- **Bun monorepo**: Auto-detects packages via `bun.lock` without workspace config — smooth DX
- **Vite 8 + React 19**: HMR is instant, no compatibility issues so far
- **TanStack Router plugin**: File-based routing works out of the box with Vite

### What Could Be Better
- **No server tests yet**: Server has no test setup — need to add before implementing API logic

### Lessons Learned
- **AGENTS.md is essential**: Documenting project structure and gotchas upfront helps AI agents serve better context
- **Biome exclusion patterns**: `styles.css` and `routeTree.gen.ts` must be explicitly excluded from Biome checks — easy to forget

## Patterns & Conventions

### Code Patterns Worth Preserving
- **File-based routing**: Route files in `client/src/routes/` auto-map to URLs
- **Tab indentation, double quotes**: Enforced by Biome across both packages
- **Independent Biome configs**: Each package has its own `biome.json` — keeps concerns separate

### Gotchas for Maintainers
- **`routeTree.gen.ts` is auto-generated** — never edit manually. Regenerated on dev/build by `@tanstack/router-plugin/vite`
- **`server/src/` is empty** — the server entrypoint is `server/index.ts`, not `src/`
- **Path aliases `#/` and `@/` both resolve to `client/src/`** — defined in `client/tsconfig.json` paths and `client/package.json` imports
- **Root `package.json` scripts (`dev`, `build`, `preview`) are for Vite** — they won't work for the server
- **Server runs on port 4000** by default, client dev server on port 3000
- **`styles.css` excluded from Biome** — contains Tailwind directives, not standard CSS

## Active Projects

| Project | Goal | Owner | Timeline |
|---------|------|-------|----------|
| Scaffolding (current) | Project setup, tooling, dev commands working | Project owner | ✅ Complete |
| Core CRUD (next) | Issue data model + REST API + UI | Project owner | Next sprint |

## Archive (Resolved Items)

No resolved items yet.

## Onboarding Checklist

- [ ] Know that `routeTree.gen.ts` is auto-generated — never edit
- [ ] Know that `server/index.ts` is the server entrypoint, not `src/`
- [ ] Know about the `#/` and `@/` path aliases for client imports
- [ ] Understand tab indentation and double quotes conventions
- [ ] Know which files are excluded from Biome checking
- [ ] Be aware of open questions (database, deployment, auth)
- [ ] Understand current project phase (scaffold complete, CRUD next)

## Related Files

- `decisions-log.md` — Past decisions that inform current state
- `business-domain.md` — Learning goals and project identity
- `technical-domain.md` — Technical details and architecture
- `business-tech-bridge.md` — Learning goal ↔ tech mapping
