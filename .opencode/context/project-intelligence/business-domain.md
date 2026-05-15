<!-- Context: project-intelligence/business | Priority: high | Version: 1.0 | Updated: 2026-05-15 -->

# Business Domain

> A learning/experimentation project to build a full-stack issue tracking web application.

## Quick Reference

- **Purpose**: Understand why this project exists
- **Update When**: Project scope changes, new learning goals identified
- **Audience**: Developers needing context, anyone onboarding

## Project Identity

```
Project Name: issue-tracker
Tagline: Full-stack issue tracking — a learning project
Problem Statement: Learn modern full-stack development by building a real application
Solution: Express 5 backend + React 19 frontend in a Bun monorepo
```

## Target Users

| User Segment | Who They Are | What They Need | Pain Points |
|--------------|--------------|----------------|-------------|
| Developers (primary) | Developers learning full-stack | Hands-on project to apply modern tools | Tutorials are too abstract, need a real app |
| Self (secondary) | Project owner | Explore new tech (Bun, Express 5, React 19, TanStack Router) | Need motivation to learn by building |

## Value Proposition

**For Learners**:
- Hands-on experience with modern full-stack stack (Bun, Express 5, React 19)
- Real architecture decisions with documented rationale
- Incremental complexity — start simple, add features over time

**For Project Health**:
- Clean, documented codebase as a reference
- All decisions captured in decision log for later review
- Educational value > production readiness

## Success Metrics

| Metric | Definition | Target | Current |
|--------|------------|--------|---------|
| Scaffold complete | Project structure, tooling, dev commands working | Done | ✅ Done |
| Core CRUD working | Create/read/update/delete issues via API + UI | Future | ❌ Not started |
| Tests passing | Vitest test suite green | 100% | ✅ Scaffold only |

No business model, revenue targets, or market metrics — this is a learning project.

## Key Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Developer | Project owner | All decisions, implementation, learning |

Single-person project — no external stakeholders.

## Roadmap Context

**Current Focus**: Project scaffolding and infrastructure setup complete. Preparing for core CRUD functionality.

**Next Milestone**: Define data model (issue schema) and implement basic CRUD API.

**Long-term Vision**: Fully functional issue tracker with user authentication, filtering, and search — built with full understanding of each component.

## Business Constraints

- **Learning-first**: Technology choices prioritize learning value over production readiness
- **Single developer**: Scope must be realistic for one person
- **No timeline**: Project progresses at learner's pace

## Onboarding Checklist

- [ ] Understand the problem statement (learning project)
- [ ] Know the target user (developers learning full-stack)
- [ ] Understand current project focus (scaffold complete, CRUD next)
- [ ] Know this is a single-person learning project with no business model

## Related Files

- `technical-domain.md` — How this learning goal is solved technically
- `business-tech-bridge.md` — Mapping between learning goals and tech choices
- `decisions-log.md` — Technical decisions with educational context
- `living-notes.md` — Current open questions and next steps
