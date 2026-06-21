# ADR-0002: Backend Architecture & Repository Structure

## Status
Accepted — 2026-06-15 (resolves the open architecture question in the project spec §5)

## Context
The KNU Interactive Study Hub MVP targets a single Discrete Mathematics topic — **Graph Theory** —
built by a **3–4 person team** on a **flexible timeline**, with **no dedicated DevOps** and a known
frontend coverage gap. The platform's differentiator is automated, real-time evaluation of
mathematical/algorithmic logic. Graph-theory grading is computationally light, but the roadmap
(Boolean algebra, proofs) trends toward symbolic math where Python's SymPy is decisive.

The spec selected Python + FastAPI; GlobalRules §3 is written around Go + chi. The team initially
proposed a "modular monolith with one part in Python and one part in Go" — which is, by definition,
two processes (polyglot multi-service), not a monolith.

Options considered:

| Option | Summary | Cost now | Reversibility |
| --- | --- | --- | --- |
| A. Single-language modular monolith | One process, modules as packages | Lowest | Low future-proofing |
| B. Polyglot 2 services (Go gateway + Python grader) | Two runtimes from day one | Highest (2 pipelines, network hop) | n/a |
| C. Modular monolith with grading behind an interface | One process now, grader extractable to a Python service later | Low now, cheap to split | High |

## Decision
Adopt **Option C**: a **single-language modular monolith** in a **monorepo**.

```
/
  frontend/          # React
  backend/           # single-language modular monolith (language: see ADR-0001)
    internal/
      auth/          # JWT issue/validate, identity
      content/       # modules, sections, problem definitions
      practice/      # submissions + the Grader interface (extraction seam)
      progress/      # per-user mastery/progress
      platform/      # db pooling, config, structured logging
    migrations/
  docker-compose.yml
```

- `backend/` is organized by **bounded context** following Clean Architecture: handlers do HTTP/routing
  only; business logic lives in service layers; persistence in repositories.
- The grading engine sits behind a **`Grader` interface**. Its graph-theory implementation runs
  in-process now; it can later be extracted into a standalone **Python + FastAPI** service (for
  SymPy-class math) by swapping the implementation behind that interface — callers are unaffected.
- The single backend language is decided in **ADR-0001**.

## Context Map
- Frontend (React) → Backend API over HTTP/JSON.
- **Auth** — issues/validates JWT; upstream of all others (identity); no inbound deps.
- **Content** — owns modules/sections/problem definitions; no inbound deps.
- **Practice/Grading** — consumes Content (problem definitions) + Auth (identity); evaluates
  submissions via the `Grader` interface. ← extraction seam.
- **Progress** — consumes Practice (results) + Auth (identity); owns mastery/progress.
- Dependency direction points toward the stable contexts (Auth, Content). No cross-context DB
  access — contexts interact only through service interfaces.

## Consequences
**Easier:** one image / one CI pipeline / in-process calls; fast iteration for a small team; module
boundaries map cleanly to future services; the grader split is a known, low-risk operation when
needed (honors the team's Go+Python instinct, deferred to when it pays off).

**Harder / accepted cost:** module boundaries are enforced by discipline and code review, not process
isolation (cross-context access only via defined interfaces); the `Grader` interface adds minor
indirection today; if we ever need Go-grade serving performance *and* Python math simultaneously, we
pay the extraction cost at that point (knowingly deferred).

**Governance:** routed by the Agent Orchestrator. The Security Engineer reviews the grader's handling
of untrusted submission input (veto power). Reality Checker / Evidence Collector gate production readiness.
