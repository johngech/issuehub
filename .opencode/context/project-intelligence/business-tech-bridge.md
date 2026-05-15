<!-- Context: project-intelligence/bridge | Priority: high | Version: 1.0 | Updated: 2026-05-15 -->

# Business ↔ Tech Bridge

> How learning goals drive technical choices in the issue-tracker project.

## Quick Reference

- **Purpose**: Show how educational objectives map to architectural decisions
- **Update When**: New features planned, tech stack changes
- **Related Files**: `business-domain.md`, `technical-domain.md`, `decisions-log.md`

## Core Mapping

| Learning Goal | Technical Solution | Why This Mapping | Value |
|---------------|-------------------|------------------|-------|
| Learn modern runtime | Bun (single runtime, no workspace config) | Eliminates toolchain complexity, focuses on code | Faster setup, less config yak-shaving |
| Learn file-based routing | TanStack Router with `router-plugin/vite` | Convention over configuration, auto code-splitting | Production pattern without boilerplate |
| Learn utility-first CSS | Tailwind CSS v4 via `@tailwindcss/vite` plugin | Zero-config setup, modern CSS-first approach | Rapid UI iteration, no CSS file management |
| Learn unified lint/format | Biome (replaces ESLint + Prettier) | All-in-one, fewer dependencies to manage | Understand modern linting patterns |
| Learn modern testing | Vitest + Testing Library + jsdom | Native Vite integration, fast, industry-standard | Test patterns that transfer to real projects |
| Learn AI-assisted dev | OpenAgentsControl (OAC) framework | Project-specific context, custom agents | Understand AI coding workflows |

## Feature Mapping Examples

### Feature: Health Check Endpoint

**Learning Context**:
- Goal: Understand Express 5 setup and basic routing
- Tech: Express 5 with TypeScript + Bun
- Priority: First backend feature

**Technical Implementation**:
- Solution: `server/index.ts` — single `GET /api/health` returning `{ status: "OK!" }`
- Architecture: Standard Express app, port from `PORT` env (default 4000)
- Trade-offs: Minimal — enough to verify server works, no database or middleware yet

**Connection**: Establishes the backend foundation. Everything else builds on this pattern.

### Feature: Welcome Page

**Learning Context**:
- Goal: Verify React 19 + TanStack Router + Tailwind v4 integration
- Tech: React 19, TanStack Router, Tailwind v4
- Priority: First frontend feature

**Technical Implementation**:
- Solution: `client/src/routes/index.tsx` — home page with "Welcome to TanStack Start" heading
- Architecture: File-based routing via TanStack Router Plugin, auto-generated `routeTree.gen.ts`
- Tooling: Tailwind via `@tailwindcss/vite` plugin, React devtools, TanStack Router devtools

**Connection**: Verifies the full frontend toolchain works end-to-end (Vite → Tailwind → Router → React).

## Trade-off Decisions

When learning goals and production-readiness conflict:

| Situation | Learning Priority | Production Priority | Decision Made | Rationale |
|-----------|-------------------|---------------------|---------------|-----------|
| Bun vs Node.js | Bun — new, learn modern runtime | Node.js — mature ecosystem | Bun | Learning value outweighs ecosystem risk |
| Monorepo vs separate repos | Monorepo — simpler setup | Separate — independent deploy | Monorepo | Single project, no deployment pressure |
| No database yet | Start without, learn later | Choose DB early | No database | Focus on scaffolding first |

## Stakeholder Communication

**For Learners** (primary audience):
- Every tech choice intentionally exposes a modern pattern
- Documentation captures "why" so you learn the rationale
- Project starts simple and grows — you build understanding incrementally

**For External Viewers**:
- This is a learning project, not a production app
- Code quality and documentation are the primary output
- Decisions are documented as educational artifacts

## Onboarding Checklist

- [ ] Understand the core learning goal for this project
- [ ] See how each tech choice serves a learning objective
- [ ] Know the key trade-offs (Bun vs Node.js, etc.)
- [ ] Understand current project scope (scaffold + health endpoint)

## Related Files

- `business-domain.md` — Learning goals and project identity
- `technical-domain.md` — Technical implementation details
- `decisions-log.md` — Full decision history with rationale
- `living-notes.md` — Current open questions
