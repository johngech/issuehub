<!-- Context: project-intelligence/technical | Priority: high | Version: 1.0 | Updated: 2026-05-15 -->

# Technical Domain

> Express 5 backend + React 19 SPA, served in a Bun monorepo with no database yet.

## Quick Reference

- **Purpose**: Understand how the project works technically
- **Update When**: New features, refactoring, tech stack changes
- **Audience**: Developers, technical stakeholders

## Primary Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | TypeScript | 6.0 | Static typing, modern JS features |
| Runtime/PM | Bun | latest | Single runtime for dev/scripts, faster than Node, built-in TS support |
| Backend | Express 5 | ^5.2.1 | Lightweight HTTP framework, familiar API |
| Frontend | React 19 | ^19.2.0 | Modern component model, concurrent features |
| Routing | TanStack Router | latest | File-based routing, auto code-splitting, type-safe |
| Styling | Tailwind CSS v4 | ^4.1.18 | Utility-first, CSS-first config via Vite plugin |
| Icons | Lucide React | ^0.545.0 | Lightweight, tree-shakeable icon library |
| Bundler | Vite 8 | ^8.0.0 | Fast HMR, native ESM, plugin ecosystem |
| Testing | Vitest 4 + Testing Library | ^4.1.5 / ^16.3.0 | Native Vite integration, modern API, jsdom |
| Lint/Format | Biome 2 | 2.4.x | All-in-one linter + formatter, fast |

## Architecture Pattern

```
Type: Monorepo — REST API backend + SPA frontend
Pattern: Single-page application consumes REST API over HTTP
Backend: Express 5 server (port 4000) serving JSON endpoints
Frontend: React 19 SPA (port 3000 dev) via Vite, TanStack Router for client-side routing
```

### Why This Architecture?

This is an **early-stage learning project**. Monorepo simplifies local development — one repo to clone, one lock file, shared config. Bun auto-discovers the `server/` and `client/` packages via `bun.lock` without workspace config. Separate frontend/backend decouples concerns and mimics real-world full-stack architecture.

## Project Structure

```
issue-tracker/
├── server/                  # Express 5 backend
│   ├── index.ts             # Entrypoint — GET /api/health
│   ├── src/                 # EMPTY — no routes/models/controllers yet
│   ├── biome.json           # Biome config (tab indent, double quotes)
│   └── package.json
├── client/                  # React 19 frontend
│   ├── src/
│   │   ├── main.tsx         # App bootstrap, creates router
│   │   ├── router.tsx       # TanStack Router factory
│   │   ├── routes/
│   │   │   ├── __root.tsx   # Root layout with devtools
│   │   │   └── index.tsx    # Home page — "Welcome to TanStack Start"
│   │   ├── routeTree.gen.ts # AUTO-GENERATED — DO NOT EDIT
│   │   └── styles.css       # Tailwind entry — excluded from Biome
│   ├── index.html           # HTML entrypoint
│   ├── vite.config.ts       # Vite + Tailwind + TanStack Router plugin
│   ├── biome.json           # Biome config (tab indent, double quotes)
│   └── package.json
├── .opencode/               # OpenAgentsControl AI agent framework
├── AGENTS.md                # AI agent instructions
├── bun.lock                 # Lock file (Bun auto-discovers packages)
├── package.json             # Root (Vite/TypeScript dev deps only)
└── tsconfig.json            # Shared root TS config
```

**Key Directories**:
- `server/` — Express 5 backend, single entrypoint `index.ts`
- `client/` — React 19 SPA with file-based routing
- `.opencode/` — AI agent framework config, agents, context, skills

## Key Technical Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Bun runtime | Single runtime for server + client, fast, no workspace config needed | Simplified toolchain, faster installs |
| TanStack Router | File-based routing, auto code-splitting, type-safe routes | Convention over configuration |
| Tailwind v4 + Vite plugin | Zero-config CSS, CSS-first configuration, utility classes | Rapid UI development |
| Biome (no ESLint/Prettier) | All-in-one tool, faster, built-in import organization | Less config overhead |
| Vitest + Testing Library | Native Vite integration, modern, fast | Fast feedback on tests |

See `decisions-log.md` for full decision history with alternatives.

## Integration Points

| System | Purpose | Protocol | Direction |
|--------|---------|----------|-----------|
| `/api/health` | Health check endpoint | REST/JSON | Inbound (server) → Client |
| Future REST API | Issue CRUD operations | REST/JSON | Inbound (server) → Client |

No database, external services, or authentication configured yet.

## Technical Constraints

| Constraint | Origin | Impact |
|------------|--------|--------|
| No database yet | Learning stage | All data is mock/future |
| No CI/CD | Learning stage | Manual dev/build only |
| No deployment | Learning stage | Local development only |

## Development Environment

```
Setup:  git clone && cd issue-tracker && bun install
Server: cd server && bun run --watch index.ts  (port 4000)
Client: cd client && bunx vite dev --port 3000
Test:   cd client && bunx vitest run
Lint:   bunx biome check --write (from package dir)
```

**Requirements**: Bun installed, Node.js optional (Bun handles everything).

## Deployment

```
Environment:  Not configured (local dev only)
Platform:     TBD
CI/CD:        None yet
Monitoring:   None yet
```

## Onboarding Checklist

- [ ] Know the primary tech stack (TypeScript, Express 5, React 19, Bun)
- [ ] Understand the monorepo structure and why it was chosen
- [ ] Know the key project directories and their purpose
- [ ] Understand major technical decisions and rationale
- [ ] Know that `routeTree.gen.ts` is auto-generated — never edit manually
- [ ] Know that `server/src/` is empty — entrypoint is `server/index.ts`
- [ ] Be able to set up local development environment (bun install + dev commands)
- [ ] Know how to run tests (client only) and lint

## Related Files

- `business-domain.md` — Why this technical foundation exists
- `business-tech-bridge.md` — How business needs map to technical solutions
- `decisions-log.md` — Full decision history with context
- `living-notes.md` — Current open questions and known issues
