# ADR 002 — Domain-Driven Design: Domain Layer

**Status:** Accepted  
**Date:** 2026-05-07  
**Applies to:** All boilerplates (Node/Fastify, Python/FastAPI, Ruby on Rails)

---

## Context

Boilerplates need a consistent structure that:
- Separates business rules from infrastructure (HTTP, DB)
- Makes domain logic testable without starting a server or connecting to a DB
- Gives a clear pattern to extend when adding new features

---

## Decision

Each boilerplate implements a lightweight **Domain layer**:

```
domain/
  entities/      # Pure data types / domain models (User, RefreshToken)
  errors/        # Typed domain errors (EmailAlreadyInUseError, etc.)
  value-objects/ # Validated primitives (Email, Username, Password)
```

**Rules:**
1. Domain entities have **no framework imports** — only plain language primitives
2. Value objects **validate at construction** and throw domain errors on failure
3. Domain errors carry semantic names (not HTTP codes) — HTTP mapping happens at the transport layer

### HTTP mapping (transport layer)

```
InvalidCredentialsError  → 401
UnauthorizedError        → 401
InvalidRefreshTokenError → 401
UserNotFoundError        → 404
EmailAlreadyInUseError   → 409
UsernameAlreadyTakenError → 409
<other DomainError>      → 422
```

The global error handler (`setErrorHandler` / FastAPI exception handler / `rescue_from`) owns this mapping. Controllers never set HTTP codes for domain errors directly.

---

## Consequences

**Good:**
- Domain logic is 100% unit-testable — no HTTP mocking needed
- Adding a new transport (gRPC, CLI) requires only a new adapter, not domain changes
- Error semantics are explicit and searchable

**Trade-offs:**
- Extra layer for simple CRUD — acceptable as boilerplate pattern
- Developers must distinguish "domain error" from "validation error" — documented in CONTRIBUTING.md

---

## Alternatives Considered

- **Anemic model (no domain layer)**: validation scattered in controllers — rejected for maintainability
- **Full DDD with aggregates + events**: overkill for auth boilerplate — deferred to application-specific code
