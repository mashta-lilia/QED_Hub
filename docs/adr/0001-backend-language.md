# ADR-0001: Backend Language for the Modular Monolith

## Status
Accepted — 2026-06-15

## Context
ADR-0002 commits us to a single-language modular monolith with the grader behind an interface.
We must pick that one language. Inputs:

- **Team familiarity** — the primary factor for a 3–4 person MVP (the language the team ships
  fastest and maintains best wins).
- **Graph-theory MVP needs** — light; satisfied by Go (`gonum/graph`) or Python (NetworkX) equally.
- **Roadmap math** — Boolean simplification and proof checking favor Python (SymPy). Under
  ADR-0002's seam, a Go monolith can still gain this later by extracting the grader into a Python service.
- **GlobalRules §3** — detailed standards exist for *both* Go (chi, `context.Context`, goroutine
  lifecycles) and Python (FastAPI, strict async, type hints).

## Options

| Option | Strengths | Costs |
| --- | --- | --- |
| Go + chi | GlobalRules-aligned, strong concurrency & serving, single static binary, simple deploy | Weaker symbolic math; grader extraction needed for SymPy-class topics |
| Python + FastAPI | Spec-aligned, richest math ecosystem (NetworkX/SymPy) — no extraction ever needed for math; fastest path to the differentiator | Higher memory; must enforce strict async per rules |

## Decision
**Python + FastAPI.** The team is strongest in Python, so it ships and maintains fastest; it is also
the spec-aligned choice and gives the grading engine direct in-process access to the richest math
ecosystem (NetworkX now; SymPy for Boolean/proofs later). Under ADR-0002 the grader stays behind the
`Grader` interface, but no future extraction is required for math reasons.

Binding constraints (GlobalRules §3): strictly asynchronous code (no synchronous code, no Flask);
an async ORM (SQLAlchemy 2.x async or Tortoise-ORM); strict type hints on every signature; HTTP
exceptions raised only at the handler layer; PostgreSQL connection pooling; secrets via environment
(`pydantic-settings`); structured logging.

## Consequences
**Easier:** fastest path to the auto-grading differentiator; one language across the whole team; no
service split needed for math; NetworkX/SymPy available in-process.

**Harder / accepted:** higher memory and lower raw throughput than Go (immaterial at student-MVP
scale); strict async discipline and the `Grader` interface boundary must be enforced so ADR-0002's
extraction option stays open.

**Technical note for the Backend Architect:** graph evaluation is CPU-bound and must run off the
async event loop (e.g., `run_in_executor`, a process pool, or a background worker) to avoid blocking
request handling. Untrusted submission input crossing into the grader is a Security Engineer review
item (veto).

Unblocks task #3 (scaffolding) and task #5 (schema).
